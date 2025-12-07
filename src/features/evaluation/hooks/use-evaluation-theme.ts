// use-evaluation-theme.ts
import { useMemo } from 'react';
import { QUALITY_COLORS } from '../constants/evaluation-constants';

// Quality型は外部からインポートされるものと仮定
type Quality = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Q値に基づいて色を判定するヘルパー
 */
const getQualityColor = (quality: Quality | null): string => {
  if (quality === null) return QUALITY_COLORS.UNKNOWN;
  return quality >= 3 ? QUALITY_COLORS.SUCCESS : QUALITY_COLORS.FAILURE;
};

/**
 * Q値に基づいてメインカラーを取得するカスタムフック
 * @param quality - 算出されたQ値 (0-5 or null)
 * @returns 判定された色の文字列
 */
export const useQualityColor = (quality: Quality | null) => {
  return useMemo(() => getQualityColor(quality), [quality]);
};
