// get-promotion-check-args.ts

import { LearningTarget } from '@/data/learningTarget/learningTarget.types';
import { LearningTargetUnitWithSM2 } from '@/data/learningTarget/learningTargetUnit.types';
import { updateSM2TargetData } from '../../sm2/functions/calculate-sm2-state';
import { MIN_HIGH_QUALITY_SCORE, TARGET_ROOT_ID } from '../constants/main-constants';
import { UserEvaluation } from '../types/user-evaluation.types';
import { PromotionCheckArgs } from './check-promotion-conditions'; // 昇格判定に必要な引数の型
import { updateConsecutiveDays } from './update-consecutive-days';
import { updateUnitsSM2State } from './update-split-units-sm2';

/**
 * ステージ昇格判定ヘルパーに渡す引数オブジェクトを準備します。
 * この準備の過程で、SM-2の状態更新のシミュレーションと連続日数の計算を行います。
 * * @param learningTarget 現在の学習ターゲット全体
 * @param evaluations 今回のユーザー評価
 * @param processedQualities ユニットIDごとのQ値
 * @param now 現在時刻
 * @returns PromotionCheckArgs インターフェースを満たすオブジェクト
 */
export function getPromotionCheckArgs(
  learningTarget: LearningTarget,
  evaluations: Record<string, UserEvaluation>,
  processedQualities: Record<string, number>,
  now: number
): Omit<PromotionCheckArgs, 'currentStage' | 'newTotalCommitmentCount' | 'now'> {
  // 最終的な引数から共通プロパティを除いたもの

  const { state, totalCommitmentCount, lastCommitmentAt } = learningTarget;
  const isTargetMode = state.managementMode === 'TARGET';

  let newConsecutiveDays = 0;
  let isSuccessPathAchieved = false;
  let sm2NextReviewDates: number[] = [];

  // --- BUDDING ステージの判定データ計算 ---
  if (state.stage === 'BUDDING') {
    // 1. 連続日数の計算
    const newConsecutiveDaysData = updateConsecutiveDays(
      state.consecutiveDaysData,
      lastCommitmentAt,
      now
    );
    newConsecutiveDays = newConsecutiveDaysData.consecutiveDays;

    // 2. 成果パス達成の判定
    let tempAchievedIds = [...state.achievedHighQualityUnitIds];
    const unitKeys = isTargetMode ? [TARGET_ROOT_ID] : Object.keys(state.units);

    // 今回の評価による達成をシミュレート
    for (const key of unitKeys) {
      if (processedQualities[key] >= MIN_HIGH_QUALITY_SCORE && !tempAchievedIds.includes(key)) {
        tempAchievedIds.push(key);
      }
    }
    // 全ユニットが達成済みか
    isSuccessPathAchieved = tempAchievedIds.length === unitKeys.length;
  }

  // --- BLOOMING/MASTERED ステージの判定データ計算（SM-2更新シミュレーション） ---
  else if (state.stage === 'BLOOMING' || state.stage === 'MASTERED') {
    if (isTargetMode) {
      // TARGETモード
      const updatedSM2 = updateSM2TargetData(
        state.sm2Data,
        evaluations[TARGET_ROOT_ID] || Object.values(evaluations)[0],
        now
      );
      sm2NextReviewDates = [updatedSM2.nextReviewDate];
    } else {
      // SPLITモード
      const currentUnits = state.units as Record<string, LearningTargetUnitWithSM2>;
      const unitEvaluations = evaluations as Record<string, UserEvaluation>;

      // SM-2の状態更新をシミュレート更新
      const updatedUnits: Record<string, LearningTargetUnitWithSM2> = updateUnitsSM2State(
        currentUnits,
        unitEvaluations,
        now
      );

      // 全ユニットの新しい間隔を抽出
      sm2NextReviewDates = Object.values(updatedUnits).map((u) => u.sm2Data.nextReviewDate);
    }
  }

  // 昇格判定に必要な引数を返す
  return {
    newConsecutiveDays,
    isSuccessPathAchieved,
    sm2NextReviewDates, // 間隔（日数）を渡す
  };
}
