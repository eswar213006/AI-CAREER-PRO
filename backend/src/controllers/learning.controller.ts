import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { dbService } from '../utils/dbService';
import { generateAIResponse } from '../config/ai';

// Static MCQ Database
const MCQS_BANK: Record<string, any[]> = {
  'java': [
    {
      id: 'java-q1',
      question: 'Which of the following belongs to memory allocation in Java?',
      options: ['Garbage Collector', 'JVM stack', 'Heap Memory', 'All of the above'],
      answer: 3,
      explanation: 'Heap memory and JVM stack are memory regions, and the Garbage Collector manages this allocation.'
    },
    {
      id: 'java-q2',
      question: 'What is the default value of a boolean variable in Java?',
      options: ['true', 'false', 'null', '0'],
      answer: 1,
      explanation: 'The default value of a boolean primitive in Java is false.'
    }
  ],
  'dbms': [
    {
      id: 'dbms-q1',
      question: 'What is the default isolation level in MySQL InnoDB?',
      options: ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'Serializable'],
      answer: 2,
      explanation: 'Repeatable Read is the default transaction isolation level for InnoDB storage engine.'
    },
    {
      id: 'dbms-q2',
      question: 'Which SQL constraint guarantees uniqueness and prevents null values?',
      options: ['UNIQUE', 'PRIMARY KEY', 'NOT NULL', 'FOREIGN KEY'],
      answer: 1,
      explanation: 'A PRIMARY KEY constraint implicitly includes UNIQUE and NOT NULL declarations.'
    }
  ],
  'os': [
    {
      id: 'os-q1',
      question: 'What is thrashing in OS memory management?',
      options: [
        'A state where CPU execution speed peaks',
        'A state where the system spends more time paging than executing processes',
        'Abrupt termination of memory tasks due to deadlocks',
        'Allocation of buffer arrays to hard drives'
      ],
      answer: 1,
      explanation: 'Thrashing occurs when virtual memory resources are exhausted, causing high rate of page swapping.'
    }
  ],
  'networks': [
    {
      id: 'networks-q1',
      question: 'Which layer of the OSI model does a Router operate on?',
      options: ['Data Link Layer', 'Network Layer', 'Transport Layer', 'Application Layer'],
      answer: 1,
      explanation: 'Routers make path-routing determinations using IP addresses at the Network Layer (Layer 3).'
    }
  ],
  'aptitude': [
    {
      id: 'apt-q1',
      question: 'A train 120m long passes a post in 6 seconds. What is its speed in km/h?',
      options: ['60 km/h', '72 km/h', '80 km/h', '90 km/h'],
      answer: 1,
      explanation: 'Speed = Distance / Time = 120m / 6s = 20 m/s. 20 * (18/5) = 72 km/h.'
    }
  ]
};

export const getMcqs = async (req: Request, res: Response) => {
  res.status(200).json({ bank: MCQS_BANK });
};

export const getProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    let progress = await dbService.progress.findOne({ userId });
    if (!progress) {
      // Create if missing
      progress = await dbService.progress.create({
        userId,
        subjects: [
          { subjectName: 'Java & OOPs', mcqsTaken: 0, mcqsCorrect: 0, level: 15 },
          { subjectName: 'DBMS & SQL', mcqsTaken: 0, mcqsCorrect: 0, level: 10 },
          { subjectName: 'Operating Systems', mcqsTaken: 0, mcqsCorrect: 0, level: 5 },
          { subjectName: 'Computer Networks', mcqsTaken: 0, mcqsCorrect: 0, level: 8 },
          { subjectName: 'Quantitative Aptitude', mcqsTaken: 0, mcqsCorrect: 0, level: 20 },
        ],
        placementReadinessTrend: [{ date: new Date().toISOString().split('T')[0], score: 35 }],
        weakTopics: ['DSA', 'System Design'],
        roadmap: [
          { phase: 1, title: 'Build Foundations', status: 'in-progress', description: 'Review core subjects like Java/OOPs and DBMS cheat sheets.' },
          { phase: 2, title: 'Resume Optimization', status: 'todo', description: 'Upload and evaluate resume against target job description.' }
        ],
        dailyGoals: [
          { text: 'Take a Mini MCQ Practice Quiz', completed: false, points: 10 },
          { text: 'Run and compile code in sandbox', completed: false, points: 15 }
        ],
        weeklyGoals: [
          { text: 'Analyze Resume ATS compatibility', completed: false, points: 40 },
          { text: 'Complete a full length AI Mock Interview', completed: false, points: 80 }
        ]
      });
    }

    res.status(200).json({ progress });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const submitMcqResult = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const { subjectKey, questionId, isCorrect } = req.body;

    const progress = await dbService.progress.findOne({ userId });
    if (!progress) {
      return res.status(404).json({ message: 'Progress record not found.' });
    }

    // Map subjectKey to correct display name
    const subjectMap: Record<string, string> = {
      'java': 'Java & OOPs',
      'dbms': 'DBMS & SQL',
      'os': 'Operating Systems',
      'networks': 'Computer Networks',
      'aptitude': 'Quantitative Aptitude'
    };

    const targetSubjectName = subjectMap[subjectKey] || 'Java & OOPs';

    const updatedSubjects = progress.subjects.map((sub: any) => {
      if (sub.subjectName === targetSubjectName) {
        const newTaken = sub.mcqsTaken + 1;
        const newCorrect = sub.mcqsCorrect + (isCorrect ? 1 : 0);
        // Calculate new level
        const levelIncrement = isCorrect ? 5 : 1;
        const newLevel = Math.min(sub.level + levelIncrement, 100);

        return {
          ...sub,
          mcqsTaken: newTaken,
          mcqsCorrect: newCorrect,
          level: newLevel
        };
      }
      return sub;
    });

    // Award user XP
    const xpReward = isCorrect ? 15 : 5;
    await dbService.user.findByIdAndUpdate(userId, {
      $inc: { 'stats.xp': xpReward }
    });

    const updatedProgress = await dbService.progress.findOneAndUpdate(
      { userId },
      { $set: { subjects: updatedSubjects } }
    );

    res.status(200).json({
      message: 'MCQ result updated successfully.',
      progress: updatedProgress,
      xpEarned: xpReward
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateGoal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const { goalType, goalText, completed } = req.body; // goalType: 'daily' | 'weekly'

    const progress = await dbService.progress.findOne({ userId });
    if (!progress) {
      return res.status(404).json({ message: 'Progress record not found.' });
    }

    let updatedGoals = [];
    let xpReward = 0;

    if (goalType === 'daily') {
      updatedGoals = progress.dailyGoals.map((g: any) => {
        if (g.text === goalText) {
          if (completed && !g.completed) xpReward = g.points;
          return { ...g, completed };
        }
        return g;
      });

      await dbService.progress.findOneAndUpdate(
        { userId },
        { $set: { dailyGoals: updatedGoals } }
      );
    } else {
      updatedGoals = progress.weeklyGoals.map((g: any) => {
        if (g.text === goalText) {
          if (completed && !g.completed) xpReward = g.points;
          return { ...g, completed };
        }
        return g;
      });

      await dbService.progress.findOneAndUpdate(
        { userId },
        { $set: { weeklyGoals: updatedGoals } }
      );
    }

    if (xpReward > 0) {
      await dbService.user.findByIdAndUpdate(userId, {
        $inc: { 'stats.xp': xpReward }
      });
    }

    res.status(200).json({
      message: 'Goal state updated successfully.',
      xpEarned: xpReward
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const generatePersonalizedRoadmap = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const user = await dbService.user.findById(userId);
    const progress = await dbService.progress.findOne({ userId });

    if (!user || !progress) {
      return res.status(404).json({ message: 'User profile or progress details missing.' });
    }

    // Call Gemini to structure standard roadmap steps
    const prompt = `
      Create a personalized 4-phase learning roadmap for a student with target role: "${user.profile.targetRole || 'Software Engineer'}".
      They are weak in subjects: ${progress.weakTopics.join(', ')}.
      Return JSON:
      [
        {
          "phase": 1,
          "title": "Phase 1 Name",
          "description": "Specific focus items",
          "resources": ["Resource Link 1", "Resource Link 2"]
        },
        ...
      ]
    `;

    const fallbackRoadmap = [
      {
        phase: 1,
        title: `Strengthen core topics for ${user.profile.targetRole}`,
        description: 'Spend 5 hours reviewing basic data structures, OOP properties, and debugging compiler challenges.',
        resources: ['https://geeksforgeeks.org', 'https://leetcode.com']
      },
      {
        phase: 2,
        title: 'Master backend system layers',
        description: 'Focus heavily on Database normalizations, indexing speeds, and setting up REST APIs with express.',
        resources: ['https://db-book.com', 'https://expressjs.com']
      },
      {
        phase: 3,
        title: 'Complete company mock rounds',
        description: `Set up a custom target mock session for typical ${user.profile.targetRole} questionnaires.`,
        resources: ['Practice Hub', 'Mock Interview Console']
      },
      {
        phase: 4,
        title: 'Review speech filler phrases',
        description: 'Complete hands-free speech interviews, reviewing output speed levels and correcting pronounciation.',
        resources: ['Mock Interview Analytics']
      }
    ];

    const generatedRoadmap = await generateAIResponse(prompt, fallbackRoadmap);

    const updatedRoadmap = generatedRoadmap.map((step: any) => ({
      phase: step.phase,
      title: step.title,
      status: step.phase === 1 ? 'in-progress' : 'todo',
      description: step.description,
      resources: step.resources || []
    }));

    await dbService.progress.findOneAndUpdate(
      { userId },
      { $set: { roadmap: updatedRoadmap } }
    );

    res.status(200).json({
      message: 'Personalized roadmap refreshed successfully.',
      roadmap: updatedRoadmap
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
