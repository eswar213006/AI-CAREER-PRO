import { Request, Response, Router } from 'express';

const router = Router();

const STATIC_GUIDES: Record<string, any> = {
  amazon: {
    id: 'amazon',
    name: 'Amazon',
    logo: '📦',
    type: 'Product Tech',
    difficulty: 'Hard',
    ctc: '32 - 45 LPA',
    timeline: '4 - 6 Weeks',
    overview: 'Amazon focuses heavily on Leadership Principles and scale. Prepare core DSA, object-oriented design, and system scalability concepts.',
    hiringProcess: ['Online Assessment (2 Coding questions + Work Style simulation)', 'Technical Round 1 (DSA)', 'Technical Round 2 (Low-Level Design)', 'Bar Raiser Round'],
    interviewPattern: 'Every single interviewer evaluates candidates against Amazon Leadership Principles (e.g. Customer Obsession, Bias for Action).',
    codingTopics: ['Dynamic Programming', 'Graphs & Trees', 'Sliding Window', 'Binary Search'],
    csSubjects: ['DBMS & SQL Indexing', 'OS CPU Scheduling', 'Computer Network TCP Handshakes'],
    faqs: [
      { q: 'What is the bar raiser round?', a: 'An independent interviewer evaluates your alignment with Amazon Leadership Principles.' },
      { q: 'Is dynamic programming common?', a: 'Yes, DP questions are frequently asked in R1 and R2.' }
    ],
    hrQuestions: ['Tell me about a time you had to make a decision without all the information.', 'Tell me about a time you went above and beyond for a customer.'],
    behavioralQuestions: ['Describe a time you failed and what you learned.', 'How do you handle disagreements in a team?'],
    roadmap: ['Solve top 50 Amazon tagged problems on Leetcode.', 'Revise Amazon 16 Leadership Principles with STAR stories.', 'Take mock system design quizzes.'],
    recommendedProblems: ['Two Sum', 'LRU Cache', 'Valid Parentheses', 'Longest Substring Without Repeating Characters'],
    experiences: ['Interview flow was organized. Bar raiser focused on Customer Obsession.', 'Online assessment was easy, but the behavioral simulation was tricky.']
  }
};

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const guide = STATIC_GUIDES[id.toLowerCase()];
  if (!guide) {
    // Generate default guide dynamically to prevent empty states
    return res.json({
      id,
      name: id.toUpperCase(),
      logo: '🏢',
      type: 'Product Tech',
      difficulty: 'Hard',
      ctc: '20 - 35 LPA',
      timeline: '4 Weeks',
      overview: `Complete preparation guide for placements at ${id}.`,
      hiringProcess: ['Online Assessment', 'Technical Interview', 'HR Fitment Round'],
      interviewPattern: 'Algorithmic efficiency, OOP, and resume projects review.',
      codingTopics: ['Dynamic Programming', 'Arrays & Strings', 'LinkedLists'],
      csSubjects: ['DBMS Normalization', 'OS Scheduling', 'Networks'],
      faqs: [{ q: 'How to apply?', a: 'Apply via off-campus recruitment or college placements.' }],
      hrQuestions: ['Why do you want to join us?'],
      behavioralQuestions: ['Describe a challenge.'],
      roadmap: ['Revise core subjects', 'Solve coding challenges'],
      recommendedProblems: ['Two Sum'],
      experiences: ['Had a great experience. Simple questions on tree traversals.']
    });
  }
  res.json(guide);
});

export default router;
