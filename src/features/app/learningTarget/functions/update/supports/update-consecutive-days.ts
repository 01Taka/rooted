import { LearningTargetConsecutiveDays } from '@/data/learningTarget/learningTargetConsecutiveDays.types';
import {
  INITIAL_CONSECUTIVE_DAYS,
  MAX_RESET_BLOCK_COUNT,
  ONE_DAY_MS,
} from '../../../constants/main-constants';

/**
 * 連続日数を更新し、リセットブロックの消費/チャージ判定を行います。
 * * 仕様に合わせたロジック変更点:
 * 1. 欠席によりブロックを消費した場合、連続日数はインクリメントされ記録が維持される。
 * 2. 欠席をブロックで防いだ場合、リセットブロックは減るが、直ちに回復はしない。
 * 3. ブロックを消費した後の最初の取り組み (diffDays = 1) で、ブロックを1つ再チャージする。
 * 4. ブロックが足りない場合、連続日数をリセットし、リセットブロックは回復を待つ状態（MAXまで回復しない）。
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
    // 2. 翌日の場合：連続日数をインクリメント。リセットブロックの再チャージ判定。
    consecutiveDays += 1;

    // --- 【修正ロジック】 リセットブロックのチャージ ---
    // 設計: 「1回取り組む」ことで再チャージされる
    // => ブロックがMAX未満であれば、1つだけ回復させる。毎日回復する仕様は不適切。
    // MAX_RESET_BLOCK_COUNT=1 の場合、ブロックが0の時のみ回復する。
    if (resetBlockCount < MAX_RESET_BLOCK_COUNT) {
      // 1つだけ回復（消費後の「1回」の取り組みと解釈）
      resetBlockCount += 1;
      lastResetBlockChargedAt = now;
    }
  } else if (diffDays > 1) {
    // 3. 2日以上空いた場合（欠席あり）：ブロックの消費・リセット判定を行う。

    // 欠席した日数 = diffDays - 1 日
    const consumedBlocks = diffDays - 1;

    if (resetBlockCount >= consumedBlocks) {
      // ブロックが足りる場合：ブロックを消費し、連続日数をインクリメント（連続記録を維持）
      resetBlockCount -= consumedBlocks;
      consecutiveDays += 1; // 連続日数は維持されるため、1日分進める
      lastResetBlockUsedAt = now;
    } else {
      // ブロックが足りない場合：連続記録をリセット。
      consecutiveDays = INITIAL_CONSECUTIVE_DAYS;
      // 記録リセット後は、初期値(1)に戻す
      resetBlockCount = MAX_RESET_BLOCK_COUNT;
    }
  }

  // 更新されたデータを返す
  return {
    ...currentData,
    consecutiveDays,
    resetBlockCount,
    lastResetBlockUsedAt,
    lastResetBlockChargedAt,
  };
}
