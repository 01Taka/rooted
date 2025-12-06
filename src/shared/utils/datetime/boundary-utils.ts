import { subHours } from 'date-fns';
import { APP_BOUNDARY_HOUR } from '@/shared/constants/app-constants';

/**
 * 渡されたタイムスタンプを、カスタムの日の境目（時間）に合わせて調整したDateオブジェクトに変換します。
 * * * @param timestamp - 調整したい日付と時刻のタイムスタンプ（ミリ秒）。
 * @param boundaryHour - 日の境目とする時間（0～23）。例: 4（朝4時が新しい0時となる）。
 * @returns {Date} 境界に合わせて時間が巻き戻された新しい Date オブジェクト。
 */
export const adjustDateForBoundary = (
  timestamp: string | number | Date,
  boundaryHour: number = APP_BOUNDARY_HOUR
): Date => {
  // タイムスタンプからDateオブジェクトを作成
  const originalDate: Date = new Date(timestamp);

  // 指定された時間分、時間を巻き戻す
  // date-fnsの subHours は元の Date オブジェクトを変更せず、新しい Date オブジェクトを返す
  return subHours(originalDate, boundaryHour);
};
