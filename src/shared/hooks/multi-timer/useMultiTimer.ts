import { useCallback, useMemo } from 'react';
import {
  SingleTimerActions,
  SingleTimerData,
  TimerState,
  UseMultiTimerArgs,
  UseMultiTimerResult,
} from './multi-timer-types';
import { useMultiTimerLogic } from './useMultiTimerLogic'; // 複数のタイマーロジック
import { useMultiTimerState } from './useMultiTimerState'; // 複数のタイマー状態管理

/**
 * 複数のタイマーの状態管理、永続化、およびロジック計算を統合したカスタムフック。
 *
 * @param {UseMultiTimerArgs} args - 初期状態マップ、永続化プロバイダー、インターバルなどの設定。
 * @returns {UseMultiTimerResult} タイマーの操作関数、状態マップ、および時間情報マップ。
 */
export const useMultiTimer = (args: UseMultiTimerArgs): UseMultiTimerResult => {
  // 1. 状態管理と永続化を行う useMultiTimerState を呼び出し
  // useMultiTimerState は stateMap, durationMap, および状態変更コールバックを返す
  const timerState = useMultiTimerState(args);

  // 2. タイマーのロジック計算と操作関数を提供する useMultiTimerLogic を呼び出し
  const timerLogic = useMultiTimerLogic({
    ...args,
    ...timerState,
  });

  // 3. 個別のタイマーの実行状態を切り替える関数を定義
  const switchState = useCallback(
    (id: string) => {
      // isRunningMap を参照して、現在の状態に応じて start または stop を呼び出す
      if (timerLogic.isRunningMap[id]) {
        timerLogic.stop(id);
      } else {
        timerLogic.start(id);
      }
    },
    [timerLogic.isRunningMap, timerLogic.stop, timerLogic.start]
  );

  // 4. 進捗率 (progress) のマップを計算
  const progressMap = useMemo(() => {
    const map: Record<string, number> = {};
    const { elapsedTimeMap } = timerLogic;
    const { durationMap } = timerState;
    const isDecreaseProgress = args.isDecreaseProgress ?? false;

    Object.keys(durationMap).forEach((id) => {
      const duration = durationMap[id] ?? 0;
      const elapsedTime = elapsedTimeMap[id] ?? 0;

      if (elapsedTime <= 0 || duration <= 0) {
        // 初期状態またはDurationがゼロの場合
        map[id] = isDecreaseProgress ? 1 : 0;
        return;
      }

      const progressValue = Math.min(elapsedTime / duration, 1);
      map[id] = isDecreaseProgress ? 1 - progressValue : progressValue;
    });

    return map;
  }, [timerLogic.elapsedTimeMap, timerState.durationMap, args.isDecreaseProgress]);

  const getTimerData = useCallback(
    (id: string): SingleTimerData => {
      const defaultState: TimerState = { startTime: 0, stoppedAt: 0, isRunning: false };

      const state = timerState.stateMap[id] ?? defaultState;
      const duration = timerState.durationMap[id] ?? 0;
      const remainingTime = timerLogic.remainingTimeMap[id] ?? 0;
      const elapsedTime = timerLogic.elapsedTimeMap[id] ?? 0;
      const progress = progressMap[id] ?? (args.isDecreaseProgress ? 1 : 0);

      return {
        id,
        ...state, // startTime, stoppedAt, isRunning
        duration,
        remainingTime,
        elapsedTime,
        progress,
      };
    },
    [
      timerState.stateMap,
      timerState.durationMap,
      timerLogic.remainingTimeMap,
      timerLogic.elapsedTimeMap,
      progressMap,
      args.isDecreaseProgress,
    ]
  );

  const getActionsFor = useCallback(
    (id: string): SingleTimerActions => ({
      // 各アクション関数をラップし、idを内部で渡す
      start: () => timerLogic.start(id),
      stop: () => timerLogic.stop(id),
      reset: () => timerLogic.reset(id),
      switchState: () => switchState(id),
      onDurationChange: (duration: number) => timerState.onDurationChange(id, duration),
    }),
    [timerLogic.start, timerLogic.stop, timerLogic.reset, switchState]
  );

  const getSingleTimer = useCallback(
    (id: string) => ({ ...getActionsFor(id), ...getTimerData(id) }),
    [getActionsFor, getTimerData]
  );

  // 5. 必要な結果を結合して返す
  return {
    ...timerState,
    ...timerLogic,
    progressMap,
    switchState,
    getTimerData,
    getActionsFor,
    getSingleTimer,
  };
};
