import { useCallback, useEffect, useMemo, useState } from 'react';

// 仮の型定義 (useTimer-types.ts から必要なものを抜粋/簡略化)

interface TimerInfo {
  isRunning: boolean;
  stoppedAt: number;
  expectedEndAt: number;
  expectedDuration: number;
}

interface UseMultiTimersArgs {
  /** * タイマーIDをキーとし、各タイマーのステータス情報を含むマップ。
   * 呼び出し元で useState などを使って管理される。
   */
  infoMap: Record<string, TimerInfo>;
  intervalMs?: number;
  getNow?: () => number;
}

interface UseMultiTimersResult {
  /** タイマーIDごとの現在の残り時間 (ミリ秒) のマップ */
  remainingTimeMap: Record<string, number>;
  /** タイマーIDごとの現在の経過時間 (ミリ秒) のマップ */
  elapsedTimeMap: Record<string, number>;
}
/**
 * 複数のタイマーの状態を同時に計算・更新するフック。
 *
 * @param {UseMultiTimersArgs} args - タイマー全体の設定 (インターバル、現在時刻の取得関数など)。
 * @returns {UseMultiTimersResult} タイマー操作と状態取得のためのメソッド。
 */
export const useMultiRemainingTime = (args: UseMultiTimersArgs): UseMultiTimersResult => {
  const { infoMap, intervalMs = 1000 } = args;
  const getNow = useCallback(args.getNow ?? (() => Date.now()), [args.getNow]);

  // RemainingTimes を内部状態として持つ
  const [remainingTimeMap, setRemainingTimeMap] = useState<Record<string, number>>({});

  // infoMap が変更されたときに、remainingTimeMap の初期値を設定する
  useEffect(() => {
    // infoMap の変更に応じて、isRunningがfalseのタイマーの残り時間を固定する
    const initialMap = Object.entries(infoMap).reduce(
      (acc, [id, info]) => {
        let remaining = 0;
        if (info.isRunning) {
          // 実行中: useEffectで更新されるため、ここでは現在の状態のものを維持
          remaining = remainingTimeMap[id] ?? info.expectedDuration;
        } else if (info.expectedEndAt > 0) {
          // 停止中: 終了予定時刻 - 停止時刻
          remaining = info.expectedEndAt - info.stoppedAt;
        } else {
          // 初期状態/リセット後
          remaining = info.expectedDuration;
        }
        acc[id] = remaining;
        return acc;
      },
      {} as Record<string, number>
    );

    setRemainingTimeMap(initialMap);
  }, [infoMap]); // infoMap が外部から変更されたら再計算

  // インターバルで実行中のタイマーのみを更新するロジック
  useEffect(() => {
    const runningIds = Object.keys(infoMap).filter((id) => infoMap[id].isRunning);

    if (runningIds.length === 0) return;

    const updateRemainingTimes = () => {
      const now = getNow();

      setRemainingTimeMap((prevRemaining) => {
        const newRemainingTimes = { ...prevRemaining };
        let hasChanges = false;

        runningIds.forEach((id) => {
          const timer = infoMap[id];
          if (timer.isRunning) {
            const diff = timer.expectedEndAt - now;
            // 負の値になっても更新を継続 (0未満になることが確認できる)
            if (diff !== newRemainingTimes[id]) {
              newRemainingTimes[id] = diff;
              hasChanges = true;
            }
          }
        });

        return hasChanges ? newRemainingTimes : prevRemaining;
      });
    };

    updateRemainingTimes();
    const interval = setInterval(updateRemainingTimes, intervalMs);

    return () => clearInterval(interval);
  }, [infoMap, getNow, intervalMs]);

  // 経過時間を計算
  const elapsedTimeMap = useMemo(() => {
    return Object.entries(infoMap).reduce(
      (acc, [id, info]) => {
        const remaining = remainingTimeMap[id] ?? info.expectedDuration;
        acc[id] = info.expectedDuration - remaining;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [infoMap, remainingTimeMap]);

  return {
    remainingTimeMap,
    elapsedTimeMap,
  };
};
