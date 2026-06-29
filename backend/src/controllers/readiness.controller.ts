import { Request, Response, Router } from 'express';
import { generateAIResponse } from '../config/ai';

const router = Router();

router.get('/score', async (req: Request, res: Response) => {
  const fallback = {
    overallScore: 78,
    breakdown: [
      { subject: 'DSA', score: 85, fullMark: 100 },
      { subject: 'DBMS', score: 70, fullMark: 100 },
      { subject: 'OS', score: 65, fullMark: 100 },
      { subject: 'Networks', score: 72, fullMark: 100 },
      { subject: 'Aptitude', score: 80, fullMark: 100 },
      { subject: 'Communication', score: 90, fullMark: 100 },
      { subject: 'Projects', score: 75, fullMark: 100 }
    ],
    strengths: [
      'Exceptional core data structures (Arrays, Trees, Graphs)',
      'Strong communication and presentation skills in mock HR tests',
      'Solid profile completion on LinkedIn with clear portfolio references'
    ],
    weaknesses: [
      'System level OS issues (Paging, Threading details)',
      'DBMS transaction concurrency questions often answered incorrectly',
      'Needs 1 more scalable full stack project on GitHub portfolio'
    ],
    recommendations: [
      'Brush up on ACID property concurrency schemes and isolation levels.',
      'Solve 15 OS Process Scheduling questions in practice sandbox.',
      'Add API documentation to your React resume project on GitHub.'
    ],
    timeline: [
      { title: 'Core DSA Review & Refinement', date: 'Week 1', status: 'completed' },
      { title: 'OS & Transaction Mechanics Practice', date: 'Week 2', status: 'ongoing' },
      { title: 'Full Stack Project Build Integration', date: 'Week 3', status: 'upcoming' },
      { title: 'Mock Technical Interview Simulator Run', date: 'Week 4', status: 'upcoming' }
    ],
    weeklyGoals: [
      { text: 'Complete OS CPU Scheduling MCQ checklist', done: true },
      { text: 'Finish 5 Graph algorithms problems optimally', done: false },
      { text: 'Polish Resume project structure documentation', done: false },
      { text: 'Simulate 1 Mock HR behavioral trial', done: true }
    ],
    eligibleCompanies: ['Amazon', 'Adobe', 'Oracle', 'Goldman Sachs', 'Flipkart', 'Infosys', 'TCS', 'Wipro', 'Deloitte']
  };

  try {
    const prompt = `You are a Senior SaaS Product Manager evaluating a candidate's readiness for placements.
Generate a structured JSON evaluation matching:
- overallScore: integer percentage
- breakdown: list of objects with { subject, score, fullMark }
- strengths: list of strings
- weaknesses: list of strings
- recommendations: list of strings
- timeline: list of objects with { title, date, status }
- weeklyGoals: list of objects with { text, done }
- eligibleCompanies: list of strings`;

    const result = await generateAIResponse(prompt, fallback);
    res.json(result);
  } catch {
    res.json(fallback);
  }
});

export default router;
