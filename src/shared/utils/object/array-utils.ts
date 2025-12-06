// 回転方向の定義はそのまま使用
type RotationDirection = 'none' | 'clockwise' | 'counter-clockwise';

/**
 * ジェネリック型 T を使用し、二重配列 (T[][]) の行と列を操作（転置・回転）します。
 *
 * T: 配列の要素の型 (例: number, string, ExpandedLearningCycleTestResult など)
 *
 * 'none': シンプルな転置 (行と列の入れ替えのみ)
 * 'clockwise': 時計回り (右に 90度) 回転
 * 'counter-clockwise': 反時計回り (左に 90度) 回転
 *
 * @param arrayOfArrays T型の要素を持つ二重配列
 * @param direction 実行したい回転の方向 ('none' | 'clockwise' | 'counter-clockwise')
 * @returns 処理後の新しい二重配列
 */
export function rotateOrTranspose<T>(
  arrayOfArrays: T[][],
  direction: RotationDirection = 'none' // デフォルトは転置のみ
): T[][] {
  // 配列が空、または行がない場合のチェック
  if (!arrayOfArrays || arrayOfArrays.length === 0 || arrayOfArrays[0].length === 0) {
    return [];
  }

  const numRows = arrayOfArrays.length;
  const numCols = arrayOfArrays[0].length;

  // ------------------------------------
  // I. シンプルな転置 ('none')
  // ------------------------------------
  if (direction === 'none') {
    // 転置後のサイズは numCols x numRows
    const transposedArray: T[][] = Array.from({ length: numCols }, () => []);

    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < numCols; j++) {
        // 元の (i, j) を 新しい (j, i) に移動
        transposedArray[j][i] = arrayOfArrays[i][j];
      }
    }
    return transposedArray;
  }

  // ------------------------------------
  // II. 90度回転 ('clockwise' / 'counter-clockwise')
  // ------------------------------------

  // 回転後のサイズは numCols x numRows
  const rotatedArray: T[][] = Array.from(
    { length: numCols },
    () => Array(numRows).fill(undefined) // 要素数 numRows で初期化（undefinedでも可）
  );

  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      if (direction === 'clockwise') {
        // 🕒 時計回り (右 90度): (i, j) -> (j, numRows - 1 - i)
        rotatedArray[j][numRows - 1 - i] = arrayOfArrays[i][j];
      } else if (direction === 'counter-clockwise') {
        // 🗘 反時計回り (左 90度): (i, j) -> (numCols - 1 - j, i)
        rotatedArray[numCols - 1 - j][i] = arrayOfArrays[i][j];
      }
    }
  }

  return rotatedArray;
}

/**
 * ソートオプションを定義するインターフェース
 * @template T オブジェクトの型
 */
interface SortOption<T> {
  /**
   * ソートの基準となるオブジェクトのキー。
   * 指定がない場合はソートしない。
   */
  key: keyof T;
  /**
   * ソート順序。trueの場合は降順 (Z-A, 9-0)、falseまたは未指定の場合は昇順 (A-Z, 0-9)。
   */
  reverse?: boolean;
}

/**
 * カスタムソート関数のオプション
 * @template T オブジェクトの型
 */
interface CustomSortOptions<T> {
  /**
   * 二重目の配列 (内側の配列) のソートオプション
   */
  innerSort: SortOption<T>;
  /**
   * 一重目の配列 (外側の配列) のソートオプション
   * ソートは内側の配列の**最初の要素**を基準に行われる。
   */
  outerSort: SortOption<T>;
}
/**
 * オブジェクトの二重配列を、指定されたキーとオプションでソートする関数
 *
 * 1. 内側の配列をソート
 * 2. 外側の配列を内側の最初の要素を基準にソート
 *
 * @template T 配列内のオブジェクトの型
 * @param {T[][]} array ソート対象の二重配列
 * @param {CustomSortOptions<T>} options ソートのキーと順序のオプション
 * @returns {T[][]} ソート済みの新しい二重配列
 */
export function sortDoubleArray<T>(array: T[][], options: CustomSortOptions<T>): T[][] {
  const { innerSort, outerSort } = options;

  // 1. **内側の配列**をソート (マップ関数内で各配列に適用)
  const arrayWithInnerSorted = array.map((innerArray) => {
    // keyが指定されていない場合はソートしない
    if (!innerSort.key) {
      return innerArray;
    }

    // 元の配列を変更しないようにコピー
    const sortedInnerArray = [...innerArray];
    const key = innerSort.key;

    sortedInnerArray.sort((a, b) => {
      const valA = a[key];
      const valB = b[key];

      let comparison = 0;
      if (valA > valB) {
        comparison = 1;
      } else if (valA < valB) {
        comparison = -1;
      }

      // reverseがtrueならソート順を反転 (-1を掛ける)
      return innerSort.reverse ? comparison * -1 : comparison;
    });

    return sortedInnerArray;
  });

  // 2. **外側の配列**をソート (内側の**最初の要素**を基準に)
  // keyが指定されていない場合はソートしない
  if (!outerSort.key) {
    return arrayWithInnerSorted;
  }

  // 元の配列を変更しないようにコピー
  const fullySortedArray = [...arrayWithInnerSorted];
  const key = outerSort.key;

  fullySortedArray.sort((a, b) => {
    // 最初の要素が存在しない場合はソート対象外とする (または undefined として扱う)
    const firstA = a[0];
    const firstB = b[0];

    // 最初の要素がない場合は、ソート順を維持 (0を返す)
    if (!firstA || !firstB) {
      return 0;
    }

    const valA = firstA[key];
    const valB = firstB[key];

    let comparison = 0;
    if (valA > valB) {
      comparison = 1;
    } else if (valA < valB) {
      comparison = -1;
    }

    // reverseがtrueならソート順を反転 (-1を掛ける)
    return outerSort.reverse ? comparison * -1 : comparison;
  });

  return fullySortedArray;
}
