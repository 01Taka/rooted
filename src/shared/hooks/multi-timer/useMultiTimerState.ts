import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PersistedData,
  TimerState,
  TimerStateMap,
  UseMultiTimerStateArgs,
  UseMultiTimerStateResult,
} from './multi-timer-types';

// 仮定した型をインポート

const defaultInitialTimerState: TimerState = {
  startTime: 0,
  stoppedAt: 0,
  isRunning: false,
};

/**
 * 複数のタイマーの状態管理と永続化を担うフック。
 * 非同期な永続化プロバイダーに対応し、ロード状態を管理します。
 *
 * @param {UseMultiTimerStateArgs} args - 初期状態マップ、初期期間マップ、永続化プロバイダーなどを含む引数。
 * @returns {UseMultiTimerStateResult} useMultiTimerLogic に渡す引数と現在の状態、ロード完了フラグを含むオブジェクト。
 */
export const useMultiTimerState = (args: UseMultiTimerStateArgs): UseMultiTimerStateResult => {
  const { initialStateMap, initialDurationMap, persistenceProvider } = args;

  // 1. ロード状態と内部状態の管理
  const [isLoaded, setIsLoaded] = useState(false);
  const [durationMap, setDurationMap] = useState<Record<string, number>>(initialDurationMap);
  const [stateMap, setStateMap] = useState<TimerStateMap>({
    ...Object.fromEntries(
      Object.keys(initialDurationMap).map((key) => [key, defaultInitialTimerState])
    ),
    ...initialStateMap,
  });

  // 2. 永続化プロバイダーへの保存処理をラップ
  const saveAll = useCallback(
    (currentStates: TimerStateMap, currentDurations: Record<string, number>) => {
      if (!persistenceProvider) return;

      const dataToSave: PersistedData = {
        stateMap: currentStates,
        durationMap: currentDurations,
      };

      try {
        persistenceProvider.save(dataToSave);
      } catch (error) {
        console.error('Failed to save multi-timer state:', error);
      }
    },
    [persistenceProvider]
  );

  // 3. 非同期ロード処理
  useEffect(() => {
    if (!persistenceProvider) {
      setIsLoaded(true);
      return;
    }

    let isMounted = true;

    const loadState = async () => {
      try {
        const persisted = await persistenceProvider.load();
        if (isMounted && persisted) {
          // ロードデータで初期状態を上書き
          setStateMap((prev) => ({ ...prev, ...persisted.stateMap }));
          setDurationMap((prev) => ({ ...prev, ...persisted.durationMap }));
        }
      } catch (e) {
        console.error('Failed to load multi-timer state:', e);
      } finally {
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    };

    loadState();

    return () => {
      isMounted = false;
    };
  }, [persistenceProvider]);

  // 4. onStateChange (個別タイマーの状態変更)
  const onStateChange = useCallback(
    (id: string, newState: Partial<TimerState>) => {
      setStateMap((prevMap) => {
        const prevState = prevMap[id] ?? defaultInitialTimerState;
        const newMap: TimerStateMap = {
          ...prevMap,
          [id]: {
            ...prevState,
            ...newState,
          },
        };
        // 非同期保存
        saveAll(newMap, durationMap);

        return newMap;
      });
    },
    [durationMap, saveAll] // durationMap は保存時に必要
  );

  // 5. onAllStateChange (全タイマーの状態変更: startAll/stopAll/resetAll用)
  const onAllStateChange = useCallback(
    (newStateMap: TimerStateMap) => {
      setStateMap(newStateMap);
      // 非同期保存
      saveAll(newStateMap, durationMap);
    },
    [durationMap, saveAll]
  );

  const onDurationChange = useCallback(
    (id: string, newDuration: number) => {
      setDurationMap((prevDurationMap) => {
        const newMap: Record<string, number> = {
          ...prevDurationMap,
          [id]: newDuration,
        }; // 非同期保存
        saveAll(stateMap, newMap);

        return newMap;
      });
    },
    [stateMap, saveAll] // stateMap は保存時に必要
  );

  // 6. setDurationMap (期間マップ全体の更新)
  const setDurationMapHandler = useCallback(
    (newDurationMap: Record<string, number>) => {
      setDurationMap(newDurationMap);
      // 非同期保存
      saveAll(stateMap, newDurationMap);
    },
    [stateMap, saveAll] // stateMap は保存時に必要
  );

  // 7. 戻り値の構築
  const useMultiTimerArgs: UseMultiTimerStateResult = useMemo(
    () => ({
      stateMap,
      durationMap,
      isLoaded,
      onStateChange,
      onAllStateChange,
      onDurationChange,
      setDurationMap: setDurationMapHandler,
    }),
    [stateMap, durationMap, isLoaded, onStateChange, onAllStateChange, setDurationMapHandler]
  );

  return useMultiTimerArgs;
};
