import { LearningTarget } from '@/data/learningTarget/learningTarget.types';
import { LearningTargetConsecutiveDays } from '@/data/learningTarget/learningTargetConsecutiveDays.types';
import { LearningTargetStage } from '@/data/learningTarget/learningTargetLiteral.types';
import { LearningTargetSM2TargetData } from '@/data/learningTarget/learningTargetSM2.types';
import { LearningTargetUnitWithSM2 } from '@/data/learningTarget/learningTargetUnit.types';
import { updateSM2TargetData } from '../../../sm2/functions/calculate-sm2-state'; // initialize関数を想定
import {
  MAX_RESET_BLOCK_COUNT,
  MIN_HIGH_QUALITY_SCORE,
  SPROUTING_COMMITMENT_COOL_DOWN_MS,
  TARGET_ROOT_ID,
} from '../../constants/main-constants';
import { UserEvaluation } from '../../types/user-evaluation.types';
import { checkPromotionConditions } from './supports/check-promotion-conditions';
import { getCommitmentQualityScores } from './supports/get-commitment-quality-scores';
import { getHallOfFameExpiry } from './supports/get-hall-of-fame-expiry';
import { updateConsecutiveDays } from './supports/update-consecutive-days';
import { updateUnitsSM2State } from './supports/update-split-units-sm2';

/** 計算結果の戻り値型 */
export interface CalculatedTransitionResult {
  nextStage: LearningTargetStage; // 変更がない場合は現在のステージ
  isPromotion: boolean;

  // 各ステージ固有の更新データ (存在する場合のみ)
  newSproutingCount?: number;
  newConsecutiveDaysData?: LearningTargetConsecutiveDays;
  newAchievedHighQualityUnitIds?: string[];
  newTargetSM2?: LearningTargetSM2TargetData;
  newSplitUnitsSM2?: Record<string, LearningTargetUnitWithSM2>;

  // 殿堂入り期限 (計算された場合)
  hallOfFameExpiresAt?: number;
}

const getDefaultConsecutiveData = (now: number): LearningTargetConsecutiveDays => ({
  consecutiveDays: 1,
  lastResetBlockChargedAt: now,
  lastResetBlockUsedAt: null,
  resetBlockCount: MAX_RESET_BLOCK_COUNT,
});

/**
 * 評価に基づき、次のステージと更新データを一括計算します。
 */
export function calculateTransition(
  learningTarget: LearningTarget,
  evaluations: Record<string, UserEvaluation>,
  now: number
): CalculatedTransitionResult {
  const { state, lastCommitmentAt } = learningTarget;
  const isTargetMode = state.managementMode === 'TARGET';

  // Quality計算
  const qualities = getCommitmentQualityScores(evaluations, isTargetMode);

  // --- 1. 現在のステージに基づいたデータ計算 (Before Promotion Check) ---

  let sproutingCount = state.stage === 'SPROUTING' ? state.sproutingPromotionCount : 0;
  let consecutiveDaysData = state.stage === 'BUDDING' ? state.consecutiveDaysData : null;
  let achievedUnitIds = state.stage === 'BUDDING' ? state.achievedHighQualityUnitIds : [];

  // SPROUTING: カウントアップ判定
  if (state.stage === 'SPROUTING') {
    const lastInc = state.lastCountIncrementedAt ?? 0;
    if (now - lastInc >= SPROUTING_COMMITMENT_COOL_DOWN_MS) {
      sproutingCount += 1;
    }
  }

  // BUDDING: 連続日数と成果パス判定
  let isBuddingSuccessPath = false;
  if (state.stage === 'BUDDING' && consecutiveDaysData) {
    consecutiveDaysData = lastCommitmentAt
      ? updateConsecutiveDays(consecutiveDaysData, lastCommitmentAt, now)
      : getDefaultConsecutiveData(now);

    const unitKeys = isTargetMode ? [TARGET_ROOT_ID] : Object.keys(state.units);
    const newAchieved = new Set(achievedUnitIds);

    unitKeys.forEach((key) => {
      if (qualities[key] >= MIN_HIGH_QUALITY_SCORE) newAchieved.add(key);
    });

    achievedUnitIds = Array.from(newAchieved);
    isBuddingSuccessPath = achievedUnitIds.length === unitKeys.length;
  }

  // BLOOMING / MASTERED: SM-2シミュレーション (昇格判定用)
  // ※ ここでは「現在の状態」でのSM-2計算を行う
  let currentSimulatedSM2Dates: number[] = [];
  let tempSplitUnitsSM2: Record<string, LearningTargetUnitWithSM2> | null = null;
  let tempTargetSM2: LearningTargetSM2TargetData | null = null;

  if (state.stage === 'BLOOMING' || state.stage === 'MASTERED') {
    // HALL_OF_FAME ではSM-2は更新されないため、ここには入らない
    if (isTargetMode) {
      tempTargetSM2 = updateSM2TargetData(state.sm2Data!, Object.values(evaluations)[0], now);
      currentSimulatedSM2Dates = [tempTargetSM2.nextReviewDate];
    } else {
      tempSplitUnitsSM2 = updateUnitsSM2State(state.units as any, evaluations, now);
      currentSimulatedSM2Dates = Object.values(tempSplitUnitsSM2).map(
        (u) => u.sm2Data.nextReviewDate
      );
    }
  }

  // --- 2. 昇格判定 ---

  const nextStage =
    checkPromotionConditions({
      currentStage: state.stage,
      sproutingCount,
      consecutiveDays: consecutiveDaysData?.consecutiveDays,
      isBuddingSuccessPath,
      sm2NextReviewDates: currentSimulatedSM2Dates,
      now,
    }) || state.stage; // 昇格なしなら現在のステージ

  const isPromotion = nextStage !== state.stage;

  // --- 3. 最終的な更新データの確定 ---

  const result: CalculatedTransitionResult = {
    nextStage,
    isPromotion,
  };

  // SPROUTINGの更新
  if (state.stage === 'SPROUTING' && !isPromotion) {
    result.newSproutingCount = sproutingCount;
  }

  // BUDDINGの更新 (昇格したとしても、引き継ぐデータや初期化データが必要な場合に備える)
  if (nextStage === 'BUDDING') {
    result.newConsecutiveDaysData = consecutiveDaysData ?? getDefaultConsecutiveData(now);
    result.newAchievedHighQualityUnitIds = achievedUnitIds;
  }

  // BLOOMING / MASTERED / HALL_OF_FAME のデータ準備
  if (['BLOOMING', 'MASTERED', 'HALL_OF_FAME'].includes(nextStage)) {
    // A. 昇格による新規突入の場合 (BUDDING -> BLOOMINGなど)
    if (isPromotion && state.stage === 'BUDDING') {
      // 初期SM-2データの生成 (Initialize)
      if (isTargetMode) {
        // TODO: initializeSM2Data関数を実装してください（評価Qに基づいて初期Interval等を決定するもの）
        // ここでは updateSM2TargetData の第一引数にデフォルト値を渡す形で代用する例
        const initialSM2State = { interval: 0, repetitions: 0, easeFactor: 2.5 };
        result.newTargetSM2 = updateSM2TargetData(
          { state: initialSM2State, lastQuality: 0, lastActiveAt: 0, nextReviewDate: 0 },
          Object.values(evaluations)[0],
          now
        );
      } else {
        // Split Modeの初期化ロジック (updateUnitsSM2StateがSM2を持たないUnitも処理できる前提ならOK)
        // そうでない場合、ここでも初期化専用ロジックが必要
        result.newSplitUnitsSM2 = updateUnitsSM2State(state.units as any, evaluations, now);
      }
    }
    // B. 既存の運用ステージ内での更新、または BLOOMING -> HoF
    else {
      // HoF期間中はSM-2データを更新しない（仕様順守）
      if (nextStage === 'HALL_OF_FAME') {
        // HoFへの昇格時、またはHoF中のレビュー
        // データは更新せず、現在のデータを維持するためにundefinedのままにするか、
        // 明示的に元のデータを渡す設計にする。ここでは「更新データなし＝維持」とする。

        // ただし、BLOOMING -> HoF の瞬間は、判定に使用した最新のSM-2データ(100日超え)を採用すべきか？
        // -> 設計思想として「100日超えたその状態」で固定するのが自然。
        if (isPromotion && state.stage === 'BLOOMING') {
          result.newTargetSM2 = tempTargetSM2 ?? undefined;
          result.newSplitUnitsSM2 = tempSplitUnitsSM2 ?? undefined;
        }

        // 殿堂入り期限の計算
        result.hallOfFameExpiresAt = getHallOfFameExpiry(now);
      } else {
        // 通常の BLOOMING / MASTERED 更新
        result.newTargetSM2 = tempTargetSM2 ?? undefined;
        result.newSplitUnitsSM2 = tempSplitUnitsSM2 ?? undefined;
      }
    }
  }

  return result;
}
