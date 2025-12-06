import { calculateSM2Quality } from '../../../../sm2/functions/calculate-sm2-quality';
import { TARGET_ROOT_ID } from '../../../constants/main-constants';
import { UserEvaluation } from '../../../types/user-evaluation.types';

/**
 * ユーザー評価データからSM-2 Qualityスコアを計算し、ユニットID（またはターゲットモードID）をキーとする
 * 連想配列として返します。
 * * @param evaluations 評価の連想配列 (SPLIT) または単一評価の連想配列 (TARGET)
 * @param isTargetMode TARGETモードであるか
 * @returns ユニットIDをキーとするQualityスコアの連想配列
 */
export function getCommitmentQualityScores(
  evaluations: Record<string, UserEvaluation>,
  isTargetMode: boolean
): Record<string, number> {
  const processedQualities: Record<string, number> = {};

  if (isTargetMode) {
    const singleEvaluation = Object.values(evaluations)[0];
    if (singleEvaluation) {
      processedQualities[TARGET_ROOT_ID] = calculateSM2Quality(singleEvaluation);
    }
  } else {
    for (const unitId in evaluations) {
      processedQualities[unitId] = calculateSM2Quality(evaluations[unitId]);
    }
  }

  return processedQualities;
}
