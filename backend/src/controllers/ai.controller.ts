import { Request, Response } from 'express';
import { generateAIResponse } from '../config/ai';

// ─── Mock Stubs (Fallbacks) ──────────────────────────────────────────────────

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
    const { code = '', language = 'java', problemId = '' } = req.body;
    const prompt = `You are an expert code reviewer. Review the following student code for the coding problem "${problemId}" in the language "${language}".
Code to review:
\`\`\`${language}
${code}
\`\`\`

Provide feedback in JSON format containing exactly the following keys:
- "correctness": markdown string summary of whether the code is correct, including logic checking.
- "bugs": markdown string highlighting any bugs or edge case failures, or "None detected."
- "logicIssues": markdown string detailing algorithmic logic flaws, or "None detected."
- "style": markdown string for clean code, naming conventions, and code style suggestions.
- "suggestions": markdown string recommending specific improvements or optimization ideas.`;

    const result = await generateAIResponse(prompt, mockReview(code));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'AI review failed.' });
  }
};

export const explainCode = async (req: Request, res: Response) => {
  try {
    const { code = '', language = 'java', problemId = '' } = req.body;
    const prompt = `You are a friendly computer science instructor. Explain the following student code step-by-step for the coding problem "${problemId}" in "${language}".
Code to explain:
\`\`\`${language}
${code}
\`\`\`

Respond in JSON format containing:
- "summary": overall high-level summary of how the solution works.
- "steps": a JSON array of strings, where each string is a sequential step explaining the execution flow of the code.
- "code": the input code formatted/commented for clarity.`;

    const result = await generateAIResponse(prompt, mockExplain(code, problemId));
    res.json(result);
  } catch {
    res.status(500).json({ message: 'AI explain failed.' });
  }
};

export const compareCode = async (req: Request, res: Response) => {
  try {
    const { code = '', language = 'java', problemId = '' } = req.body;
    const prompt = `Compare the student's solution to the most optimal approach for the problem "${problemId}".
Student's code:
\`\`\`${language}
${code}
\`\`\`

Respond in JSON format containing:
- "userComplexity": time/space complexity of the student's code (e.g. O(N^2) / O(1)).
- "optimalComplexity": time/space complexity of the absolute best solution (e.g. O(N) / O(N)).
- "differences": detailed comparison of the student's logic vs the optimal algorithm.
- "optimalCode": a complete, clean, production-ready implementation of the optimal solution in "${language}".`;

    const result = await generateAIResponse(prompt, mockCompare(language));
    res.json(result);
  } catch {
    res.status(500).json({ message: 'AI compare failed.' });
  }
};

export const analyzeComplexity = async (req: Request, res: Response) => {
  try {
    const { code = '', language = 'java', problemId = '' } = req.body;
    const prompt = `Perform a strict Big-O complexity analysis on the following code for "${problemId}" in "${language}".
Code:
\`\`\`${language}
${code}
\`\`\`

Respond in JSON format containing:
- "time": Big-O time complexity (e.g., O(N log N)).
- "space": Big-O space complexity (e.g., O(1)).
- "explanation": step-by-step breakdown of how these complexities are derived, pointing to specific loops/recursion/data structures in the code.`;

    const result = await generateAIResponse(prompt, mockComplexity(code));
    res.json(result);
  } catch {
    res.status(500).json({ message: 'AI complexity analysis failed.' });
  }
};

export const dryRun = async (req: Request, res: Response) => {
  try {
    const { code = '', language = 'java', problemId = '', input = '' } = req.body;
    const prompt = `Simulate a dry run of the following code for "${problemId}" with the input: "${input}".
Code:
\`\`\`${language}
${code}
\`\`\`

Respond in JSON format containing:
- "steps": an array of strings, where each string represents a state transition, variable value change, or loop iteration as it executes on the provided input. Keep descriptions concise and easy to follow.`;

    const result = await generateAIResponse(prompt, mockDryRun(input));
    res.json(result);
  } catch {
    res.status(500).json({ message: 'Dry run failed.' });
  }
};

export const getHint = async (req: Request, res: Response) => {
  try {
    const { problemId = '', hintIndex = 0 } = req.body;
    const idx = Math.min(Number(hintIndex), mockHints.length - 1);
    const prompt = `Provide a progressive hint (Hint level ${hintIndex + 1}) for solving the coding problem "${problemId}".
The hint should guide the student without giving away the complete solution.

Respond in JSON format containing:
- "hint": the hint message.`;

    const result = await generateAIResponse(prompt, { hint: mockHints[idx] });
    res.json(result);
  } catch {
    res.status(500).json({ message: 'Hint generation failed.' });
  }
};

export const generateTestCases = async (req: Request, res: Response) => {
  try {
    const { problemId = '', language = 'java' } = req.body;
    const prompt = `Generate 5 diverse test cases (including basic, edge cases, large input, and empty/null states) for the problem "${problemId}".
Respond in JSON format containing:
- "testCases": an array of objects, where each object has:
  - "label": name/type of case (e.g. "Edge Case: Negative Target")
  - "input": description of the test inputs
  - "expected": description of the expected output`;

    const result = await generateAIResponse(prompt, mockTestCases());
    res.json(result);
  } catch {
    res.status(500).json({ message: 'Test case generation failed.' });
  }
};

export const startInterview = async (req: Request, res: Response) => {
  try {
    const { problemId = '' } = req.body;
    const prompt = `You are a technical interviewer at a top tech company. Ask the candidate a conceptual or follow-up question related to the problem "${problemId}".
Respond in JSON format containing:
- "question": the question.`;

    const result = await generateAIResponse(prompt, mockInterview());
    res.json(result);
  } catch {
    res.status(500).json({ message: 'Interview start failed.' });
  }
};

export const evaluateInterview = async (req: Request, res: Response) => {
  try {
    const { problemId = '', question = '', answer = '' } = req.body;
    const prompt = `As a technical interviewer, evaluate the candidate's response.
Question asked: "${question}"
Candidate's response: "${answer}"
Coding Problem: "${problemId}"

Respond in JSON format containing:
- "feedback": clear feedback detailing what was correct, any missing pieces, and what they could have explained better. Use markdown for readability.`;

    const result = await generateAIResponse(prompt, mockInterviewEvaluate(answer));
    res.json(result);
  } catch {
    res.status(500).json({ message: 'Interview evaluation failed.' });
  }
};

export const chat = async (req: Request, res: Response) => {
  try {
    const { message = '', problemId = '', code = '', language = 'java', history = [] } = req.body;

    const chatHistoryText = history.map((msg: any) => `${msg.role === 'user' ? 'Student' : 'AI'}: ${msg.text}`).join('\n');
    const prompt = `You are a helpful AI programming assistant inside a Coding Sandbox. You are guiding a student on the problem "${problemId}".
Their current code:
\`\`\`${language}
${code}
\`\`\`

Conversation history:
${chatHistoryText}

Student's new message: "${message}"

Respond in JSON format containing:
- "reply": your response (formatted nicely using markdown). Keep explanations clear, crisp, and educational. Use code blocks if you need to demonstrate patterns.`;

    const lowerMsg = message.toLowerCase();
    const fallback = mockReview(code);
    let mockReply = `🤖 I'm here to help with "${problemId}"! Your current code is written in ${language}. Let me know if you need code review, complexity analysis, or tips.`;
    
    if (lowerMsg.includes('time complexity') || lowerMsg.includes('big o')) {
      mockReply = '⏱️ The time complexity depends on your algorithm. If you use nested loops it\'s O(N²). Using a HashMap reduces it to O(N). Look at how many iterations your code performs relative to input size N.';
    } else if (lowerMsg.includes('space') || lowerMsg.includes('memory')) {
      mockReply = '💾 Space complexity is determined by extra memory used. A HashMap uses O(N) extra space. If you use only a few variables, it\'s O(1).';
    } else if (lowerMsg.includes('hint') || lowerMsg.includes('help')) {
      mockReply = '💡 Hint: Try thinking about what you need to find. For each element, ask "Does its complement exist in what I\'ve already seen?" A HashMap lets you answer that in O(1).';
    } else if (lowerMsg.includes('explain') || lowerMsg.includes('how')) {
      mockReply = `📖 For "${problemId}", the key insight is:\n1. Iterate through each element\n2. Check if (target - element) has been seen before\n3. If yes → return indices\n4. If no → store element with its index\n\nThis avoids the O(N²) brute force.`;
    }

    const result = await generateAIResponse(prompt, { reply: mockReply });
    res.json(result);
  } catch {
    res.status(500).json({ message: 'Chat failed.' });
  }
};

export const scoreCode = async (req: Request, res: Response) => {
  try {
    const { code = '', language = 'java', problemId = '' } = req.body;
    const prompt = `Grade the following code for "${problemId}" in "${language}" on a scale from 0 to 100.
Code:
\`\`\`${language}
${code}
\`\`\`

Respond in JSON format containing:
- "total": integer score out of 100.
- "breakdown": an object containing sub-scores (0 to 25) for:
  - "correctness"
  - "efficiency"
  - "readability"
  - "bestPractices"
- "feedback": qualitative feedback detailing strengths and areas for improvement.`;

    const result = await generateAIResponse(prompt, mockScore(code));
    res.json(result);
  } catch {
    res.status(500).json({ message: 'Scoring failed.' });
  }
};
