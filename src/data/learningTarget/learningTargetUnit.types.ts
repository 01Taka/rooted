import { LearningTargetSM2TargetData } from './learningTargetSM2.types';

export interface LearningTargetUnitContent {
  title?: string;
  detail?: string;
  questions?: string;
  answers?: string[];
}

export interface LearningTargetUnitBase {
  id: string; // データ自体のID
  // データベース上でのパスとLearningTargetのパス
  // 今回はLearningTargetに直接Unit[]を含めるので必要ない
  // path: string;
  // parentId: string;
  unitPath: string; // ユーザーが指定するUnitの識別パス。contentがない場合のtitle代わり
  content?: LearningTargetUnitContent;
}

/** SM2データを持たないユニットの型 */
export type LearningTargetUnitWithoutSM2 = LearningTargetUnitBase & { sm2Data?: undefined };
/** SM2データを持つユニットの型 */
export type LearningTargetUnitWithSM2 = LearningTargetUnitBase & {
  sm2Data: LearningTargetSM2TargetData;
};

export type LearningTargetUnit = LearningTargetUnitWithoutSM2 | LearningTargetUnitWithSM2;
