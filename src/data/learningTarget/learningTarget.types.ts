import { LearningHistoryActivityHistoryItem } from './learningTargetActivityHistory.types';
import { GreenhouseTransitionHistoryItem } from './learningTargetGreenhouseTransitionHistory.types';
import { LearningTargetManagementData } from './learningTargetManagementData.types';
import { LearningTargetStageData } from './learningTargetStageData.types';
import { StageTransitionHistoryItem } from './learningTargetStageTransitionHistory.types';

export interface LearningTarget {
  id: string;
  title: string;
  description: string;
  currentSlot: number;
  managementData: LearningTargetManagementData;

  createdAt: number;
  lastCommitmentAt: number;
  totalCommitmentCount: number;

  stageData: LearningTargetStageData;
  isInGreenhouse: boolean;

  stageTransitionHistory: StageTransitionHistoryItem[];
  greenhouseTransitionHistory: GreenhouseTransitionHistoryItem[];
  activityHistory: LearningHistoryActivityHistoryItem[];
}
