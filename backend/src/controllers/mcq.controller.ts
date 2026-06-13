import { Request, Response, Router } from 'express';
import path from 'path';
import fs from 'fs';

const router = Router();

const dataPath = path.resolve(__dirname, '../../data/technicalMCQ.json');
let mcqData: any = {};
try {
  const raw = fs.readFileSync(dataPath, 'utf-8');
  mcqData = JSON.parse(raw);
} catch (e) {
  console.error('Failed to load technical MCQ data', e);
}

// GET all categories or optional filter
router.get('/', (req: Request, res: Response) => {
  const { category } = req.query;
  if (category && typeof category === 'string') {
    const catData = mcqData[category];
    return res.json(catData || []);
  }
  res.json(Object.keys(mcqData)); // list categories
});

// GET questions for a specific category
router.get('/:category', (req: Request, res: Response) => {
  const { category } = req.params;
  const catData = mcqData[category];
  if (!catData) return res.status(404).json({ message: 'Category not found' });
  res.json(catData);
});

// GET single question by ID within a category
router.get('/:category/:id', (req: Request, res: Response) => {
  const { category, id } = req.params;
  const catData = mcqData[category];
  if (!catData) return res.status(404).json({ message: 'Category not found' });
  const found = catData.find((q: any) => q.id === id);
  if (!found) return res.status(404).json({ message: 'Question not found' });
  res.json(found);
});

export default router;
