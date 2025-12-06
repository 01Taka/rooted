import { addDays, differenceInCalendarDays, isSameDay, subDays } from 'date-fns';
import { adjustDateForBoundary } from './boundary-utils';

/**
 * UNIXミリ秒（タイムスタンプ）が「n日前の日付」であるかを確認します。
 * 日の境目は boundaryHour で指定します。
 * * @param timestampMs - 確認したいUNIXミリ秒。
 * @param nDaysAgo - 日数。正の数で過去、負の数で未来。
 * @param boundaryHour - 日の境目とする時間（0～23）。例: 4（朝4時）。
 * @returns 該当の日付範囲内であれば true。
 */
export const isNDaysAgo = (timestampMs: number, nDaysAgo: number): boolean => {
  // 1. 基準となる現在の日付を取得
  const now = new Date();

  // 2.   現在時刻をカスタム境界に合わせて調整し、真の「今日」を決定する
  const adjustedNow = adjustDateForBoundary(now);

  // 3. n日前の日付を計算 (調整後の現在時刻から nDaysAgo を計算)
  const targetDate =
    nDaysAgo >= 0 ? subDays(adjustedNow, nDaysAgo) : addDays(adjustedNow, Math.abs(nDaysAgo));

  // 4. 比較対象のタイムスタンプもカスタム境界に合わせて調整
  const adjustedTimestamp = adjustDateForBoundary(timestampMs);

  // 5. 調整済みの2つの日付が同じ日であるかを比較
  return isSameDay(adjustedTimestamp, targetDate);
};

// 時刻情報のないyyyy-MM-dd形式のパターンをチェックする正規表現
// 例: "2023-11-14"
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * カスタムの日の境目（時間）に基づいて、2つのタイムスタンプ間の日数差を計算します。
 * * 日の境目を境目時間（boundaryHour）とするために、両方のタイムスタンプから
 * その時間分を減算（subHours）し、調整された日付の差分を differenceInDays で計算します。
 * * @param timestampB - 比較対象の後のタイムスタンプ（ミリ秒、または日付文字列）。
 * @param timestampA - 比較対象の前のタイムスタンプ（ミリ秒、または日付文字列）。
 * @returns {number} 日付の差分（timestampB - timestampA）。
 */
export const getDaysDifference = (
  timestampB: string | number | Date,
  timestampA: string | number | Date = new Date(),
  check: boolean = true
): number => {
  // --- 警告チェックの追加 ---

  const checkAndWarn = (
    timestamp: string | number | Date,
    paramName: 'timestampA' | 'timestampB'
  ) => {
    if (typeof timestamp === 'string' && DATE_ONLY_PATTERN.test(timestamp)) {
      console.warn(
        `[WARN] ${paramName} に時刻情報のない日付文字列 ("${timestamp}") が渡されました。` +
          `日の境目（boundaryHour）の調整は、この日付文字列がパースされた際に` +
          `設定される**暗黙の時刻（通常は00:00:00）**に依存します。` +
          `意図しない結果を避けるため、可能であれば完全なタイムスタンプ（日時）を渡すことを推奨します。`
      );
    }
  };

  if (check) {
    checkAndWarn(timestampA, 'timestampA');
    checkAndWarn(timestampB, 'timestampB');
  }

  const adjustedDateA: Date = adjustDateForBoundary(timestampA);
  const adjustedDateB: Date = adjustDateForBoundary(timestampB);

  // 調整された日付で、時刻を考慮しない日数差を計算
  return differenceInCalendarDays(adjustedDateB, adjustedDateA);
};
