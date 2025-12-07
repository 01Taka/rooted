// evaluation-constants.ts

// --- 1. Q値・色定数 ---

export const QUALITY_COLORS = {
  UNKNOWN: 'gray',
  FAILURE: 'orange', // Q < 3
  SUCCESS: 'teal', // Q >= 3
  PASS: 'blue',
  FAIL: 'red',
} as const;

// --- 2. 表示テキスト定数 ---

export const EVALUATION_TEXTS = {
  MODAL_TABS: {
    TAP: 'ワンタップ',
    PASS_FAIL: '正誤',
    STAR: 'スター評価',
    SCORE: '得点率',
  },
  COMMON: {
    SET_EVALUATION: '評価を設定してください',
    CONFIRM_Q: (quality: number) => `Q=${quality} で評価を確定し、植物を成長させる`,
    INVALID_EVALUATION_ALERT: '評価モードを選択するか、評価値を設定してから確定してください。',
  },
  TAP: {
    TITLE: '習慣化の記録',
    DESCRIPTION:
      '学習に取り組んだことを記録する最も簡単な方法です。心理的ハードルを極限まで下げた「芽」の段階での継続記録に最適です。',
    LABEL_DEFAULT: 'ワンタップで記録する',
    LABEL_TOGGLED: (qDisplay: number | string) => `やった！記録を確定します (Q=${qDisplay})`,
  },
  PASS_FAIL: {
    TITLE: '不正解・正解を選択してください',
    DESCRIPTION: '短期的な継続と定着確認（`BUDDING`）に使われるクイックチェックです。',
    PASS: '正解',
    FAIL: '不正解',
    DISPLAY_Q: (qDisplay: number | string) => `確定Q値: Q=${qDisplay}`,
  },
  STAR: {
    TITLE: '主観的な定着度を 0〜5 の6段階 で評価してください',
    DESCRIPTION_DEFAULT: '星を選択して評価を確定してください。',
    DISPLAY_Q: (qDisplay: number | string) => `選択Q値: Q=${qDisplay}`,
    RATINGS: {
      5: '完璧！思い出すのに全く努力がいらなかった。（Q=5）',
      4: '優秀。思い出すのに少しの努力があった。（Q=4）',
      3: '及第点。思い出すのに時間がかかった。（Q=3）',
      2: '要注意。正解したが、確信が持てなかった。（Q=2）',
      1: '欠落。間違えたが、ヒントがあればわかった。（Q=1）',
      0: '未評価。全く思い出せなかった / 大幅に間違えた。（Q=0）',
    },
  },
  SCORE: {
    TITLE: '得点を入力してください',
    SCORE_LABEL: 'あなたの得点',
    MAX_SCORE_LABEL: '満点',
    PERCENTAGE: (percentage: number) => `得点率: ${percentage.toFixed(1)}%`,
    DISPLAY_Q: (qDisplay: number | string) => `算出Q値: Q=${qDisplay}`,
    DESCRIPTION_READY: '得点率に基づいて、忘却曲線管理のための Q 値が自動で算出されます。',
    DESCRIPTION_DEFAULT: '得点、最高得点またはスライダーを操作して評価を確定してください。',
  },
} as const;
