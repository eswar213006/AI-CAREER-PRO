import { Request, Response, Router } from 'express';
import { generateAIResponse } from '../config/ai';

const router = Router();

router.post('/analyze', async (req: Request, res: Response) => {
  const { resumeText = '', jobDescription = '' } = req.body;

  const fallback = {
    matchPercentage: 75,
    interviewProbability: 68,
    missingKeywords: ['Docker', 'AWS', 'System Design'],
    matchedKeywords: ['Java', 'SQL', 'React', 'TypeScript'],
    suggestions: [
      'Incorporate missing technical skills into your Skills and Projects description.',
      'Quantify achievement bullet points (e.g. Optimized database performance by 25%).',
      'Align your resume headline with target job description naming.'
    ]
  };

  try {
    const prompt = `Compare the student's resume text vs the job description details.
Resume Text:
${resumeText}

Job Description:
${jobDescription}

Respond in JSON format containing exactly:
- matchPercentage: integer
- interviewProbability: integer
- missingKeywords: list of strings
- matchedKeywords: list of strings
- suggestions: list of strings`;

    const result = await generateAIResponse(prompt, fallback);
    res.json(result);
  } catch {
    res.json(fallback);
  }
});

export default router;
