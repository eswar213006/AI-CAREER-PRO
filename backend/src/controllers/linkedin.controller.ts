import { Request, Response, Router } from 'express';
import { generateAIResponse } from '../config/ai';

const router = Router();

router.post('/optimize', async (req: Request, res: Response) => {
  const { headline = '', about = '', experience = '', skills = '' } = req.body;

  const fallback = {
    profileScore: 82,
    suggestions: [
      'Change headline to use specific roles and technologies (e.g. Backend Developer | Java & React).',
      'Expand your About section to include your learning timeline, projects, and target outcomes.'
    ],
    headlineBlueprint: 'Software Engineering Candidate | Java Core & Spring Boot | React & TypeScript Developer',
    aboutBlueprint: 'I am a passionate Software Engineering candidate specializing in building robust web applications and solving complex DSA puzzles. With a solid foundation in Java, React, and SQL databases, I design scalable microservices and clean client-side architectures.',
    skillsBlueprint: ['Java (Core & Advanced)', 'TypeScript / JavaScript', 'React.js Ecosystem', 'SQL (PostgreSQL)', 'Data Structures & Algorithms'],
    tips: [
      'Ensure your profile photo is professional and clean.',
      'Add links to your portfolio projects (GitHub repos) directly in your Featured section.',
      'Post weekly updates about your coding sandbox achievements to increase algorithmic authority.'
    ]
  };

  try {
    const prompt = `Act as an expert LinkedIn Profile Optimizer. Analyze the candidate profile inputs and suggest enhancements:
Headline: ${headline}
About: ${about}
Experience: ${experience}
Skills: ${skills}

Respond in JSON format containing:
- profileScore: integer
- suggestions: list of strings
- headlineBlueprint: string
- aboutBlueprint: string
- skillsBlueprint: list of strings
- tips: list of strings`;

    const result = await generateAIResponse(prompt, fallback);
    res.json(result);
  } catch {
    res.json(fallback);
  }
});

export default router;
