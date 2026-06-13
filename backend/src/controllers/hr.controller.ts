import { Request, Response, Router } from 'express';
import path from 'path';
import fs from 'fs';

const router = Router();

const dataPath = path.resolve(__dirname, '../../data/hrQuestions.json');
let hrData: any[] = [];
try {
  const raw = fs.readFileSync(dataPath, 'utf-8');
  hrData = JSON.parse(raw);
} catch (e) {
  console.error('Failed to load HR questions', e);
}

// GET all HR questions (list)
router.get('/', (req: Request, res: Response) => {
  res.json(hrData);
});

// GET a specific HR question by ID
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const found = hrData.find(q => q.id === id);
  if (!found) return res.status(404).json({ message: 'HR question not found' });
  res.json(found);
});

export default router;
