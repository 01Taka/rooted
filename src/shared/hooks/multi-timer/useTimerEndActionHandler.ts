import { useCallback } from 'react';
import { TimerEndAction, TimerEndActionType, TimerStateMap } from './multi-timer-types';

interface TimerOperationMethods {
  stop: (id: string) => void;
  reset: (id: string) => void;
  stopAll: () => void;
  startAll: () => void;
  resetAll: () => void;
  onAllStateChange: (newStateMap: TimerStateMap) => void;
  getNow: () => number;
}

/**
 * 複数のタイマーに対するターゲット指定操作と、汎用的なアクション実行ロジックを提供するカスタムフック。
 * @param {TimerStateMap} stateMap - 現在の全タイマーの状態マップ。
 * @param {TimerOperationMethods} methods - 全体操作、状態変更コールバック、現在時刻取得メソッド。
 * @returns アクションを実行するためのメソッド群。
 */
export const useTimerEndActionHandler = (
  stateMap: TimerStateMap,
  methods: TimerOperationMethods
) => {
  const { stop, reset, stopAll, startAll, resetAll, onAllStateChange, getNow } = methods;

  // --- ターゲット指定操作 (Targets系の操作は onAllStateChange を使用) ---

  const stopTargets = useCallback(
    (targets: string[]) => {
      const targetsToStop = targets.filter((id) => stateMap[id] !== undefined);
      if (targetsToStop.length === 0) return;

      const now = getNow();

      const newStateMap = Object.entries(stateMap).reduce((acc, [id, state]) => {
        if (targetsToStop.includes(id) && state.isRunning) {
          acc[id] = {
            ...state,
            stoppedAt: now,
            isRunning: false,
          };
        } else {
          acc[id] = state;
        }
        return acc;
      }, {} as TimerStateMap);

      onAllStateChange(newStateMap);
    },
    [stateMap, getNow, onAllStateChange]
  );

  const resetTargets = useCallback(
    (targets: string[]) => {
      const targetsToReset = targets.filter((id) => stateMap[id] !== undefined);
      if (targetsToReset.length === 0) return;

      const newStateMap = Object.entries(stateMap).reduce((acc, [id, state]) => {
        if (targetsToReset.includes(id)) {
          acc[id] = {
            startTime: 0,
            stoppedAt: 0,
            isRunning: false,
          };
        } else {
          acc[id] = state;
        }
        return acc;
      }, {} as TimerStateMap);

      onAllStateChange(newStateMap);
    },
    [stateMap, onAllStateChange]
  );

  const startTargets = useCallback(
    (targets: string[]) => {
      const targetsToStart = targets.filter((id) => stateMap[id] !== undefined);
      if (targetsToStart.length === 0) return;

      const now = getNow();

      const newStateMap = Object.entries(stateMap).reduce((acc, [id, state]) => {
        if (targetsToStart.includes(id) && !state.isRunning) {
          const newStartTime =
            state.stoppedAt > 0 ? now - (state.stoppedAt - state.startTime) : now;

          acc[id] = {
            ...state,
            startTime: newStartTime,
            stoppedAt: 0,
            isRunning: true,
          };
        } else {
          acc[id] = state;
        }
        return acc;
      }, {} as TimerStateMap);

      onAllStateChange(newStateMap);
    },
    [stateMap, getNow, onAllStateChange]
  );

  // --- 汎用アクション実行ヘルパー関数 (BaseAction) ---
  const executeBaseAction = useCallback(
    (action: TimerEndActionType, targets?: string[]) => {
      // targetsが必須のアクションであるかを判定
      const requiresTargets = ['stopTargets', 'resetTargets', 'startTargets'].includes(action);

      if (requiresTargets && (!targets || targets.length === 0)) {
        // ターゲットが必要なアクションにもかかわらず、ターゲットがない場合は何もしない
        return;
      }

      // ターゲット/全体操作 (onAllStateChangeを通して処理される)
      switch (action) {
        case 'stopTargets':
          stopTargets(targets!);
          break;
        case 'resetTargets':
          resetTargets(targets!);
          break;
        case 'startTargets':
          startTargets(targets!);
          break;
        case 'stopAll':
          stopAll();
          break;
        case 'resetAll':
          resetAll();
          break;
        case 'startAll':
          startAll();
          break;
        case 'stop':
        case 'reset':
          // 'stop' / 'reset' は単体での使用が意図されており、executeTimerEndAction で既に処理されているか、
          // targetsが複数ある場合はこのロジックで処理されない (単体操作メソッドを使うため)。
          // 複数のターゲットを扱う場合は、外部から 'stopTargets' を使うべき。
          break;
        default:
          console.warn(`Unknown timer end action: ${action}`);
      }
    },
    [stopTargets, resetTargets, startTargets, stopAll, resetAll, startAll]
  );

  // --- 汎用アクション実行ヘルパー関数 (TimerEndActionを受け取る) ---
  const executeTimerEndAction = useCallback(
    (actionOrActions: TimerEndAction, endedTimerId?: string) => {
      let actionsToExecute: {
        action: TimerEndActionType;
        targets?: string[];
      }[] = [];
      let isError = false;

      // ターゲット指定アクションを定義
      const targetActions: TimerEndActionType[] = ['stopTargets', 'resetTargets', 'startTargets'];

      if (Array.isArray(actionOrActions)) {
        // 配列の場合はそのまま
        actionsToExecute = actionOrActions;
      } else if (typeof actionOrActions === 'string') {
        const action = actionOrActions as TimerEndActionType;

        // 1. 🎯 ターゲット系アクションの文字列チェック (エラーログを出して終了する)
        if (targetActions.includes(action)) {
          console.error(
            `[TimerError] ターゲット指定アクション ('${action}') は、TimerEndActionTypeとして単独で渡されました。` +
              `オブジェクト ({ action: '${action}', targets: [...] }) または配列として渡してください。`
          );
          return; // エラーのため即時終了
        }

        // 2. 🛑 単一操作 ('stop', 'reset')
        if (action === 'stop' || action === 'reset') {
          if (endedTimerId !== undefined) {
            // 単一操作は onStateChange を通るため、ここで直接実行し、後の onAllStateChange のロジックと分離する
            if (action === 'stop') {
              stop(endedTimerId);
            } else {
              reset(endedTimerId);
            }
          }
          return; // 単一操作を実行したら終了
        }

        // 3. 🌐 全体操作 ('stopAll', 'resetAll', 'startAll')
        actionsToExecute = [{ action, targets: undefined }];
      } else if (typeof actionOrActions === 'object' && 'action' in actionOrActions) {
        // 単一オブジェクトの場合は配列に変換
        actionsToExecute = [actionOrActions];
      }

      if (isError) return;

      // 優先度の低いものから実行し、後のアクションで状態を上書きできるようにする
      // 配列を逆順にして実行
      [...actionsToExecute].reverse().forEach((actionObj) => {
        const action = actionObj.action;
        const targets = actionObj.targets;

        executeBaseAction(action, targets);
      });
    },
    [executeBaseAction, stop, reset]
  );

  return { executeTimerEndAction };
};
