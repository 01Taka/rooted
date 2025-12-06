import { HALL_OF_FAME_DAYS, ONE_DAY_MS } from '../constants/main-constants';

/**
 * HALL_OF_FAME の特典期間終了日時を計算します (150日後)。
 */
export function getHallOfFameExpiry(now: number): number {
  return now + HALL_OF_FAME_DAYS * ONE_DAY_MS;
}
