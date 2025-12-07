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
import { createActivityHistoryItem } from './supports/create-activity-history';
import { createStageTransitionHistoryItem } from './supports/create-stage-transition-history-item';
import { getRepresentativeUnitId } from './supports/get-representative-unit-id';

export function updateLearningTargetMainState(
  current: LearningTarget,
  evaluations: Record<string, UserEvaluation>,
  now: number
): LearningTarget {
  // 1. 計算 (変更なし)
  const result = calculateTransition(current, evaluations, now);
  const { nextStage, isPromotion } = result;

  // 2. 基本プロパティと履歴配列の準備
  // activityHistory もコピーして新しい配列にする
  const updatedActivityHistory = [...current.activityHistory];
  const updatedStageHistory = [...current.stageTransitionHistory];

  // 3. アクティビティ履歴の作成と追加
  const newActivityItem = createActivityHistoryItem(current, evaluations, nextStage, now);
  updatedActivityHistory.push(newActivityItem); // 末尾に追加 (時系列順)

  // 4. ステージ移行履歴の追加 (変更なし)
  if (isPromotion) {
    updatedStageHistory.push(
      createStageTransitionHistoryItem(current.state.stage, nextStage, 'PROMOTION_SUCCESS', now)
    );
  }

  const updatedTarget: LearningTarget = {
    ...current,
    lastCommitmentAt: now,
    totalCommitmentCount: current.totalCommitmentCount + 1,
    stageTransitionHistory: updatedStageHistory,
    activityHistory: updatedActivityHistory, // 更新した履歴をセット
  };

  // 5. stateの再構築 (以下、前回のコードと同様)
  let newState: LearningTargeMainState;
  const mode = current.state.managementMode;

  switch (nextStage) {
    case 'SPROUTING': {
      if (mode === 'TARGET') {
        newState = {
          ...current.state,
          stage: 'SPROUTING',
          sproutingPromotionCount:
            result.newSproutingCount ??
            (current.state as TargetModeSprouting).sproutingPromotionCount,
          lastCountIncrementedAt:
            result.newSproutingCount !== undefined
              ? now
              : (current.state as TargetModeSprouting).lastCountIncrementedAt,
        } as TargetModeSprouting;
      } else {
        newState = {
          ...current.state,
          stage: 'SPROUTING',
          sproutingPromotionCount:
            result.newSproutingCount ??
            (current.state as SplitModeSprouting).sproutingPromotionCount,
          lastCountIncrementedAt:
            result.newSproutingCount !== undefined
              ? now
              : (current.state as SplitModeSprouting).lastCountIncrementedAt,
        } as SplitModeSprouting;
      }
      break;
    }

    case 'BUDDING': {
      // ... (前回のコードと同じため省略。必要な場合は提示します)
      if (!result.newConsecutiveDaysData || !result.newAchievedHighQualityUnitIds) {
        // エラーハンドリング: データ欠落時は既存データをフォールバックとして使用することも検討可能
        // ここでは厳密にチェック
        if (current.state.stage === 'BUDDING') {
          // 既存維持
          const cur = current.state as TargetModeBudding; // or Split
          result.newConsecutiveDaysData = cur.consecutiveDaysData;
          result.newAchievedHighQualityUnitIds = cur.achievedHighQualityUnitIds;
        } else {
          throw new Error('Budding data missing during update');
        }
      }
      const commonBudding = {
        stage: 'BUDDING' as const,
        consecutiveDaysData: result.newConsecutiveDaysData!,
        achievedHighQualityUnitIds: result.newAchievedHighQualityUnitIds!,
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
      if (mode === 'TARGET') {
        const sm2Data = result.newTargetSM2 ?? (current.state as any).sm2Data;
        if (!sm2Data) throw new Error('SM2 data missing for Target Mode Blooming/Mastered');

        newState = {
          ...current.state,
          managementMode: 'TARGET',
          stage: nextStage,
          sm2Data,
        } as TargetModeBlooming;
      } else {
        const units = result.newSplitUnitsSM2 ?? (current.state as any).units;
        if (!units) throw new Error('Unit data missing for Split Mode Blooming/Mastered');

        newState = {
          ...current.state,
          managementMode: 'SPLIT',
          stage: nextStage,
          units,
          representativeUnitId: getRepresentativeUnitId(units),
        } as SplitModeBlooming;
      }
      break;
    }

    case 'HALL_OF_FAME': {
      const expiresAt = result.hallOfFameExpiresAt ?? (current.state as any).masteredSlotExpiresAt;
      if (!expiresAt) throw new Error('Expiration date missing for Hall of Fame');

      if (mode === 'TARGET') {
        const sm2Data = result.newTargetSM2 ?? (current.state as any).sm2Data;
        newState = {
          ...current.state,
          managementMode: 'TARGET',
          stage: 'HALL_OF_FAME',
          sm2Data, // 維持または移行時のデータ
          masteredSlotExpiresAt: expiresAt,
        } as TargetModeHallOfFame;
      } else {
        const units = result.newSplitUnitsSM2 ?? (current.state as any).units;
        newState = {
          ...current.state,
          managementMode: 'SPLIT',
          stage: 'HALL_OF_FAME',
          units, // 維持または移行時のデータ
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
