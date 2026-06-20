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

// Rich detailed ideal answers for fallback questions (used in simulation/fallback mode)
const FALLBACK_IDEAL_ANSWERS: Record<string, string> = {
  'hashmap and concurrenthashmap': 'HashMap is not thread-safe and allows one null key. ConcurrentHashMap is thread-safe, disallows nulls, and uses fine-grained node/bucket locks (synchronized/CAS in Java 8) to allow concurrent operations without blocking the entire map.',
  'java memory model': 'Heap memory stores objects/instance variables (shared between threads). Stack memory stores thread-local execution frames and primitives. Garbage Collection reclaims unreachable heap objects using generations (Young, Old, Metaspace) and GC Roots.',
  'spring boot application lifecycle': 'Starts via SpringApplication.run(), bootstraps ApplicationContext, scans components, registers Bean definitions, instantiates beans, resolves dependencies (via Reflection/Constructor Injection), and runs CommandLine/ApplicationRunners.',
  'oop principles': 'Encapsulation (data hiding), Inheritance (code reuse), Polymorphism (dynamic method overriding/overloading), Abstraction (hiding implementation details via interfaces). Polymorphism defines customized behavior; Abstraction defines templates.',
  'multithreading in java': 'Achieved using Thread, Runnable, Callable, and ExecutorService. ThreadPoolExecutor manages worker threads and task queues to prevent thread creation overhead. Synchronized blocks serialize access by locking on an object monitor.',
  'react virtual dom': 'An in-memory copy of the real DOM. React diffs changes using a reconciliation algorithm and updates only changed nodes. Re-renders in functional components are triggered by state updates (useState/useReducer), prop changes, or context updates.',
  'event loop in node.js': 'Coordinates async execution. process.nextTick fires immediately after the current operation (microtask queue). setImmediate runs in the Check phase of the event loop. setTimeout runs in the Timers phase after a specified delay threshold.',
  'jwt authentication flow': 'Access token (short-lived, e.g. 15m) sent in Authorization header. Refresh token (long-lived, e.g. 7d) stored in a secure, HttpOnly, SameSite cookie, validated against a database whitelist for security rotation/revocation.',
  'sql and nosql': 'SQL is relational, has schemas, and guarantees ACID properties (e.g. PostgreSQL). NoSQL is non-relational, schema-less, and horizontally scalable (e.g. MongoDB). Choose NoSQL/MongoDB for polymorphic data, unstructured documents, or high write speed.',
  'optimize the performance of a react': 'Implement code-splitting (React.lazy & Suspense), memoize heavy components with React.memo, cache functions/values via useCallback/useMemo, use virtualized lists for long feeds, and minimize asset sizes.',
  'process and a thread': 'A process is an isolated execution unit with dedicated virtual memory space (inter-process communication needed). A thread is the smallest schedulable execution unit inside a process, sharing memory (heap/code) with other threads.',
  'binary tree, how do you find the lowest common ancestor': 'Recursively traverse nodes: if node is null, p, or q, return node. Search left and right subtrees. If both subtrees return non-null, current node is LCA. Time complexity is O(N) where N is number of nodes. Space complexity is O(H) recursion stack.',
  'tcp and udp': 'TCP is connection-oriented, reliable, guarantees packet ordering, and handles congestion. UDP is connectionless, fast, unreliable, and suitable for streaming. TCP handshake: SYN -> SYN-ACK -> ACK.',
  'normalization and denormalization': 'Normalization structures tables to eliminate redundancy and improve integrity (1NF, 2NF, 3NF). Denormalization intentionally adds redundant data to speed up complex query executions in read-heavy/analytical workloads.',
  'rate limiter for a public api': 'Protects APIs from abuse. Algorithms include Token Bucket (allows bursts), Leaky Bucket (smooths rates), Fixed Window, and Sliding Window. Can be implemented using Redis to count client IP hits within a sliding timeframe.',
  'inner join, left join, and right join': 'INNER JOIN returns records with matching keys in both tables. LEFT JOIN returns all records from the left table and matched from the right (nulls otherwise). RIGHT JOIN returns all from the right and matched from the left.',
  'central limit theorem': 'States that the distribution of sample means approaches a normal distribution as the sample size becomes large (N >= 30), regardless of the population distribution shape. Essential for hypothesis testing and interval estimation.',
  'missing or null values in a dataset': 'Techniques: drop rows/columns containing missing values, impute using statistical metrics (mean, median, mode), or model-based imputation. In Python, use Pandas (dropna, fillna) or Scikit-learn (SimpleImputer).',
  'bar chart, a histogram, and a scatter plot': 'Bar Chart: compares values of discrete categorical variables. Histogram: visualizes the frequency distribution of a continuous numerical variable. Scatter Plot: plots pairs of continuous variables to show correlation.',
  'second highest salary': 'SQL query: SELECT MAX(Salary) FROM Employee WHERE Salary < (SELECT MAX(Salary) FROM Employee); OR using offset: SELECT Salary FROM Employee ORDER BY Salary DESC LIMIT 1 OFFSET 1;',
  'supervised, unsupervised, and reinforcement': 'Supervised: learning from labeled training data (known inputs and targets). Unsupervised: discovering hidden patterns or clusters in unlabeled data. Reinforcement: agent learning to maximize cumulative reward through environment interactions.',
  'vanishing gradient problem': 'Occurs in deep networks when backpropagated gradients shrink exponentially towards zero, stalling weight updates. Mitigated by using non-saturating activation functions like ReLU and skip-connections (as in ResNet).',
  'transformer architecture': 'A sequence-to-sequence model relying on attention mechanisms without recurrent layers. Self-attention computes key-query-value vector scores to parallelize token relationship analysis over any distance in text.',
  'precision, recall, and f1-score': 'Precision: TP / (TP + FP) (minimizes false positives). Recall: TP / (TP + FN) (minimizes false negatives, critical in medical diagnostics). F1-Score: harmonic mean of precision and recall, balancing both.',
  'prevent overfitting': 'Apply cross-validation, gather more training data, simplify model complexity, use dropout layers (neural nets), or apply regularization like L1 (Lasso - forces weight sparsity) and L2 (Ridge - shrinks weights).',
  'conflict with a teammate': 'Apply the STAR method: describe a professional conflict, focus on communication, active listening, and compromise rather than blame. Conclude with a successful resolution and what you learned.',
  'why do you want to join our company': 'Align your personal career goals with the company mission, show familiarity with their specific projects/values, demonstrate technical fit, and express excitement for growth and contribution.',
  'tight deadline and multiple competing': 'Detail task prioritization strategies (like Eisenhower Matrix), communication with project leaders, time blocks, and how you successfully hit the objective through structured planning.',
  'project you worked on that failed': 'Discuss a technical/project failure objectively without casting blame. Focus on structural root causes, recovery actions taken, and key lessons applied to ensure future project successes.',
  'where do you see yourself in five years': 'Express realistic, ambitious goals: mastering technical skills, moving towards technical/architectural leadership or mentoring, and contributing to high-impact products.'
};

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

    const fallbackQuestions = selectedBase.map((q, idx) => {
      const qLower = q.toLowerCase().trim();
      const foundKey = Object.keys(FALLBACK_IDEAL_ANSWERS).find(key => qLower.includes(key));
      const idealAnswer = foundKey 
        ? FALLBACK_IDEAL_ANSWERS[foundKey] 
        : 'Key topics: structure, clarity, accuracy, and naming edge cases.';

      return {
        id: `q${idx + 1}`,
        text: company ? `[${company} Specific] ${q}` : q,
        category: interviewType.toLowerCase(),
        idealAnswer
      };
    });

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
