import { Request, Response } from 'express';

// ─── Helpers ─────────────────────────────────────────────────────────────────
/**
 * Builds a mock/fallback AI response when no LLM API key is configured.
 * In production, replace these stubs with real OpenAI / Gemini / Claude calls.
 */

const mockReview = (code: string) => ({
  correctness: code.trim().length > 20 ? '✅ Code looks syntactically complete.' : '⚠️ Code appears incomplete.',
  bugs: 'No obvious runtime bugs detected in static analysis.',
  logicIssues: 'Logic appears reasonable based on the template. Run test cases to verify.',
  style: 'Use consistent indentation (4 spaces). Avoid magic numbers.',
  suggestions: 'Consider adding input validation. Use descriptive variable names.',
});

const mockExplain = (code: string, problemTitle: string) => ({
  summary: `This solution addresses "${problemTitle}". It processes the input and returns the expected output using a structured algorithmic approach.`,
  steps: [
    'Parse the input into the appropriate data structure.',
    'Initialize variables / data structures required for the algorithm.',
    'Iterate through the input applying the core logic.',
    'Compute and return the result.',
  ],
  code,
});

const mockCompare = (language: string) => ({
  userComplexity: 'O(N²)',
  optimalComplexity: 'O(N)',
  differences: 'Your current solution may use nested loops. The optimal approach leverages a HashMap or sliding window for O(N) time.',
  optimalCode: language === 'java'
    ? `import java.util.HashMap;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        HashMap<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[]{map.get(complement), i};\n            }\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}`
    : `# Optimal O(N) solution\ndef solve(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        if target - num in seen:\n            return [seen[target - num], i]\n        seen[num] = i\n    return []`,
});

const mockComplexity = (code: string) => ({
  time: code.includes('for') && code.includes('for') ? 'O(N²)' : 'O(N)',
  space: code.includes('HashMap') || code.includes('dict') || code.includes('map') ? 'O(N)' : 'O(1)',
  explanation: 'Complexity estimated based on loop depth and auxiliary data structures detected in the code.',
});

const mockDryRun = (input: string) => ({
  steps: [
    `Input received: ${input || '[default test input]'}`,
    'Initialize data structures.',
    'Begin iteration over input elements.',
    'Apply core logic at each step.',
    'Accumulate result.',
    `Return final answer.`,
  ],
});

const mockHints = [
  'Think about what data structure gives O(1) lookup time.',
  'Consider using a HashMap to store values you have already seen.',
  'For each element, check if the complement (target - current) exists in your map.',
  'Remember to handle edge cases: empty array, duplicate values, negative numbers.',
  'The answer indices must be different — you cannot use the same element twice.',
];

const mockTestCases = () => ({
  testCases: [
    { label: 'Basic case', input: '[2,7,11,15], target=9', expected: '[0,1]' },
    { label: 'Duplicates', input: '[3,3], target=6', expected: '[0,1]' },
    { label: 'Negative numbers', input: '[-3,4,3,90], target=0', expected: '[0,2]' },
    { label: 'Single pair', input: '[1,2], target=3', expected: '[0,1]' },
    { label: 'Large input', input: '[...1000 elements...], target=X', expected: 'Indices of matching pair' },
  ],
});

const mockInterview = () => ({
  question: 'Can you walk me through your approach to solving this problem? What is the time and space complexity of your solution, and how would you optimize it further?',
});

const mockInterviewEvaluate = (answer: string) => ({
  feedback: answer.length > 20
    ? '✅ Good explanation! You covered the key points. Consider also mentioning edge cases and how your solution handles them.'
    : '⚠️ Your answer was brief. Try to explain the algorithm step by step, mention time/space complexity, and discuss any trade-offs.',
});

const mockScore = (code: string) => {
  const hasComments = code.includes('//') || code.includes('#');
  const hasEdgeCases = code.length > 150;
  const isOptimal = code.includes('HashMap') || code.includes('dict') || code.includes('map');
  return {
    total: (hasComments ? 20 : 15) + (hasEdgeCases ? 25 : 20) + (isOptimal ? 25 : 18) + 20,
    breakdown: {
      correctness: hasEdgeCases ? 25 : 20,
      efficiency: isOptimal ? 25 : 18,
      readability: hasComments ? 20 : 15,
      bestPractices: 20,
    },
    feedback: isOptimal
      ? '🎉 Great solution! You used an efficient data structure. Consider adding more comments.'
      : '💡 Your solution works but can be optimized. Consider using a HashMap for O(N) lookup.',
  };
};

// ─── Controller Handlers ──────────────────────────────────────────────────────

export const reviewCode = async (req: Request, res: Response) => {
  try {
    const { code = '', language = 'java' } = req.body;
    // TODO: Replace with real LLM call (OpenAI / Gemini / Claude)
    const result = mockReview(code);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'AI review failed.' });
  }
};

export const explainCode = async (req: Request, res: Response) => {
  try {
    const { code = '', language = 'java', problemId = '' } = req.body;
    const result = mockExplain(code, problemId);
    res.json(result);
  } catch {
    res.status(500).json({ message: 'AI explain failed.' });
  }
};

export const compareCode = async (req: Request, res: Response) => {
  try {
    const { language = 'java' } = req.body;
    const result = mockCompare(language);
    res.json(result);
  } catch {
    res.status(500).json({ message: 'AI compare failed.' });
  }
};

export const analyzeComplexity = async (req: Request, res: Response) => {
  try {
    const { code = '' } = req.body;
    const result = mockComplexity(code);
    res.json(result);
  } catch {
    res.status(500).json({ message: 'AI complexity analysis failed.' });
  }
};

export const dryRun = async (req: Request, res: Response) => {
  try {
    const { input = '' } = req.body;
    const result = mockDryRun(input);
    res.json(result);
  } catch {
    res.status(500).json({ message: 'Dry run failed.' });
  }
};

export const getHint = async (req: Request, res: Response) => {
  try {
    const { hintIndex = 0 } = req.body;
    const idx = Math.min(Number(hintIndex), mockHints.length - 1);
    res.json({ hint: mockHints[idx] });
  } catch {
    res.status(500).json({ message: 'Hint generation failed.' });
  }
};

export const generateTestCases = async (req: Request, res: Response) => {
  try {
    const result = mockTestCases();
    res.json(result);
  } catch {
    res.status(500).json({ message: 'Test case generation failed.' });
  }
};

export const startInterview = async (req: Request, res: Response) => {
  try {
    const result = mockInterview();
    res.json(result);
  } catch {
    res.status(500).json({ message: 'Interview start failed.' });
  }
};

export const evaluateInterview = async (req: Request, res: Response) => {
  try {
    const { answer = '' } = req.body;
    const result = mockInterviewEvaluate(answer);
    res.json(result);
  } catch {
    res.status(500).json({ message: 'Interview evaluation failed.' });
  }
};

export const chat = async (req: Request, res: Response) => {
  try {
    const { message = '', problemId = '', code = '', language = 'java', history = [] } = req.body;

    // Build a context-aware mock reply
    const lowerMsg = message.toLowerCase();
    let reply = '';

    if (lowerMsg.includes('time complexity') || lowerMsg.includes('big o')) {
      reply = '⏱️ The time complexity depends on your algorithm. If you use nested loops it\'s O(N²). Using a HashMap reduces it to O(N). Look at how many iterations your code performs relative to input size N.';
    } else if (lowerMsg.includes('space') || lowerMsg.includes('memory')) {
      reply = '💾 Space complexity is determined by extra memory used. A HashMap uses O(N) extra space. If you use only a few variables, it\'s O(1).';
    } else if (lowerMsg.includes('hint') || lowerMsg.includes('help')) {
      reply = '💡 Hint: Try thinking about what you need to find. For each element, ask "Does its complement exist in what I\'ve already seen?" A HashMap lets you answer that in O(1).';
    } else if (lowerMsg.includes('explain') || lowerMsg.includes('how')) {
      reply = `📖 For "${problemId}", the key insight is:\n1. Iterate through each element\n2. Check if (target - element) has been seen before\n3. If yes → return indices\n4. If no → store element with its index\n\nThis avoids the O(N²) brute force.`;
    } else if (lowerMsg.includes('optimal') || lowerMsg.includes('best')) {
      reply = '🚀 The optimal solution uses a HashMap for O(N) time and O(N) space. It makes a single pass through the array, checking and storing complements as it goes.';
    } else if (lowerMsg.includes('error') || lowerMsg.includes('bug') || lowerMsg.includes('wrong')) {
      reply = '🐛 Common bugs to check:\n• Off-by-one errors in loop bounds\n• Not handling empty input\n• Returning wrong index types\n• Using = instead of == for comparison\n• Integer overflow for large inputs';
    } else {
      reply = `🤖 Great question about "${problemId}"! I understand you're asking: "${message}"\n\nHere's my analysis:\nYour code structure looks correct for a ${language} solution. Focus on:\n1. Edge cases (empty input, single element)\n2. Return type correctness\n3. Loop termination conditions\n\nWould you like me to elaborate on any specific part?`;
    }

    res.json({ reply });
  } catch {
    res.status(500).json({ message: 'Chat failed.' });
  }
};

export const scoreCode = async (req: Request, res: Response) => {
  try {
    const { code = '' } = req.body;
    const result = mockScore(code);
    res.json(result);
  } catch {
    res.status(500).json({ message: 'Scoring failed.' });
  }
};
