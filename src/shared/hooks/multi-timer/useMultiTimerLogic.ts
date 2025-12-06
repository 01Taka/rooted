import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  TimerState,
  TimerStateMap,
  UseMultiTimerLogicArgs,
  UseMultiTimerLogicResult,
} from './multi-timer-types';
import { useMultiRemainingTime } from './useMultiRemainingTime';
import { useTimerEndActionHandler } from './useTimerEndActionHandler';

/**
 * 複数のタイマーの状態を同時に管理し、外部から提供されたタイマー状態に基づいて計算を行い、
 * 状態変更のリクエストを外部に伝えるカスタムフック。
 *
 * @param {UseMultiTimerLogicArgs} args - タイマーの状態、期間、およびコールバックを含む引数オブジェクト。
 * @returns {UseMultiTimerLogicResult} タイマー操作と状態取得のためのメソッド。
 */
export const useMultiTimerLogic = (args: UseMultiTimerLogicArgs): UseMultiTimerLogicResult => {
  const {
    stateMap,
    durationMap,
    intervalMs,
    timerEndActionMap,
    onStateChange,
    onAllStateChange,
    onTimerEnd,
  } = args;
  const getNow = useCallback(args.getNow ?? (() => Date.now()), [args.getNow]);

  // useMultiRemainingTime に渡す infoMap を構築
  const infoMap = useMemo(() => {
    return Object.entries(stateMap).reduce(
      (acc, [id, state]) => {
        const expectedDuration = durationMap[id] ?? 0;
        const expectedEndAt = state.startTime + expectedDuration;
        acc[id] = {
          ...state,
          expectedDuration,
          expectedEndAt,
        };
        return acc;
      },
      {} as Record<string, TimerState & { expectedDuration: number; expectedEndAt: number }>
    );
  }, [stateMap, durationMap]);

  // useMultiRemainingTime を利用して残り時間と経過時間を計算
  const { remainingTimeMap, elapsedTimeMap } = useMultiRemainingTime({
    infoMap,
    intervalMs,
    getNow,
  });

  // remainingTimeMap の値を持つ Ref を作成
  // useEffect内での最新値参照と、useCallback依存配列の安定化のため
  const remainingTimeMapRef = useRef(remainingTimeMap);
  useEffect(() => {
    remainingTimeMapRef.current = remainingTimeMap;
  }, [remainingTimeMap]);

  // isRunningMap は stateMap から直接取得可能
  const isRunningMap = useMemo(() => {
    return Object.entries(stateMap).reduce(
      (acc, [id, state]) => {
        acc[id] = state.isRunning;
        return acc;
      },
      {} as Record<string, boolean>
    );
  }, [stateMap]);

  // --- 個別操作 ---

  const stop = useCallback(
    (id: string) => {
      const now = getNow();
      const state = stateMap[id];
      if (!state) return;

      // タイマーが既に停止している場合は状態変更を行わない
      if (!state.isRunning) return;

      onStateChange(id, {
        startTime: state.startTime,
        stoppedAt: now,
        isRunning: false,
      });
    },
    [stateMap, getNow, onStateChange]
  );

  const start = useCallback(
    (id: string) => {
      const now = getNow();
      const state = stateMap[id];
      if (!state) return;

      // 経過時間を保持しつつ newStartTime を計算
      const newStartTime = state.isRunning
        ? state.startTime
        : state.stoppedAt > 0
          ? now - (state.stoppedAt - state.startTime) // 停止期間を差し引く
          : now;

      onStateChange(id, {
        startTime: newStartTime,
        stoppedAt: 0,
        isRunning: true,
      });
    },
    [stateMap, getNow, onStateChange]
  );

  const reset = useCallback(
    (id: string) => {
      onStateChange(id, {
        startTime: 0,
        stoppedAt: 0,
        isRunning: false,
      });
    },
    [onStateChange]
  );

  // --- 全体操作 ---

  const startAll = useCallback(() => {
    const now = getNow();
    const newStateMap = Object.entries(stateMap).reduce((acc, [id, state]) => {
      // startロジックを適用
      const newStartTime = state.isRunning
        ? state.startTime
        : state.stoppedAt > 0
          ? now - (state.stoppedAt - state.startTime)
          : now;

      acc[id] = {
        startTime: newStartTime,
        stoppedAt: 0,
        isRunning: true,
      };
      return acc;
    }, {} as TimerStateMap);

    onAllStateChange(newStateMap);
  }, [stateMap, getNow, onAllStateChange]);

  const stopAll = useCallback(() => {
    const now = getNow();
    const newStateMap = Object.entries(stateMap).reduce((acc, [id, state]) => {
      if (!state.isRunning) {
        acc[id] = state;
        return acc;
      }

      // stopロジックを適用
      acc[id] = {
        startTime: state.startTime,
        stoppedAt: now,
        isRunning: false,
      };
      return acc;
    }, {} as TimerStateMap);

    onAllStateChange(newStateMap);
  }, [stateMap, getNow, onAllStateChange]);

  const resetAll = useCallback(() => {
    const newStateMap = Object.keys(stateMap).reduce((acc, id) => {
      // resetロジックを適用
      acc[id] = {
        startTime: 0,
        stoppedAt: 0,
        isRunning: false,
      };
      return acc;
    }, {} as TimerStateMap);

    onAllStateChange(newStateMap);
  }, [stateMap, onAllStateChange]);

  const { executeTimerEndAction } = useTimerEndActionHandler(stateMap, {
    stop,
    reset,
    stopAll,
    startAll,
    resetAll,
    onAllStateChange,
    getNow,
  });

  // --- タイマー終了時の自動停止/リセット処理 ---
  useEffect(() => {
    const nowRemainingMap = remainingTimeMapRef.current;

    Object.entries(stateMap).forEach(([id, state]) => {
      const remainingTime = nowRemainingMap[id];
      const expectedDuration = durationMap[id];

      // 実行中で、かつ残り時間が0以下になった場合
      if (state.isRunning && expectedDuration > 0 && remainingTime <= 0) {
        // onTimerEndはフックの外側で呼ばれるべき
        onTimerEnd?.(id);

        if (!timerEndActionMap || !timerEndActionMap[id]) return;
        const action = timerEndActionMap[id];
        executeTimerEndAction(action, id);
      }
    });
    // 依存配列に remainingTimeMap を追加し、残り時間が変わるたびにチェックさせる
  }, [
    remainingTimeMap,
    stateMap,
    durationMap,
    timerEndActionMap,
    onTimerEnd,
    executeTimerEndAction,
  ]);

  return {
    remainingTimeMap,
    elapsedTimeMap,
    isRunningMap,
    start,
    stop,
    reset,
    startAll,
    stopAll,
    resetAll,
  };
};
