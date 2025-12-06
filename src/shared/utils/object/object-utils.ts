/**
 * オブジェクトの配列を指定されたフィールドの値に基づいてRecord (プレーンなJSオブジェクト) に変換します。
 * キーとなるフィールドの値に重複がある場合はエラーをスローします。
 *
 * @template T オブジェクトの型
 * @template K Mapのキーとして使用するフィールドの型 (string | number | symbol)
 * @param {T[]} array 変換するオブジェクトの配列
 * @param {keyof T} keyField Recordのキーとして使用するフィールド名
 * @returns {Record<K, T>} キーは指定されたフィールドの値、値は元のオブジェクト
 * @throws {Error} キーとなるフィールドの値に重複がある場合
 */
export function arrayToRecord<T extends object, K extends string | number | symbol>(
  array: T[],
  keyField: keyof T
): Record<K, T> {
  const resultRecord: Partial<Record<K, T>> = {};

  for (const item of array) {
    // キーフィールドの値を取得。Recordのキーとして使用するため、string, number, symbolに限定される。
    const keyValue = item[keyField];

    // Recordのキーとして使用するために型をKにキャスト (string | number | symbol)
    // ここでの型アサーションは、キーとして有効な値が渡されることを開発者が保証することを前提とする
    const recordKey = keyValue as K;

    // キーが既にRecordに存在するかチェック
    // JavaScriptオブジェクトのキーチェックには`hasOwnProperty`または`in`演算子を使用
    if (recordKey in resultRecord) {
      // 重複があった場合はエラーをスロー
      throw new Error(
        `キーフィールド '${String(keyField)}' の値 '${String(keyValue)}' が重複しています。`
      );
    }

    // 重複がなければRecordに追加
    resultRecord[recordKey] = item;
  }

  // Partialを外し、完全なRecord型として返す
  return resultRecord as Record<K, T>;
}

/**
 * オブジェクトの配列を指定されたフィールドの値に基づいてRecord (プレーンなJSオブジェクト) に変換します。
 * キーとなるフィールドの値が重複している場合、最初に見つかった要素がRecordの値として採用されます。
 * * 元のキーフィールドの値が number や symbol であっても、Recordのキーは常に string に統一されます。
 *
 * @template T オブジェクトの型
 * @param {T[]} array 変換するオブジェクトの配列
 * @param {keyof T} keyField Recordのキーとして使用するフィールド名
 * @returns {Record<string, T>} キーは指定されたフィールドの値の文字列、値は最初に見つかった元のオブジェクト
 */
export function safeArrayToRecord<T extends object>(
  array: T[],
  keyField: keyof T
): Record<string, T> {
  // 戻り値の型を Record<string, T> に合わせるため、Partial<Record<string, T>> を使用
  const resultRecord: Partial<Record<string, T>> = {};

  for (const item of array) {
    // 1. キーフィールドの値を取得 (string | number | symbol など)
    const keyValue = item[keyField];

    // 2. Recordのキーとして使用するために、値を必ず string に変換
    //    null や undefined の可能性を考慮し、安全に文字列化する
    const recordKey = String(keyValue);

    // 3. キーがまだRecordに存在しない場合のみ追加（最初に見つかった要素を保持する）
    if (!(recordKey in resultRecord)) {
      resultRecord[recordKey] = item;
    }

    // キーが既に存在する場合は何もしない (最初に見つかった値が維持される)
  }

  // 4. Partialを外し、完全な Record<string, T> 型として返す
  return resultRecord as Record<string, T>;
}

/**
 * オブジェクトの配列内で指定されたIDを持つオブジェクトを検索し、
 * 見つかった場合は置き換えデータで置換し、見つからなかった場合は末尾に追加した新しい配列を返します。
 *
 * @template T 配列内のオブジェクトの型。idフィールドを持つことが期待されます。
 * @param array 対象となるオブジェクトの配列。
 * @param id 検索対象となるオブジェクトのID。
 * @param replacementData 置き換えまたは追加する新しいオブジェクトデータ。
 * @returns 処理後の新しいオブジェクト配列。
 */
export function replaceOrAddObject<T extends { id: any }>(
  array: T[],
  id: any,
  replacementData: T
): T[] {
  // 配列内で指定されたIDを持つオブジェクトのインデックスを検索
  const index = array.findIndex((item) => item.id === id);

  if (index !== -1) {
    // 🔍 IDが見つかった場合：その位置でオブジェクトを置き換える
    // スプレッド構文 (...) を使用して、元の配列を変更せず、新しい配列を生成します。
    return [
      ...array.slice(0, index), // 0からインデックス直前まで
      replacementData, // 置き換えデータ
      ...array.slice(index + 1), // インデックスの次から末尾まで
    ];
  } else {
    // ➕ IDが見つからなかった場合：置き換えデータを配列の末尾に追加する
    return [...array, replacementData];
  }
}

/**
 * Map<K, V[]>から、正規表現に一致するキーに対応する値の配列をフラット化して結合して返します。
 * * @param map - 処理対象のMap (キーは string 型である必要があります)
 * @param regex - キーに適用する正規表現
 * @returns 正規表現に一致するキーに対応するすべての値が結合され、フラット化された配列
 */
export function getFlattenedValuesByRegex<V>(map: Map<string, V[]>, regex: RegExp): V[] {
  // Array.from(map.entries()) で Map を [key, value[]] のタプルの配列に変換
  // .filter(([key]) => regex.test(key)) で正規表現に一致するキーを持つエントリのみをフィルタリング
  // .flatMap(([, values]) => values) で、残ったエントリの値の配列 (V[]) をすべてフラット化して結合
  return Array.from(map.entries())
    .filter(([key]) => regex.test(key))
    .flatMap(([, values]) => values);
}

/**
 * オブジェクトとキーの配列を受け取り、配列に含まれるキーのみを持つ新しいオブジェクトを返します。
 *
 * @param obj フィルター対象のオブジェクト
 * @param keys 保持したいキーの配列
 * @returns フィルターされた新しいオブジェクト
 */
export function filterObjectKeys<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  return keys.reduce(
    (acc, key) => {
      // obj[key] の型は T[K] であり、これは acc のプロパティの型と一致する
      // acc は Pick<T, K> として初期化されており、key は K の要素であるため、
      // この代入は型安全です。
      acc[key] = obj[key];
      return acc;
    },
    {} as Pick<T, K>
  );
}

/**
 * オブジェクトと除外したいキーの配列を受け取り、
 * 配列に含まれないキーのみを持つ新しいオブジェクトを返します。
 *
 * @param obj フィルター対象のオブジェクト
 * @param keys 除外したいキーの配列
 * @returns フィルターされた新しいオブジェクト (指定されたキーは含まれない)
 */
export function omitObjectKeys<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const keysToOmit = new Set(keys);

  // 1. Object.keys() は string[] を返すため、keyof T[] にアサートする
  const allKeys = Object.keys(obj) as (keyof T)[];

  // 2. allKeys をフィルタリングして、除外しないキーのみを取得
  const keysToKeep = allKeys.filter((key) => !keysToOmit.has(key as K)) as Exclude<keyof T, K>[];

  // 3. 必要なキーのみで新しいオブジェクトを構築
  return keysToKeep.reduce(
    (acc, key) => {
      // key は Exclude<keyof T, K> 型であり、acc は Omit<T, K> 型なので型安全
      acc[key] = obj[key] as T[Exclude<keyof T, K>];
      return acc;
    },
    // 初期値も Omit<T, K> としてアサート
    {} as Omit<T, K>
  );
}
/**
 * Recordのキーでソートされた値の配列を返します。
 *
 * @param record ソートするRecord<string, T>オブジェクト
 * @returns キーでソートされた値の配列
 */
export function sortRecordByKeys<T>(record: Record<string, T>): T[] {
  // 1. Object.entries()で [キー, 値] の配列に変換
  const entries = Object.entries(record);

  // 2. キー（インデックス0）に基づいてソート
  // stringの比較（辞書順）でソートされます。
  entries.sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

  // 3. map()でソートされたペアから値（インデックス1）のみを取り出す
  const sortedValues = entries.map(([, value]) => value);

  return sortedValues;
}
