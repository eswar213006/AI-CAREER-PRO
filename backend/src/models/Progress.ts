import mongoose, { Schema, Document } from 'mongoose';

export interface ISubjectProgress {
  subjectName: string;
  mcqsTaken: number;
  mcqsCorrect: number;
  level: number; // 0 to 100
}

export interface IReadinessTrend {
  date: string;
  score: number;
}

export interface IRoadmapStep {
  phase: number;
  title: string;
  status: 'todo' | 'in-progress' | 'completed';
  description: string;
  resources?: string[];
}

export interface IGoal {
  text: string;
  completed: boolean;
  points: number;
}

export interface IProgress {
  _id?: string;
  userId: string;
  subjects: ISubjectProgress[];
  placementReadinessTrend: IReadinessTrend[];
  weakTopics: string[];
  roadmap: IRoadmapStep[];
  dailyGoals: IGoal[];
  weeklyGoals: IGoal[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IProgressDocument extends Omit<IProgress, '_id'>, Document {}

const ProgressSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    subjects: [
      {
        subjectName: { type: String, required: true },
        mcqsTaken: { type: Number, default: 0 },
        mcqsCorrect: { type: Number, default: 0 },
        level: { type: Number, default: 0 },
      },
    ],
    placementReadinessTrend: [
      {
        date: { type: String, required: true },
        score: { type: Number, required: true },
      },
    ],
    weakTopics: [{ type: String }],
    roadmap: [
      {
        phase: { type: Number, required: true },
        title: { type: String, required: true },
        status: { type: String, enum: ['todo', 'in-progress', 'completed'], default: 'todo' },
        description: { type: String, required: true },
        resources: [{ type: String }],
      },
    ],
    dailyGoals: [
      {
        text: { type: String, required: true },
        completed: { type: Boolean, default: false },
        points: { type: Number, default: 10 },
      },
    ],
    weeklyGoals: [
      {
        text: { type: String, required: true },
        completed: { type: Boolean, default: false },
        points: { type: Number, default: 50 },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Progress || mongoose.model<IProgressDocument>('Progress', ProgressSchema);
