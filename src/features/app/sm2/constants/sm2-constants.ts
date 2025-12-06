import { ReviewNecessityStage } from '../../review-necessity/types/review-necessity-types';

/**
 * 時間によるQualityスコア補正に関するパラメータ群。
 * Level 0とLevel 1で異なる遅延閾値を定義します。
 */
export const SM2_TIME_PARAMS = {
  FAST_THRESHOLD: 0.7, // 基準時間の70%未満 → 速い
  SLOW_THRESHOLD_Q5: 1.05, // Level 0 (Q5) の減点閾値: 基準時間の105%以上
  SLOW_THRESHOLD_Q4: 1.3, // Level 1 (Q4) の減点閾値: 基準時間の130%以上
  ADJUSTMENT_STEP: 1, // 調整幅 (±1)
  MIN_QUALITY_AFTER_ADJ: 3, // 調整後の最小値
  MAX_QUALITY_AFTER_ADJ: 5, // 調整後の最大値
  TIME_RATIO_LIMIT: 5.0, // timeRatioの上限 (5倍)
} as const;

/**
 * 復習必要度レベル → SM-2 Qualityスコア対応表。
 */
export const SM2_QUALITY_MAP: Record<ReviewNecessityStage, number> = {
  0: 5, // 理解済み (Level 0)
  1: 4, // 不完全正解 (Level 1)
  2: 2, // 不安定/部分忘却 (Level 2)
  3: 0, // 忘却 (Level 3)
} as const;

// 基準時間が取得できない場合のデフォルト値
export const DEFAULT_REF_TIME_MS = 5000;
// 基準時間が取得できない場合のデフォルト値
export const DEFAULT_CATEGORY_ID = 'default';
