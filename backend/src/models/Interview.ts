import mongoose, { Schema, Document } from 'mongoose';

export interface IInterviewQuestion {
  id: string;
  text: string;
  category: string;
  idealAnswer?: string;
  userAnswer?: string;
  feedback?: string;
  score?: number;
}

export interface IVoiceReport {
  speakingSpeedWpm: number;
  fillerWordCount: number;
  fillerWordsDetected: string[];
  pronunciationScore: number;
  confidenceScore: number;
  reportSummary?: string;
}

export interface IInterview {
  _id?: string;
  userId: string;
  jobRole: string;
  experienceLevel: string;
  difficulty: string;
  interviewType: string;
  company?: string;
  status: 'active' | 'completed';
  questions: IInterviewQuestion[];
  score?: {
    technical: number;
    communication: number;
    confidence: number;
    overall: number;
  };
  voiceReport?: IVoiceReport;
  aiDetailedFeedback?: {
    strengths: string[];
    weaknesses: string[];
    tips: string[];
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface IInterviewDocument extends Omit<IInterview, '_id'>, Document {}

const InterviewSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    jobRole: { type: String, required: true },
    experienceLevel: { type: String, required: true },
    difficulty: { type: String, required: true },
    interviewType: { type: String, required: true },
    company: { type: String },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
    questions: [
      {
        id: { type: String, required: true },
        text: { type: String, required: true },
        category: { type: String },
        idealAnswer: { type: String },
        userAnswer: { type: String, default: '' },
        feedback: { type: String, default: '' },
        score: { type: Number, default: 0 },
      },
    ],
    score: {
      technical: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
      overall: { type: Number, default: 0 },
    },
    voiceReport: {
      speakingSpeedWpm: { type: Number, default: 0 },
      fillerWordCount: { type: Number, default: 0 },
      fillerWordsDetected: [{ type: String }],
      pronunciationScore: { type: Number, default: 0 },
      confidenceScore: { type: Number, default: 0 },
      reportSummary: { type: String },
    },
    aiDetailedFeedback: {
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      tips: [{ type: String }],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Interview || mongoose.model<IInterviewDocument>('Interview', InterviewSchema);
