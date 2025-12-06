import { LearningTargetEvaluationMode } from './learningTargetLiteral.types';

export interface LearningTargetActivityBase {
  evaluationMode: LearningTargetEvaluationMode;
  timestamp: number;
  /** 取組のSM2クオリティー */
  // calculatedQuality: number;
}

/**
 * 評価モード: ワンタップ (Q=4 固定)
 * - 疲れている日、維持目的
 * - 固有データは不要
 */
export interface LearningTargetActivityTap extends LearningTargetActivityBase {
  evaluationMode: 'TAP';
  // TAPモード固有のデータフィールドは特に必要ありません
}

/**
 * 評価モード: 正誤 (Q=4 / Q=1)
 * - クイックチェック
 */
export interface LearningTargetActivityPassFail extends LearningTargetActivityBase {
  evaluationMode: 'PASS_FAIL';
  /** 正解したかどうかを示すフラグ */
  isCorrect: boolean; // 正解: true, 不正解: false
}

export interface LearningTargetActivityStar extends LearningTargetActivityBase {
  evaluationMode: 'STAR';
  /** ユーザーが選択したスターレベル (0 から 5 の整数値) */
  level: number;
}

/**
 * 評価モード: 得点率 (Q=0〜5 の詳細計算)
 * - 正確な定着度確認
 */
export interface LearningTargetActivityScore extends LearningTargetActivityBase {
  evaluationMode: 'SCORE';
  /** 0〜100 の得点率 (SuperMemo SM-2の Quality (Q) 算出に利用) */
  percentage: number;
}

export type LearningTargetActivity =
  | LearningTargetActivityTap
  | LearningTargetActivityPassFail
  | LearningTargetActivityStar
  | LearningTargetActivityScore;
