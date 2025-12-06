import { UserEvaluation } from '../../learningTarget/types/update-learning-target.types';
import { DEFAULT_SM2_STATE, SM2_SCHEDULER_PARAMS } from '../constants/sm2-schedule-constants';
import { SM2State, SM2TargetData } from '../types/sm2-types';
import { calculateSM2Quality } from './calculate-sm2-quality';

/**
 * SM-2のQualityスコアに基づいて、SM-2の状態 (I, EF, n) を更新します。
 */
export function updateSM2State(currentState: SM2State, qualityScore: number): SM2State {
  const p = SM2_SCHEDULER_PARAMS;
  let { interval: I, easeFactor: EF, repetitions: n } = currentState;

  if (qualityScore >= 3) {
    if (n === 0) {
      I = p.FIRST_INTERVAL;
    } else if (n === 1) {
      I = p.SECOND_INTERVAL;
    } else {
      I = Math.round(I * EF);
    }

    n += 1;

    const qDiff = 5 - qualityScore;
    EF =
      EF +
      (p.EF_ADJUSTMENT_COEFFICIENT_A -
        qDiff * (p.EF_ADJUSTMENT_COEFFICIENT_B + qDiff * p.EF_ADJUSTMENT_COEFFICIENT_C));

    if (EF < p.MIN_EF) EF = p.MIN_EF;
    if (EF > p.MAX_EF) EF = p.MAX_EF;
  } else {
    n = p.RESET_REPETITIONS;
    I = p.RESET_INTERVAL;
  }

  return { interval: I, easeFactor: EF, repetitions: n };
}

export const calculateSM2State = (evaluations: UserEvaluation[]): SM2State => {
  let currentState = DEFAULT_SM2_STATE;

  for (const evaluation of evaluations) {
    // a. Qualityスコアを計算
    const qualityScore = calculateSM2Quality(evaluation);
    // b. SM-2の状態を更新
    currentState = updateSM2State(currentState, qualityScore);
  }

  return currentState;
};

/**
 * SM-2の状態と最終活動時間に基づき、次の復習推奨日時を計算します。
 * @param state 更新されたSM-2の状態
 * @param lastActiveAt ユーザーが評価を行った時刻 (ミリ秒)
 * @returns 次回復習推奨日時 (ミリ秒)
 */
export function calculateNextReviewDate(state: SM2State, lastActiveAt: number): number {
  // state.interval は日数なので、ミリ秒に変換して加算
  const intervalMs = state.interval * 24 * 60 * 60 * 1000;
  return lastActiveAt + intervalMs;
}

export function updateSM2TargetData(
  currentData: SM2TargetData,
  evaluation: UserEvaluation,
  now: number
): SM2TargetData {
  // 1. Qualityスコアを計算
  const qualityScore = calculateSM2Quality(evaluation);

  // 2. SM-2の状態を更新
  const newState = updateSM2State(currentData.state, qualityScore);

  // 3. 次回復習推奨日時を計算
  const nextReviewDate = calculateNextReviewDate(newState, now);

  return {
    state: newState,
    lastActiveAt: now, // 最後に活動した日時を現在時刻に更新
    nextReviewDate: nextReviewDate,
  };
}
