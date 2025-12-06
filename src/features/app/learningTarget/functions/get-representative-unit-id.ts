import { LearningTargetUnitWithSM2 } from '@/data/learningTarget/learningTargetUnit.types';

/**
 * SPLITモードにおいて、最も定着度が低い（次の復習日が最も過去に近い）ユニットのIDを返します。
 * @param units - ユニットIDをキーとするユニットデータのレコード
 * @returns 代表ユニットのID
 */
export function getRepresentativeUnitId(units: Record<string, LearningTargetUnitWithSM2>): string {
  const unitIds = Object.keys(units);

  if (unitIds.length === 0) {
    // ユニットが存在しない場合は、空文字または例外を返すのが適切
    return '';
  }

  let representativeId = unitIds[0];
  let minReviewDate = units[representativeId].sm2Data.nextReviewDate;

  for (let i = 1; i < unitIds.length; i++) {
    const unitId = unitIds[i];
    const unitReviewDate = units[unitId].sm2Data.nextReviewDate;

    if (unitReviewDate < minReviewDate) {
      minReviewDate = unitReviewDate;
      representativeId = unitId;
    }
  }

  return representativeId;
}
