import { SM2State } from '../types/sm2-types';

/**
 * SM-2スケジューリング計算に関するパラメータ群。
 */
export const SM2_SCHEDULER_PARAMS = {
  // 状態初期値
  INITIAL_EF: 2.5, // 初期易しさ係数 (EF)
  // Quality < 3 の時のリセット値
  RESET_INTERVAL: 1, // 忘却時の間隔リセット値 (日数)
  RESET_REPETITIONS: 0, // 忘却時の連続正解回数リセット値
  // 最初の復習間隔 (日数)
  FIRST_INTERVAL: 1, // 1回目 (n=0 -> n=1) の間隔
  SECOND_INTERVAL: 6, // 2回目 (n=1 -> n=2) の間隔
  // EF更新に関する係数
  EF_ADJUSTMENT_COEFFICIENT_A: 0.1,
  EF_ADJUSTMENT_COEFFICIENT_B: 0.08,
  EF_ADJUSTMENT_COEFFICIENT_C: 0.02,
  // EFの下限
  MIN_EF: 1.3,
  MAX_EF: 3.0,
  // 即時復習の間隔 (ms): 間隔が1日未満の場合に適用
  IMMEDIATE_REVIEW_MS: 1 * 60 * 60 * 1000, // 1時間
} as const;

/**
 * SM-2の状態初期値 (問題がまだ学習されていない場合)
 */
export const DEFAULT_SM2_STATE: SM2State = {
  interval: 0,
  easeFactor: SM2_SCHEDULER_PARAMS.INITIAL_EF,
  repetitions: 0,
} as const;
