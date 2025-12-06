import { LearningTargetConsecutiveDays } from '@/data/learningTarget/learningTargetConsecutiveDays.types';
import {
  INITIAL_CONSECUTIVE_DAYS,
  MAX_RESET_BLOCK_COUNT,
  ONE_DAY_MS,
} from '../../../constants/main-constants';

/**
 * 連続日数を更新し、リセットブロックの消費/チャージ判定を行います。
 */
export function updateConsecutiveDays(
  currentData: LearningTargetConsecutiveDays,
  lastCommitmentAt: number,
  now: number
): LearningTargetConsecutiveDays {
  const lastDate = new Date(lastCommitmentAt);
  lastDate.setHours(0, 0, 0, 0);

  const nowDate = new Date(now);
  nowDate.setHours(0, 0, 0, 0);

  // 日付差分の計算
  const diffDays = Math.round((nowDate.getTime() - lastDate.getTime()) / ONE_DAY_MS);

  // 同日の場合は変更なし
  if (diffDays === 0) return currentData;

  let { consecutiveDays, resetBlockCount, lastResetBlockUsedAt, lastResetBlockChargedAt } =
    currentData;

  // 1. 翌日の場合 (継続成功)
  if (diffDays === 1) {
    consecutiveDays += 1;

    // リセットブロックのチャージ判定 (MAX未満なら1つ回復)
    if (resetBlockCount < MAX_RESET_BLOCK_COUNT) {
      resetBlockCount += 1;
      lastResetBlockChargedAt = now;
    }
  }
  // 2. 2日以上空いた場合 (欠席あり)
  else {
    const missedDays = diffDays - 1;

    if (resetBlockCount >= missedDays) {
      // ブロック消費で継続維持
      resetBlockCount -= missedDays;
      consecutiveDays += 1; // 記録上はつながった扱い
      lastResetBlockUsedAt = now;
    } else {
      // ブロック不足でリセット
      consecutiveDays = INITIAL_CONSECUTIVE_DAYS;
      resetBlockCount = MAX_RESET_BLOCK_COUNT; // リセット時はブロックも初期値に戻す仕様と仮定
      // もしリセット時にブロックを回復させない仕様なら、ここを変更してください
    }
  }

  return {
    consecutiveDays,
    resetBlockCount,
    lastResetBlockUsedAt,
    lastResetBlockChargedAt,
  };
}
