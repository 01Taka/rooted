import { LearningHistoryActivityHistoryItem } from './learningTargetActivityHistory.types';
import { GreenhouseTransitionHistoryItem } from './learningTargetGreenhouseTransitionHistory.types';
import { LearningTargeMainState } from './learningTargetMainState.types';
import { StageTransitionHistoryItem } from './learningTargetStageTransitionHistory.types';

export interface LearningTarget {
  id: string;
  title: string;
  description: string;
  currentSlot: number;

  createdAt: number;

  /** 主要な状態を表すデータオブジェクト。温室での復習では更新されない */
  state: LearningTargeMainState;
  /** スロット内で最後に復習した日時。温室での復習では更新されない */
  lastCommitmentAt: number;
  /** スロット内で復習した回数。温室での復習では更新されない */
  totalCommitmentCount: number;

  isInGreenhouse: boolean;

  /** stateが温室では変更されないのに伴い、温室の間は更新されない */
  stageTransitionHistory: StageTransitionHistoryItem[];

  greenhouseTransitionHistory: GreenhouseTransitionHistoryItem[];

  /** 温室も含めたすべての活動履歴 */
  activityHistory: LearningHistoryActivityHistoryItem[];
}
