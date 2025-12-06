/**
 * 評価モード 'TAP' に対応する UserEvaluation
 * value は存在しない (undefined)
 */
export interface UserEvaluationTap {
  mode: 'TAP';
  value?: never; // valueが存在しないことを明示
}

/**
 * 評価モード 'PASS_FAIL' に対応する UserEvaluation
 * value は boolean (true/false)
 */
export interface UserEvaluationPassFail {
  mode: 'PASS_FAIL';
  value: boolean;
}

/**
 * 評価モード 'STAR' に対応する UserEvaluation
 * value は 0から5の整数を表現するための number
 */
export interface UserEvaluationStar {
  mode: 'STAR';
  value: 0 | 1 | 2 | 3 | 4 | 5; // 0~5の整数に制約
}

/**
 * 評価モード 'SCORE' に対応する UserEvaluation
 * value は 0から100の小数を表現するための number
 */
export interface UserEvaluationScore {
  mode: 'SCORE';
  value: number; // 0~100の浮動小数点数を許容
}

/**
 * 最終的な UserEvaluation 型 (識別されたユニオン)
 * mode の値によって value の型が自動的に決定される
 */
export type UserEvaluation =
  | UserEvaluationTap
  | UserEvaluationPassFail
  | UserEvaluationStar
  | UserEvaluationScore;
