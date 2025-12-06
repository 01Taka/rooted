/** 個々のタイマーの状態 */
export interface TimerState {
  /** タイマー開始時刻 (Date.now()の結果) */
  startTime: number;
  /** タイマーが停止した時刻 (Date.now()の結果) */
  stoppedAt: number;
  /** タイマーが実行中か */
  isRunning: boolean;
}

/** 複数のタイマーの状態マップ */
export type TimerStateMap = Record<string, TimerState>;

export type TimerEndActionBase = 'stopAll' | 'resetAll' | 'startAll' | 'stop' | 'reset';

export type TimerEndActionWithTarget = 'stopTargets' | 'resetTargets' | 'startTargets';

export type TimerEndActionType = TimerEndActionBase | TimerEndActionWithTarget;

export type TimerEndAction =
  | TimerEndActionBase
  | { action: TimerEndActionType; targets?: string[] }
  | { action: TimerEndActionType; targets?: string[] }[];

/** useMultiTimerLogicの引数 */
export interface UseMultiTimerLogicArgs {
  /** タイマーIDをキーとし、各タイマーのステータス情報を含むマップ */
  stateMap: TimerStateMap;
  /** タイマーIDごとの予定継続時間 (ミリ秒) のマップ */
  durationMap: Record<string, number>;
  /** インターバル (ミリ秒) */
  intervalMs?: number;
  /** 現在時刻を取得する関数 */
  getNow?: () => number;
  /** タイマー終了時のアクション */
  timerEndActionMap?: Record<string, TimerEndAction>;

  /** 個々のタイマーの状態が変更されたときのコールバック */
  onStateChange: (id: string, newState: TimerState) => void;
  /** 全てのタイマーの状態が変更されたときのコールバック (startAll, stopAll, resetAll用) */
  onAllStateChange: (newStateMap: TimerStateMap) => void;
  /** 個々のタイマーが終了したときのコールバック */
  onTimerEnd?: (id: string) => void;
}

/** useMultiTimerLogicの戻り値 */
export interface UseMultiTimerLogicResult {
  /** タイマーIDごとの現在の残り時間 (ミリ秒) のマップ */
  remainingTimeMap: Record<string, number>;
  /** タイマーIDごとの現在の経過時間 (ミリ秒) のマップ */
  elapsedTimeMap: Record<string, number>;
  /** タイマーIDごとの実行状態のマップ */
  isRunningMap: Record<string, boolean>;

  // 個別操作
  start: (id: string) => void;
  stop: (id: string) => void;
  reset: (id: string) => void;

  // 全体操作
  startAll: () => void;
  stopAll: () => void;
  resetAll: () => void;
}

/** 永続化プロバイダーが扱うデータ構造 */
export interface PersistedData {
  stateMap: TimerStateMap;
  durationMap: Record<string, number>;
}

/** 永続化プロバイダーのインターフェース */
export interface MultiTimerPersistenceProvider {
  load: () => Promise<PersistedData | null>;
  save: (data: PersistedData) => Promise<void>;
}

/** useMultiTimerStateの引数 */
export interface UseMultiTimerStateArgs {
  /** 初期期間のマップ (キーはタイマーID) */
  initialDurationMap: Record<string, number>;
  /** 初期状態のマップ (キーはタイマーID) */
  initialStateMap?: TimerStateMap;
  /** 永続化プロバイダー */
  persistenceProvider?: MultiTimerPersistenceProvider;
}

/** useMultiTimerStateの戻り値 */
export interface UseMultiTimerStateResult {
  /** useMultiTimerLogic に渡す状態マップ */
  stateMap: TimerStateMap;
  /** useMultiTimerLogic に渡す期間マップ */
  durationMap: Record<string, number>;
  /** ロードが完了したかどうかのフラグ */
  isLoaded: boolean;

  /** 個々のタイマーの状態が変更されたときのコールバック */
  onStateChange: (id: string, newState: Partial<TimerState>) => void;
  /** 全てのタイマーの状態が一度に変更されたときのコールバック */
  onAllStateChange: (newStateMap: TimerStateMap) => void;
  onDurationChange: (id: string, newDuration: number) => void;
  /** 期間マップ全体を更新するセッター関数 */
  setDurationMap: (newDurationMap: Record<string, number>) => void;
}

/**
 * useMultiTimer フックの引数
 * 状態管理（永続化含む）とロジック計算に必要な全ての引数を集約します。
 */
export interface UseMultiTimerArgs extends UseMultiTimerStateArgs {
  /**
   * 個々のタイマーが終了したときのコールバック
   * @param id - 終了したタイマーのID
   */
  onTimerEnd?: (id: string) => void;

  /** インターバル (ミリ秒) */
  intervalMs?: number;

  /** 現在時刻を取得する関数 */
  getNow?: () => number;

  /** タイマー終了時のアクション */
  timerEndActionMap?: Record<string, TimerEndAction>;

  /** 進捗率を減少方向 (1から0) で計算するかどうかのフラグ */
  isDecreaseProgress?: boolean;
}

/**
 * 特定のタイマーIDに関連する全てのデータをまとめた単一のオブジェクト
 */
export interface SingleTimerData extends TimerState {
  id: string; // タイマーID
  duration: number; // 予定継続時間 (ミリ秒)
  remainingTime: number; // 現在の残り時間 (ミリ秒)
  elapsedTime: number; // 現在の経過時間 (ミリ秒)
  progress: number; // 現在の進捗率 (0から1)
}

/**
 * 特定のタイマーIDにバインドされた引数なしの操作関数セット
 */
export interface SingleTimerActions {
  start: () => void;
  stop: () => void;
  reset: () => void;
  switchState: () => void;
  onDurationChange: (duration: number) => void;
}

export type SingleTimer = SingleTimerData & SingleTimerActions;

/**
 * useMultiTimer フックの戻り値
 * 状態、ロジックの計算結果、および操作関数を全て含みます。
 */
export interface UseMultiTimerResult extends UseMultiTimerStateResult, UseMultiTimerLogicResult {
  /** タイマーIDごとの現在の進捗率 (0から1) のマップ */
  progressMap: Record<string, number>;

  /** 個別のタイマーの実行状態を切り替える関数 (実行中なら停止、停止中なら開始) */
  switchState: (id: string) => void;
  /**
   * 特定のタイマーIDに関連する全てのデータを単一のオブジェクトとして返す関数
   * @param id - データを取得したいタイマーのID
   */
  getTimerData: (id: string) => SingleTimerData;
  /**
   * 特定のタイマーIDに関連する操作関数を、引数なしのコールバックとして返す関数。
   * @param id - データを取得したいタイマーのID
   */
  getActionsFor: (id: string) => SingleTimerActions;

  getSingleTimer: (id: string) => SingleTimer;
}
