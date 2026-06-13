import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission {
  _id?: string;
  userId: string;
  problemId: string;
  title: string;
  code: string;
  language: string;
  status: 'Compile Error' | 'Runtime Error' | 'Wrong Answer' | 'Accepted' | 'Pending';
  testCasesPassed: number;
  totalTestCases: number;
  executionTimeMs: number;
  correctnessScore: number;
  aiReview?: {
    timeComplexity: string;
    spaceComplexity: string;
    optimizationSuggestions: string[];
    codeSmells: string[];
    refactoredCode?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ISubmissionDocument extends Omit<ISubmission, '_id'>, Document {}

const SubmissionSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    problemId: { type: String, required: true },
    title: { type: String, required: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    status: {
      type: String,
      enum: ['Compile Error', 'Runtime Error', 'Wrong Answer', 'Accepted', 'Pending'],
      default: 'Pending',
    },
    testCasesPassed: { type: Number, default: 0 },
    totalTestCases: { type: Number, default: 0 },
    executionTimeMs: { type: Number, default: 0 },
    correctnessScore: { type: Number, default: 0 },
    aiReview: {
      timeComplexity: { type: String, default: 'N/A' },
      spaceComplexity: { type: String, default: 'N/A' },
      optimizationSuggestions: [{ type: String }],
      codeSmells: [{ type: String }],
      refactoredCode: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Submission || mongoose.model<ISubmissionDocument>('Submission', SubmissionSchema);
