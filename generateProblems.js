const fs = require('fs');
const path = require('path');

const templates = {
  javascript: (name) => `function ${name}(input) {\n    // Write your code here\n    \n}`,
  java: (name) => `public class Solution {\n    public Object ${name}(Object input) {\n        // Write your code here\n        return null;\n    }\n}`,
  python: (name) => `def ${name}(input):\n    # Write your code here\n    pass`
};

const problemTypes = [
  { category: 'Array', diffs: ['Easy', 'Medium', 'Hard'] },
  { category: 'String', diffs: ['Easy', 'Medium'] },
  { category: 'LinkedList', diffs: ['Easy', 'Medium'] },
  { category: 'Tree', diffs: ['Medium', 'Hard'] },
  { category: 'Dynamic Programming', diffs: ['Medium', 'Hard'] },
  { category: 'Graph', diffs: ['Medium', 'Hard'] }
];

const problems = [];

problems.push({
  id: 'two-sum',
  title: 'Two Sum',
  difficulty: 'Easy',
  category: 'Array',
  description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
You may assume that each input would have exactly one solution, and you may not use the same element twice.
You can return the answer in any order.`,
  inputFormat: 'nums = [2, 7, 11, 15], target = 9',
  outputFormat: '[0, 1]',
  testCases: [
    { input: '[[2, 7, 11, 15], 9]', expected: '[0, 1]' },
    { input: '[[3, 2, 4], 6]', expected: '[1, 2]' },
    { input: '[[3, 3], 6]', expected: '[0, 1]' }
  ],
  defaultTemplates: {
    javascript: `function twoSum(nums, target) {\n    // Write your code here\n    \n}`,
    java: `public class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n}`,
    python: `def two_sum(nums, target):\n    # Write your code here\n    pass`
  }
});

problems.push({
  id: 'reverse-linked-list',
  title: 'Reverse Linked List',
  difficulty: 'Easy',
  category: 'LinkedList',
  description: 'Given the head of a singly linked list, reverse the list, and return its reversed list.',
  inputFormat: 'head = [1,2,3,4,5]',
  outputFormat: '[5,4,3,2,1]',
  testCases: [
    { input: '[[1, 2, 3, 4, 5]]', expected: '[5, 4, 3, 2, 1]' },
    { input: '[[1, 2]]', expected: '[2, 1]' }
  ],
  defaultTemplates: {
    javascript: `function reverseList(head) {\n    // Write your code here\n    \n}`,
    java: `public class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Write your code here\n        return null;\n    }\n}`,
    python: `def reverse_list(head):\n    # Write your code here\n    pass`
  }
});

problems.push({
  id: 'longest-substring',
  title: 'Longest Substring Without Repeating Characters',
  difficulty: 'Medium',
  category: 'String',
  description: 'Given a string s, find the length of the longest substring without repeating characters.',
  inputFormat: 's = "abcabcbb"',
  outputFormat: '3',
  testCases: [
    { input: '["abcabcbb"]', expected: '3' },
    { input: '["bbbbb"]', expected: '1' },
    { input: '["pwwkew"]', expected: '3' }
  ],
  defaultTemplates: {
    javascript: `function lengthOfLongestSubstring(s) {\n    // Write your code here\n    \n}`,
    java: `public class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your code here\n        return 0;\n    }\n}`,
    python: `def length_of_longest_substring(s):\n    # Write your code here\n    pass`
  }
});

for (let i = 4; i <= 50; i++) {
  const type = problemTypes[i % problemTypes.length];
  const diff = type.diffs[i % type.diffs.length];
  
  problems.push({
    id: `problem-${i}`,
    title: `${type.category} Challenge ${i}`,
    difficulty: diff,
    category: type.category,
    description: `Solve the following algorithmic challenge related to ${type.category}. Ensure your solution is highly optimized for Time and Space Complexity. Constraints: 1 <= N <= 10^5.`,
    inputFormat: 'input = [data]',
    outputFormat: '[result]',
    testCases: [
      { input: '[[1, 2, 3]]', expected: 'mocked_output' },
      { input: '[[4, 5, 6]]', expected: 'mocked_output' }
    ],
    defaultTemplates: {
      javascript: templates.javascript(`solveProblem${i}`),
      java: templates.java(`solveProblem${i}`),
      python: templates.python(`solve_problem_${i}`)
    }
  });
}

const targetPath = path.join(__dirname, 'backend', 'src', 'data', 'codingProblems.json');
fs.writeFileSync(targetPath, JSON.stringify(problems, null, 2));
console.log('Successfully generated 50 coding problems at', targetPath);
