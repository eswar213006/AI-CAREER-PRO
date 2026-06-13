import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { dbService } from '../utils/dbService';
import { generateAIResponse } from '../config/ai';

// ─── Full MCQ Bank — 10 questions per subject (50 total) ──────────────────────
const MCQS_BANK: Record<string, any[]> = {
  java: [
    { id: 'java-q1', question: 'Which of the following belongs to memory allocation in Java?', options: ['Garbage Collector', 'JVM stack', 'Heap Memory', 'All of the above'], answer: 3, explanation: 'Heap memory, JVM stack, and the Garbage Collector all participate in Java memory management.' },
    { id: 'java-q2', question: 'What is the default value of a boolean variable in Java?', options: ['true', 'false', 'null', '0'], answer: 1, explanation: 'The default value of a boolean primitive in Java is false.' },
    { id: 'java-q3', question: 'Which keyword prevents a class from being subclassed in Java?', options: ['static', 'abstract', 'final', 'private'], answer: 2, explanation: 'The "final" keyword applied to a class prevents inheritance.' },
    { id: 'java-q4', question: 'What is the output of: System.out.println(10 + 20 + "Hello")?', options: ['1020Hello', '30Hello', 'Hello1020', 'Compilation error'], answer: 1, explanation: 'Java evaluates left to right: 10+20=30, then 30+"Hello"="30Hello".' },
    { id: 'java-q5', question: 'Which interface must be implemented to sort objects using Collections.sort()?', options: ['Serializable', 'Cloneable', 'Comparable', 'Iterable'], answer: 2, explanation: 'The Comparable interface defines the natural ordering of objects via compareTo().' },
    { id: 'java-q6', question: 'What is method overloading in Java?', options: ['Overriding parent method', 'Multiple methods with same name but different parameters', 'Using abstract methods', 'Calling static methods'], answer: 1, explanation: 'Overloading allows multiple methods with the same name but different parameter lists.' },
    { id: 'java-q7', question: 'Which collection class is thread-safe in Java?', options: ['ArrayList', 'HashMap', 'LinkedList', 'Vector'], answer: 3, explanation: 'Vector is synchronized and thread-safe, unlike ArrayList.' },
    { id: 'java-q8', question: 'What does the "super" keyword do in Java?', options: ['Calls the current class constructor', 'Refers to the parent class', 'Creates a new object', 'Declares static methods'], answer: 1, explanation: 'super() is used to invoke the parent class constructor or access parent members.' },
    { id: 'java-q9', question: 'What is the difference between == and .equals() in Java?', options: ['No difference', '== compares reference; .equals() compares content', '== compares content; .equals() compares reference', 'Both compare content'], answer: 1, explanation: '== checks if two references point to the same object; .equals() checks logical equality of content.' },
    { id: 'java-q10', question: 'Which Java feature allows one class to inherit methods from multiple interfaces?', options: ['Multiple inheritance via extends', 'Interface default methods (Java 8+)', 'Abstract classes', 'Static imports'], answer: 1, explanation: 'Java 8 introduced default methods in interfaces, allowing classes to inherit behavior from multiple interfaces.' },
  ],

  dbms: [
    { id: 'dbms-q1', question: 'What is the default isolation level in MySQL InnoDB?', options: ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'Serializable'], answer: 2, explanation: 'Repeatable Read is the default transaction isolation level for InnoDB storage engine.' },
    { id: 'dbms-q2', question: 'Which SQL constraint guarantees uniqueness and prevents null values?', options: ['UNIQUE', 'PRIMARY KEY', 'NOT NULL', 'FOREIGN KEY'], answer: 1, explanation: 'A PRIMARY KEY constraint implicitly includes UNIQUE and NOT NULL declarations.' },
    { id: 'dbms-q3', question: 'What does BCNF stand for in database normalization?', options: ['Boyce-Codd Normal Form', 'Binary Coded Normal Form', 'Basic Constraint Normal Form', 'Boyce-Codd Null Form'], answer: 0, explanation: 'BCNF (Boyce-Codd Normal Form) is a stricter version of 3NF that eliminates all anomalies based on functional dependencies.' },
    { id: 'dbms-q4', question: 'Which JOIN returns all rows when there is a match in either left or right table?', options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'], answer: 3, explanation: 'FULL OUTER JOIN returns all rows when there is a match in either table, filling NULLs where no match exists.' },
    { id: 'dbms-q5', question: 'What is a deadlock in a database system?', options: ['A corrupted index', 'Two transactions waiting for each other\'s locks', 'A failed backup', 'Query timeout'], answer: 1, explanation: 'A deadlock occurs when two or more transactions each hold a lock and wait for the other to release theirs.' },
    { id: 'dbms-q6', question: 'Which command is used to undo a transaction in SQL?', options: ['COMMIT', 'ROLLBACK', 'SAVEPOINT', 'DELETE'], answer: 1, explanation: 'ROLLBACK undoes changes made during a transaction, restoring the database to its previous state.' },
    { id: 'dbms-q7', question: 'What is a view in SQL?', options: ['A physical copy of a table', 'A virtual table based on the result of a SELECT query', 'A type of index', 'A stored procedure'], answer: 1, explanation: 'A view is a named, virtual table whose contents are defined by a SQL query. It does not store data itself.' },
    { id: 'dbms-q8', question: 'Which normal form eliminates partial dependencies?', options: ['1NF', '2NF', '3NF', 'BCNF'], answer: 1, explanation: '2NF requires that every non-key attribute is fully functionally dependent on the primary key.' },
    { id: 'dbms-q9', question: 'What is an index in a database?', options: ['A type of join', 'A data structure to speed up queries', 'A backup mechanism', 'A constraint on a column'], answer: 1, explanation: 'An index is a data structure (usually a B-Tree) that improves the speed of data retrieval operations.' },
    { id: 'dbms-q10', question: 'What does the "HAVING" clause do in SQL?', options: ['Filters rows before grouping', 'Filters groups after GROUP BY', 'Joins two tables', 'Sorts the result'], answer: 1, explanation: 'HAVING filters aggregated groups, similar to WHERE but applied after GROUP BY.' },
  ],

  os: [
    { id: 'os-q1', question: 'What is thrashing in OS memory management?', options: ['A state where CPU execution speed peaks', 'A state where the system spends more time paging than executing', 'Abrupt termination due to deadlocks', 'Allocation of buffers to hard drives'], answer: 1, explanation: 'Thrashing occurs when virtual memory is exhausted, causing high-rate page swapping and near-zero useful execution.' },
    { id: 'os-q2', question: 'Which scheduling algorithm gives the minimum average waiting time?', options: ['FCFS', 'Round Robin', 'Shortest Job First (SJF)', 'Priority Scheduling'], answer: 2, explanation: 'SJF scheduling minimizes average waiting time by always executing the shortest available process next.' },
    { id: 'os-q3', question: 'What is a semaphore used for in operating systems?', options: ['Memory paging', 'Process synchronization and mutual exclusion', 'CPU scheduling', 'File management'], answer: 1, explanation: 'A semaphore is a synchronization primitive used to control access to shared resources among concurrent processes.' },
    { id: 'os-q4', question: 'What are the four necessary conditions for a deadlock?', options: ['Starvation, Aging, Preemption, Hold & Wait', 'Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait', 'FCFS, Round Robin, Priority, SJF', 'Paging, Segmentation, Swapping, Thrashing'], answer: 1, explanation: "Coffman's four conditions for deadlock: Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait." },
    { id: 'os-q5', question: 'What is the difference between a process and a thread?', options: ['No difference', 'A process is heavyweight with its own memory; a thread is lightweight sharing memory', 'A thread has its own memory space', 'A process runs inside a thread'], answer: 1, explanation: 'Processes have independent memory spaces; threads are lightweight units within a process that share memory.' },
    { id: 'os-q6', question: 'What is virtual memory?', options: ['RAM extension using SSD cache', 'Technique creating illusion of larger RAM using disk storage', 'L1/L2 CPU cache', 'GPU memory buffer'], answer: 1, explanation: 'Virtual memory uses disk space (page file) to simulate additional RAM, allowing larger programs to run.' },
    { id: 'os-q7', question: "Which page replacement algorithm suffers from Belady's anomaly?", options: ['Optimal', 'LRU', 'FIFO', 'Clock Algorithm'], answer: 2, explanation: "FIFO page replacement can result in more page faults with more frames — a phenomenon called Belady's Anomaly." },
    { id: 'os-q8', question: 'What is a context switch?', options: ['Switching between input devices', 'Saving and restoring CPU state when switching processes', 'Changing file system mounts', 'Swapping RAM and ROM'], answer: 1, explanation: 'A context switch saves the current process state (registers, program counter) and restores the next process state.' },
    { id: 'os-q9', question: 'What type of kernel is Linux?', options: ['Microkernel', 'Monolithic kernel', 'Hybrid kernel', 'Exokernel'], answer: 1, explanation: 'Linux uses a monolithic kernel architecture, where all OS services run in kernel space.' },
    { id: 'os-q10', question: 'What is a race condition?', options: ['CPU overheating', 'Two threads accessing shared data simultaneously causing unpredictable results', 'A scheduling priority conflict', 'Memory overflow error'], answer: 1, explanation: 'A race condition occurs when multiple threads access/modify shared data concurrently without synchronization.' },
  ],

  networks: [
    { id: 'net-q1', question: 'Which layer of the OSI model does a Router operate on?', options: ['Data Link Layer', 'Network Layer', 'Transport Layer', 'Application Layer'], answer: 1, explanation: 'Routers make path-routing decisions using IP addresses at the Network Layer (Layer 3).' },
    { id: 'net-q2', question: 'What does DNS stand for and what does it do?', options: ['Data Network System — routes data packets', 'Domain Name System — translates domain names to IP addresses', 'Dynamic Node Service — assigns IP addresses', 'Distributed Name Server — stores web pages'], answer: 1, explanation: 'DNS (Domain Name System) translates human-readable domain names (google.com) into machine-readable IP addresses.' },
    { id: 'net-q3', question: 'What is the main difference between TCP and UDP?', options: ['No difference', 'TCP is reliable & connection-oriented; UDP is fast & connectionless', 'UDP is slower than TCP', 'TCP is stateless'], answer: 1, explanation: 'TCP guarantees delivery via handshaking/acknowledgements. UDP is connectionless and faster, but unreliable.' },
    { id: 'net-q4', question: 'Which HTTP method is used to update an existing resource?', options: ['GET', 'POST', 'PUT', 'DELETE'], answer: 2, explanation: 'PUT (or PATCH) is used to update an existing resource. POST creates a new resource.' },
    { id: 'net-q5', question: 'What is the purpose of a MAC address?', options: ['Identifies a device on the internet', 'Uniquely identifies a NIC at the Data Link layer', 'Assigns dynamic IPs', 'Encrypts network traffic'], answer: 1, explanation: 'A MAC address is a hardware identifier burned into a NIC, used for local network (Layer 2) communication.' },
    { id: 'net-q6', question: 'What port does HTTPS use by default?', options: ['80', '21', '443', '8080'], answer: 2, explanation: 'HTTPS uses port 443 by default, with TLS/SSL encryption. HTTP uses port 80.' },
    { id: 'net-q7', question: 'What is the three-way handshake in TCP?', options: ['SYN, SYN-ACK, ACK', 'GET, POST, PUT', 'Connect, Send, Close', 'Open, Read, Write'], answer: 0, explanation: 'TCP uses SYN → SYN-ACK → ACK to establish a reliable connection between client and server.' },
    { id: 'net-q8', question: 'Which protocol is used to assign IP addresses automatically?', options: ['DNS', 'ARP', 'DHCP', 'ICMP'], answer: 2, explanation: 'DHCP (Dynamic Host Configuration Protocol) automatically assigns IP addresses to devices on a network.' },
    { id: 'net-q9', question: 'What does a firewall do?', options: ['Speeds up internet connection', 'Monitors and filters incoming/outgoing network traffic based on rules', 'Assigns MAC addresses', 'Encrypts hard drive data'], answer: 1, explanation: 'A firewall monitors and controls network traffic based on predefined security rules to protect against threats.' },
    { id: 'net-q10', question: 'What is the difference between IPv4 and IPv6?', options: ['No meaningful difference', 'IPv4 is 32-bit (4B addresses); IPv6 is 128-bit (340 undecillion addresses)', 'IPv6 is slower', 'IPv4 supports more addresses'], answer: 1, explanation: 'IPv4 uses 32-bit addresses (4.3B total); IPv6 uses 128-bit addresses to accommodate the explosive growth of internet devices.' },
  ],

  aptitude: [
    { id: 'apt-q1', question: 'A train 120m long passes a pole in 6 seconds. What is its speed in km/h?', options: ['60 km/h', '72 km/h', '80 km/h', '90 km/h'], answer: 1, explanation: 'Speed = 120/6 = 20 m/s. Convert: 20 × (18/5) = 72 km/h.' },
    { id: 'apt-q2', question: 'If A can do a job in 10 days and B in 15 days, how long together?', options: ['5 days', '6 days', '8 days', '12 days'], answer: 1, explanation: 'Combined rate = 1/10 + 1/15 = 3/30 + 2/30 = 5/30 = 1/6. So 6 days.' },
    { id: 'apt-q3', question: 'What is 15% of 240?', options: ['30', '36', '42', '48'], answer: 1, explanation: '15% of 240 = (15/100) × 240 = 36.' },
    { id: 'apt-q4', question: 'A number increased by 20% gives 360. What is the original number?', options: ['280', '300', '320', '340'], answer: 1, explanation: 'x × 1.20 = 360 → x = 360/1.2 = 300.' },
    { id: 'apt-q5', question: 'Ratio of A:B is 3:5. If total is 120, what is A?', options: ['40', '45', '50', '72'], answer: 1, explanation: 'A = (3/8) × 120 = 45.' },
    { id: 'apt-q6', question: 'Simple interest on ₹2000 at 5% per annum for 3 years?', options: ['₹250', '₹300', '₹350', '₹400'], answer: 1, explanation: 'SI = (P × R × T)/100 = (2000 × 5 × 3)/100 = ₹300.' },
    { id: 'apt-q7', question: 'In a 100m race A beats B by 10m. If A runs 100m, where is B?', options: ['85m', '88m', '90m', '92m'], answer: 2, explanation: 'When A runs 100m, B runs 90m (since B is 10m behind). B is at the 90m mark.' },
    { id: 'apt-q8', question: 'Find the missing number: 2, 6, 12, 20, __, 42', options: ['28', '30', '32', '36'], answer: 1, explanation: 'Differences: 4, 6, 8, 10, 12. So next = 20 + 10 = 30.' },
    { id: 'apt-q9', question: 'A shopkeeper gains 25% profit on selling price. What is his actual profit %?', options: ['20%', '25%', '33.33%', '40%'], answer: 2, explanation: 'Profit 25% on SP means: P = 0.25 x SP. Solving: P/CP = 1/3 = 33.33%.' },
    { id: 'apt-q10', question: 'Average of 5 numbers is 20. If one number is removed, average becomes 15. What is the removed number?', options: ['30', '35', '40', '45'], answer: 2, explanation: 'Total = 5×20 = 100. Remaining 4 numbers total = 4×15 = 60. Removed = 100 - 60 = 40.' },
  ],
};

// ─── Controller functions ───────────────────────────────────────────────────

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
          { phase: 2, title: 'Resume Optimization', status: 'todo', description: 'Upload and evaluate resume against target job description.' },
          { phase: 3, title: 'Practice Coding Rounds', status: 'todo', description: 'Solve 5 easy/medium coding problems inside compiler sandbox.' },
          { phase: 4, title: 'Mock Interviews', status: 'todo', description: 'Complete 1 Technical and 1 Behavioral full mock interview round.' },
        ],
        dailyGoals: [
          { text: 'Take a Mini MCQ Practice Quiz', completed: false, points: 10 },
          { text: 'Run and compile code in sandbox', completed: false, points: 15 },
        ],
        weeklyGoals: [
          { text: 'Analyze Resume ATS compatibility', completed: false, points: 40 },
          { text: 'Complete a full length AI Mock Interview', completed: false, points: 80 },
        ],
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

    const subjectMap: Record<string, string> = {
      java: 'Java & OOPs',
      dbms: 'DBMS & SQL',
      os: 'Operating Systems',
      networks: 'Computer Networks',
      aptitude: 'Quantitative Aptitude',
    };

    const targetSubjectName = subjectMap[subjectKey] || 'Java & OOPs';

    const updatedSubjects = progress.subjects.map((sub: any) => {
      if (sub.subjectName === targetSubjectName) {
        const newTaken = sub.mcqsTaken + 1;
        const newCorrect = sub.mcqsCorrect + (isCorrect ? 1 : 0);
        const levelIncrement = isCorrect ? 5 : 1;
        const newLevel = Math.min(sub.level + levelIncrement, 100);
        return { ...sub, mcqsTaken: newTaken, mcqsCorrect: newCorrect, level: newLevel };
      }
      return sub;
    });

    const xpReward = isCorrect ? 15 : 5;
    await dbService.user.findByIdAndUpdate(userId, { $inc: { 'stats.xp': xpReward } });

    const updatedProgress = await dbService.progress.findOneAndUpdate(
      { userId },
      { $set: { subjects: updatedSubjects } }
    );

    res.status(200).json({
      message: 'MCQ result updated successfully.',
      progress: updatedProgress,
      xpEarned: xpReward,
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

    const { goalType, goalText, completed } = req.body;
    const progress = await dbService.progress.findOne({ userId });
    if (!progress) {
      return res.status(404).json({ message: 'Progress record not found.' });
    }

    let xpReward = 0;
    if (goalType === 'daily') {
      const updatedGoals = progress.dailyGoals.map((g: any) => {
        if (g.text === goalText) {
          if (completed && !g.completed) xpReward = g.points;
          return { ...g, completed };
        }
        return g;
      });
      await dbService.progress.findOneAndUpdate({ userId }, { $set: { dailyGoals: updatedGoals } });
    } else {
      const updatedGoals = progress.weeklyGoals.map((g: any) => {
        if (g.text === goalText) {
          if (completed && !g.completed) xpReward = g.points;
          return { ...g, completed };
        }
        return g;
      });
      await dbService.progress.findOneAndUpdate({ userId }, { $set: { weeklyGoals: updatedGoals } });
    }

    if (xpReward > 0) {
      await dbService.user.findByIdAndUpdate(userId, { $inc: { 'stats.xp': xpReward } });
    }

    res.status(200).json({ message: 'Goal state updated successfully.', xpEarned: xpReward });
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

    const prompt = `
      Create a personalized 4-phase placement preparation roadmap for a student targeting the role: "${user.profile.targetRole || 'Software Engineer'}".
      Their experience level is: ${user.profile.experienceLevel || 'Fresher'}.
      They are weak in: ${progress.weakTopics.join(', ')}.
      
      Return ONLY valid JSON (no markdown), array format:
      [
        {
          "phase": 1,
          "title": "Phase title (max 8 words)",
          "description": "Specific actionable focus description (2-3 sentences)",
          "resources": ["Resource name or URL 1", "Resource name or URL 2"]
        }
      ]
    `;

    const fallbackRoadmap = [
      { phase: 1, title: `Strengthen Core CS Fundamentals`, description: `Focus on Java OOPs, DBMS normalization, OS scheduling, and Computer Networks basics. Practice at least 2 MCQs from each subject daily.`, resources: ['GeeksforGeeks.org', 'JavaPoint.com'] },
      { phase: 2, title: 'Optimize Resume & Portfolio', description: `Upload your resume to AI Resume Analyzer to get an ATS score. Add quantified impact metrics (e.g., "reduced load time by 40%") to all project bullets.`, resources: ['Resume Analyzer Tool', 'LinkedIn Profile Builder'] },
      { phase: 3, title: 'Conquer Coding Interview Rounds', description: `Solve 10 curated DSA problems in the Coding Sandbox. Focus on Arrays, Strings, Trees, and Dynamic Programming — the most common interview topics.`, resources: ['Coding Sandbox', 'LeetCode.com'] },
      { phase: 4, title: 'Master Mock Interviews & Communication', description: `Complete 2 full mock interview sessions using voice recording. Review AI feedback on speaking pace, filler words, and technical accuracy. Aim for 75%+ overall score.`, resources: ['AI Mock Interview Console', 'Placement Prep Hub'] },
    ];

    const generatedRoadmap = await generateAIResponse(prompt, fallbackRoadmap);

    const updatedRoadmap = (Array.isArray(generatedRoadmap) ? generatedRoadmap : fallbackRoadmap).map((step: any) => ({
      phase: step.phase,
      title: step.title,
      status: step.phase === 1 ? 'in-progress' : 'todo',
      description: step.description,
      resources: step.resources || [],
    }));

    await dbService.progress.findOneAndUpdate({ userId }, { $set: { roadmap: updatedRoadmap } });

    res.status(200).json({ message: 'Personalized roadmap refreshed successfully.', roadmap: updatedRoadmap });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
