import { Request, Response, Router } from 'express';
import path from 'path';
import fs from 'fs';

const router = Router();

const dataPath = path.resolve(__dirname, '../../data/companyGuides.json');
let guides: any[] = [];
try {
  const raw = fs.readFileSync(dataPath, 'utf-8');
  guides = JSON.parse(raw);
} catch (e) {
  console.error('Failed to load company guides', e);
}

// GET all company guides (list)
router.get('/', (req: Request, res: Response) => {
  res.json(guides);
});

// GET a specific company guide by id
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const found = guides.find(g => g.id === id);
  if (!found) return res.status(404).json({ message: 'Company guide not found' });
  res.json(found);
});

export default router;
