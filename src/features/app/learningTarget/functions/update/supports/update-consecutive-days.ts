import { LearningTargetConsecutiveDays } from '@/data/learningTarget/learningTargetConsecutiveDays.types';
import {
  INITIAL_CONSECUTIVE_DAYS,
  MAX_RESET_BLOCK_COUNT,
  ONE_DAY_MS,
} from '../../../constants/main-constants';

/**
 * 連続日数を更新し、リセットブロックの消費/チャージ判定を行います。
 * * 新ロジック:
 * - 欠席日数（diffDays - 1）分のブロックを消費する。
 * - ブロックが足りない場合、連続日数をリセットし、ブロックをMAXまで1づつチャージする。
 * - 翌日コミットの場合 (diffDays === 1)、連続日数をインクリメントし、ブロックをMAXまでチャージする。
 * - 同日コミットの場合 (diffDays === 0)、更新は行われない。
 * * @param currentData 現在の連続日数データ
 * @param lastCommitmentAt 前回のコミットメント時刻
 * @param now 現在時刻
 */
export function updateConsecutiveDays(
  currentData: LearningTargetConsecutiveDays,
  lastCommitmentAt: number,
  now: number
): LearningTargetConsecutiveDays {
  // 日付の正規化（時刻を00:00:00にセットして日付のみを比較）
  const lastDate = new Date(lastCommitmentAt);
  lastDate.setHours(0, 0, 0, 0);

  const nowDate = new Date(now);
  nowDate.setHours(0, 0, 0, 0);

  const diffTime = nowDate.getTime() - lastDate.getTime();
  // Math.roundを使用することで、夏時間などの影響を考慮しても正確な日数を取得
  const diffDays = Math.round(diffTime / ONE_DAY_MS);

  let { consecutiveDays, resetBlockCount, lastResetBlockUsedAt, lastResetBlockChargedAt } =
    currentData;

  // ----------------------------------------------------
  // 日付差に応じた処理
  // ----------------------------------------------------

  if (diffDays === 0) return currentData;

  if (diffDays === 1) {
    // 2. 翌日の場合：連続日数をインクリメント。ブロックをMAXまで1づつチャージ。
    consecutiveDays += 1;
    if (resetBlockCount < MAX_RESET_BLOCK_COUNT) {
      // 念のためMAX_RESET_BLOCK_COUNTでクリップ
      resetBlockCount = Math.min(resetBlockCount + 1, MAX_RESET_BLOCK_COUNT);
      lastResetBlockChargedAt = now;
    }
  } else if (diffDays > 1) {
    // 3. 2日以上空いた場合（欠席あり）：ブロックの消費・リセット判定を行う。

    // 欠席した日数 = diffDays - 1 日
    const consumedBlocks = diffDays - 1;

    if (resetBlockCount >= consumedBlocks) {
      // ブロックが足りる場合：ブロックを消費し、連続日数をインクリメント（連続記録を維持）
      resetBlockCount -= consumedBlocks;
      lastResetBlockUsedAt = now;
      consecutiveDays += 1;
    } else {
      // ブロックが足りない場合：連続記録をリセットし、ブロックをMAXまでチャージ。
      consecutiveDays = INITIAL_CONSECUTIVE_DAYS;
      resetBlockCount = MAX_RESET_BLOCK_COUNT;
      lastResetBlockChargedAt = now;
    }
  }
  // diffDaysが負になることは通常想定しませんが、負の場合は何もしない（記録が未来日になるため）

  return {
    consecutiveDays,
    resetBlockCount,
    lastResetBlockUsedAt,
    lastResetBlockChargedAt,
  };
}
