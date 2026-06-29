import { Request, Response, Router } from 'express';
import { generateAIResponse } from '../config/ai';

const router = Router();

router.post('/generate', async (req: Request, res: Response) => {
  const { company = 'Amazon', skillLevel = 'Intermediate', hours = 3, duration = 30 } = req.body;

  const totalWeeks = Math.ceil(duration / 7);
  const fallbackTasks = Array.from({ length: Math.min(duration, 14) }).map((_, idx) => {
    const dayNum = idx + 1;
    let cat = 'coding';
    let tStr = `Solve company-specific array tagged questions.`;
    if (dayNum % 7 === 0) {
      cat = 'mock';
      tStr = `Take a mock interview for ${company} rounds under time constraints.`;
    } else if (dayNum % 6 === 0) {
      cat = 'revision';
      tStr = `Revise sorting logic and DBMS normal forms.`;
    } else if (dayNum % 2 === 0) {
      cat = 'theory';
      tStr = `Study OS process concurrency models and semaphores.`;
    }
    return {
      day: dayNum,
      task: tStr,
      category: cat,
      resources: ['Prep Hub SQL Guide', 'V8 Sandbox Two-Sum problem']
    };
  });

  const fallbackWeeks = Array.from({ length: totalWeeks }).map((_, idx) => ({
    week: idx + 1,
    goal: `Complete core DSA patterns & start company tagged mock drills`,
    checked: false
  }));

  const fallback = {
    company,
    duration,
    dailyTasks: fallbackTasks,
    weeklyGoals: fallbackWeeks
  };

  try {
    const prompt = `Act as an AI study planner scheduler. Create a preparation plan for ${company} over ${duration} days assuming user skill level is ${skillLevel} and available hours are ${hours}.
Respond in JSON format containing:
- company: string
- duration: number
- dailyTasks: list of { day: number, task: string, category: "coding"|"theory"|"revision"|"mock", resources: list of strings } (generate at least 14 days worth of tasks)
- weeklyGoals: list of { week: number, goal: string, checked: boolean }`;

    const result = await generateAIResponse(prompt, fallback);
    res.json(result);
  } catch {
    res.json(fallback);
  }
});

export default router;
