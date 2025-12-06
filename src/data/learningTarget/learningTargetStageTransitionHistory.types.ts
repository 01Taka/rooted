// 1. 初期作成
interface InitialCreationTransition {
  reason: 'INITIAL_CREATION';
  fromStage: null;
  toStage: 'SPROUTING';
  timestamp: number;
}

// 2. Masteredからの降格
interface MasteredDemotionTransition {
  reason: 'DEMOTION_MASTERED_FAIL';
  fromStage: 'MASTERED';
  toStage: 'BLOOMING';
  timestamp: number;
}

// 3. 殿堂への回復/復帰
interface RecoverySuccessTransition {
  reason: 'RECOVERY_SUCCESS';
  fromStage: 'MASTERED';
  toStage: 'HALL_OF_FAME';
  timestamp: number;
}

// 4. 一般的な成長/昇格
type PromotionSuccessTransition =
  | { reason: 'PROMOTION_SUCCESS'; fromStage: 'SPROUTING'; toStage: 'BUDDING'; timestamp: number }
  | { reason: 'PROMOTION_SUCCESS'; fromStage: 'BUDDING'; toStage: 'BLOOMING'; timestamp: number }
  | {
      reason: 'PROMOTION_SUCCESS';
      fromStage: 'BLOOMING';
      toStage: 'HALL_OF_FAME';
      timestamp: number;
    };

// すべての遷移タイプを統合
export type StageTransitionHistoryItem =
  | InitialCreationTransition
  | MasteredDemotionTransition
  | RecoverySuccessTransition
  | PromotionSuccessTransition;
