import { addDays, format } from 'date-fns';
import { adjustDateForBoundary } from './boundary-utils';

export const dateToyyyyMMdd = (date: string | number | Date) => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * 現在の「カスタム境目に基づく今日」の日付を 'yyyy-MM-dd' 形式で返します。
 * @returns 処理後の日付の文字列（'yyyy-MM-dd'形式）
 */
export const getToday = (): string => {
  // 1. 現在時刻を境目に合わせて調整
  const adjustedNow = adjustDateForBoundary(Date.now());

  // 2. 調整後の日付を 'yyyy-MM-dd' 形式で整形
  return dateToyyyyMMdd(adjustedNow);
};

/**
 * 現在の日付（カスタム境目非考慮）に指定された日数を足した後の日付を 'yyyy-MM-dd' 形式で返します。
 * （注意: この関数はカスタムの日の境目を考慮しません）
 *
 * @param daysToAdd 現在の日付に足す日数（整数）
 * @returns 処理後の日付の文字列（'yyyy-MM-dd'形式）
 */
export function getDateAfterDays(
  daysToAdd: number,
  timestamp: string | number | Date = Date.now()
): string {
  // 境界調整を適用しない元の時刻を使用
  const originalDate = new Date(timestamp);
  const newDate = addDays(originalDate, daysToAdd);

  return dateToyyyyMMdd(newDate);
}

// getDateAfterDays_Boundary版の提案 (カスタム境目を考慮した日付加算が必要な場合)
export function getDateAfterDaysBoundary(
  daysToAdd: number,
  timestamp: string | number | Date = Date.now()
): string {
  // 1. 境目を考慮して日付を調整
  const adjustedNow = adjustDateForBoundary(timestamp);

  // 2. 調整済みのDateオブジェクトに日数を加算
  const newDate = addDays(adjustedNow, daysToAdd);

  // 3. 結果を整形
  return dateToyyyyMMdd(newDate);
}

/**
 * 渡された日付が「カスタム境目に基づく今日」と同じかどうかを判定します。
 *
 * @param date 比較対象の日付（文字列、数値、Dateオブジェクト）
 * @returns 今日と同じなら true
 */
export const isToday = (date: string | number | Date): boolean => {
  // 比較対象の日付も境目を考慮して調整
  const adjustedTargetDate = adjustDateForBoundary(date);

  // 調整された日付を 'yyyy-MM-dd' 形式で整形
  const formattedTargetDate = dateToyyyyMMdd(adjustedTargetDate);

  // 調整された今日の日付と比較
  return getToday() === formattedTargetDate;
};

/**
 * 配列内に「カスタム境目に基づく今日」と同じ日付の要素が含まれるかどうかを判定します。
 *
 * @param dates 比較対象の日付の配列（文字列、数値、Dateオブジェクトの配列）
 * @returns 配列に今日と同じ日付が含まれていれば true
 */
export const containsToday = (dates: (string | number | Date)[]): boolean => {
  // 配列のいずれかの要素が isToday(element) の条件を満たすかを確認します。
  return dates.some((date) => isToday(date));
};
