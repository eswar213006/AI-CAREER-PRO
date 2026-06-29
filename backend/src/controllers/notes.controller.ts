import { Request, Response, Router } from 'express';
import { generateAIResponse } from '../config/ai';

const router = Router();

router.post('/generate', async (req: Request, res: Response) => {
  const { topic = 'DBMS Normalization' } = req.body;

  const fallback = {
    topic,
    summary: `Normalisation in DBMS is a systematic process of organizing the database schemas to minimize data redundancy and eliminate anomalies (Insertion, Update, Deletion). It involves decomposing tables into smaller, well-structured relations using Functional Dependencies.`,
    revisionChecklist: [
      'Understand First Normal Form (1NF) - Atomic attribute values.',
      'Understand Second Normal Form (2NF) - No partial dependencies.',
      'Understand Third Normal Form (3NF) - No transitive dependencies.',
      'Identify Boyce-Codd Normal Form (BCNF) - Strict candidate key dependencies.'
    ],
    cheatSheet: `1NF: Remove repeating groups / composite columns.\n2NF: 1NF + remove partial dependencies (Non-key attrs must depend on entire PK).\n3NF: 2NF + remove transitive dependencies (Non-key attrs must not depend on other non-key attrs).\nBCNF: For X -> Y, X must be a super key.`,
    flashcards: [
      { q: 'What is a deletion anomaly?', a: 'Accidentally deleting valuable primary records because they are stored in the same table as a dependent attribute.' },
      { q: 'What is transitive dependency?', a: 'When a non-prime attribute determines another non-prime attribute.' }
    ],
    interviewQA: [
      { q: 'Explain BCNF vs 3NF.', a: 'BCNF is a stronger version of 3NF. While 3NF allows X -> Y if Y is a prime attribute, BCNF strictly requires X to be a super key for any functional dependency.' },
      { q: 'What is dependency preserving decomposition?', a: 'Ensuring that all functional dependencies defined on the original relation can be checked using the individual tables after decomposition.' }
    ]
  };

  try {
    const prompt = `Act as an expert CS educator. Generate detailed topic notes for "${topic}".
Respond in JSON format containing exactly:
- topic: string
- summary: string
- revisionChecklist: list of strings
- cheatSheet: string
- flashcards: list of { q: string, a: string }
- interviewQA: list of { q: string, a: string }`;

    const result = await generateAIResponse(prompt, fallback);
    res.json(result);
  } catch {
    res.json(fallback);
  }
});

export default router;
