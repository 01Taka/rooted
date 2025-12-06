import { LearningTarget } from '@/data/learningTarget/learningTarget.types';
import {
  LearningTargeMainState,
  SplitModeBlooming,
  SplitModeBudding,
  SplitModeHallOfFame,
  SplitModeSprouting,
  TargetModeBlooming,
  TargetModeBudding,
  TargetModeHallOfFame,
  TargetModeSprouting,
} from '@/data/learningTarget/learningTargetMainState.types';
import { UserEvaluation } from '../../types/user-evaluation.types';
import { calculateTransition } from './calculate-transition';
import { createStageTransitionHistoryItem } from './supports/create-stage-transition-history-item';
import { getRepresentativeUnitId } from './supports/get-representative-unit-id';

export function updateLearningTargetMainState(
  current: LearningTarget,
  evaluations: Record<string, UserEvaluation>,
  now: number
): LearningTarget {
  // 1. 計算
  const result = calculateTransition(current, evaluations, now);
  const { nextStage, isPromotion } = result;

  // 2. 基本プロパティの更新
  const updatedTarget: LearningTarget = {
    ...current,
    lastCommitmentAt: now,
    totalCommitmentCount: current.totalCommitmentCount + 1,
    // 履歴配列のコピー
    stageTransitionHistory: [...current.stageTransitionHistory],
  };

  // 3. 履歴の追加
  if (isPromotion) {
    updatedTarget.stageTransitionHistory.push(
      createStageTransitionHistoryItem(current.state.stage, nextStage, 'PROMOTION_SUCCESS', now)
    );
  }

  // 4. stateの再構築 (Discriminated Unionによる完全な型安全分岐)
  let newState: LearningTargeMainState;
  const mode = current.state.managementMode;

  // TypeScriptの制御フロー解析を効かせるため、nextStageで分岐
  switch (nextStage) {
    case 'SPROUTING': {
      if (mode === 'TARGET') {
        newState = {
          ...current.state,
          stage: 'SPROUTING',
          sproutingPromotionCount:
            result.newSproutingCount ??
            (current.state as TargetModeSprouting).sproutingPromotionCount,
          lastCountIncrementedAt: now,
        } as TargetModeSprouting;
      } else {
        newState = {
          ...current.state,
          stage: 'SPROUTING',
          sproutingPromotionCount:
            result.newSproutingCount ??
            (current.state as SplitModeSprouting).sproutingPromotionCount,
          lastCountIncrementedAt: now,
        } as SplitModeSprouting;
      }
      break;
    }

    case 'BUDDING': {
      if (!result.newConsecutiveDaysData || !result.newAchievedHighQualityUnitIds) {
        throw new Error('Budding data missing during update');
      }
      const commonBudding = {
        stage: 'BUDDING' as const,
        consecutiveDaysData: result.newConsecutiveDaysData,
        achievedHighQualityUnitIds: result.newAchievedHighQualityUnitIds,
      };

      if (mode === 'TARGET') {
        newState = {
          ...current.state,
          managementMode: 'TARGET',
          ...commonBudding,
        } as TargetModeBudding;
      } else {
        newState = {
          ...current.state,
          managementMode: 'SPLIT',
          ...commonBudding,
        } as SplitModeBudding;
      }
      break;
    }

    case 'BLOOMING':
    case 'MASTERED': {
      // BLOOMINGとMASTEREDは構造が似ているため共通化可能だが、厳密には分ける
      if (mode === 'TARGET') {
        // SM-2データ: 新規計算値があればそれを使用、なければ既存維持 (HoFからの降格など特殊ケース考慮)
        const sm2Data = result.newTargetSM2 ?? (current.state as any).sm2Data;
        if (!sm2Data) throw new Error('SM2 data missing for Target Mode Blooming/Mastered');

        newState = {
          ...current.state,
          managementMode: 'TARGET',
          stage: nextStage,
          sm2Data,
        } as TargetModeBlooming; // or Mastered
      } else {
        const units = result.newSplitUnitsSM2 ?? (current.state as any).units;
        if (!units) throw new Error('Unit data missing for Split Mode Blooming/Mastered');

        newState = {
          ...current.state,
          managementMode: 'SPLIT',
          stage: nextStage,
          units,
          representativeUnitId: getRepresentativeUnitId(units),
        } as SplitModeBlooming; // or Mastered
      }
      break;
    }

    case 'HALL_OF_FAME': {
      // 殿堂入り期間: SM-2データは既存維持（更新データがあればそれは移行時点のもの）
      // 期限の更新
      const expiresAt = result.hallOfFameExpiresAt ?? (current.state as any).masteredSlotExpiresAt;
      if (!expiresAt) throw new Error('Expiration date missing for Hall of Fame');

      if (mode === 'TARGET') {
        const sm2Data = result.newTargetSM2 ?? (current.state as any).sm2Data;
        newState = {
          ...current.state,
          managementMode: 'TARGET',
          stage: 'HALL_OF_FAME',
          sm2Data,
          masteredSlotExpiresAt: expiresAt,
        } as TargetModeHallOfFame;
      } else {
        const units = result.newSplitUnitsSM2 ?? (current.state as any).units;
        newState = {
          ...current.state,
          managementMode: 'SPLIT',
          stage: 'HALL_OF_FAME',
          units,
          masteredSlotExpiresAt: expiresAt,
          representativeUnitId: getRepresentativeUnitId(units),
        } as SplitModeHallOfFame;
      }
      break;
    }

    default:
      throw new Error(`Unexpected stage transition: ${nextStage}`);
  }

  updatedTarget.state = newState;
  return updatedTarget;
}
