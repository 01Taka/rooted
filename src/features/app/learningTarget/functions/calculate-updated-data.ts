// calculate-updated-data.ts

import { LearningTarget } from '@/data/learningTarget/learningTarget.types';
import { LearningTargetConsecutiveDays } from '@/data/learningTarget/learningTargetConsecutiveDays.types';
import { LearningTargetStage } from '@/data/learningTarget/learningTargetLiteral.types';
import { LearningTargetSM2TargetData } from '@/data/learningTarget/learningTargetSM2.types';
import { LearningTargetUnitWithSM2 } from '@/data/learningTarget/learningTargetUnit.types';
import { updateSM2TargetData } from '../../sm2/functions/calculate-sm2-state';
import { UserEvaluation } from '../types/user-evaluation.types';
import { calculateNextStageData } from './calculate-next-stage-data';
import { getHallOfFameExpiry } from './get-hall-of-fame-expiry';

// （既存のcalculateNextStageDataの結果の型を拡張した型を仮定します）
export type LearningTargetUpdateData = {
  nextStage: LearningTargetStage | null;
  newConsecutiveDaysData: LearningTargetConsecutiveDays | null;
  newAchievedHighQualityUnitIds: string[] | null;
  updatedUnitsWithSM2: Record<string, LearningTargetUnitWithSM2> | null; // SPLITモード用: SM2適用済みユニット
  updatedTargetSM2: LearningTargetSM2TargetData | null; // TARGETモード用: SM2適用済みデータ
  stagePromotion: boolean; // ステージ昇格があったかどうか
  predictedMasteredSlotExpiresAt: number;
};

/**
 * ユーザー評価に基づき、学習ターゲットの状態を更新するために必要なデータをすべて計算します。
 * @param currentLearningTarget 現在の学習ターゲット全体
 * @param evaluations 今回のユーザー評価
 * @param now 現在時刻 (ミリ秒)
 * @returns 状態更新に必要なすべてのデータ
 */
export function calculateUpdatedData(
  currentLearningTarget: LearningTarget,
  evaluations: Record<string, UserEvaluation>,
  now: number
): LearningTargetUpdateData {
  // 1. 次のステージと基本的な更新データを計算
  const calculatedStageData = calculateNextStageData(currentLearningTarget, evaluations, now);
  let { nextStage, newConsecutiveDaysData, newAchievedHighQualityUnitIds, updatedUnitsWithSM2 } =
    calculatedStageData;

  const currentStage = currentLearningTarget.state.stage;
  const stagePromotion = !!nextStage && nextStage !== currentStage; // 2. SM2運用ステージのデータ更新（昇格時または通常運用時）

  let updatedTargetSM2 = null;

  const isSM2Stage =
    nextStage === 'BLOOMING' ||
    nextStage === 'MASTERED' ||
    nextStage === 'HALL_OF_FAME' ||
    (!stagePromotion &&
      (currentStage === 'BLOOMING' ||
        currentStage === 'MASTERED' ||
        currentStage === 'HALL_OF_FAME'));

  if (isSM2Stage) {
    if (currentLearningTarget.state.managementMode === 'TARGET') {
      // TARGETモード: SM2データを計算
      const rootEvaluation = Object.values(evaluations)[0];
      const currentSM2Data =
        (currentLearningTarget.state as any).sm2Data || {}; /* ステージ移行時の初期値 */
      updatedTargetSM2 = updateSM2TargetData(currentSM2Data, rootEvaluation, now);
    } // SPLITモードの unitsWithSM2 は、`calculateNextStageData`が既に計算している前提
    // （元のコードの`updatedUnitsWithSM2`がこれに相当）
  } else {
    updatedUnitsWithSM2 = null; // SM2ステージ以外では不要なためクリア
  }

  const predictedMasteredSlotExpiresAt = getHallOfFameExpiry(now);

  return {
    nextStage,
    newConsecutiveDaysData,
    newAchievedHighQualityUnitIds,
    updatedUnitsWithSM2,
    updatedTargetSM2,
    stagePromotion,
    predictedMasteredSlotExpiresAt,
  };
}
