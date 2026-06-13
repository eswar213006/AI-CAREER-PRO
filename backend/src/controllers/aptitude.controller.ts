import { Request, Response, Router } from 'express';
import path from 'path';
import fs from 'fs';

const router = Router();

const dataPath = path.resolve(__dirname, '../../data/aptitudeQuestions.json');
let aptitudeData: any = [];
try {
  const raw = fs.readFileSync(dataPath, 'utf-8');
  aptitudeData = JSON.parse(raw);
} catch (e) {
  console.error('Failed to load aptitude questions', e);
}

// GET all questions (optionally filter by type)
router.get('/', (req: Request, res: Response) => {
  const { type } = req.query;
  if (type && typeof type === 'string') {
    const filtered = aptitudeData[type];
    return res.json(filtered || []);
  }
  res.json(aptitudeData);
});

// GET single question by ID (search across categories)
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  for (const cat of Object.values<any>(aptitudeData)) {
    const found = cat.find((q: any) => q.id === id);
    if (found) return res.json(found);
  }
  res.status(404).json({ message: 'Question not found' });
});

export default router;
