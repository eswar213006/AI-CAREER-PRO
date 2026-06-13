import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: string;
  icon: string;
}

export interface IDailyChallenge {
  date: string;
  challengeId: string;
  completed: boolean;
  completedAt?: string;
}

export interface IUser {
  _id?: string;
  email: string;
  password?: string;
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: string;
  role: 'student' | 'admin';
  profile: {
    name: string;
    avatar?: string;
    bio?: string;
    targetRole?: string;
    experienceLevel?: string;
    targetCompanies?: string[];
    resumeUrl?: string;
  };
  stats: {
    xp: number;
    currentStreak: number;
    longestStreak: number;
    lastActiveDate?: string;
    codingChallengesCompleted: number;
    totalInterviewsTaken: number;
    readinessScore: number;
    atsScore: number;
  };
  achievements: IAchievement[];
  dailyChallenges: IDailyChallenge[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: String },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    profile: {
      name: { type: String, required: true },
      avatar: { type: String },
      bio: { type: String, default: '' },
      targetRole: { type: String, default: '' },
      experienceLevel: { type: String, default: 'Fresher' },
      targetCompanies: [{ type: String }],
      resumeUrl: { type: String },
    },
    stats: {
      xp: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      lastActiveDate: { type: String },
      codingChallengesCompleted: { type: Number, default: 0 },
      totalInterviewsTaken: { type: Number, default: 0 },
      readinessScore: { type: Number, default: 0 },
      atsScore: { type: Number, default: 0 },
    },
    achievements: [
      {
        id: { type: String },
        title: { type: String },
        description: { type: String },
        unlockedAt: { type: String },
        icon: { type: String },
      },
    ],
    dailyChallenges: [
      {
        date: { type: String },
        challengeId: { type: String },
        completed: { type: Boolean, default: false },
        completedAt: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
