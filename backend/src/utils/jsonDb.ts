import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getFilePath = (collection: string) => path.join(DATA_DIR, `${collection}.json`);

const readCollection = (collection: string): any[] => {
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8') || '[]');
  } catch {
    return [];
  }
};

const writeCollection = (collection: string, data: any[]) => {
  fs.writeFileSync(getFilePath(collection), JSON.stringify(data, null, 2));
};

// Resolve dot-notation path setting into nested object
const applyDotSet = (obj: any, dotPath: string, value: any): void => {
  const parts = dotPath.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur[parts[i]] === undefined || cur[parts[i]] === null) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
};

// Apply Mongoose-style $set operator with dot-notation support
const applyUpdate = (doc: any, update: any): any => {
  const result = { ...doc, updatedAt: new Date().toISOString() };

  if (update.$set) {
    for (const [key, value] of Object.entries(update.$set)) {
      if (key.includes('.')) {
        applyDotSet(result, key, value);
      } else {
        (result as any)[key] = value;
      }
    }
  } else {
    for (const [key, value] of Object.entries(update)) {
      if (!key.startsWith('$')) {
        if (key.includes('.')) {
          applyDotSet(result, key, value);
        } else {
          (result as any)[key] = value;
        }
      }
    }
  }

  return result;
};

export const jsonDb = {
  find: <T>(collection: string, query?: Partial<T>): T[] => {
    const data = readCollection(collection);
    if (!query || Object.keys(query).length === 0) return data as T[];
    return data.filter((item: any) => {
      for (const key in query) {
        if (item[key] !== (query as any)[key]) return false;
      }
      return true;
    }) as T[];
  },

  findOne: <T>(collection: string, query: Partial<T>): T | null => {
    const results = jsonDb.find<T>(collection, query);
    return results.length > 0 ? results[0] : null;
  },

  findById: <T>(collection: string, id: string): T | null => {
    const data = readCollection(collection);
    return (data.find((item: any) => item._id === id || item.id === id) as T) || null;
  },

  create: <T>(collection: string, doc: any): T => {
    const data = readCollection(collection);
    const newDoc = {
      _id: doc._id || `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc,
    };
    data.push(newDoc);
    writeCollection(collection, data);
    return newDoc as T;
  },

  findByIdAndUpdate: <T>(collection: string, id: string, update: any): T | null => {
    const data = readCollection(collection);
    const index = data.findIndex((item: any) => item._id === id || item.id === id);
    if (index === -1) return null;
    data[index] = applyUpdate(data[index], update);
    writeCollection(collection, data);
    return data[index] as T;
  },

  findOneAndUpdate: <T>(collection: string, query: Partial<T>, update: any, upsert = false): T | null => {
    const data = readCollection(collection);
    const index = data.findIndex((item: any) => {
      for (const key in query) {
        if (item[key] !== (query as any)[key]) return false;
      }
      return true;
    });

    if (index === -1) {
      if (upsert) {
        const updateData = update.$set ? update.$set : update;
        const newDoc = jsonDb.create<T>(collection, { ...query, ...updateData });
        return newDoc;
      }
      return null;
    }

    data[index] = applyUpdate(data[index], update);
    writeCollection(collection, data);
    return data[index] as T;
  },

  deleteOne: (collection: string, query: any): boolean => {
    const data = readCollection(collection);
    const filtered = data.filter((item: any) => {
      for (const key in query) {
        if (item[key] === query[key]) return false;
      }
      return true;
    });
    writeCollection(collection, filtered);
    return filtered.length < data.length;
  }
};
