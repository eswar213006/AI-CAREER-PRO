import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { dbService } from '../utils/dbService';
import { generateAIResponse } from '../config/ai';

// Pre-defined fallback questions for key roles
const FALLBACK_QUESTIONS: Record<string, string[]> = {
  'java developer': [
    'Explain the difference between HashMap and ConcurrentHashMap in Java. How does it handle concurrency?',
    'What is the Java Memory Model? Explain Garbage Collection and the difference between Heap and Stack memory.',
    'Explain the Spring Boot application lifecycle. How does dependency injection work under the hood?',
    'What are the OOP principles? Give a real-world example of Polymorphism and how it differs from Abstraction.',
    'How do you handle multithreading in Java? Explain ThreadPoolExecutor and synchronized blocks.'
  ],
  'full stack developer': [
    'Explain how React virtual DOM works, and what triggers a re-render in a functional component.',
    'What is the event loop in Node.js? Explain the difference between setImmediate, process.nextTick, and setTimeout.',
    'How would you design a secure JWT authentication flow with access and refresh tokens?',
    'What is the difference between SQL and NoSQL? In what scenario would you choose MongoDB over PostgreSQL?',
    'How do you optimize the performance of a React application? Name at least three techniques.'
  ],
  'software engineer': [
    'Explain the difference between a Process and a Thread in Operating Systems. How do they communicate?',
    'Given a binary tree, how do you find the lowest common ancestor (LCA) of two given nodes? What is the complexity?',
    'What is the difference between TCP and UDP? Explain the three-way handshake in TCP.',
    'Explain the difference between normalization and denormalization in DBMS. When would you use denormalization?',
    'How would you design a rate limiter for a public API? What algorithms (like Token Bucket) would you apply?'
  ],
  'data analyst': [
    'What are the differences between INNER JOIN, LEFT JOIN, and RIGHT JOIN in SQL? Give an example.',
    'Explain the Central Limit Theorem and why it is important in statistics.',
    'How do you handle missing or null values in a dataset during data cleaning? What tools do you use in Python?',
    'What is the difference between a bar chart, a histogram, and a scatter plot? When would you use each?',
    'How do you write a SQL query to find the second highest salary from an Employee table?'
  ],
  'ai/ml engineer': [
    'Explain the difference between supervised, unsupervised, and reinforcement learning.',
    'What is the vanishing gradient problem in deep neural networks? How do activation functions like ReLU or architectures like ResNet mitigate this?',
    'Explain how a Transformer architecture works. What is the self-attention mechanism?',
    'What is the difference between precision, recall, and F1-score? When would you prioritize recall over precision?',
    'How do you prevent overfitting in a machine learning model? Explain regularization techniques.'
  ]
};

// Generic behavioral and HR questions
const HR_BEHAVIORAL_QUESTIONS = [
  'Tell me about a time you faced a difficult conflict with a teammate or classmate. How did you resolve it?',
  'Why do you want to join our company, and what makes you a good fit for this role?',
  'Describe a situation where you had a tight deadline and multiple competing priorities. How did you manage your time?',
  'Tell me about a project you worked on that failed. What went wrong and what did you learn from the experience?',
  'Where do you see yourself in five years? What are your professional growth goals?'
];

export const generateInterview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const { jobRole, experienceLevel, difficulty, interviewType, company } = req.body;

    if (!jobRole || !experienceLevel || !difficulty || !interviewType) {
      return res.status(400).json({ message: 'Missing interview configuration parameters.' });
    }

    // Prepare Prompt for Gemini
    const prompt = `
      You are an expert interviewer. Generate exactly 5 questions for a candidate with the following details:
      Job Role: ${jobRole}
      Experience Level: ${experienceLevel}
      Difficulty: ${difficulty}
      Interview Type: ${interviewType}
      Target Company: ${company || 'General Technical Interview'}

      Your response MUST be in JSON format matching this array structure:
      [
        {
          "id": "q1",
          "text": "The full text of the question",
          "category": "technical/behavioral/system-design/hr",
          "idealAnswer": "Short bullet points of what a great answer should cover"
        },
        ...
      ]
    `;

    // Choose fallback templates
    const cleanRole = jobRole.toLowerCase().trim();
    let selectedBase = FALLBACK_QUESTIONS[cleanRole] || FALLBACK_QUESTIONS['software engineer'];
    
    if (interviewType === 'HR' || interviewType === 'Behavioral') {
      selectedBase = HR_BEHAVIORAL_QUESTIONS;
    } else if (interviewType === 'Mixed') {
      selectedBase = [
        selectedBase[0],
        selectedBase[1],
        HR_BEHAVIORAL_QUESTIONS[0],
        selectedBase[2],
        HR_BEHAVIORAL_QUESTIONS[1]
      ];
    }

    const fallbackQuestions = selectedBase.map((q, idx) => ({
      id: `q${idx + 1}`,
      text: company ? `[${company} Specific] ${q}` : q,
      category: interviewType.toLowerCase(),
      idealAnswer: 'Key topics: structure, clarity, accuracy, and naming edge cases.'
    }));

    const generatedQuestions = await generateAIResponse(prompt, fallbackQuestions);

    const newInterview = await dbService.interview.create({
      userId,
      jobRole,
      experienceLevel,
      difficulty,
      interviewType,
      company: company || 'General',
      status: 'active',
      questions: generatedQuestions.map((q: any) => ({
        id: q.id,
        text: q.text,
        category: q.category || interviewType,
        idealAnswer: q.idealAnswer || '',
        userAnswer: '',
        feedback: '',
        score: 0
      })),
      score: { technical: 0, communication: 0, confidence: 0, overall: 0 },
      voiceReport: {
        speakingSpeedWpm: 0,
        fillerWordCount: 0,
        fillerWordsDetected: [],
        pronunciationScore: 0,
        confidenceScore: 0,
        reportSummary: ''
      },
      aiDetailedFeedback: { strengths: [], weaknesses: [], tips: [] }
    });

    res.status(200).json({
      message: 'Interview session generated successfully.',
      interview: newInterview
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const submitAnswer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const { interviewId, questionId, userAnswer } = req.body;

    if (!interviewId || !questionId) {
      return res.status(400).json({ message: 'Interview ID and Question ID are required.' });
    }

    const interview = await dbService.interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: 'Interview session not found.' });
    }

    const questionIndex = interview.questions.findIndex((q: any) => q.id === questionId);
    if (questionIndex === -1) {
      return res.status(404).json({ message: 'Question not found in this session.' });
    }

    // Save user answer
    const questionsUpdate = [...interview.questions];
    questionsUpdate[questionIndex].userAnswer = userAnswer;

    await dbService.interview.findByIdAndUpdate(interviewId, {
      $set: { questions: questionsUpdate }
    });

    res.status(200).json({ message: 'Answer saved successfully.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const completeInterview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const { interviewId, durations = [] } = req.body; // durations is array of numbers in seconds per question

    if (!interviewId) {
      return res.status(400).json({ message: 'Interview ID is required.' });
    }

    const interview = await dbService.interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: 'Interview session not found.' });
    }

    // Compile voice metrics based on transcripts
    let totalWordCount = 0;
    let totalDurationSec = 0;
    let totalFillerWords = 0;
    const fillerWordsMap: Record<string, number> = {};
    const fillersRegex = /\b(um|uh|like|basically|actually|you know|so|ok|okay)\b/gi;

    interview.questions.forEach((q: any, index: number) => {
      const ans = q.userAnswer || '';
      const words = ans.trim().split(/\s+/).filter(Boolean);
      totalWordCount += words.length;

      const duration = durations[index] || 45; // fallback to 45 seconds per question
      totalDurationSec += duration;

      // Scan for filler words
      const matches = ans.match(fillersRegex);
      if (matches) {
        totalFillerWords += matches.length;
        matches.forEach((m: string) => {
          const lower = m.toLowerCase();
          fillerWordsMap[lower] = (fillerWordsMap[lower] || 0) + 1;
        });
      }
    });

    const averageWpm = totalDurationSec > 0 ? Math.round((totalWordCount / totalDurationSec) * 60) : 0;
    const uniqueFillers = Object.keys(fillerWordsMap);

    // Prompt for Gemini AI Evaluation
    const evaluationPrompt = `
      You are an expert, strict technical interviewer. Grade the following interview questions and student answers:
      
      Job Role: ${interview.jobRole}
      Difficulty: ${interview.difficulty}
      
      Questions & Answers:
      ${interview.questions.map((q: any, i: number) => `
        Q${i + 1}: ${q.text}
        Candidate Answer: ${q.userAnswer || 'No answer provided.'}
        Ideal criteria: ${q.idealAnswer}
      `).join('\n')}

      Evaluate the candidate strictly. If an answer is blank, "I don't know", skipped, or extremely brief, you MUST assign a score of 0 or 1, and explicitly state in the feedback that the answer was missing or insufficient.
      Return a JSON object containing:
      {
        "questionsFeedback": [
          {"id": "q1", "feedback": "Detailed corrective feedback", "score": (number 0-10)},
          {"id": "q2", "feedback": "Detailed corrective feedback", "score": (number 0-10)}
        ],
        "score": {
          "technical": (number 0-100),
          "communication": (number 0-100),
          "confidence": (number 0-100),
          "overall": (number 0-100)
        },
        "aiDetailedFeedback": {
          "strengths": ["strength bullet 1"],
          "weaknesses": ["weakness bullet 1"],
          "tips": ["improvement tip 1"]
        }
      }
    `;

    // Determine voice pronunciation/confidence grades based on filler word density
    const fillerRatio = totalWordCount > 0 ? totalFillerWords / totalWordCount : 0;
    const calculatedPronunciation = totalWordCount > 10 ? Math.max(Math.min(95 - Math.round(fillerRatio * 150), 95), 45) : 0;
    const calculatedConfidence = totalWordCount > 10 ? Math.max(Math.min(92 - Math.round(fillerRatio * 100), 92), 40) : 0;

    const defaultQuestionsFeedback = interview.questions.map((q: any) => {
      const length = (q.userAnswer || '').trim().length;
      let score = 0;
      let feedback = 'No valid answer provided. In a real interview, always attempt to outline your thought process.';
      if (length > 150) {
        score = 8;
        feedback = 'Well structured answer covering core requirements. Good use of terminology.';
      } else if (length > 50) {
        score = 6;
        feedback = 'Covers base concepts, but could benefit from deeper technical explanations or trade-offs.';
      } else if (length > 10) {
        score = 3;
        feedback = 'Answer was significantly too brief. Expand on the concepts and provide structured reasoning.';
      }
      return { id: q.id, feedback, score };
    });

    const technicalScore = totalWordCount > 150 ? 75 : totalWordCount > 50 ? 55 : totalWordCount > 10 ? 25 : 0;
    const overallScore = totalWordCount > 10 ? Math.round((technicalScore + calculatedPronunciation + calculatedConfidence) / 3) : 0;

    const fallbackEvaluation = {
      questionsFeedback: defaultQuestionsFeedback,
      score: {
        technical: technicalScore,
        communication: calculatedPronunciation,
        confidence: calculatedConfidence,
        overall: overallScore
      },
      aiDetailedFeedback: {
        strengths: totalWordCount > 50 ? [
          'Attempted to address core topics.',
          'Maintained a professional tone.'
        ] : ['No significant strengths observed due to lack of detailed responses.'],
        weaknesses: [
          totalWordCount < 80 ? 'Answers are far too brief or completely missing. Technical interviews require deep, structured explanations.' : 'Struggled to articulate edge cases.',
          totalFillerWords > 5 ? `High filler word count (detected ${totalFillerWords} fillers) affects fluency.` : 'Could state more direct project metrics.'
        ],
        tips: [
          'Practice speaking with a structural framework like STAR (Situation, Task, Action, Result).',
          'Never skip a question completely—always state your assumptions or explain a brute-force approach.',
          'Review weak topics in the preparation hub before starting your next mock.'
        ]
      }
    };

    const evaluation = await generateAIResponse(evaluationPrompt, fallbackEvaluation);

    // Save final report inside DB
    const finalQuestions = interview.questions.map((q: any) => {
      const feedbackObj = evaluation.questionsFeedback.find((fb: any) => fb.id === q.id);
      return {
        ...q,
        feedback: feedbackObj ? feedbackObj.feedback : 'Graded successfully.',
        score: feedbackObj ? feedbackObj.score : 7
      };
    });

    const voiceSummary = `Speaking pace is ${averageWpm} WPM (${
      averageWpm > 150 ? 'Fast' : averageWpm < 100 ? 'Slow' : 'Optimal'
    }). Used ${totalFillerWords} filler words. Pronunciation score: ${calculatedPronunciation}%, confidence score: ${calculatedConfidence}%.`;

    const updatedInterview = await dbService.interview.findByIdAndUpdate(interviewId, {
      $set: {
        status: 'completed',
        questions: finalQuestions,
        score: evaluation.score,
        voiceReport: {
          speakingSpeedWpm: averageWpm,
          fillerWordCount: totalFillerWords,
          fillerWordsDetected: uniqueFillers,
          pronunciationScore: calculatedPronunciation,
          confidenceScore: calculatedConfidence,
          reportSummary: voiceSummary
        },
        aiDetailedFeedback: evaluation.aiDetailedFeedback
      }
    });

    // Update User Stats: Increment interviews, add XP, modify readiness score
    const user = await dbService.user.findById(userId);
    let earnedXP = 0;
    if (user) {
      const newReadiness = Math.round((user.stats.readinessScore * 0.7) + (evaluation.score.overall * 0.3));
      earnedXP = Math.max(5, evaluation.score.overall); // Dynamic XP based on performance

      await dbService.user.findByIdAndUpdate(userId, {
        $inc: {
          'stats.totalInterviewsTaken': 1,
          'stats.xp': earnedXP
        },
        $set: {
          'stats.readinessScore': newReadiness
        }
      });

      // Update Readiness trend inside Progress model
      const todayStr = new Date().toISOString().split('T')[0];
      const progress = await dbService.progress.findOne({ userId });
      if (progress) {
        const updatedTrend = [...progress.placementReadinessTrend];
        const lastTrend = updatedTrend[updatedTrend.length - 1];
        
        if (lastTrend && lastTrend.date === todayStr) {
          updatedTrend[updatedTrend.length - 1].score = newReadiness;
        } else {
          updatedTrend.push({ date: todayStr, score: newReadiness });
        }

        await dbService.progress.findOneAndUpdate({ userId }, {
          $set: { placementReadinessTrend: updatedTrend }
        });
      }
    }

    res.status(200).json({
      message: 'Interview evaluated successfully.',
      earnedXP,
      report: {
        ...updatedInterview,
        questions: finalQuestions,
        score: evaluation.score,
        voiceReport: {
          speakingSpeedWpm: averageWpm,
          fillerWordCount: totalFillerWords,
          fillerWordsDetected: uniqueFillers,
          pronunciationScore: calculatedPronunciation,
          confidenceScore: calculatedConfidence,
          reportSummary: voiceSummary
        },
        aiDetailedFeedback: evaluation.aiDetailedFeedback
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const interviews = await dbService.interview.find({ userId });
    res.status(200).json({ interviews });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
