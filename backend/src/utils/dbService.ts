import User, { IUser } from '../models/User';
import Interview, { IInterview } from '../models/Interview';
import Submission, { ISubmission } from '../models/Submission';
import Progress, { IProgress } from '../models/Progress';
import { jsonDb } from './jsonDb';
import { checkUseMongoDB } from '../config/db';

export const dbService = {
  user: {
    findOne: async (query: Partial<IUser>): Promise<IUser | null> => {
      if (checkUseMongoDB()) {
        const doc = await User.findOne(query).exec();
        return doc ? doc.toObject() : null;
      }
      return jsonDb.findOne<IUser>('users', query);
    },
    findById: async (id: string): Promise<IUser | null> => {
      if (checkUseMongoDB()) {
        const doc = await User.findById(id).exec();
        return doc ? doc.toObject() : null;
      }
      return jsonDb.findById<IUser>('users', id);
    },
    create: async (data: Partial<IUser>): Promise<IUser> => {
      if (checkUseMongoDB()) {
        const userObj = new User(data);
        const doc = await userObj.save();
        return doc.toObject();
      }
      return jsonDb.create<IUser>('users', data);
    },
    findByIdAndUpdate: async (id: string, update: any): Promise<IUser | null> => {
      if (checkUseMongoDB()) {
        const doc = await User.findByIdAndUpdate(id, update, { new: true }).exec();
        return doc ? doc.toObject() : null;
      }
      return jsonDb.findByIdAndUpdate<IUser>('users', id, update);
    },
    find: async (query: Partial<IUser> = {}): Promise<IUser[]> => {
      if (checkUseMongoDB()) {
        const docs = await User.find(query).exec();
        return docs.map(d => d.toObject());
      }
      return jsonDb.find<IUser>('users', query);
    }
  },

  interview: {
    findOne: async (query: Partial<IInterview>): Promise<IInterview | null> => {
      if (checkUseMongoDB()) {
        const doc = await Interview.findOne(query).exec();
        return doc ? doc.toObject() : null;
      }
      return jsonDb.findOne<IInterview>('interviews', query);
    },
    findById: async (id: string): Promise<IInterview | null> => {
      if (checkUseMongoDB()) {
        const doc = await Interview.findById(id).exec();
        return doc ? doc.toObject() : null;
      }
      return jsonDb.findById<IInterview>('interviews', id);
    },
    create: async (data: Partial<IInterview>): Promise<IInterview> => {
      if (checkUseMongoDB()) {
        const intObj = new Interview(data);
        const doc = await intObj.save();
        return doc.toObject();
      }
      return jsonDb.create<IInterview>('interviews', data);
    },
    findByIdAndUpdate: async (id: string, update: any): Promise<IInterview | null> => {
      if (checkUseMongoDB()) {
        const doc = await Interview.findByIdAndUpdate(id, update, { new: true }).exec();
        return doc ? doc.toObject() : null;
      }
      return jsonDb.findByIdAndUpdate<IInterview>('interviews', id, update);
    },
    find: async (query: Partial<IInterview> = {}): Promise<IInterview[]> => {
      if (checkUseMongoDB()) {
        const docs = await Interview.find(query).sort({ createdAt: -1 }).exec();
        return docs.map(d => d.toObject());
      }
      return jsonDb.find<IInterview>('interviews', query).sort((a: any, b: any) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
  },

  submission: {
    findOne: async (query: Partial<ISubmission>): Promise<ISubmission | null> => {
      if (checkUseMongoDB()) {
        const doc = await Submission.findOne(query).exec();
        return doc ? doc.toObject() : null;
      }
      return jsonDb.findOne<ISubmission>('submissions', query);
    },
    findById: async (id: string): Promise<ISubmission | null> => {
      if (checkUseMongoDB()) {
        const doc = await Submission.findById(id).exec();
        return doc ? doc.toObject() : null;
      }
      return jsonDb.findById<ISubmission>('submissions', id);
    },
    create: async (data: Partial<ISubmission>): Promise<ISubmission> => {
      if (checkUseMongoDB()) {
        const subObj = new Submission(data);
        const doc = await subObj.save();
        return doc.toObject();
      }
      return jsonDb.create<ISubmission>('submissions', data);
    },
    findByIdAndUpdate: async (id: string, update: any): Promise<ISubmission | null> => {
      if (checkUseMongoDB()) {
        const doc = await Submission.findByIdAndUpdate(id, update, { new: true }).exec();
        return doc ? doc.toObject() : null;
      }
      return jsonDb.findByIdAndUpdate<ISubmission>('submissions', id, update);
    },
    find: async (query: Partial<ISubmission> = {}): Promise<ISubmission[]> => {
      if (checkUseMongoDB()) {
        const docs = await Submission.find(query).sort({ createdAt: -1 }).exec();
        return docs.map(d => d.toObject());
      }
      return jsonDb.find<ISubmission>('submissions', query).sort((a: any, b: any) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
  },

  progress: {
    findOne: async (query: Partial<IProgress>): Promise<IProgress | null> => {
      if (checkUseMongoDB()) {
        const doc = await Progress.findOne(query).exec();
        return doc ? doc.toObject() : null;
      }
      return jsonDb.findOne<IProgress>('progress', query);
    },
    create: async (data: Partial<IProgress>): Promise<IProgress> => {
      if (checkUseMongoDB()) {
        const progObj = new Progress(data);
        const doc = await progObj.save();
        return doc.toObject();
      }
      return jsonDb.create<IProgress>('progress', data);
    },
    findOneAndUpdate: async (query: Partial<IProgress>, update: any): Promise<IProgress | null> => {
      if (checkUseMongoDB()) {
        const doc = await Progress.findOneAndUpdate(query, update, { new: true, upsert: true }).exec();
        return doc ? doc.toObject() : null;
      }
      return jsonDb.findOneAndUpdate<IProgress>('progress', query, update, true);
    }
  }
};
