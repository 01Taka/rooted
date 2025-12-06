export type TimeUnits = {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  isPositive: boolean;
};

export type ProcessedTime = {
  split: TimeUnits;
  conversion: TimeUnits;
  isPositive: boolean;
};

/**
 * ミリ秒の処理とゼロ埋めによる整形を行った結果の型定義です。
 */
export type FormattedMilliseconds = {
  /**
   * ミリ秒を時間、分、秒、ミリ秒に分割し、ゼロ埋めした結果。
   * 例: 3723456ms -> { hours: "01", minutes: "02", seconds: "03", milliseconds: "456" }
   */
  split: {
    hours: string;
    minutes: string;
    seconds: string;
    milliseconds: string;
    isPositive: boolean;
  };
  /**
   * ミリ秒を独立した単位（時間、分、秒）に変換し、ゼロ埋めした結果。
   * hours, minutes, seconds は整数部分のみがゼロ埋めされる。
   * 例: 3723456ms -> { hours: "01", minutes: "62", seconds: "3723", milliseconds: 3723456 }
   */
  conversion: {
    hours: string; // 全体のミリ秒を時間で割った値の整数部（ゼロ埋め）
    minutes: string; // 全体のミリ秒を分で割った値の整数部（ゼロ埋め）
    seconds: string; // 全体のミリ秒を秒で割った値の整数部（ゼロ埋め）
    milliseconds: number; // 変換前の元のミリ秒（数値）
    isPositive: boolean;
  };
  /**
   * 元のミリ秒が正の値であったかを示すフラグ。
   */
  isPositive: boolean;
};

/**
 * ゼロ埋めの桁数を設定するためのオプション。
 * 設定されない場合はデフォルト値 (hours: 2, minutes: 2, seconds: 2, milliseconds: 3) が適用されます。
 */
export type FormatMillisecondsOptions = {
  hoursPads?: number;
  minutesPads?: number;
  secondsPads?: number;
  millisecondsPads?: number;
  truncateConversion?: boolean;
  useAbsolute?: boolean;
};

/**
 * ミリ秒を時間、分、秒、ミリ秒に分割します。
 *
 * @param ms 分割したいミリ秒数
 * @param useAbsolute オプション。trueの場合、msの絶対値で計算します（デフォルト: false）。
 * @returns 時間、分、秒、ミリ秒を含むオブジェクトと、元の値が正であったかを示すフラグ。
 */
export function splitMilliseconds(ms: number, useAbsolute: boolean = false): TimeUnits {
  const isPositive = ms >= 0;
  const targetMs = useAbsolute ? Math.abs(ms) : ms;

  // 1. 時間を計算
  const hours = Math.floor(targetMs / (1000 * 60 * 60));
  // 残りのミリ秒を計算
  let remainingMs = targetMs % (1000 * 60 * 60);

  // 2. 分を計算
  const minutes = Math.floor(remainingMs / (1000 * 60));
  // 残りのミリ秒を更新
  remainingMs %= 1000 * 60;

  // 3. 秒を計算
  const seconds = Math.floor(remainingMs / 1000);
  // 残りのミリ秒を更新
  remainingMs %= 1000;

  // 4. 最終的なミリ秒（常に 0 から 999 の範囲）
  const milliseconds = remainingMs;

  return {
    hours,
    minutes,
    seconds,
    milliseconds,
    isPositive,
  };
}

/**
 * ミリ秒を時間、分、秒に変換します。
 *
 * @param ms - 変換したいミリ秒数。
 * @param truncate - オプション。trueの場合、結果を切り捨て（整数）で返します（デフォルト: false）。
 * @param useAbsolute - オプション。trueの場合、msの絶対値で計算します（デフォルト: false）。
 * @returns 時間、分、秒を含むオブジェクトと、元の値が正であったかを示すフラグ。
 */
export function convertMs(
  ms: number,
  truncate: boolean = false,
  useAbsolute: boolean = false
): TimeUnits {
  const isPositive = ms >= 0;
  const targetMs = useAbsolute ? Math.abs(ms) : ms;

  const MS_IN_HOUR = 1000 * 60 * 60;
  const MS_IN_MINUTE = 1000 * 60;
  const MS_IN_SECOND = 1000;

  // 1. 時間 (Hours) の計算
  let hours = targetMs / MS_IN_HOUR;

  // 2. 分 (Minutes) の計算
  let minutes = targetMs / MS_IN_MINUTE;

  // 3. 秒 (Seconds) の計算
  let seconds = targetMs / MS_IN_SECOND;

  if (truncate) {
    // フラグが true の場合、すべての値を切り捨てる
    hours = Math.floor(hours);
    minutes = Math.floor(minutes);
    seconds = Math.floor(seconds);
  }

  return {
    hours,
    minutes,
    seconds,
    milliseconds: targetMs,
    isPositive,
  };
}

// ---

/**
 * ミリ秒を「分割」および「独立した単位への変換」の両方を行う統合関数です。
 *
 * @param ms - 処理したいミリ秒数。
 * @param truncateConversion - オプション。trueの場合、独立変換の結果を切り捨てます（デフォルト: false）。
 * @param useAbsolute - オプション。trueの場合、msの絶対値で計算します（デフォルト: false）。
 * @returns 分割結果と変換結果の両方を含むオブジェクト。
 */
export function processMilliseconds(
  ms: number,
  truncateConversion: boolean = false,
  useAbsolute: boolean = false
): ProcessedTime {
  return {
    split: splitMilliseconds(ms, useAbsolute),
    conversion: convertMs(ms, truncateConversion, useAbsolute),
    isPositive: ms >= 0,
  };
}

/**
 * ミリ秒の処理結果をゼロ埋めして整形します。
 *
 * @param ms - 処理したいミリ秒数。
 * @param truncateConversion - オプション。trueの場合、独立変換の結果を切り捨てます（デフォルト: false）。
 * @param useAbsolute - オプション。trueの場合、msの絶対値で計算します（デフォルト: false）。
 * @param options - オプション。ゼロ埋めの桁数を設定します。
 * @returns 分割結果と変換結果の両方を含む、値がゼロ埋めされた文字列のオブジェクト。
 */
export function formatMilliseconds(
  ms: number,
  options: FormatMillisecondsOptions = {} // 新しいオプショナル引数
): FormattedMilliseconds {
  const pads = {
    hours: options.hoursPads ?? 2,
    minutes: options.minutesPads ?? 2,
    seconds: options.secondsPads ?? 2,
    milliseconds: options.millisecondsPads ?? 3,
  };

  // processMilliseconds はこのコードブロックの外部で定義されているものとする
  const result = processMilliseconds(ms, options.truncateConversion, options.useAbsolute);

  /**
   * 数値を指定された長さでゼロ埋めするヘルパー関数。
   * @param num - ゼロ埋めしたい数値。
   * @param length - 最終的な文字列の長さ。
   * @returns ゼロ埋めされた文字列。
   */
  const zeroPad = (num: number, length: number): string => {
    // 小数点以下を考慮し、Math.floorで切り捨ててから文字列化し、ゼロ埋め
    return Math.floor(num).toString().padStart(length, '0');
  };

  // 1. 分割結果（Split）のゼロ埋め
  const formattedSplit = {
    hours: zeroPad(result.split.hours, pads.hours),
    minutes: zeroPad(result.split.minutes, pads.minutes),
    seconds: zeroPad(result.split.seconds, pads.seconds),
    milliseconds: zeroPad(result.split.milliseconds, pads.milliseconds),
    isPositive: result.split.isPositive,
  };

  // 2. 独立変換結果（Conversion）のゼロ埋め
  const formattedConversion = {
    hours: zeroPad(result.conversion.hours, pads.hours),
    minutes: zeroPad(result.conversion.minutes, pads.minutes),
    seconds: zeroPad(result.conversion.seconds, pads.seconds),
    // conversionのmillisecondsは処理されたms全体の値なので、そのまま保持
    milliseconds: result.conversion.milliseconds,
    isPositive: result.conversion.isPositive,
  };

  return {
    split: formattedSplit,
    conversion: formattedConversion,
    isPositive: result.isPositive,
  };
}

export function formatMillisecondsToMSS(ms: number) {
  // 1. ミリ秒を秒に変換
  const totalSeconds = Math.floor(ms / 1000);

  // 2. 秒数から分と秒を計算
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60; // 60で割った余りが秒数

  // 3. 2桁表示にしてコロンで結合
  const formattedMinutes = String(minutes).padStart(1, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}
