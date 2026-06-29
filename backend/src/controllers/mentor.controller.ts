import { Request, Response, Router } from 'express';
import { generateAIResponse } from '../config/ai';

const router = Router();

router.post('/recommendations', async (req: Request, res: Response) => {
  const fallback = {
    roleRecommendation: 'Backend Software Engineer (L4)',
    careerPath: 'Focus on high-throughput server architecture, concurrent data processing pipelines, and DB index scaling.',
    salaryExpectation: '14 - 22 LPA (Base)',
    growthMetrics: 'Backend developers are seeing a 22% YoY increase in demand, specifically with Node.js/Go ecosystem skills.',
    certifications: ['AWS Certified Developer - Associate', 'MongoDB Certified Developer Associate', 'Oracle Certified Professional Java SE Developer'],
    projects: [
      { title: 'Distributed Task Queue System', tech: 'Redis, Node.js, Docker', description: 'Design a system handling background job scheduling, exponential backoffs, and dead-letter queues.' },
      { title: 'E-commerce API Gateway', tech: 'Spring Boot, PostgreSQL, Spring Cloud', description: 'Configure dynamic routing, rate-limiting, and fault tolerance patterns with Resilience4j.' }
    ],
    targetCompanies: ['Amazon', 'Oracle', 'Goldman Sachs', 'Adobe', 'Swiggy'],
    roadmap: [
      'Master Advanced SQL & DB Indexing mechanics',
      'Learn Docker and AWS Core compute services',
      'Complete 2 real-world enterprise portfolio APIs',
      'Simulate mock distributed system system design scenarios'
    ]
  };

  try {
    const prompt = `Act as an AI Career Mentor. Generate a career profile recommendation JSON containing:
- roleRecommendation: string
- careerPath: string
- salaryExpectation: string
- growthMetrics: string
- certifications: list of strings
- projects: list of { title, tech, description }
- targetCompanies: list of strings
- roadmap: list of strings`;

    const result = await generateAIResponse(prompt, fallback);
    res.json(result);
  } catch {
    res.json(fallback);
  }
});

export default router;
