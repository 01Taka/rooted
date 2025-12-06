import { LearningTarget } from '@/data/learningTarget/learningTarget.types';
import { UserEvaluation } from '../types/user-evaluation.types';
import { applyCalculatedData } from './applyCalculatedData';
import { calculateUpdatedData } from './calculate-updated-data';

/**
 * 学習ターゲットの評価を行い、すべての状態（ステージ、カウンター、SM2データなど）を更新します。
 * （責務分離のため、計算と適用を分離）
 * @param currentLearningTarget 現在の学習ターゲット全体
 * @param evaluations 今回のユーザー評価
 * @param now 現在時刻 (ミリ秒)
 * @returns 更新された新しい LearningTarget オブジェクト
 */
export function updateLearningTargetMainState(
  currentLearningTarget: LearningTarget,
  evaluations: Record<string, UserEvaluation>,
  now: number
): LearningTarget {
  // 1. 次のステージと更新データ（計算結果）をすべて取得
  const calculatedData = calculateUpdatedData(currentLearningTarget, evaluations, now); // 2. 計算結果を適用し、最終的な LearningTarget オブジェクトを構築

  return applyCalculatedData(currentLearningTarget, calculatedData, now);
}
