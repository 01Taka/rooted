import { LearningTarget } from '@/data/learningTarget/learningTarget.types';
import { LearningTargetConsecutiveDays } from '@/data/learningTarget/learningTargetConsecutiveDays.types';
import { LearningTargetStage } from '@/data/learningTarget/learningTargetLiteral.types';
import { LearningTargetUnitWithSM2 } from '@/data/learningTarget/learningTargetUnit.types';
import { updateSM2TargetData } from '../../../sm2/functions/calculate-sm2-state';
import { MIN_HIGH_QUALITY_SCORE, TARGET_ROOT_ID } from '../../constants/main-constants';
import { UserEvaluation } from '../../types/user-evaluation.types';
import { checkPromotionConditions } from './supports/check-promotion-conditions';
import { getCommitmentQualityScores } from './supports/get-commitment-quality-scores';
import { updateUnitsSM2State } from './supports/update-split-units-sm2';
import { updateConsecutiveDays } from './update-consecutive-days';

export interface CalculatedNextStageData {
  /** 昇格先のステージ名 ('BUDDING', 'BLOOMING', 'HALL_OF_FAME') または null */
  nextStage: LearningTargetStage | null;

  /** 更新された連続日数データ (BUDDINGステージで使用。BUDDING以外ではnull) */
  newConsecutiveDaysData: LearningTargetConsecutiveDays | null;

  /** 更新されるべき achievedHighQualityUnitIds のリスト (BUDDINGステージで使用。BUDDING以外ではnull) */
  newAchievedHighQualityUnitIds: string[] | null;

  /** SM-2更新をシミュレートした後のユニットのレコード (SPLIT/TARGETモードのBLOOMING以降で使用。それ以外ではnull) */
  updatedUnitsWithSM2: Record<string, LearningTargetUnitWithSM2> | null;
}

/**
 * 学習目標の現在の状態と評価に基づき、次のステージと関連するすべての更新データを計算します。
 */
export function calculateNextStageData(
  learningTarget: LearningTarget,
  evaluations: Record<string, UserEvaluation>,
  now = Date.now()
): CalculatedNextStageData {
  const { state, totalCommitmentCount, lastCommitmentAt } = learningTarget;
  const isTargetMode = state.managementMode === 'TARGET';

  // 1. Qualityスコアの計算と正規化
  const processedQualities = getCommitmentQualityScores(evaluations, isTargetMode);

  // 2. 昇格判定に必要な引数の計算と、それに伴う状態更新データのシミュレーション

  let newConsecutiveDaysData = null;
  let newAchievedHighQualityUnitIds = null;
  let updatedUnitsWithSM2 = null;
  let sm2NextReviewDates: number[] = [];
  let isSuccessPathAchieved = false;

  // --- BUDDING ステージの更新データシミュレーション ---
  if (state.stage === 'BUDDING') {
    // 連続日数の計算
    newConsecutiveDaysData = updateConsecutiveDays(
      state.consecutiveDaysData,
      lastCommitmentAt,
      now
    );

    // 成果パス達成済みユニットIDの更新シミュレーションと達成判定
    let tempAchievedIds = [...state.achievedHighQualityUnitIds];
    const unitKeys = isTargetMode ? [TARGET_ROOT_ID] : Object.keys(state.units);

    // 今回の評価による達成をシミュレートし、新しいIDリストを生成
    for (const key of unitKeys) {
      if (processedQualities[key] >= MIN_HIGH_QUALITY_SCORE && !tempAchievedIds.includes(key)) {
        tempAchievedIds.push(key);
      }
    }

    newAchievedHighQualityUnitIds = tempAchievedIds;
    isSuccessPathAchieved = newAchievedHighQualityUnitIds.length === unitKeys.length;

    // PromotionCheckArgs のためのデータ抽出
    sm2NextReviewDates = []; // BUDDING では不要
  }
  // --- BLOOMING/MASTERED ステージの更新データシミュレーション ---
  else if (state.stage === 'BLOOMING' || state.stage === 'MASTERED') {
    if (isTargetMode) {
      // TARGETモード: SM-2更新をシミュレート
      const updatedSM2 = updateSM2TargetData(
        state.sm2Data,
        evaluations[TARGET_ROOT_ID] || Object.values(evaluations)[0],
        now
      );
      // TARGETモードではユニットがないため、updatedUnitsWithSM2はnullのまま
      sm2NextReviewDates = [updatedSM2.nextReviewDate];
    } else {
      // SPLITモード: 全ユニットのSM-2更新をシミュレート
      const currentUnits = state.units as Record<string, LearningTargetUnitWithSM2>;
      const unitEvaluations = evaluations as Record<string, UserEvaluation>;

      updatedUnitsWithSM2 = updateUnitsSM2State(currentUnits, unitEvaluations, now);

      // 全ユニットの新しい nextReviewDate を抽出 (昇格判定用)
      sm2NextReviewDates = Object.values(updatedUnitsWithSM2).map((u) => u.sm2Data.nextReviewDate);
    }
  }

  // 3. 次のステージを判定するためのヘルパー関数を呼び出し
  const nextStage = checkPromotionConditions({
    currentStage: state.stage,
    newTotalCommitmentCount: totalCommitmentCount + 1,
    newConsecutiveDays: newConsecutiveDaysData?.consecutiveDays ?? 0,
    isSuccessPathAchieved: isSuccessPathAchieved,
    sm2NextReviewDates: sm2NextReviewDates,
    now: now,
  });

  // 4. 計算結果をすべて集約して返却
  return {
    nextStage,
    newConsecutiveDaysData, // BUDDING のみ値を持つ
    newAchievedHighQualityUnitIds, // BUDDING のみ値を持つ
    updatedUnitsWithSM2, // BLOOMING/MASTERED のみ値を持つ (SPLITモードのみ)
  };
}
