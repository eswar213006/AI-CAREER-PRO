// ─── Complete Solution Bank ───────────────────────────────────────────────────
// Exact, working, well-commented solutions for every problem in all 4 languages.
// Used as the primary fallback when Gemini API quota is exceeded.

export interface SolutionEntry {
  solution: string;
  explanation: string;
  timeComplexity: string;
  spaceComplexity: string;
}

type LangMap = Record<'java' | 'c' | 'cpp' | 'python', SolutionEntry>;

export const SOLUTION_BANK: Record<string, LangMap> = {

  // ── Two Sum ──────────────────────────────────────────────────────────────────
  'two-sum': {
    java: {
      solution: `import java.util.HashMap;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Store number -> index mapping
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            // Check if complement already seen
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
      explanation: 'Use a HashMap to store each number and its index. For each number, check if target - num already exists in the map.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(N)'
    },
    cpp: {
      solution: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> map; // value -> index
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (map.count(complement)) {
                return {map[complement], i};
            }
            map[nums[i]] = i;
        }
        return {};
    }
};`,
      explanation: 'Use an unordered_map for O(1) average lookup. For each element, check if its complement exists.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(N)'
    },
    c: {
      solution: `#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    *returnSize = 2;
    int* result = (int*)malloc(2 * sizeof(int));
    // Brute force O(N^2) — no hash map in plain C
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                result[0] = i;
                result[1] = j;
                return result;
            }
        }
    }
    return result;
}`,
      explanation: 'Plain C uses brute-force nested loops since no built-in hash map. Checks every pair.',
      timeComplexity: 'O(N²)', spaceComplexity: 'O(1)'
    },
    python: {
      solution: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Map number -> index for O(1) lookup
        seen = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i
        return []`,
      explanation: 'Use a dictionary to map each value to its index. For each number, check if the complement exists.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(N)'
    }
  },

  // ── Reverse Linked List ───────────────────────────────────────────────────────
  'reverse-linked-list': {
    java: {
      solution: `class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode next = curr.next; // save next
            curr.next = prev;          // reverse pointer
            prev = curr;               // advance prev
            curr = next;               // advance curr
        }
        return prev; // prev is new head
    }
}`,
      explanation: 'Iterative in-place reversal using three pointers: prev, curr, next.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(1)'
    },
    cpp: {
      solution: `class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        ListNode* curr = head;
        while (curr) {
            ListNode* next = curr->next;
            curr->next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }
};`,
      explanation: 'Iterative reversal with three pointers. No extra memory needed.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(1)'
    },
    c: {
      solution: `struct ListNode* reverseList(struct ListNode* head) {
    struct ListNode* prev = NULL;
    struct ListNode* curr = head;
    while (curr != NULL) {
        struct ListNode* next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}`,
      explanation: 'Iterative reversal with prev/curr/next pointers.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(1)'
    },
    python: {
      solution: `class Solution:
    def reverseList(self, head):
        prev = None
        curr = head
        while curr:
            next_node = curr.next  # save next
            curr.next = prev       # reverse
            prev = curr
            curr = next_node
        return prev`,
      explanation: 'Iterative reversal using three pointers.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(1)'
    }
  },

  // ── Longest Substring Without Repeating Characters ────────────────────────────
  'longest-substring': {
    java: {
      solution: `import java.util.HashMap;

class Solution {
    public int lengthOfLongestSubstring(String s) {
        HashMap<Character, Integer> map = new HashMap<>();
        int left = 0, maxLen = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            // If char seen and within window, shrink window
            if (map.containsKey(c) && map.get(c) >= left) {
                left = map.get(c) + 1;
            }
            map.put(c, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}`,
      explanation: 'Sliding window + HashMap. Expand right, shrink left when duplicate found.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(min(N,M)) where M is charset size'
    },
    cpp: {
      solution: `#include <string>
#include <unordered_map>
using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_map<char, int> last;
        int left = 0, maxLen = 0;
        for (int right = 0; right < s.size(); right++) {
            char c = s[right];
            if (last.count(c) && last[c] >= left) {
                left = last[c] + 1;
            }
            last[c] = right;
            maxLen = max(maxLen, right - left + 1);
        }
        return maxLen;
    }
};`,
      explanation: 'Sliding window with unordered_map to track last seen position of each character.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(N)'
    },
    c: {
      solution: `#include <string.h>

int lengthOfLongestSubstring(char* s) {
    int last[256];
    memset(last, -1, sizeof(last));
    int left = 0, maxLen = 0, n = strlen(s);
    for (int right = 0; right < n; right++) {
        unsigned char c = (unsigned char)s[right];
        if (last[c] >= left) {
            left = last[c] + 1;
        }
        last[c] = right;
        if (right - left + 1 > maxLen) maxLen = right - left + 1;
    }
    return maxLen;
}`,
      explanation: 'Sliding window with an array of 256 for ASCII characters.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(1)'
    },
    python: {
      solution: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        last = {}   # char -> last seen index
        left = 0
        max_len = 0
        for right, c in enumerate(s):
            if c in last and last[c] >= left:
                left = last[c] + 1
            last[c] = right
            max_len = max(max_len, right - left + 1)
        return max_len`,
      explanation: 'Sliding window with dict to track last index of each character.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(N)'
    }
  },

  // ── Valid Parentheses ─────────────────────────────────────────────────────────
  'valid-parentheses': {
    java: {
      solution: `import java.util.Stack;

class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '[' || c == '{') {
                stack.push(c); // push open brackets
            } else {
                if (stack.isEmpty()) return false;
                char top = stack.pop();
                // Check if matches
                if (c == ')' && top != '(') return false;
                if (c == ']' && top != '[') return false;
                if (c == '}' && top != '{') return false;
            }
        }
        return stack.isEmpty();
    }
}`,
      explanation: 'Use a stack. Push open brackets; for close brackets, pop and verify match.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(N)'
    },
    cpp: {
      solution: `#include <stack>
#include <string>
using namespace std;

class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for (char c : s) {
            if (c == '(' || c == '[' || c == '{') {
                st.push(c);
            } else {
                if (st.empty()) return false;
                char top = st.top(); st.pop();
                if (c == ')' && top != '(') return false;
                if (c == ']' && top != '[') return false;
                if (c == '}' && top != '{') return false;
            }
        }
        return st.empty();
    }
};`,
      explanation: 'Stack-based bracket matching.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(N)'
    },
    c: {
      solution: `#include <string.h>
#include <stdbool.h>

bool isValid(char* s) {
    int n = strlen(s);
    char stack[n + 1];
    int top = -1;
    for (int i = 0; i < n; i++) {
        char c = s[i];
        if (c == '(' || c == '[' || c == '{') {
            stack[++top] = c;
        } else {
            if (top < 0) return false;
            char t = stack[top--];
            if (c == ')' && t != '(') return false;
            if (c == ']' && t != '[') return false;
            if (c == '}' && t != '{') return false;
        }
    }
    return top == -1;
}`,
      explanation: 'Stack array to match brackets.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(N)'
    },
    python: {
      solution: `class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        matching = {')': '(', ']': '[', '}': '{'}
        for c in s:
            if c in '([{':
                stack.append(c)
            else:
                if not stack or stack[-1] != matching[c]:
                    return False
                stack.pop()
        return len(stack) == 0`,
      explanation: 'Stack with a matching dictionary for close brackets.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(N)'
    }
  },

  // ── Max Subarray (Kadane's) ───────────────────────────────────────────────────
  'max-subarray': {
    java: {
      solution: `class Solution {
    public int maxSubArray(int[] nums) {
        int maxSum = nums[0];
        int currentSum = nums[0];
        for (int i = 1; i < nums.length; i++) {
            // Either extend current subarray or start fresh
            currentSum = Math.max(nums[i], currentSum + nums[i]);
            maxSum = Math.max(maxSum, currentSum);
        }
        return maxSum;
    }
}`,
      explanation: "Kadane's Algorithm: at each index, decide to extend or restart the subarray.",
      timeComplexity: 'O(N)', spaceComplexity: 'O(1)'
    },
    cpp: {
      solution: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int maxSum = nums[0], curr = nums[0];
        for (int i = 1; i < nums.size(); i++) {
            curr = max(nums[i], curr + nums[i]);
            maxSum = max(maxSum, curr);
        }
        return maxSum;
    }
};`,
      explanation: "Kadane's — track running sum, reset when negative.",
      timeComplexity: 'O(N)', spaceComplexity: 'O(1)'
    },
    c: {
      solution: `int maxSubArray(int* nums, int n) {
    int maxSum = nums[0], curr = nums[0];
    for (int i = 1; i < n; i++) {
        curr = curr + nums[i] > nums[i] ? curr + nums[i] : nums[i];
        if (curr > maxSum) maxSum = curr;
    }
    return maxSum;
}`,
      explanation: "Kadane's algorithm in C.",
      timeComplexity: 'O(N)', spaceComplexity: 'O(1)'
    },
    python: {
      solution: `class Solution:
    def maxSubArray(self, nums: list[int]) -> int:
        max_sum = curr = nums[0]
        for num in nums[1:]:
            curr = max(num, curr + num)  # extend or restart
            max_sum = max(max_sum, curr)
        return max_sum`,
      explanation: "Kadane's Algorithm in Python.",
      timeComplexity: 'O(N)', spaceComplexity: 'O(1)'
    }
  },

  // ── Climbing Stairs ───────────────────────────────────────────────────────────
  'climbing-stairs': {
    java: {
      solution: `class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n;
        int prev2 = 1, prev1 = 2;
        for (int i = 3; i <= n; i++) {
            int curr = prev1 + prev2; // ways(i) = ways(i-1) + ways(i-2)
            prev2 = prev1;
            prev1 = curr;
        }
        return prev1;
    }
}`,
      explanation: 'DP with O(1) space: ways(n) = ways(n-1) + ways(n-2). Same as Fibonacci.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(1)'
    },
    cpp: {
      solution: `class Solution {
public:
    int climbStairs(int n) {
        if (n <= 2) return n;
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) {
            int c = a + b;
            a = b;
            b = c;
        }
        return b;
    }
};`,
      explanation: 'Fibonacci-style DP with rolling variables.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(1)'
    },
    c: {
      solution: `int climbStairs(int n) {
    if (n <= 2) return n;
    int a = 1, b = 2;
    for (int i = 3; i <= n; i++) {
        int c = a + b;
        a = b;
        b = c;
    }
    return b;
}`,
      explanation: 'Fibonacci sequence using two rolling integers.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(1)'
    },
    python: {
      solution: `class Solution:
    def climbStairs(self, n: int) -> int:
        if n <= 2:
            return n
        a, b = 1, 2
        for _ in range(3, n + 1):
            a, b = b, a + b  # rolling Fibonacci
        return b`,
      explanation: 'Rolling Fibonacci — ways(n) = ways(n-1) + ways(n-2).',
      timeComplexity: 'O(N)', spaceComplexity: 'O(1)'
    }
  },

  // ── Binary Search ─────────────────────────────────────────────────────────────
  'binary-search': {
    java: {
      solution: `class Solution {
    public int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2; // avoids overflow
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
}`,
      explanation: 'Classic binary search. Halve the search space each iteration.',
      timeComplexity: 'O(log N)', spaceComplexity: 'O(1)'
    },
    cpp: {
      solution: `#include <vector>
using namespace std;

class Solution {
public:
    int search(vector<int>& nums, int target) {
        int left = 0, right = nums.size() - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
};`,
      explanation: 'Standard binary search on a sorted array.',
      timeComplexity: 'O(log N)', spaceComplexity: 'O(1)'
    },
    c: {
      solution: `int search(int* nums, int n, int target) {
    int left = 0, right = n - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;
        else if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
      explanation: 'Binary search in C.',
      timeComplexity: 'O(log N)', spaceComplexity: 'O(1)'
    },
    python: {
      solution: `class Solution:
    def search(self, nums: list[int], target: int) -> int:
        left, right = 0, len(nums) - 1
        while left <= right:
            mid = (left + right) // 2
            if nums[mid] == target:
                return mid
            elif nums[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        return -1`,
      explanation: 'Standard binary search.',
      timeComplexity: 'O(log N)', spaceComplexity: 'O(1)'
    }
  },

  // ── Subsets (Power Set) ───────────────────────────────────────────────────────
  'subsets': {
    java: {
      solution: `import java.util.*;

class Solution {
    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, 0, new ArrayList<>(), result);
        return result;
    }
    private void backtrack(int[] nums, int start, List<Integer> curr, List<List<Integer>> result) {
        result.add(new ArrayList<>(curr)); // add current subset
        for (int i = start; i < nums.length; i++) {
            curr.add(nums[i]);           // include nums[i]
            backtrack(nums, i + 1, curr, result);
            curr.remove(curr.size() - 1); // exclude nums[i] (backtrack)
        }
    }
}`,
      explanation: 'Backtracking: at each index, choose to include or exclude. Recursively build all 2^N subsets.',
      timeComplexity: 'O(N × 2^N)', spaceComplexity: 'O(N)'
    },
    cpp: {
      solution: `#include <vector>
using namespace std;

class Solution {
public:
    vector<vector<int>> subsets(vector<int>& nums) {
        vector<vector<int>> result;
        vector<int> curr;
        backtrack(nums, 0, curr, result);
        return result;
    }
    void backtrack(vector<int>& nums, int start, vector<int>& curr, vector<vector<int>>& result) {
        result.push_back(curr); // record current subset
        for (int i = start; i < nums.size(); i++) {
            curr.push_back(nums[i]);
            backtrack(nums, i + 1, curr, result);
            curr.pop_back(); // undo choice
        }
    }
};`,
      explanation: 'Backtracking solution generating all 2^N subsets.',
      timeComplexity: 'O(N × 2^N)', spaceComplexity: 'O(N)'
    },
    c: {
      solution: `#include <stdio.h>
#include <stdlib.h>

// Print all subsets using bitmask
void subsets(int* nums, int n) {
    int total = 1 << n; // 2^n subsets
    for (int mask = 0; mask < total; mask++) {
        printf("[");
        int first = 1;
        for (int i = 0; i < n; i++) {
            if (mask & (1 << i)) {
                if (!first) printf(",");
                printf("%d", nums[i]);
                first = 0;
            }
        }
        printf("] ");
    }
}`,
      explanation: 'Bitmask approach: each bit represents whether an element is included.',
      timeComplexity: 'O(N × 2^N)', spaceComplexity: 'O(1)'
    },
    python: {
      solution: `class Solution:
    def subsets(self, nums: list[int]) -> list[list[int]]:
        result = []

        def backtrack(start, curr):
            result.append(curr[:])  # snapshot of current subset
            for i in range(start, len(nums)):
                curr.append(nums[i])       # include
                backtrack(i + 1, curr)
                curr.pop()                 # exclude (backtrack)

        backtrack(0, [])
        return result`,
      explanation: 'Backtracking — include/exclude each element recursively.',
      timeComplexity: 'O(N × 2^N)', spaceComplexity: 'O(N)'
    }
  },

  // ── Permutations ─────────────────────────────────────────────────────────────
  'permutations': {
    java: {
      solution: `import java.util.*;

class Solution {
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, 0, result);
        return result;
    }
    private void backtrack(int[] nums, int start, List<List<Integer>> result) {
        if (start == nums.length) {
            List<Integer> perm = new ArrayList<>();
            for (int n : nums) perm.add(n);
            result.add(perm);
            return;
        }
        for (int i = start; i < nums.length; i++) {
            // Swap current with i-th
            int tmp = nums[start]; nums[start] = nums[i]; nums[i] = tmp;
            backtrack(nums, start + 1, result);
            // Restore (undo swap)
            tmp = nums[start]; nums[start] = nums[i]; nums[i] = tmp;
        }
    }
}`,
      explanation: 'Swap-based backtracking. Swap each element into the current position and recurse.',
      timeComplexity: 'O(N × N!)', spaceComplexity: 'O(N)'
    },
    cpp: {
      solution: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    vector<vector<int>> permute(vector<int>& nums) {
        vector<vector<int>> result;
        sort(nums.begin(), nums.end());
        do {
            result.push_back(nums); // each permutation
        } while (next_permutation(nums.begin(), nums.end()));
        return result;
    }
};`,
      explanation: 'Uses std::next_permutation to iterate through all permutations.',
      timeComplexity: 'O(N × N!)', spaceComplexity: 'O(N!)'
    },
    c: {
      solution: `#include <stdio.h>
#include <stdlib.h>

void swap(int* a, int* b) { int t = *a; *a = *b; *b = t; }

// Heap's algorithm to generate all permutations
void permute(int* arr, int n) {
    int c[n];
    for (int i = 0; i < n; i++) c[i] = 0;
    // Print first permutation
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");
    int i = 0;
    while (i < n) {
        if (c[i] < i) {
            if (i % 2 == 0) swap(&arr[0], &arr[i]);
            else swap(&arr[c[i]], &arr[i]);
            for (int j = 0; j < n; j++) printf("%d ", arr[j]);
            printf("\\n");
            c[i]++;
            i = 0;
        } else {
            c[i] = 0;
            i++;
        }
    }
}`,
      explanation: "Heap's algorithm generates all N! permutations with minimal swaps.",
      timeComplexity: 'O(N × N!)', spaceComplexity: 'O(N)'
    },
    python: {
      solution: `class Solution:
    def permute(self, nums: list[int]) -> list[list[int]]:
        result = []

        def backtrack(start):
            if start == len(nums):
                result.append(nums[:])  # snapshot
                return
            for i in range(start, len(nums)):
                nums[start], nums[i] = nums[i], nums[start]  # swap
                backtrack(start + 1)
                nums[start], nums[i] = nums[i], nums[start]  # restore

        backtrack(0)
        return result`,
      explanation: 'Swap-based backtracking to generate all permutations.',
      timeComplexity: 'O(N × N!)', spaceComplexity: 'O(N)'
    }
  },

  // ── Trapping Rain Water ───────────────────────────────────────────────────────
  'trapping-rainwater': {
    java: {
      solution: `class Solution {
    public int trap(int[] height) {
        int left = 0, right = height.length - 1;
        int leftMax = 0, rightMax = 0;
        int water = 0;
        while (left < right) {
            if (height[left] < height[right]) {
                if (height[left] >= leftMax) leftMax = height[left];
                else water += leftMax - height[left]; // water trapped
                left++;
            } else {
                if (height[right] >= rightMax) rightMax = height[right];
                else water += rightMax - height[right];
                right--;
            }
        }
        return water;
    }
}`,
      explanation: 'Two-pointer approach. Move the shorter side inward, accumulate water based on max heights.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(1)'
    },
    cpp: {
      solution: `#include <vector>
using namespace std;

class Solution {
public:
    int trap(vector<int>& height) {
        int left = 0, right = height.size() - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (left < right) {
            if (height[left] < height[right]) {
                leftMax = max(leftMax, height[left]);
                water += leftMax - height[left++];
            } else {
                rightMax = max(rightMax, height[right]);
                water += rightMax - height[right--];
            }
        }
        return water;
    }
};`,
      explanation: 'Two-pointer O(1) space solution.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(1)'
    },
    c: {
      solution: `int trap(int* height, int n) {
    int left = 0, right = n - 1;
    int leftMax = 0, rightMax = 0, water = 0;
    while (left < right) {
        if (height[left] < height[right]) {
            if (height[left] > leftMax) leftMax = height[left];
            else water += leftMax - height[left];
            left++;
        } else {
            if (height[right] > rightMax) rightMax = height[right];
            else water += rightMax - height[right];
            right--;
        }
    }
    return water;
}`,
      explanation: 'Two-pointer approach in C.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(1)'
    },
    python: {
      solution: `class Solution:
    def trap(self, height: list[int]) -> int:
        left, right = 0, len(height) - 1
        left_max = right_max = water = 0
        while left < right:
            if height[left] < height[right]:
                left_max = max(left_max, height[left])
                water += left_max - height[left]
                left += 1
            else:
                right_max = max(right_max, height[right])
                water += right_max - height[right]
                right -= 1
        return water`,
      explanation: 'Two-pointer — move from both ends, track running max on each side.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(1)'
    }
  },

  // ── Coin Change ───────────────────────────────────────────────────────────────
  'coin-change': {
    java: {
      solution: `import java.util.Arrays;

class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1); // initialize with "infinity"
        dp[0] = 0; // base case: 0 coins to make amount 0
        for (int i = 1; i <= amount; i++) {
            for (int coin : coins) {
                if (coin <= i) {
                    dp[i] = Math.min(dp[i], dp[i - coin] + 1);
                }
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`,
      explanation: 'Bottom-up DP. dp[i] = minimum coins needed for amount i.',
      timeComplexity: 'O(amount × coins.length)', spaceComplexity: 'O(amount)'
    },
    cpp: {
      solution: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        vector<int> dp(amount + 1, amount + 1);
        dp[0] = 0;
        for (int i = 1; i <= amount; i++) {
            for (int coin : coins) {
                if (coin <= i)
                    dp[i] = min(dp[i], dp[i - coin] + 1);
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
};`,
      explanation: 'Bottom-up DP on amounts from 0 to target.',
      timeComplexity: 'O(amount × coins)', spaceComplexity: 'O(amount)'
    },
    c: {
      solution: `#include <stdlib.h>

int coinChange(int* coins, int coinsSize, int amount) {
    int* dp = (int*)malloc((amount + 1) * sizeof(int));
    for (int i = 0; i <= amount; i++) dp[i] = amount + 1;
    dp[0] = 0;
    for (int i = 1; i <= amount; i++) {
        for (int j = 0; j < coinsSize; j++) {
            if (coins[j] <= i && dp[i - coins[j]] + 1 < dp[i]) {
                dp[i] = dp[i - coins[j]] + 1;
            }
        }
    }
    int res = dp[amount] > amount ? -1 : dp[amount];
    free(dp);
    return res;
}`,
      explanation: 'DP table in C with dynamic allocation.',
      timeComplexity: 'O(amount × coinsSize)', spaceComplexity: 'O(amount)'
    },
    python: {
      solution: `class Solution:
    def coinChange(self, coins: list[int], amount: int) -> int:
        dp = [float('inf')] * (amount + 1)
        dp[0] = 0  # base case
        for i in range(1, amount + 1):
            for coin in coins:
                if coin <= i:
                    dp[i] = min(dp[i], dp[i - coin] + 1)
        return dp[amount] if dp[amount] != float('inf') else -1`,
      explanation: 'Bottom-up DP. Fill dp[0..amount] with minimum coins required.',
      timeComplexity: 'O(amount × N)', spaceComplexity: 'O(amount)'
    }
  },

  // ── Number of Islands ─────────────────────────────────────────────────────────
  'number-of-islands': {
    java: {
      solution: `class Solution {
    public int numIslands(char[][] grid) {
        int count = 0;
        for (int i = 0; i < grid.length; i++) {
            for (int j = 0; j < grid[0].length; j++) {
                if (grid[i][j] == '1') {
                    dfs(grid, i, j); // sink the island
                    count++;
                }
            }
        }
        return count;
    }
    private void dfs(char[][] grid, int r, int c) {
        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] != '1') return;
        grid[r][c] = '0'; // mark visited
        dfs(grid, r + 1, c); dfs(grid, r - 1, c);
        dfs(grid, r, c + 1); dfs(grid, r, c - 1);
    }
}`,
      explanation: 'DFS from each unvisited land cell. Mark all connected land as visited.',
      timeComplexity: 'O(M×N)', spaceComplexity: 'O(M×N)'
    },
    cpp: {
      solution: `#include <vector>
using namespace std;

class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        int count = 0;
        for (int i = 0; i < grid.size(); i++) {
            for (int j = 0; j < grid[0].size(); j++) {
                if (grid[i][j] == '1') {
                    dfs(grid, i, j);
                    count++;
                }
            }
        }
        return count;
    }
    void dfs(vector<vector<char>>& g, int r, int c) {
        if (r < 0 || r >= g.size() || c < 0 || c >= g[0].size() || g[r][c] != '1') return;
        g[r][c] = '0';
        dfs(g, r+1, c); dfs(g, r-1, c); dfs(g, r, c+1); dfs(g, r, c-1);
    }
};`,
      explanation: 'DFS flood-fill to count connected components of land.',
      timeComplexity: 'O(M×N)', spaceComplexity: 'O(M×N)'
    },
    c: {
      solution: `void dfs(char** g, int rows, int cols, int r, int c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || g[r][c] != '1') return;
    g[r][c] = '0';
    dfs(g, rows, cols, r+1, c); dfs(g, rows, cols, r-1, c);
    dfs(g, rows, cols, r, c+1); dfs(g, rows, cols, r, c-1);
}
int numIslands(char** grid, int rows, int* colSizes) {
    int cols = colSizes[0], count = 0;
    for (int i = 0; i < rows; i++)
        for (int j = 0; j < cols; j++)
            if (grid[i][j] == '1') { dfs(grid, rows, cols, i, j); count++; }
    return count;
}`,
      explanation: 'Recursive DFS in C.',
      timeComplexity: 'O(M×N)', spaceComplexity: 'O(M×N)'
    },
    python: {
      solution: `class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        if not grid:
            return 0
        rows, cols = len(grid), len(grid[0])
        count = 0

        def dfs(r, c):
            if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != '1':
                return
            grid[r][c] = '0'  # mark visited
            dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1)

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == '1':
                    dfs(r, c)
                    count += 1
        return count`,
      explanation: 'DFS flood-fill to count islands.',
      timeComplexity: 'O(M×N)', spaceComplexity: 'O(M×N)'
    }
  },

  // ── House Robber ──────────────────────────────────────────────────────────────
  'house-robber': {
    java: {
      solution: `class Solution {
    public int rob(int[] nums) {
        if (nums.length == 1) return nums[0];
        int prev2 = 0, prev1 = 0;
        for (int num : nums) {
            int curr = Math.max(prev1, prev2 + num); // rob or skip
            prev2 = prev1;
            prev1 = curr;
        }
        return prev1;
    }
}`,
      explanation: 'DP: at each house, choose max(skip this house, rob this + two houses back).',
      timeComplexity: 'O(N)', spaceComplexity: 'O(1)'
    },
    cpp: {
      solution: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int rob(vector<int>& nums) {
        int prev2 = 0, prev1 = 0;
        for (int num : nums) {
            int curr = max(prev1, prev2 + num);
            prev2 = prev1;
            prev1 = curr;
        }
        return prev1;
    }
};`,
      explanation: 'Rolling DP variables — only need last two values.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(1)'
    },
    c: {
      solution: `int rob(int* nums, int n) {
    int prev2 = 0, prev1 = 0;
    for (int i = 0; i < n; i++) {
        int curr = prev1 > prev2 + nums[i] ? prev1 : prev2 + nums[i];
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`,
      explanation: 'Rolling variables DP.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(1)'
    },
    python: {
      solution: `class Solution:
    def rob(self, nums: list[int]) -> int:
        prev2 = prev1 = 0
        for num in nums:
            curr = max(prev1, prev2 + num)  # rob or skip
            prev2, prev1 = prev1, curr
        return prev1`,
      explanation: 'Rolling DP. Skip adjacent houses.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(1)'
    }
  },

  // ── 3Sum ────────────────────────────────────────────────────────────────────
  '3sum': {
    java: {
      solution: `import java.util.*;

class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> result = new ArrayList<>();
        for (int i = 0; i < nums.length - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue; // skip duplicates
            int left = i + 1, right = nums.length - 1;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum == 0) {
                    result.add(Arrays.asList(nums[i], nums[left], nums[right]));
                    while (left < right && nums[left] == nums[left + 1]) left++;
                    while (left < right && nums[right] == nums[right - 1]) right--;
                    left++; right--;
                } else if (sum < 0) left++;
                else right--;
            }
        }
        return result;
    }
}`,
      explanation: 'Sort array, then for each element use two-pointer to find pairs that sum to zero.',
      timeComplexity: 'O(N²)', spaceComplexity: 'O(1)'
    },
    cpp: {
      solution: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        vector<vector<int>> res;
        for (int i = 0; i < (int)nums.size() - 2; i++) {
            if (i > 0 && nums[i] == nums[i-1]) continue;
            int l = i+1, r = nums.size()-1;
            while (l < r) {
                int s = nums[i] + nums[l] + nums[r];
                if (s == 0) {
                    res.push_back({nums[i], nums[l], nums[r]});
                    while (l < r && nums[l] == nums[l+1]) l++;
                    while (l < r && nums[r] == nums[r-1]) r--;
                    l++; r--;
                } else if (s < 0) l++;
                else r--;
            }
        }
        return res;
    }
};`,
      explanation: 'Sort + two pointers, skipping duplicates.',
      timeComplexity: 'O(N²)', spaceComplexity: 'O(1)'
    },
    c: {
      solution: `#include <stdlib.h>
#include <stdio.h>

int cmp(const void* a, const void* b) { return *(int*)a - *(int*)b; }

// Prints all triplets summing to zero
void threeSum(int* nums, int n) {
    qsort(nums, n, sizeof(int), cmp);
    for (int i = 0; i < n - 2; i++) {
        if (i > 0 && nums[i] == nums[i-1]) continue;
        int l = i+1, r = n-1;
        while (l < r) {
            int s = nums[i] + nums[l] + nums[r];
            if (s == 0) {
                printf("[%d,%d,%d] ", nums[i], nums[l], nums[r]);
                while (l < r && nums[l] == nums[l+1]) l++;
                while (l < r && nums[r] == nums[r-1]) r--;
                l++; r--;
            } else if (s < 0) l++;
            else r--;
        }
    }
}`,
      explanation: 'Sort + two pointers in C.',
      timeComplexity: 'O(N²)', spaceComplexity: 'O(1)'
    },
    python: {
      solution: `class Solution:
    def threeSum(self, nums: list[int]) -> list[list[int]]:
        nums.sort()
        result = []
        for i in range(len(nums) - 2):
            if i > 0 and nums[i] == nums[i-1]:
                continue  # skip duplicates
            left, right = i + 1, len(nums) - 1
            while left < right:
                s = nums[i] + nums[left] + nums[right]
                if s == 0:
                    result.append([nums[i], nums[left], nums[right]])
                    while left < right and nums[left] == nums[left+1]: left += 1
                    while left < right and nums[right] == nums[right-1]: right -= 1
                    left += 1; right -= 1
                elif s < 0:
                    left += 1
                else:
                    right -= 1
        return result`,
      explanation: 'Sort + two pointers with duplicate skipping.',
      timeComplexity: 'O(N²)', spaceComplexity: 'O(1)'
    }
  },

  // ── Container With Most Water ─────────────────────────────────────────────────
  'container-most-water': {
    java: {
      solution: `class Solution {
    public int maxArea(int[] height) {
        int left = 0, right = height.length - 1;
        int maxWater = 0;
        while (left < right) {
            int water = Math.min(height[left], height[right]) * (right - left);
            maxWater = Math.max(maxWater, water);
            // Move the shorter wall inward
            if (height[left] < height[right]) left++;
            else right--;
        }
        return maxWater;
    }
}`,
      explanation: 'Two pointers from both ends. Always move the shorter height to potentially find a larger area.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(1)'
    },
    cpp: {
      solution: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxArea(vector<int>& h) {
        int l = 0, r = h.size() - 1, maxW = 0;
        while (l < r) {
            maxW = max(maxW, min(h[l], h[r]) * (r - l));
            if (h[l] < h[r]) l++;
            else r--;
        }
        return maxW;
    }
};`,
      explanation: 'Two-pointer greedy — move shorter side.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(1)'
    },
    c: {
      solution: `int maxArea(int* h, int n) {
    int l = 0, r = n - 1, maxW = 0;
    while (l < r) {
        int w = (h[l] < h[r] ? h[l] : h[r]) * (r - l);
        if (w > maxW) maxW = w;
        if (h[l] < h[r]) l++;
        else r--;
    }
    return maxW;
}`,
      explanation: 'Two-pointer in C.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(1)'
    },
    python: {
      solution: `class Solution:
    def maxArea(self, height: list[int]) -> int:
        left, right = 0, len(height) - 1
        max_water = 0
        while left < right:
            water = min(height[left], height[right]) * (right - left)
            max_water = max(max_water, water)
            if height[left] < height[right]:
                left += 1
            else:
                right -= 1
        return max_water`,
      explanation: 'Two pointers, move the shorter side inward.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(1)'
    }
  },

  // ── Anagram Check ────────────────────────────────────────────────────────────
  'anagram-check': {
    java: {
      solution: `class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        int[] count = new int[26];
        for (char c : s.toCharArray()) count[c - 'a']++;
        for (char c : t.toCharArray()) count[c - 'a']--;
        for (int n : count) if (n != 0) return false;
        return true;
    }
}`,
      explanation: 'Count character frequencies with an array of 26. If all counts are 0 after both strings, they are anagrams.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(1)'
    },
    cpp: {
      solution: `#include <string>
using namespace std;

class Solution {
public:
    bool isAnagram(string s, string t) {
        if (s.size() != t.size()) return false;
        int count[26] = {};
        for (char c : s) count[c-'a']++;
        for (char c : t) count[c-'a']--;
        for (int n : count) if (n != 0) return false;
        return true;
    }
};`,
      explanation: 'Character frequency array check.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(1)'
    },
    c: {
      solution: `#include <stdbool.h>
#include <string.h>

bool isAnagram(char* s, char* t) {
    if (strlen(s) != strlen(t)) return false;
    int count[26] = {0};
    for (int i = 0; s[i]; i++) count[s[i]-'a']++;
    for (int i = 0; t[i]; i++) count[t[i]-'a']--;
    for (int i = 0; i < 26; i++) if (count[i]) return false;
    return true;
}`,
      explanation: 'Character frequency array in C.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(1)'
    },
    python: {
      solution: `from collections import Counter

class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        # Simply compare frequency counts
        return Counter(s) == Counter(t)`,
      explanation: 'Use Counter to compare character frequencies of both strings.',
      timeComplexity: 'O(N)', spaceComplexity: 'O(N)'
    }
  },

  // ── Merge Intervals ───────────────────────────────────────────────────────────
  'merge-intervals': {
    java: {
      solution: `import java.util.*;

class Solution {
    public int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> a[0] - b[0]); // sort by start
        List<int[]> merged = new ArrayList<>();
        for (int[] interval : intervals) {
            // If list empty or no overlap with last
            if (merged.isEmpty() || merged.get(merged.size()-1)[1] < interval[0]) {
                merged.add(interval);
            } else {
                // Overlap — extend the end
                merged.get(merged.size()-1)[1] = Math.max(merged.get(merged.size()-1)[1], interval[1]);
            }
        }
        return merged.toArray(new int[0][]);
    }
}`,
      explanation: 'Sort by start time. Merge overlapping intervals greedily.',
      timeComplexity: 'O(N log N)', spaceComplexity: 'O(N)'
    },
    cpp: {
      solution: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end());
        vector<vector<int>> res;
        for (auto& iv : intervals) {
            if (res.empty() || res.back()[1] < iv[0]) {
                res.push_back(iv);
            } else {
                res.back()[1] = max(res.back()[1], iv[1]);
            }
        }
        return res;
    }
};`,
      explanation: 'Sort + greedy merge.',
      timeComplexity: 'O(N log N)', spaceComplexity: 'O(N)'
    },
    c: {
      solution: `#include <stdlib.h>

int cmp(const void* a, const void* b) {
    int* x = *(int**)a; int* y = *(int**)b;
    return x[0] - y[0];
}
// Returns merged intervals (printed)
void mergeIntervals(int intervals[][2], int n) {
    qsort(intervals, n, sizeof(intervals[0]), cmp);
    int stack[n][2], top = 0;
    for (int i = 0; i < n; i++) {
        if (top == 0 || stack[top-1][1] < intervals[i][0]) {
            stack[top][0] = intervals[i][0];
            stack[top][1] = intervals[i][1];
            top++;
        } else if (stack[top-1][1] < intervals[i][1]) {
            stack[top-1][1] = intervals[i][1];
        }
    }
    for (int i = 0; i < top; i++) printf("[%d,%d] ", stack[i][0], stack[i][1]);
}`,
      explanation: 'Sort + stack-based merge in C.',
      timeComplexity: 'O(N log N)', spaceComplexity: 'O(N)'
    },
    python: {
      solution: `class Solution:
    def merge(self, intervals: list[list[int]]) -> list[list[int]]:
        intervals.sort(key=lambda x: x[0])
        merged = []
        for interval in intervals:
            if not merged or merged[-1][1] < interval[0]:
                merged.append(interval)
            else:
                merged[-1][1] = max(merged[-1][1], interval[1])
        return merged`,
      explanation: 'Sort by start, greedily merge overlaps.',
      timeComplexity: 'O(N log N)', spaceComplexity: 'O(N)'
    }
  },
};
`,
<parameter name="toolSummary">Writing solution bank file
