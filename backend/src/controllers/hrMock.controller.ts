import { Request, Response, Router } from 'express';
import { generateAIResponse } from '../config/ai';

const router = Router();

router.post('/evaluate', async (req: Request, res: Response) => {
  const { question = '', answer = '' } = req.body;

  const fallback = {
    grammarScore: 82,
    communicationScore: 78,
    confidenceScore: 85,
    feedbackText: 'Strong response showing structural organization. Consider using the STAR method to focus more explicitly on key results.'
  };

  try {
    const prompt = `Act as an expert technical HR interviewer evaluating a behavioral candidate response.
Question asked: "${question}"
Candidate Answer: "${answer}"

Respond in JSON containing exactly:
- grammarScore: integer percentage
- communicationScore: integer percentage
- confidenceScore: integer percentage
- feedbackText: markdown string providing qualitative suggestions.`;

    const result = await generateAIResponse(prompt, fallback);
    res.json(result);
  } catch {
    res.json(fallback);
  }
});

export default router;
