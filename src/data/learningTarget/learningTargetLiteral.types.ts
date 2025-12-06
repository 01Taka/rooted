export type LearningTargetEvaluationMode = 'TAP' | 'PASS_FAIL' | 'STAR' | 'SCORE';

export type LearningTargetManagementMode = 'TARGET' | 'SPLIT';

/**
 * 植物（学習目標）の成長段階
 * ユーザーのコミットメントレベルと知識の定着度を示す
 */
export type LearningTargetStage =
  | 'SPROUTING' // 芽を植える
  | 'BUDDING' // つぼみをつける
  | 'BLOOMING' // 花をめでる
  | 'MASTERED' // 大成した花 殿堂入り条件達成済み（復習間隔100日超）
  | 'HALL_OF_FAME'; // 150日間の特典期間中（保護状態）

export type StageTransitionReason =
  | 'PROMOTION_SUCCESS'
  | 'DEMOTION_MASTERED_FAIL'
  | 'RECOVERY_SUCCESS'
  | 'INITIAL_CREATION';

export type GreenhouseTransitionReason = 'MANUAL_USER_REQUEST' | 'AUTO_MASTERED_EXPIRY';
