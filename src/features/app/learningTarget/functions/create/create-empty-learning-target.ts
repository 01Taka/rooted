// SPROUTINGの初期状態

import { LearningTarget } from '@/data/learningTarget/learningTarget.types';
import {
  LearningTargeMainState,
  TargetModeSprouting,
} from '@/data/learningTarget/learningTargetMainState.types';

/**
 * 新しい学習ターゲットオブジェクトを初期値で作成します。
 *
 * @param id 新しいLearningTargetに割り当てる一意のID。
 * @param title ターゲットのタイトル。
 * @returns LearningTargetインターフェースを満たすオブジェクト。
 */
export function createEmptyLearningTarget(id: string, title: string): LearningTarget {
  // 初期状態: TARGETモード, SPROUTINGステージ
  const initialState: TargetModeSprouting = {
    managementMode: 'TARGET',
    stage: 'SPROUTING',
    sproutingPromotionCount: 0,
    // sm2Data は SPROUTING のため undefined
  };

  const now = Date.now(); // 現在のタイムスタンプ

  const emptyLearningTarget: LearningTarget = {
    id: id,
    title: title,
    description: '', // 空の説明
    currentSlot: 0, // 初期スロット
    createdAt: now,

    // --- メインの状態 ---
    state: initialState as LearningTargeMainState, // 判別可能なユニオン型の初期状態
    lastCommitmentAt: null, // 復習なし
    totalCommitmentCount: 0,
    isInGreenhouse: false,

    // --- 履歴データ ---
    stageTransitionHistory: [
      {
        reason: 'INITIAL_CREATION', // 初期作成の履歴
        fromStage: null,
        toStage: 'SPROUTING',
        timestamp: now,
      },
    ],
    greenhouseTransitionHistory: [], // 温室への出入り履歴は空
    activityHistory: [], // 活動履歴は空
  };

  return emptyLearningTarget;
}
