import { LearningTargetActivity } from './learningTargetActivity.types';
import { LearningTargetManagementMode, LearningTargetStage } from './learningTargetLiteral.types';

// ----------------------------------------------------------------------
// 共通の基盤となる型
// ----------------------------------------------------------------------

/** 履歴アイテムの共通基本プロパティ */
type ActivityHistoryItemCommon = {
  managementMode: LearningTargetManagementMode;
  /** このデータが温室内での復習かどうか */
  isInGreenhouse: boolean;
  /** このアクティビティ発生時の植物の状態 */
  stageAtActivity: LearningTargetStage;
};

// ----------------------------------------------------------------------
// 状態遷移 (State Transition) に関連する型
// ----------------------------------------------------------------------

/** 状態が遷移したアクティビティ履歴アイテム */
type ActivityHistoryItemWithTransition = ActivityHistoryItemCommon & {
  didStateTransition: true;
  newStage: LearningTargetStage;
};

/** 状態が遷移しなかったアクティビティ履歴アイテム */
type ActivityHistoryItemWithoutTransition = ActivityHistoryItemCommon & {
  didStateTransition: false;
};

/** 状態遷移の有無を含む履歴アイテムの基本型 (判別可能なユニオン型) */
export type ActivityHistoryItemBase =
  | ActivityHistoryItemWithTransition
  | ActivityHistoryItemWithoutTransition;

// ----------------------------------------------------------------------
// 管理モード (Management Mode) に関連する型
// ----------------------------------------------------------------------

/** TARGET モードの履歴アイテム */
export type ActivityHistoryTargetItem = ActivityHistoryItemBase & {
  managementMode: 'TARGET';
  activity: LearningTargetActivity;
};

/** SPLIT モードの履歴アイテムで使用されるユニット情報 */
export type SplitUnitActivity = {
  id: string;
  unitPath: string; // 履歴の時点でのパス。パスが更新されてもこちらは更新されない
  activity: LearningTargetActivity;
};

/** SPLIT モードの履歴アイテム */
export type ActivityHistorySplitItem = ActivityHistoryItemBase & {
  managementMode: 'SPLIT';
  activeUnits: SplitUnitActivity[];
};

// ----------------------------------------------------------------------
// 最終的なエクスポート型
// ----------------------------------------------------------------------

/** 全ての学習履歴アクティビティ履歴アイテム */
export type LearningHistoryActivityHistoryItem =
  | ActivityHistoryTargetItem
  | ActivityHistorySplitItem;
