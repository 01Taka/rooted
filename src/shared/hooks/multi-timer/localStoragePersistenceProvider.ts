import { MultiTimerPersistenceProvider, PersistedData } from './multi-timer-types';

/**
 * ローカルストレージを使用してタイマーの状態を永続化するプロバイダー。
 * load/save メソッドは非同期処理 (Promise) を返すように実装されています。
 */
export class LocalStorageMultiTimerPersistenceProvider implements MultiTimerPersistenceProvider {
  private readonly storageKey: string;
  private readonly delayMs: number; // 非同期処理を模倣するための遅延

  /**
   * @param key ローカルストレージに保存する際のキー
   * @param delayMs load/save 実行時の遅延時間 (非同期処理を模倣するため)
   */
  constructor(key: string, delayMs: number = 0) {
    this.storageKey = key;
    this.delayMs = delayMs;
  }

  /**
   * LocalStorageからタイマーデータをロードします。
   * @returns PersistedData または null を解決する Promise
   */
  load(): Promise<PersistedData | null> {
    return new Promise((resolve) => {
      // 非同期操作をエミュレート
      setTimeout(() => {
        try {
          const storedData = localStorage.getItem(this.storageKey);

          if (!storedData) {
            resolve(null);
            return;
          }

          // JSONをパースし、型チェックは行わずにそのまま返す
          const data: PersistedData = JSON.parse(storedData);
          resolve(data);
        } catch (e) {
          console.error('Error loading data from LocalStorage:', e);
          resolve(null);
        }
      }, this.delayMs);
    });
  }

  /**
   * LocalStorageにタイマーデータを保存します。
   * @param data 保存するデータ ({ stateMap, durationMap })
   * @returns 完了時に解決する Promise
   */
  save(data: PersistedData): Promise<void> {
    return new Promise((resolve, reject) => {
      // 非同期操作をエミュレート
      setTimeout(() => {
        try {
          const jsonString = JSON.stringify(data);
          localStorage.setItem(this.storageKey, jsonString);
          resolve();
        } catch (e) {
          console.error('Error saving data to LocalStorage:', e);
          // LocalStorageの容量オーバーなどのエラーを想定
          reject(e);
        }
      }, this.delayMs);
    });
  }
}
