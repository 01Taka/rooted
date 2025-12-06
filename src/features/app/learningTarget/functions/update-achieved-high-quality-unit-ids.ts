const MIN_HIGH_QUALITY_SCORE = 3; // Q >= 3

/**
 * 高得点を達成したユニットIDリストを更新します。
 */
export function updateAchievedHighQualityUnitIds(
  currentIds: string[],
  unitId: string,
  qualityScore: number
): string[] {
  // すでに達成済みなら何もしない
  if (currentIds.includes(unitId)) {
    return currentIds;
  }

  // 今回が高得点ならリストに追加
  if (qualityScore >= MIN_HIGH_QUALITY_SCORE) {
    return [...currentIds, unitId];
  }

  return currentIds;
}
