/**
 * SM-2アルゴリズムの状態を定義します。
 */
export interface LearningTargetSM2State {
  interval: number; // I: 次の復習までの間隔 (日数)
  easeFactor: number; // EF: 易しさ係数
  repetitions: number; // n: 正解の連続回数
}

export interface LearningTargetSM2TargetData {
  state: LearningTargetSM2State;
  lastActiveAt: number;
  nextReviewDate: number;
}
