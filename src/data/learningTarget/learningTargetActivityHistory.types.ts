import { LearningTargetActivity } from './learningTargetActivity.types';
import { LearningTargetManagementMode, LearningTargetState } from './learningTargetLiteral.types';

type ActivityHistoryItemWithTransition = {
  managementMode: LearningTargetManagementMode;
  /** このアクティビティ発生時の植物の状態 */
  stateAtActivity: LearningTargetState;
  didStateTransition: true;
  newState: LearningTargetState;
};

type ActivityHistoryItemWithoutTransition = {
  managementMode: LearningTargetManagementMode;
  /** このアクティビティ発生時の植物の状態 */
  stateAtActivity: LearningTargetState;
  didStateTransition: false;
};

type ActivityHistoryItemBase =
  | ActivityHistoryItemWithTransition
  | ActivityHistoryItemWithoutTransition;

type ActivityHistoryTargetItem = ActivityHistoryItemBase & {
  managementMode: 'TARGET';
  activity: LearningTargetActivity;
};

type ActivityHistorySpritItem = ActivityHistoryItemBase & {
  managementMode: 'SPLIT';
  activeUnits: {
    id: string;
    unitPath: string; // 履歴の時点でのパス。パスが更新されてもこちらは更新されない
    activity: LearningTargetActivity;
  }[];
};

export type LearningHistoryActivityHistoryItem =
  | ActivityHistoryTargetItem
  | ActivityHistorySpritItem;
