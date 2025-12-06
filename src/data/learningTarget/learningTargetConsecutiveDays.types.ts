export interface LearningTargetConsecutiveDays {
  consecutiveDays: number; // 現在の連続日数
  // 今後複数のブロックをもてるようにするため柔軟性を持たせてnumberを使用
  // 現在の使用では0か1しか使わない
  resetBlockCount: number; // リセットブロックを保有しているか。
  lastResetBlockUsedAt: number | null; // 最後にいつリセットブロックを使ったか。復活までの時間を計算する用
  lastResetBlockChargedAt: number; // 最後にいつリセットブロックがチャージされたか
}
