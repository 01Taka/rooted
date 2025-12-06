import { LearningTargetState } from './learningTargetLiteral.types';

// 1. 初期作成
interface InitialCreationTransition {
  reason: 'INITIAL_CREATION';
  fromState: null;
  toState: 'SPROUTING';
  timestamp: number;
}

// 2. Masteredからの降格
interface MasteredDemotionTransition {
  reason: 'DEMOTION_MASTERED_FAIL';
  fromState: 'MASTERED';
  toState: 'BLOOMING';
  timestamp: number;
}

// 3. 殿堂への回復/復帰
interface RecoverySuccessTransition {
  reason: 'RECOVERY_SUCCESS';
  fromState: 'MASTERED';
  toState: 'HALL_OF_FAME';
  timestamp: number;
}

// 4. 一般的な成長/昇格
type PromotionSuccessTransition =
  | { reason: 'PROMOTION_SUCCESS'; fromState: 'SPROUTING'; toState: 'BUDDING'; timestamp: number }
  | { reason: 'PROMOTION_SUCCESS'; fromState: 'BUDDING'; toState: 'BLOOMING'; timestamp: number }
  | {
      reason: 'PROMOTION_SUCCESS';
      fromState: 'BLOOMING';
      toState: 'HALL_OF_FAME';
      timestamp: number;
    };

// すべての遷移タイプを統合
export type StageTransitionHistoryItem =
  | InitialCreationTransition
  | MasteredDemotionTransition
  | RecoverySuccessTransition
  | PromotionSuccessTransition;
