/**
 * ログレベルを定義する列挙型
 */
export enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR,
  NONE, // ログを出力しないレベル
}

// Viteの環境変数を参照して、現在の環境を取得
// import.meta.env.MODE は "development" または "production" など
const currentEnv = import.meta.env.MODE;

/**
 * 環境ごとの最小ログレベルを設定
 * - development: DEBUG (全て出力)
 * - production: WARN (WARNとERRORのみ出力)
 * - その他: NONE (ログを抑制)
 */
const minLogLevel: LogLevel =
  currentEnv === 'development'
    ? LogLevel.DEBUG
    : currentEnv === 'production'
      ? LogLevel.WARN
      : LogLevel.NONE;

/**
 * カスタムロガークラス
 */
class CustomLogger {
  private getLogLevelString(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return 'DEBUG';
      case LogLevel.INFO:
        return 'INFO';
      case LogLevel.WARN:
        return 'WARN';
      case LogLevel.ERROR:
        return 'ERROR';
      default:
        return 'UNKNOWN';
    }
  }

  /**
   * ログを出力するかどうかを判定
   */
  private shouldLog(level: LogLevel): boolean {
    return level >= minLogLevel;
  }

  private log(level: LogLevel, message: string, ...optionalParams: any[]): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.getLogLevelString(level)}]`;

    // ログレベルに応じて適切なconsoleメソッドを使用
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`${prefix} ${message}`, ...optionalParams);
        break;
      case LogLevel.INFO:
        console.info(`${prefix} ${message}`, ...optionalParams);
        break;
      case LogLevel.WARN:
        console.warn(`${prefix} ${message}`, ...optionalParams);
        break;
      case LogLevel.ERROR:
        console.error(`${prefix} ${message}`, ...optionalParams);
        break;
      default:
        console.log(`${prefix} ${message}`, ...optionalParams);
    }
  }

  // 公開メソッド
  public debug(message: string, ...optionalParams: any[]): void {
    this.log(LogLevel.DEBUG, message, ...optionalParams);
  }

  public info(message: string, ...optionalParams: any[]): void {
    this.log(LogLevel.INFO, message, ...optionalParams);
  }

  public warn(message: string, ...optionalParams: any[]): void {
    this.log(LogLevel.WARN, message, ...optionalParams);
  }

  public error(message: string, ...optionalParams: any[]): void {
    this.log(LogLevel.ERROR, message, ...optionalParams);
  }
}

// シングルトンインスタンスとしてエクスポート
export const logger = new CustomLogger();
