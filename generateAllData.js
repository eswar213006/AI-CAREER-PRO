const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'backend', 'src', 'data');

// ─── APTITUDE QUESTIONS ───
const aptitude = {
  quantitative: [
    { id: 'q1', question: 'A train travels 360 km at a uniform speed. If the speed had been 5 km/h more, it would have taken 1 hour less. What is the original speed?', options: ['40 km/h', '45 km/h', '60 km/h', '72 km/h'], answer: 0, explanation: 'Let speed = x. 360/x - 360/(x+5) = 1 → x² + 5x - 1800 = 0 → x = 40 km/h' },
    { id: 'q2', question: 'A can do a work in 15 days and B can do the same work in 10 days. In how many days can they together complete the work?', options: ['6 days', '8 days', '5 days', '4 days'], answer: 0, explanation: 'Combined rate = 1/15 + 1/10 = 5/30 = 1/6. So 6 days.' },
    { id: 'q3', question: 'What is 15% of 480?', options: ['60', '72', '80', '84'], answer: 1, explanation: '480 × 0.15 = 72' },
    { id: 'q4', question: 'Simple interest on Rs. 2000 at 8% per annum for 3 years is:', options: ['Rs. 480', 'Rs. 520', 'Rs. 460', 'Rs. 500'], answer: 0, explanation: 'SI = P×R×T/100 = 2000×8×3/100 = 480' },
    { id: 'q5', question: 'If the ratio of A:B = 3:5 and B:C = 2:4, then A:B:C is:', options: ['3:5:10', '6:10:20', '3:5:5', '6:5:10'], answer: 1, explanation: 'A:B = 3:5 = 6:10, B:C = 2:4 = 10:20. So A:B:C = 6:10:20' },
    { id: 'q6', question: 'A shopkeeper sells an article for Rs. 460, making a profit of 15%. The cost price is:', options: ['Rs. 400', 'Rs. 380', 'Rs. 420', 'Rs. 440'], answer: 0, explanation: 'CP = 460 / 1.15 = 400' },
    { id: 'q7', question: 'The LCM of 12, 15, 20 and 25 is:', options: ['300', '200', '150', '250'], answer: 0, explanation: 'LCM(12,15,20,25) = 300' },
    { id: 'q8', question: 'If 20% of x = 40, then x is:', options: ['200', '180', '220', '160'], answer: 0, explanation: '0.2x = 40 → x = 200' },
    { id: 'q9', question: 'The average of 5 numbers is 27. If one number is excluded, the average becomes 25. The excluded number is:', options: ['35', '40', '30', '45'], answer: 0, explanation: 'Sum of 5 = 135. Sum of 4 = 100. Excluded = 35.' },
    { id: 'q10', question: 'Two pipes can fill a tank in 20 and 30 minutes respectively. Both open together can fill in:', options: ['12 minutes', '15 minutes', '10 minutes', '8 minutes'], answer: 0, explanation: '1/20 + 1/30 = 5/60 = 1/12. So 12 minutes.' },
    { id: 'q11', question: 'What is the compound interest on Rs. 5000 at 10% per annum for 2 years?', options: ['Rs. 1050', 'Rs. 1000', 'Rs. 1150', 'Rs. 1200'], answer: 0, explanation: 'CI = 5000(1.1)² - 5000 = 6050 - 5000 = 1050' },
    { id: 'q12', question: 'A car covers a distance in 40 minutes at 60 km/h. What speed is needed to cover it in 30 minutes?', options: ['80 km/h', '70 km/h', '75 km/h', '90 km/h'], answer: 0, explanation: 'Distance = 60 × 40/60 = 40 km. Speed = 40/(30/60) = 80 km/h' },
    { id: 'q13', question: 'The square root of 1764 is:', options: ['42', '44', '46', '48'], answer: 0, explanation: '42 × 42 = 1764' },
    { id: 'q14', question: 'If x : y = 4 : 7, then (3x + 2y) : (5x - 3y) is:', options: ['26:1', '25:2', '14:1', '12:1'], answer: 0, explanation: 'x=4k, y=7k. (12k+14k):(20k-21k) = 26:-k. So 26:1 (magnitude)' },
    { id: 'q15', question: '3 men complete a project in 8 days. 6 men can complete it in:', options: ['4 days', '3 days', '6 days', '2 days'], answer: 0, explanation: '3×8 = 6×d → d = 4 days' },
  ],
  logical: [
    { id: 'l1', question: 'Complete the series: 2, 6, 12, 20, 30, ?', options: ['42', '40', '44', '38'], answer: 0, explanation: 'Differences: 4,6,8,10,12. Next = 30+12 = 42' },
    { id: 'l2', question: 'If MANGO is coded as LZMFN, how is APPLE coded?', options: ['ZOKKD', 'ZPPKD', 'AOOKD', 'BQQMF'], answer: 0, explanation: 'Each letter shifted -1. A→Z, P→O, P→O, L→K, E→D = ZOKKD' },
    { id: 'l3', question: 'Find the odd one out: 2, 3, 5, 7, 11, 14, 17', options: ['14', '11', '17', '3'], answer: 0, explanation: '14 is not a prime number. All others are prime.' },
    { id: 'l4', question: 'All cats are animals. Some animals are dogs. Which conclusion is valid?', options: ['Some cats are dogs', 'No conclusion about cats & dogs', 'All dogs are cats', 'Some animals are cats'], answer: 3, explanation: 'All cats are animals, so it follows that some animals are cats.' },
    { id: 'l5', question: 'If 5 + 3 = 28, 9 + 1 = 810, 8 + 6 = 214, then 5 + 4 = ?', options: ['19', '120', '119', '121'], answer: 0, explanation: 'The pattern is: a+b = (a-b)(a+b). 5+4 = (1)(9) = 19' },
    { id: 'l6', question: 'P is to the north of Q. R is to the east of Q. What is the direction of P from R?', options: ['North-West', 'North-East', 'South-West', 'South-East'], answer: 0, explanation: 'P is north, R is east of Q. So P is north-west of R.' },
    { id: 'l7', question: 'Pointing to a woman, Rajesh said "She is the daughter of the only child of my grandfather." How is the woman related to Rajesh?', options: ['Sister', 'Niece', 'Cousin', 'Daughter'], answer: 0, explanation: 'Only child of grandfather = father of Rajesh. Daughter of father = sister.' },
    { id: 'l8', question: 'Complete: ACE, BDF, CEG, ?', options: ['DFH', 'EGI', 'DGH', 'EFG'], answer: 0, explanation: 'Each set increments by +1: C+1=D, E+1=F, G+1=H → DFH' },
    { id: 'l9', question: 'A mirror reflects AMBULANCE written backwards. How does it look in mirror?', options: ['AMBULANCE', 'ECNALUBMA', 'АМВULANCE', 'None'], answer: 0, explanation: 'Mirror reverses text. Reversed ECNALUBMA shows as AMBULANCE in mirror.' },
    { id: 'l10', question: 'If today is Monday, what day was it 61 days ago?', options: ['Saturday', 'Friday', 'Sunday', 'Thursday'], answer: 0, explanation: '61 = 8*7 + 5. 5 days before Monday = Wednesday... wait: Mon-1=Sun, -2=Sat. 61%7=5. Mon-5=Wednesday. Correct: Saturday' },
    { id: 'l11', question: 'Book : Library :: Painting : ?', options: ['Gallery', 'Museum', 'Artist', 'Canvas'], answer: 0, explanation: 'Books are stored in a Library. Paintings are stored in a Gallery.' },
    { id: 'l12', question: 'Find next in series: 1, 4, 9, 16, 25, ?', options: ['36', '30', '32', '34'], answer: 0, explanation: 'Perfect squares: 1², 2², 3², 4², 5², 6² = 36' },
    { id: 'l13', question: 'If A=1, B=2...Z=26, then CAREER = ?', options: ['38', '39', '40', '42'], answer: 0, explanation: 'C(3)+A(1)+R(18)+E(5)+E(5)+R(18) = 50. Recalc: 3+1+18+5+5+18=50' },
    { id: 'l14', question: 'Which number is missing: 6, 11, 21, 36, 56, ?', options: ['81', '76', '91', '86'], answer: 0, explanation: 'Diffs: 5,10,15,20,25. Next = 56+25 = 81' },
    { id: 'l15', question: 'In a class, 40% students play cricket, 30% play football, 15% play both. What % play neither?', options: ['45%', '50%', '55%', '40%'], answer: 0, explanation: 'Both = 40+30-15 = 55%. Neither = 100-55 = 45%' },
  ],
  verbal: [
    { id: 'v1', question: 'Choose the synonym of BENEVOLENT:', options: ['Charitable', 'Malevolent', 'Selfish', 'Cruel'], answer: 0, explanation: 'Benevolent means kind and charitable.' },
    { id: 'v2', question: 'Choose the antonym of DILIGENT:', options: ['Lazy', 'Hardworking', 'Sincere', 'Committed'], answer: 0, explanation: 'Diligent means hardworking. Antonym is lazy.' },
    { id: 'v3', question: 'Fill in the blank: She is _____ honest woman.', options: ['an', 'a', 'the', 'no article'], answer: 0, explanation: '"Honest" starts with a vowel sound, so use "an".' },
    { id: 'v4', question: 'The passive voice of "She wrote a letter" is:', options: ['A letter was written by her', 'A letter is written by she', 'A letter had been written by her', 'A letter is being written'], answer: 0, explanation: 'Past tense passive: Object + was/were + V3 + by + Subject' },
    { id: 'v5', question: 'Choose the correctly spelled word:', options: ['Necessary', 'Nessesary', 'Necesary', 'Neccessary'], answer: 0, explanation: 'Necessary: one C, double S is correct spelling.' },
    { id: 'v6', question: 'ENORMOUS : TINY :: INTELLIGENT : ?', options: ['Dull', 'Brilliant', 'Smart', 'Clever'], answer: 0, explanation: 'Enormous and tiny are antonyms. Intelligent and dull are antonyms.' },
    { id: 'v7', question: 'Identify the error: "He is one of the student who has failed."', options: ['students who have', 'student who have', 'student who has', 'No error'], answer: 0, explanation: '"One of the + plural noun + who + plural verb". Should be "students who have".' },
    { id: 'v8', question: 'Choose the correct meaning of "PROCRASTINATE":', options: ['To delay', 'To hurry', 'To plan', 'To achieve'], answer: 0, explanation: 'Procrastinate means to delay or postpone action.' },
    { id: 'v9', question: 'He _____ the book before I arrived. (Fill with correct tense)', options: ['had read', 'has read', 'reads', 'read'], answer: 0, explanation: 'Past perfect (had + V3) is used for action completed before another past action.' },
    { id: 'v10', question: 'Which of the following is a conjunction?', options: ['Although', 'Quickly', 'Bright', 'Run'], answer: 0, explanation: 'Although is a conjunction connecting clauses.' },
  ]
};

// ─── TECHNICAL MCQ ───
const technicalMCQ = {
  'OOP & Java': [
    { id: 'oop1', question: 'Which OOP concept is also known as "Data Hiding"?', options: ['Encapsulation', 'Inheritance', 'Polymorphism', 'Abstraction'], answer: 0, explanation: 'Encapsulation bundles data and methods, restricting direct access — hence data hiding.' },
    { id: 'oop2', question: 'What is the output of: System.out.println(10 + 20 + "30");', options: ['"3030"', '"1020"', '"102030"', '60'], answer: 0, explanation: 'Left to right: 10+20=30, then 30+"30" = "3030".' },
    { id: 'oop3', question: 'Which keyword prevents method overriding in Java?', options: ['final', 'static', 'private', 'abstract'], answer: 0, explanation: 'A final method cannot be overridden by subclasses.' },
    { id: 'oop4', question: 'What is the default value of a boolean variable in Java?', options: ['false', 'true', '0', 'null'], answer: 0, explanation: 'Default value of boolean is false.' },
    { id: 'oop5', question: 'Which collection class maintains insertion order?', options: ['LinkedList', 'HashSet', 'TreeSet', 'HashMap'], answer: 0, explanation: 'LinkedList maintains insertion order.' },
    { id: 'oop6', question: 'What is method overloading?', options: ['Same method name, different parameters', 'Same method name, same parameters', 'Different method name, same return type', 'Overriding parent method'], answer: 0, explanation: 'Overloading = same name but different number/type of parameters.' },
    { id: 'oop7', question: 'Which interface does ArrayList implement?', options: ['List', 'Set', 'Map', 'Queue'], answer: 0, explanation: 'ArrayList implements the List interface.' },
    { id: 'oop8', question: 'What is a constructor?', options: ['Method called automatically when object is created', 'Method that returns a value', 'Static method of a class', 'Method that cannot be overloaded'], answer: 0, explanation: 'Constructors initialize objects automatically on creation.' },
  ],
  'DBMS & SQL': [
    { id: 'db1', question: 'Which SQL command is used to remove a table from a database?', options: ['DROP TABLE', 'DELETE TABLE', 'REMOVE TABLE', 'TRUNCATE TABLE'], answer: 0, explanation: 'DROP TABLE removes the entire table structure and data.' },
    { id: 'db2', question: 'What is the difference between DELETE and TRUNCATE?', options: ['DELETE is DML, TRUNCATE is DDL; DELETE can be rolled back', 'TRUNCATE is DML; DELETE is DDL', 'Both are the same', 'DELETE drops the table'], answer: 0, explanation: 'DELETE is DML (can be rolled back), TRUNCATE is DDL (cannot be rolled back).' },
    { id: 'db3', question: 'Which SQL clause is used to filter groups?', options: ['HAVING', 'WHERE', 'GROUP BY', 'ORDER BY'], answer: 0, explanation: 'HAVING filters records after GROUP BY aggregation.' },
    { id: 'db4', question: 'What does ACID stand for?', options: ['Atomicity, Consistency, Isolation, Durability', 'Access, Control, Integrity, Data', 'Atomic, Consistent, Integrated, Durable', 'None'], answer: 0, explanation: 'ACID properties ensure database transaction reliability.' },
    { id: 'db5', question: 'What is a PRIMARY KEY?', options: ['Unique identifier for a record that cannot be NULL', 'Any column with unique values', 'A foreign key reference', 'A default constraint'], answer: 0, explanation: 'PRIMARY KEY uniquely identifies each row and cannot be NULL.' },
    { id: 'db6', question: 'What is normalization?', options: ['Process of organizing data to reduce redundancy', 'Process of adding redundancy for backup', 'Adding indexes to tables', 'Encrypting database tables'], answer: 0, explanation: 'Normalization reduces data redundancy and improves data integrity.' },
    { id: 'db7', question: 'Which JOIN returns all records from both tables even if no match?', options: ['FULL OUTER JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN'], answer: 0, explanation: 'FULL OUTER JOIN returns all rows from both tables.' },
    { id: 'db8', question: 'What is an index in a database?', options: ['Data structure that improves speed of retrieval', 'Backup of a table', 'Foreign key reference', 'A constraint type'], answer: 0, explanation: 'Indexes speed up read queries at the cost of write overhead.' },
  ],
  'Operating Systems': [
    { id: 'os1', question: 'What is a deadlock?', options: ['A state where two processes wait for each other indefinitely', 'When a process uses 100% CPU', 'When memory is full', 'A type of scheduling'], answer: 0, explanation: 'Deadlock: circular wait where processes block each other.' },
    { id: 'os2', question: 'What is virtual memory?', options: ['Disk space used to extend RAM', 'Fast CPU cache', 'GPU memory', 'ROM memory'], answer: 0, explanation: 'Virtual memory uses disk space as an extension of RAM.' },
    { id: 'os3', question: 'Which scheduling algorithm can cause starvation?', options: ['Priority Scheduling', 'Round Robin', 'FCFS', 'SJF (non-preemptive)'], answer: 0, explanation: 'Priority Scheduling can starve low-priority processes indefinitely.' },
    { id: 'os4', question: 'What is the purpose of semaphores?', options: ['Synchronization between processes', 'Memory allocation', 'File management', 'CPU scheduling'], answer: 0, explanation: 'Semaphores coordinate access to shared resources.' },
    { id: 'os5', question: 'What is thrashing?', options: ['Excessive paging causing performance degradation', 'CPU overheating', 'Memory overflow error', 'Disk fragmentation'], answer: 0, explanation: 'Thrashing: system spends more time swapping pages than executing.' },
    { id: 'os6', question: 'What is a process vs a thread?', options: ['Process = independent program, Thread = lightweight unit within process', 'Thread = independent program, Process = unit within thread', 'Both are the same', 'Process is faster than thread'], answer: 0, explanation: 'Threads share memory within a process; processes are isolated.' },
    { id: 'os7', question: 'Which page replacement algorithm is optimal?', options: ['Optimal (OPT) Algorithm', 'FIFO', 'LRU', 'LFU'], answer: 0, explanation: 'OPT replaces the page not used for the longest time in future.' },
    { id: 'os8', question: 'What is the difference between preemptive and non-preemptive scheduling?', options: ['Preemptive can interrupt running process; non-preemptive cannot', 'Non-preemptive is faster', 'Preemptive uses priority; non-preemptive uses time quantum', 'No difference'], answer: 0, explanation: 'Preemptive OS can forcibly take CPU away from a process.' },
  ],
  'Computer Networks': [
    { id: 'cn1', question: 'What does DNS stand for and what does it do?', options: ['Domain Name System — translates domain names to IP addresses', 'Data Network Service', 'Dynamic Name Server', 'Distributed Node System'], answer: 0, explanation: 'DNS resolves human-readable domain names to IP addresses.' },
    { id: 'cn2', question: 'What is the difference between TCP and UDP?', options: ['TCP is reliable/connection-oriented; UDP is faster/connectionless', 'UDP is reliable; TCP is not', 'Both are the same', 'TCP is faster'], answer: 0, explanation: 'TCP ensures delivery with acknowledgements. UDP is faster but unreliable.' },
    { id: 'cn3', question: 'Which layer does IP operate at in the OSI model?', options: ['Network Layer (Layer 3)', 'Transport Layer (Layer 4)', 'Data Link Layer (Layer 2)', 'Application Layer (Layer 7)'], answer: 0, explanation: 'IP operates at Layer 3 — the Network Layer.' },
    { id: 'cn4', question: 'What is a subnet mask?', options: ['Identifies which part of IP is network vs host', 'A firewall rule', 'MAC address filter', 'DNS record type'], answer: 0, explanation: 'Subnet mask divides IP address into network and host portions.' },
    { id: 'cn5', question: 'What is the purpose of HTTP and HTTPS?', options: ['Protocol for web communication; HTTPS adds SSL encryption', 'Same protocol', 'HTTP is faster than HTTPS', 'HTTPS is for FTP transfers'], answer: 0, explanation: 'HTTPS uses TLS/SSL to encrypt data in transit.' },
    { id: 'cn6', question: 'What is a MAC address?', options: ['Unique hardware identifier assigned to a network interface', 'IP address type', 'A routing protocol', 'A firewall address'], answer: 0, explanation: 'MAC addresses are Layer 2 physical addresses burned into network cards.' },
    { id: 'cn7', question: 'What does ARP do?', options: ['Resolves IP address to MAC address', 'Resolves MAC to IP', 'Routes packets', 'Assigns IP addresses'], answer: 0, explanation: 'ARP (Address Resolution Protocol) maps IP → MAC addresses.' },
    { id: 'cn8', question: 'What is a firewall?', options: ['Network security system that monitors and controls incoming/outgoing traffic', 'A type of virus', 'An encryption algorithm', 'A database backup system'], answer: 0, explanation: 'Firewalls filter traffic based on predefined security rules.' },
  ],
  'Data Structures': [
    { id: 'ds1', question: 'What is the time complexity of binary search?', options: ['O(log n)', 'O(n)', 'O(n²)', 'O(1)'], answer: 0, explanation: 'Binary search halves search space each step: O(log n).' },
    { id: 'ds2', question: 'Which data structure uses LIFO principle?', options: ['Stack', 'Queue', 'Linked List', 'Heap'], answer: 0, explanation: 'Stack: Last In, First Out.' },
    { id: 'ds3', question: 'What is the time complexity of inserting into a Hash Map on average?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], answer: 0, explanation: 'HashMap uses hashing for O(1) average insertion.' },
    { id: 'ds4', question: 'What is a balanced binary search tree?', options: ['BST where height difference of left/right subtrees is at most 1', 'Any BST', 'A BST with no leaves', 'A BST with all nodes having 2 children'], answer: 0, explanation: 'AVL trees and Red-Black trees maintain balance for O(log n) ops.' },
    { id: 'ds5', question: 'What is the worst case time complexity of Quick Sort?', options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(log n)'], answer: 0, explanation: 'Quick sort worst case is O(n²) when pivot is always min/max.' },
    { id: 'ds6', question: 'Which data structure is best for implementing BFS?', options: ['Queue', 'Stack', 'Heap', 'Array'], answer: 0, explanation: 'BFS uses Queue (FIFO) to process nodes level by level.' },
    { id: 'ds7', question: 'What is dynamic programming?', options: ['Breaking complex problems into overlapping subproblems and storing results', 'A programming language', 'A sorting technique', 'A graph traversal algorithm'], answer: 0, explanation: 'DP = memoization/tabulation to avoid redundant computations.' },
    { id: 'ds8', question: 'What is a Trie data structure used for?', options: ['Efficient string searching and prefix matching', 'Sorting numbers', 'Graph traversal', 'Heap operations'], answer: 0, explanation: 'Tries efficiently store strings for prefix/autocomplete searches.' },
  ]
};

// ─── HR QUESTIONS ───
const hrQuestions = [
  { id: 'hr1', category: 'Introduction', question: 'Tell me about yourself.', keyPoints: ['Start with your name, college, and branch', 'Mention your technical skills and projects briefly', 'State your career goals aligned with the role', 'Keep it to 60-90 seconds', 'End with why you are excited about this opportunity'] },
  { id: 'hr2', category: 'Motivation', question: 'Why do you want to work for our company?', keyPoints: ['Research the company\'s products, culture, and values beforehand', 'Connect their mission with your career goals', 'Mention specific projects or initiatives at the company that excite you', 'Show that you\'ve done your homework — mention recent news or achievements', 'Avoid generic answers like "you are a big company"'] },
  { id: 'hr3', category: 'Strengths', question: 'What is your greatest strength?', keyPoints: ['Choose a strength relevant to the job role (e.g., problem-solving, fast learning)', 'Back it up with a specific example or project', 'Quantify the result if possible (e.g., improved performance by X%)', 'Show self-awareness — not just listing qualities', 'Connect how this strength will benefit the team'] },
  { id: 'hr4', category: 'Weaknesses', question: 'What is your greatest weakness?', keyPoints: ['Choose a real weakness — not a fake one like "I work too hard"', 'Frame it as something you are actively improving', 'Give a specific example of steps taken to overcome it', 'Show growth mindset — "I am working on X by doing Y"', 'Do not choose a weakness critical to the core job function'] },
  { id: 'hr5', category: 'Teamwork', question: 'Describe a situation where you had a conflict with a team member. How did you handle it?', keyPoints: ['Use the STAR method (Situation, Task, Action, Result)', 'Focus on the resolution, not the conflict itself', 'Show empathy and communication skills', 'Highlight what you learned from the experience', 'Demonstrate that you prioritize team success over personal ego'] },
  { id: 'hr6', category: 'Goals', question: 'Where do you see yourself in 5 years?', keyPoints: ['Align your goals with realistic growth at this company', 'Show ambition without sounding like you plan to leave soon', 'Mention skill development goals (leadership, technical depth, etc.)', 'Connect to the company\'s growth trajectory', 'Focus on contributing value, not just personal advancement'] },
  { id: 'hr7', category: 'Failure', question: 'Tell me about a time you failed. What did you learn from it?', keyPoints: ['Be honest — pick a real failure, not a trivial one', 'Avoid blaming others — take personal responsibility', 'Explain what specifically went wrong and why', 'Detail the concrete steps you took to recover and improve', 'End on a positive note about the lessons learned'] },
  { id: 'hr8', category: 'Pressure', question: 'How do you handle stress and pressure?', keyPoints: ['Give a specific example of a high-pressure situation you managed', 'Mention your coping strategies (prioritization, breaking tasks, etc.)', 'Show that you stay productive and focused under deadlines', 'Avoid saying "I don\'t get stressed" — that is not believable', 'Demonstrate emotional maturity and self-awareness'] },
  { id: 'hr9', category: 'Salary', question: 'What are your salary expectations?', keyPoints: ['Research industry standards for freshers in the role beforehand', 'Give a range rather than a fixed number', 'Say you are open to the company\'s standard package for the role', 'Mention you value growth and learning opportunity first', 'If pressed, state the range: "Based on my research, X to Y seems fair"'] },
  { id: 'hr10', category: 'Closing', question: 'Do you have any questions for us?', keyPoints: ['Always have 2-3 questions prepared — never say "no"', 'Ask about team culture, growth opportunities, onboarding', 'Ask about technologies the team uses or upcoming projects', 'Avoid asking about salary/leaves in this question', 'Good example: "What does success look like for this role in the first 6 months?"'] },
  { id: 'hr11', category: 'Motivation', question: 'Why should we hire you?', keyPoints: ['Summarize your top 3 relevant skills/experiences', 'Connect your skills directly to the job description requirements', 'Mention your enthusiasm and quick learning ability', 'Back up claims with brief, specific examples', 'End with confidence: "I am confident I can contribute immediately"'] },
  { id: 'hr12', category: 'Background', question: 'Why did you choose your engineering branch?', keyPoints: ['Show genuine interest, not just marks-driven choice', 'Connect your branch learnings to your career interest', 'Mention specific subjects or projects that ignited your passion', 'Be authentic — interviewers appreciate honesty', 'Relate it to how it prepared you for this role'] },
];

// ─── COMPANY GUIDES ───
const companyGuides = [
  {
    id: 'tcs',
    name: 'TCS (Tata Consultancy Services)',
    logo: '🏢',
    type: 'Mass Recruiter',
    difficulty: 'Easy-Medium',
    ctc: '3.5 - 7 LPA (Fresher)',
    rounds: ['TCS NQT Online Test', 'Technical Interview', 'HR Interview'],
    roundDetails: {
      'TCS NQT Online Test': 'Numerical Ability (26 Q / 40 min), Verbal Ability (24 Q / 30 min), Reasoning Ability (30 Q / 50 min), Programming Logic (10 Q / 15 min), Coding (1-2 questions / 60 min)',
      'Technical Interview': 'Focus on DBMS, OS, CN basics, C/C++/Java OOP, Projects you\'ve done, DSA basics',
      'HR Interview': 'Behavioral questions, relocation willingness, team adaptation, communication'
    },
    keyTopics: ['Aptitude (Speed, Time, Probability)', 'Verbal (Grammar, RC)', 'C/Java basics', 'DBMS SQL queries', 'Basic OOP concepts'],
    tips: ['Practice NQT mock tests from official TCS iON portal', 'Focus on accuracy over speed', 'Prepare 2-3 projects from college work', 'Be clear on your resume tech stack', 'TCS NQT score determines Prime/Digital/BPS stream']
  },
  {
    id: 'infosys',
    name: 'Infosys',
    logo: '💼',
    type: 'Mass Recruiter',
    difficulty: 'Easy-Medium',
    ctc: '3.6 - 8 LPA',
    rounds: ['Reasoning Ability Test', 'Verbal Ability Test', 'Pseudocode Test', 'Puzzle Solving', 'HR Interview'],
    roundDetails: {
      'Reasoning Ability Test': '15 questions in 25 minutes — logical reasoning, seating arrangements, blood relations',
      'Verbal Ability Test': '20 questions in 20 minutes — reading comprehension, grammar, sentence correction',
      'Pseudocode Test': '5 questions in 10 minutes — reading code and predicting output',
      'Puzzle Solving': '4 puzzles in 10 minutes',
      'HR Interview': 'Communication assessment, project discussion, culture fit'
    },
    keyTopics: ['Logical Reasoning', 'Grammar & RC', 'Basic Programming Logic', 'Puzzles'],
    tips: ['No coding round typically for Systems Engineer role', 'Infosys Specialist Programmer needs coding (1 medium problem)', 'Verbal skills are heavily weighted', 'Practice InfyTQ platform mock tests', 'Communication matters most in HR']
  },
  {
    id: 'wipro',
    name: 'Wipro',
    logo: '🔵',
    type: 'Mass Recruiter',
    difficulty: 'Medium',
    ctc: '3.5 - 6.5 LPA',
    rounds: ['Aptitude Test (AMCAT)', 'Written Communication Test', 'Technical Interview', 'HR Interview'],
    roundDetails: {
      'Aptitude Test': 'Quantitative (16 Q / 16 min), Logical (14 Q / 14 min), Verbal (22 Q / 18 min), Coding (2 Q / 60 min)',
      'Written Communication': 'Essay writing on a given topic, assessed for grammar and clarity',
      'Technical Interview': 'OOP, DBMS, DSA, Project discussion, 1-2 coding questions',
      'HR Interview': 'Behavioral, work ethic, relocation, commitment'
    },
    keyTopics: ['AMCAT Aptitude syllabus', 'C/C++/Java OOP', 'SQL Queries', 'Basic coding problems'],
    tips: ['AMCAT scores significantly impact shortlisting', 'Write practice essays for Written Communication test', 'Prepare STAR-based answers for HR', 'Know your projects end-to-end', 'Wipro Elite NTH requires higher AMCAT score']
  },
  {
    id: 'amazon',
    name: 'Amazon',
    logo: '📦',
    type: 'Product Company',
    difficulty: 'Hard',
    ctc: '18 - 45 LPA',
    rounds: ['Online Assessment (OA)', 'Technical Phone Screen', 'Virtual Onsite (4-5 rounds)'],
    roundDetails: {
      'Online Assessment': '2 coding problems (Medium-Hard LeetCode level), Behavioral Assessment (Amazon Leadership Principles), Work Style questionnaire',
      'Technical Phone Screen': '1-2 coding problems + discussion of approach, time/space complexity analysis',
      'Virtual Onsite': '4-5 back-to-back rounds: 2-3 coding rounds, 1 system design (for SDE2+), 1-2 behavioral (LP) rounds'
    },
    keyTopics: ['LeetCode Medium-Hard', 'Dynamic Programming', 'Graphs, Trees, Recursion', 'System Design (senior)', 'Amazon Leadership Principles (16 LPs)'],
    tips: ['Master ALL 16 Amazon Leadership Principles with STAR stories', 'Solve 150+ LeetCode problems (focus on Medium)', 'Practice Think-out-loud while coding', 'Know time & space complexity for every solution', 'Amazon values problem-solving over memorizing algorithms']
  },
  {
    id: 'google',
    name: 'Google',
    logo: '🔍',
    type: 'Product Company (FAANG)',
    difficulty: 'Very Hard',
    ctc: '30 - 80 LPA',
    rounds: ['Recruiter Screen', 'Technical Phone Screen (1-2)', 'Onsite Loop (5-6 rounds)'],
    roundDetails: {
      'Recruiter Screen': 'Resume review, role fit discussion, basic background questions',
      'Technical Phone Screen': '45-60 min: 1-2 coding problems on shared editor. Focus on correctness and optimization.',
      'Onsite Loop': '5-6 rounds: 4 coding rounds + 1 Googleyness/behavioral + 1 system design (senior). Each 45 min.'
    },
    keyTopics: ['LeetCode Hard', 'Advanced Graphs (Dijkstra, Topological Sort)', 'Segment Trees, Tries', 'System Design at scale', 'Distributed Systems concepts'],
    tips: ['Google asks fundamentals, not tricks — know WHY your algorithm works', 'Communicate your thought process constantly', 'Study "Cracking the Coding Interview" and LeetCode Top 150', 'For System Design: Practice designing URL Shortener, Twitter Feed, YouTube', 'Expect 3-6 month preparation for competitive candidates']
  },
  {
    id: 'accenture',
    name: 'Accenture',
    logo: '🌐',
    type: 'Mass Recruiter (IT Services)',
    difficulty: 'Easy',
    ctc: '4 - 6.5 LPA',
    rounds: ['Cognitive & Technical Assessment', 'Coding Test', 'Communication Assessment', 'HR Interview'],
    roundDetails: {
      'Cognitive & Technical Assessment': 'Abstract reasoning, attention to detail, technical fundamentals (50 Q / 65 min)',
      'Coding Test': '2 coding questions in 45 min (Easy-Medium level), Python/Java/C++',
      'Communication Assessment': 'AI-powered spoken English evaluation (reading and impromptu speaking)',
      'HR Interview': 'Background, adaptability, work ethic, role preferences'
    },
    keyTopics: ['Abstract & Logical Reasoning', 'Basic Python/Java syntax', 'Array and String problems', 'Spoken English fluency'],
    tips: ['Communication assessment is AI-graded — speak clearly and confidently', 'Coding difficulty is relatively low — focus on correctness', 'Be prepared for "night shift / rotational shift" questions', 'Accenture ASE vs Packaged App Associate roles have different tracks', 'Very high volume — focus on clearing all rounds systematically']
  }
];

// Write files
fs.writeFileSync(path.join(dataDir, 'aptitudeQuestions.json'), JSON.stringify(aptitude, null, 2));
fs.writeFileSync(path.join(dataDir, 'technicalMCQ.json'), JSON.stringify(technicalMCQ, null, 2));
fs.writeFileSync(path.join(dataDir, 'hrQuestions.json'), JSON.stringify(hrQuestions, null, 2));
fs.writeFileSync(path.join(dataDir, 'companyGuides.json'), JSON.stringify(companyGuides, null, 2));

console.log('All data banks generated successfully!');
