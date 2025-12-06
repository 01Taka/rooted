import { SM2TargetData } from './learningTargetSM2.types';

export interface LearningTargetUnitContent {
  title?: string;
  detail?: string;
  questions?: string;
  answers?: string[];
}

export interface LearningTargetUnit {
  id: string; // データ自体のID
  // データベース上でのパスとLearningTargetのパス
  // 今回はLearningTargetに直接Unit[]を含めるので必要ない
  // path: string;
  // parentId: string;
  unitPath: string; // ユーザーが指定するUnitの識別パス。contentがない場合のtitle代わり
  sm2Data: SM2TargetData;
  content?: LearningTargetUnitContent;
}
