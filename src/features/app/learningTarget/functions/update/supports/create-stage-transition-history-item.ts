import {
  LearningTargetStage,
  StageTransitionReason,
} from '@/data/learningTarget/learningTargetLiteral.types';
import { StageTransitionHistoryItem } from '@/data/learningTarget/learningTargetStageTransitionHistory.types';

/**
 * ステージ遷移履歴アイテムを生成します。
 */
export function createStageTransitionHistoryItem(
  fromStage: LearningTargetStage | null,
  toStage: LearningTargetStage,
  reason: StageTransitionReason,
  now: number
): StageTransitionHistoryItem {
  // TypeScriptのDiscriminated Unionに適合させるための分岐
  if (reason === 'INITIAL_CREATION' && toStage === 'SPROUTING') {
    return { reason, fromStage: null, toStage: 'SPROUTING', timestamp: now };
  }

  if (reason === 'DEMOTION_MASTERED_FAIL' && fromStage === 'MASTERED' && toStage === 'BLOOMING') {
    return { reason, fromStage: 'MASTERED', toStage: 'BLOOMING', timestamp: now };
  }

  if (reason === 'RECOVERY_SUCCESS' && fromStage === 'MASTERED' && toStage === 'HALL_OF_FAME') {
    return { reason, fromStage: 'MASTERED', toStage: 'HALL_OF_FAME', timestamp: now };
  }

  if (reason === 'PROMOTION_SUCCESS') {
    // 型安全のために具体的な遷移をチェック
    if (fromStage === 'SPROUTING' && toStage === 'BUDDING') {
      return { reason, fromStage: 'SPROUTING', toStage: 'BUDDING', timestamp: now };
    }
    if (fromStage === 'BUDDING' && toStage === 'BLOOMING') {
      return { reason, fromStage: 'BUDDING', toStage: 'BLOOMING', timestamp: now };
    }
    if (fromStage === 'BLOOMING' && toStage === 'HALL_OF_FAME') {
      return { reason, fromStage: 'BLOOMING', toStage: 'HALL_OF_FAME', timestamp: now };
    }
  }

  throw new Error(`Invalid stage transition: ${fromStage} -> ${toStage} with reason ${reason}`);
}
