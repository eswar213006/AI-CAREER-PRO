import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Code2,
  Terminal,
  Play,
  CheckCircle,
  Cpu,
  AlertTriangle,
  Clipboard,
  Check,
  Lightbulb,
  Eye,
  EyeOff,
  RefreshCw,
  ChevronRight,
  Bot,
  X,
  Sparkles,
  BookOpen,
  GitCompare,
  BarChart2,
  Flame,
  HelpCircle,
  FlaskConical,
  Mic,
  MessageSquare,
  Star,
  FileText,
  ChevronDown,
  ChevronUp,
  Copy,
  Send,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import type { RootState } from '../store';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import api from '../utils/api';

type Language = 'java' | 'c' | 'cpp' | 'python';

const LANG_LABELS: Record<Language, string> = {
  java: 'Java (JDK 17)',
  c: 'C (GCC 11)',
  cpp: 'C++ (G++ 17)',
  python: 'Python 3',
};

const LANG_FILENAMES: Record<Language, string> = {
  java: 'Solution.java',
  c: 'solution.c',
  cpp: 'solution.cpp',
  python: 'solution.py',
};

const buildDefaultTemplate = (problem: any, language: Language): string => {
  if (problem.defaultTemplates[language]) return problem.defaultTemplates[language];
  const jsTemplate = problem.defaultTemplates['javascript'] || '';
  const funcMatch = jsTemplate.match(/function\s+(\w+)\s*\(([^)]*)\)/);
  const funcName = funcMatch ? funcMatch[1] : 'solve';
  const rawParams = funcMatch ? funcMatch[2] : 'input';
  if (language === 'cpp') {
    const params = rawParams.split(',').map((p: string) => `auto ${p.trim()}`).join(', ');
    return `#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    // Write your solution here\n    auto ${funcName}(${params}) {\n        \n    }\n};`;
  }
  if (language === 'c') {
    const params = rawParams.split(',').map((p: string) => `int ${p.trim()}`).join(', ');
    return `#include <stdio.h>\n#include <stdlib.h>\n\n// Write your solution here\nvoid ${funcName}(${params}) {\n    \n}`;
  }
  return problem.defaultTemplates['python'] || `def ${funcName}(${rawParams}):\n    # Write your solution here\n    pass`;
};

// ─── AI Section Card ────────────────────────────────────────────────────────
interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}
const SectionCard: React.FC<SectionCardProps> = ({ icon, title, color, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-2xl border ${color} bg-dark-card/60 backdrop-blur overflow-hidden transition-all`}>
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <span className="flex items-center gap-2 text-xs font-bold text-white">
          {icon}
          {title}
        </span>
        {open ? <ChevronUp className="h-3.5 w-3.5 text-gray-400" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
};

// ─── AI Assistant Panel ─────────────────────────────────────────────────────
interface AIAssistantPanelProps {
  problem: any;
  code: string;
  language: Language;
  onClose: () => void;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ problem, code, language, onClose }) => {
  const { showToast } = useToast();

  // Per-section loading/data/error
  const [reviewData, setReviewData] = useState<any>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const [explainData, setExplainData] = useState<any>(null);
  const [explainLoading, setExplainLoading] = useState(false);

  const [compareData, setCompareData] = useState<any>(null);
  const [compareLoading, setCompareLoading] = useState(false);

  const [complexityData, setComplexityData] = useState<any>(null);
  const [complexityLoading, setComplexityLoading] = useState(false);

  const [dryRunData, setDryRunData] = useState<any>(null);
  const [dryRunInput, setDryRunInput] = useState('');
  const [dryRunLoading, setDryRunLoading] = useState(false);

  const [hintIndex, setHintIndex] = useState(0);
  const [hintData, setHintData] = useState<string[]>([]);
  const [hintLoading, setHintLoading] = useState(false);

  const [testData, setTestData] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  const [interviewQ, setInterviewQ] = useState<any>(null);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewAnswer, setInterviewAnswer] = useState('');
  const [interviewFeedback, setInterviewFeedback] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [scoreData, setScoreData] = useState<any>(null);
  const [scoreLoading, setScoreLoading] = useState(false);

  const [copied, setCopied] = useState('');

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
    showToast('Copied!', 'success');
  };

  // ── Call helpers ──────────────────────────────────────────────────────────
  const callAI = async (endpoint: string, body: object) => {
    const res = await api.post(`/ai/${endpoint}`, body);
    return res.data;
  };

  const handleReview = async () => {
    setReviewLoading(true);
    try {
      const data = await callAI('review', { problemId: problem.id, language, code });
      setReviewData(data);
    } catch (e: any) {
      showToast(e.response?.data?.message || 'AI review failed.', 'error');
    } finally { setReviewLoading(false); }
  };

  const handleExplain = async () => {
    setExplainLoading(true);
    try {
      const data = await callAI('explain', { problemId: problem.id, language, code });
      setExplainData(data);
    } catch (e: any) {
      showToast(e.response?.data?.message || 'AI explain failed.', 'error');
    } finally { setExplainLoading(false); }
  };

  const handleCompare = async () => {
    setCompareLoading(true);
    try {
      const data = await callAI('compare', { problemId: problem.id, language, code });
      setCompareData(data);
    } catch (e: any) {
      showToast(e.response?.data?.message || 'AI compare failed.', 'error');
    } finally { setCompareLoading(false); }
  };

  const handleComplexity = async () => {
    setComplexityLoading(true);
    try {
      const data = await callAI('complexity', { problemId: problem.id, language, code });
      setComplexityData(data);
    } catch (e: any) {
      showToast(e.response?.data?.message || 'AI complexity failed.', 'error');
    } finally { setComplexityLoading(false); }
  };

  const handleDryRun = async () => {
    setDryRunLoading(true);
    try {
      const data = await callAI('dryrun', { problemId: problem.id, language, code, input: dryRunInput });
      setDryRunData(data);
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Dry run failed.', 'error');
    } finally { setDryRunLoading(false); }
  };

  const handleHint = async () => {
    setHintLoading(true);
    try {
      const data = await callAI('hint', { problemId: problem.id, hintIndex });
      setHintData(prev => [...prev, data.hint]);
      setHintIndex(i => i + 1);
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Hint failed.', 'error');
    } finally { setHintLoading(false); }
  };

  const handleTestCases = async () => {
    setTestLoading(true);
    try {
      const data = await callAI('testcases', { problemId: problem.id, code, language });
      setTestData(data);
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Test case gen failed.', 'error');
    } finally { setTestLoading(false); }
  };

  const handleInterview = async () => {
    setInterviewLoading(true);
    try {
      const data = await callAI('interview', { problemId: problem.id });
      setInterviewQ(data);
      setInterviewAnswer('');
      setInterviewFeedback(null);
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Interview failed.', 'error');
    } finally { setInterviewLoading(false); }
  };

  const handleInterviewSubmit = async () => {
    if (!interviewAnswer.trim()) return;
    setInterviewLoading(true);
    try {
      const data = await callAI('interview/evaluate', { problemId: problem.id, question: interviewQ?.question, answer: interviewAnswer });
      setInterviewFeedback(data.feedback);
    } catch {
      setInterviewFeedback('Could not evaluate. Please try again.');
    } finally { setInterviewLoading(false); }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setChatLoading(true);
    try {
      const data = await callAI('chat', { problemId: problem.id, code, language, message: userMsg, history: chatMessages });
      setChatMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'ai', text: '⚠️ AI is unavailable right now. Please try again.' }]);
    } finally {
      setChatLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const handleScore = async () => {
    setScoreLoading(true);
    try {
      const data = await callAI('score', { problemId: problem.id, code, language });
      setScoreData(data);
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Scoring failed.', 'error');
    } finally { setScoreLoading(false); }
  };

  const openInChatGPT = () => {
    const prompt = encodeURIComponent(`Problem: ${problem.title}\n\nMy ${LANG_LABELS[language]} code:\n\`\`\`\n${code}\n\`\`\`\n\nPlease review my code and suggest improvements.`);
    window.open(`https://chat.openai.com/?q=${prompt}`, '_blank');
  };

  const openInGemini = () => {
    const prompt = encodeURIComponent(`Problem: ${problem.title}\n\nMy ${LANG_LABELS[language]} code:\n\`\`\`\n${code}\n\`\`\`\n\nPlease review my code and suggest improvements.`);
    window.open(`https://gemini.google.com/app?q=${prompt}`, '_blank');
  };

  const AIButton: React.FC<{ onClick: () => void; loading: boolean; label: string; icon?: React.ReactNode }> = ({ onClick, loading, label, icon }) => (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/30 hover:border-violet-400/60 text-violet-300 text-xs font-bold transition-all hover:shadow-lg hover:shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (icon || <Sparkles className="h-3.5 w-3.5" />)}
      {label}
    </button>
  );

  const CodeBlock: React.FC<{ code: string; copyKey: string }> = ({ code: c, copyKey }) => (
    <div className="relative">
      <pre className="bg-[#070A13] border border-dark-border rounded-xl p-3 font-mono text-[10px] text-emerald-400 overflow-x-auto leading-relaxed max-h-48">
        <code>{c}</code>
      </pre>
      <button
        onClick={() => copyText(c, copyKey)}
        className="absolute top-2 right-2 p-1.5 rounded-lg bg-dark-bg/80 border border-dark-border hover:bg-dark-hover text-gray-400 hover:text-white transition-colors"
      >
        {copied === copyKey ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-stretch">
      {/* Backdrop */}
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        className="w-full max-w-md bg-[#0C0E1A] border-l border-violet-500/20 shadow-2xl shadow-violet-900/30 flex flex-col overflow-hidden"
        style={{ animation: 'slideInRight 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border bg-gradient-to-r from-violet-900/30 to-purple-900/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white">AI Assistant</h2>
              <p className="text-[10px] text-violet-400">{problem?.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable sections */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">

          {/* 1. Review My Code */}
          <SectionCard
            icon={<Star className="h-3.5 w-3.5 text-yellow-400" />}
            title="Review My Code"
            color="border-yellow-500/20"
            defaultOpen
          >
            <AIButton onClick={handleReview} loading={reviewLoading} label="Review My Code" icon={<Star className="h-3.5 w-3.5" />} />
            {reviewData && (
              <div className="space-y-2 text-xs text-gray-300">
                {reviewData.correctness && <div className="p-2.5 bg-emerald-950/30 border border-emerald-800/40 rounded-xl"><span className="font-bold text-emerald-400 block mb-1">✅ Correctness</span>{reviewData.correctness}</div>}
                {reviewData.bugs && <div className="p-2.5 bg-red-950/30 border border-red-800/40 rounded-xl"><span className="font-bold text-red-400 block mb-1">🐛 Bugs</span>{reviewData.bugs}</div>}
                {reviewData.logicIssues && <div className="p-2.5 bg-orange-950/30 border border-orange-800/40 rounded-xl"><span className="font-bold text-orange-400 block mb-1">⚠️ Logic Issues</span>{reviewData.logicIssues}</div>}
                {reviewData.style && <div className="p-2.5 bg-blue-950/30 border border-blue-800/40 rounded-xl"><span className="font-bold text-blue-400 block mb-1">🎨 Style</span>{reviewData.style}</div>}
                {reviewData.suggestions && <div className="p-2.5 bg-violet-950/30 border border-violet-800/40 rounded-xl"><span className="font-bold text-violet-400 block mb-1">💡 Suggestions</span>{reviewData.suggestions}</div>}
              </div>
            )}
          </SectionCard>

          {/* 2. Explain My Code */}
          <SectionCard
            icon={<BookOpen className="h-3.5 w-3.5 text-sky-400" />}
            title="Explain My Code"
            color="border-sky-500/20"
          >
            <AIButton onClick={handleExplain} loading={explainLoading} label="Explain Step by Step" icon={<BookOpen className="h-3.5 w-3.5" />} />
            {explainData && (
              <div className="space-y-2 text-xs text-gray-300">
                {explainData.summary && <p className="p-2.5 bg-sky-950/30 border border-sky-800/40 rounded-xl">{explainData.summary}</p>}
                {explainData.steps?.map((step: string, i: number) => (
                  <div key={i} className="flex gap-2 p-2 bg-dark-bg/60 border border-dark-border rounded-xl">
                    <span className="text-sky-400 font-black text-[10px] w-5 shrink-0">{i + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
                {explainData.code && <CodeBlock code={explainData.code} copyKey="explain" />}
              </div>
            )}
          </SectionCard>

          {/* 3. Compare with Optimal */}
          <SectionCard
            icon={<GitCompare className="h-3.5 w-3.5 text-emerald-400" />}
            title="Compare with Optimal"
            color="border-emerald-500/20"
          >
            <AIButton onClick={handleCompare} loading={compareLoading} label="Compare My Code" icon={<GitCompare className="h-3.5 w-3.5" />} />
            {compareData && (
              <div className="space-y-2 text-xs text-gray-300">
                {compareData.userComplexity && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 bg-dark-bg border border-dark-border rounded-xl text-center">
                      <span className="text-[9px] text-gray-500 block">Your Complexity</span>
                      <span className="font-black text-white">{compareData.userComplexity}</span>
                    </div>
                    <div className="p-2.5 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-center">
                      <span className="text-[9px] text-gray-500 block">Optimal</span>
                      <span className="font-black text-emerald-400">{compareData.optimalComplexity}</span>
                    </div>
                  </div>
                )}
                {compareData.differences && <p className="p-2.5 bg-dark-bg border border-dark-border rounded-xl">{compareData.differences}</p>}
                {compareData.optimalCode && (
                  <>
                    <span className="text-[10px] text-emerald-400 font-bold block">Optimal Solution:</span>
                    <CodeBlock code={compareData.optimalCode} copyKey="compare" />
                  </>
                )}
              </div>
            )}
          </SectionCard>

          {/* 4. Complexity Analysis */}
          <SectionCard
            icon={<BarChart2 className="h-3.5 w-3.5 text-pink-400" />}
            title="Complexity Analysis"
            color="border-pink-500/20"
          >
            <AIButton onClick={handleComplexity} loading={complexityLoading} label="Analyze Complexity" icon={<BarChart2 className="h-3.5 w-3.5" />} />
            {complexityData && (
              <div className="space-y-2 text-xs text-gray-300">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-pink-950/30 border border-pink-800/40 rounded-xl text-center">
                    <span className="text-[9px] text-gray-500 block">Time</span>
                    <span className="font-black text-pink-400">{complexityData.time}</span>
                  </div>
                  <div className="p-2.5 bg-purple-950/30 border border-purple-800/40 rounded-xl text-center">
                    <span className="text-[9px] text-gray-500 block">Space</span>
                    <span className="font-black text-purple-400">{complexityData.space}</span>
                  </div>
                </div>
                {complexityData.explanation && <p className="p-2.5 bg-dark-bg border border-dark-border rounded-xl">{complexityData.explanation}</p>}
              </div>
            )}
          </SectionCard>

          {/* 5. Dry Run */}
          <SectionCard
            icon={<Flame className="h-3.5 w-3.5 text-orange-400" />}
            title="Dry Run Simulator"
            color="border-orange-500/20"
          >
            <input
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
              placeholder="Enter test input e.g. [2,7,11,15], 9"
              value={dryRunInput}
              onChange={e => setDryRunInput(e.target.value)}
            />
            <AIButton onClick={handleDryRun} loading={dryRunLoading} label="Run Step by Step" icon={<Flame className="h-3.5 w-3.5" />} />
            {dryRunData && (
              <div className="space-y-2 text-xs text-gray-300">
                {dryRunData.steps?.map((step: string, i: number) => (
                  <div key={i} className="flex gap-2 p-2 bg-orange-950/20 border border-orange-800/30 rounded-xl">
                    <span className="text-orange-400 font-black shrink-0">Step {i + 1}:</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* 6. Hints */}
          <SectionCard
            icon={<HelpCircle className="h-3.5 w-3.5 text-amber-400" />}
            title="Progressive Hints"
            color="border-amber-500/20"
          >
            {hintData.map((hint, i) => (
              <div key={i} className="p-2.5 bg-amber-950/20 border border-amber-800/30 rounded-xl text-xs text-gray-300">
                <span className="text-amber-400 font-bold block mb-1">Hint {i + 1}:</span>
                {hint}
              </div>
            ))}
            <AIButton onClick={handleHint} loading={hintLoading} label={hintData.length === 0 ? 'Get First Hint' : 'Next Hint'} icon={<HelpCircle className="h-3.5 w-3.5" />} />
          </SectionCard>

          {/* 7. Test Case Generator */}
          <SectionCard
            icon={<FlaskConical className="h-3.5 w-3.5 text-teal-400" />}
            title="Test Case Generator"
            color="border-teal-500/20"
          >
            <AIButton onClick={handleTestCases} loading={testLoading} label="Generate Edge Cases" icon={<FlaskConical className="h-3.5 w-3.5" />} />
            {testData?.testCases?.map((tc: any, i: number) => (
              <div key={i} className="p-2.5 bg-teal-950/20 border border-teal-800/30 rounded-xl text-xs">
                <span className="text-teal-400 font-bold">Case {i + 1}: {tc.label}</span>
                <p className="text-gray-400 mt-1">Input: <span className="font-mono text-gray-200">{tc.input}</span></p>
                <p className="text-gray-400">Expected: <span className="font-mono text-gray-200">{tc.expected}</span></p>
              </div>
            ))}
          </SectionCard>

          {/* 8. Mock Interview */}
          <SectionCard
            icon={<Mic className="h-3.5 w-3.5 text-rose-400" />}
            title="Mock Interview Mode"
            color="border-rose-500/20"
          >
            <AIButton onClick={handleInterview} loading={interviewLoading} label="Start Interview" icon={<Mic className="h-3.5 w-3.5" />} />
            {interviewQ && (
              <div className="space-y-2">
                <div className="p-2.5 bg-rose-950/20 border border-rose-800/30 rounded-xl text-xs text-gray-200">
                  <span className="text-rose-400 font-bold block mb-1">Interviewer:</span>
                  {interviewQ.question}
                </div>
                <textarea
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-rose-500/50 resize-none"
                  rows={3}
                  placeholder="Type your answer..."
                  value={interviewAnswer}
                  onChange={e => setInterviewAnswer(e.target.value)}
                />
                <button
                  onClick={handleInterviewSubmit}
                  disabled={interviewLoading}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-300 text-xs font-bold hover:bg-rose-600/30 transition-all disabled:opacity-50"
                >
                  {interviewLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  Submit Answer
                </button>
                {interviewFeedback && (
                  <div className="p-2.5 bg-dark-bg border border-dark-border rounded-xl text-xs text-gray-300">
                    <span className="text-rose-400 font-bold block mb-1">Feedback:</span>
                    {interviewFeedback}
                  </div>
                )}
              </div>
            )}
          </SectionCard>

          {/* 9. AI Chat */}
          <SectionCard
            icon={<MessageSquare className="h-3.5 w-3.5 text-indigo-400" />}
            title="Ask AI Anything"
            color="border-indigo-500/20"
            defaultOpen
          >
            <div className="max-h-48 overflow-y-auto space-y-2 mb-2">
              {chatMessages.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-2">Ask anything about this problem or your code...</p>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`p-2.5 rounded-xl text-xs ${msg.role === 'user' ? 'bg-indigo-950/30 border border-indigo-800/40 text-indigo-200 text-right' : 'bg-dark-bg border border-dark-border text-gray-300'}`}>
                  <span className={`text-[9px] font-bold block mb-1 ${msg.role === 'user' ? 'text-indigo-400' : 'text-violet-400'}`}>
                    {msg.role === 'user' ? 'You' : '🤖 AI'}
                  </span>
                  <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
                placeholder="Ask a question..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChat(); } }}
              />
              <button
                onClick={handleChat}
                disabled={chatLoading || !chatInput.trim()}
                className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 transition-all disabled:opacity-50"
              >
                {chatLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              </button>
            </div>
          </SectionCard>

          {/* 10. Score My Code */}
          <SectionCard
            icon={<Star className="h-3.5 w-3.5 text-yellow-400" />}
            title="Score My Submission"
            color="border-yellow-500/20"
          >
            <AIButton onClick={handleScore} loading={scoreLoading} label="Get My Score" icon={<Star className="h-3.5 w-3.5" />} />
            {scoreData && (
              <div className="space-y-2">
                <div className="flex items-center justify-center py-4">
                  <div className="relative w-20 h-20">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1e1b4b" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#7c3aed" strokeWidth="3" strokeDasharray={`${scoreData.total || 0}, 100`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-black text-white">{scoreData.total || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {scoreData.breakdown && Object.entries(scoreData.breakdown).map(([k, v]) => (
                    <div key={k} className="p-2 bg-dark-bg border border-dark-border rounded-xl">
                      <span className="text-[9px] text-gray-500 capitalize block">{k}</span>
                      <span className="font-black text-white">{String(v)}/25</span>
                    </div>
                  ))}
                </div>
                {scoreData.feedback && <p className="text-xs text-gray-400 p-2.5 bg-dark-bg border border-dark-border rounded-xl">{scoreData.feedback}</p>}
              </div>
            )}
          </SectionCard>

          {/* 11. Open in External AI */}
          <SectionCard
            icon={<ExternalLink className="h-3.5 w-3.5 text-cyan-400" />}
            title="Open in External AI"
            color="border-cyan-500/20"
          >
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={openInChatGPT}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-950/30 border border-emerald-700/40 hover:border-emerald-500/60 text-emerald-400 text-xs font-bold transition-all hover:shadow-lg hover:shadow-emerald-500/10"
              >
                <ExternalLink className="h-3.5 w-3.5" /> ChatGPT
              </button>
              <button
                onClick={openInGemini}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-blue-950/30 border border-blue-700/40 hover:border-blue-500/60 text-blue-400 text-xs font-bold transition-all hover:shadow-lg hover:shadow-blue-500/10"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Gemini
              </button>
            </div>
          </SectionCard>

        </div>
      </div>
    </div>
  );
};

// ─── Main CodingSandbox ─────────────────────────────────────────────────────
export const CodingSandbox: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { showToast } = useToast();

  const [problems, setProblems] = useState<any[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<Language>('java');

  // Panel states
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [solutionLoading, setSolutionLoading] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [solutionData, setSolutionData] = useState<any>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [copied, setCopied] = useState(false);

  // AI Assistant
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // Line count for gutter
  const lineCount = Math.max(15, code.split('\n').length + 2);

  // ── Data fetching ────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/coding/problems');
        setProblems(res.data.problems);
        if (res.data.problems.length > 0) setSelectedProblem(res.data.problems[0]);
      } catch {
        showToast('Failed to load coding problems.', 'error');
      }
    })();
  }, []);

  // ── Reset editor on problem / language change ───────────────────────────────
  useEffect(() => {
    if (!selectedProblem) return;
    setCode(buildDefaultTemplate(selectedProblem, language));
    setExecutionResult(null);
    setSubmissionResult(null);
    setSolutionData(null);
    setShowSolution(false);
  }, [selectedProblem, language]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleRunCode = async () => {
    if (!selectedProblem) return;
    setRunning(true);
    setExecutionResult(null);
    try {
      const res = await api.post('/coding/run', { problemId: selectedProblem.id, code, language });
      setExecutionResult(res.data);
      const allPassed = res.data.results?.every((r: any) => r.status === 'Passed');
      showToast(allPassed ? '✅ All test cases passed!' : '❌ Some test cases failed.', allPassed ? 'success' : 'warning');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Execution failed.', 'error');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!selectedProblem) return;
    setSubmitting(true);
    setSubmissionResult(null);
    setExecutionResult(null);
    try {
      const res = await api.post('/coding/submit', { problemId: selectedProblem.id, code, language });
      setSubmissionResult(res.data.submission);
      setExecutionResult({ results: res.data.runLogs });
      if (res.data.submission?.status === 'Accepted') {
        showToast('🎉 Accepted! All test cases passed. +70 XP earned.', 'success');
      } else {
        showToast(`Submission: ${res.data.submission?.status || 'Failed'}`, 'warning');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Submission failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewSolution = async () => {
    if (!selectedProblem) return;
    if (solutionData) { setShowSolution(v => !v); return; }
    setSolutionLoading(true);
    try {
      const res = await api.post('/coding/solution', { problemId: selectedProblem.id, language });
      setSolutionData(res.data);
      setShowSolution(true);
      showToast('📖 Solution loaded. Study the approach before using it!', 'info');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load solution.', 'error');
    } finally {
      setSolutionLoading(false);
    }
  };

  const handleUseSolution = (codeStr: string) => {
    setCode(codeStr);
    showToast('Solution loaded into editor. Try understanding it before submitting!', 'success');
  };

  const handleUseCorrection = (codeStr: string) => {
    setCode(codeStr);
    showToast('✅ Corrected code loaded into editor!', 'success');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copied to clipboard.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    if (!selectedProblem) return;
    setCode(buildDefaultTemplate(selectedProblem, language));
    setExecutionResult(null);
    setSubmissionResult(null);
    showToast('Editor reset to default template.', 'info');
  };

  // ── Difficulty badge styling ─────────────────────────────────────────────────
  const diffBadge = (diff: string) => {
    if (diff === 'Easy') return 'bg-emerald-950/20 border-emerald-900/50 text-emerald-400';
    if (diff === 'Hard') return 'bg-red-950/20 border-red-900/50 text-red-400';
    return 'bg-amber-950/20 border-amber-900/50 text-amber-400';
  };

  return (
    <>
      {/* AI Assistant Slide-in Panel */}
      {showAIAssistant && selectedProblem && (
        <AIAssistantPanel
          problem={selectedProblem}
          code={code}
          language={language}
          onClose={() => setShowAIAssistant(false)}
        />
      )}

      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary-400" />
              <span>Integrated Coding Workspace</span>
            </h2>
            <p className="text-xs text-gray-400">
              Solve DSA rounds. Write code, test assertions, view solutions, and review AI Big-O complexity optimizations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* 🤖 AI Assistant button */}
            {selectedProblem && (
              <button
                onClick={() => setShowAIAssistant(v => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all"
              >
                <Bot className="h-4 w-4" />
                AI Assistant
                <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[9px] font-black">NEW</span>
              </button>
            )}

            {/* Problem selector badges */}
            <div className="flex flex-wrap gap-2 max-w-xl justify-end">
              {problems.map((prob) => (
                <button
                  key={prob.id}
                  onClick={() => setSelectedProblem(prob)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                    selectedProblem?.id === prob.id
                      ? 'bg-primary-500/10 border-primary-500 text-primary-400 shadow-inner'
                      : 'bg-dark-card border-dark-border text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {prob.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {selectedProblem && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            {/* ── LEFT PANEL ──────────────────────────────────────────────────── */}
            <div className="space-y-5">

              {/* Problem description */}
              <GlassCard className="space-y-4">
                <div className="flex items-center justify-between border-b border-dark-border pb-3">
                  <h3 className="text-base font-extrabold text-white">{selectedProblem.title}</h3>
                  <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${diffBadge(selectedProblem.difficulty)}`}>
                    {selectedProblem.difficulty}
                  </span>
                </div>
                <div className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {selectedProblem.description}
                </div>
                <hr className="border-dark-border" />
                <div className="space-y-2 text-xs">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Example I/O</p>
                  <div className="bg-dark-bg p-3.5 rounded-xl border border-dark-border space-y-1 font-mono text-[10px] leading-relaxed">
                    <p><span className="text-primary-400">Input:</span> {selectedProblem.inputFormat}</p>
                    <p><span className="text-accent-pink">Output:</span> {selectedProblem.outputFormat}</p>
                  </div>
                </div>

                {/* View Solution toggle */}
                <button
                  onClick={handleViewSolution}
                  disabled={solutionLoading}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-accent-purple/30 bg-accent-purple/5 hover:bg-accent-purple/10 text-accent-purple text-xs font-bold transition-all"
                >
                  {solutionLoading
                    ? <><div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-accent-purple" /> Loading Solution...</>
                    : showSolution
                      ? <><EyeOff className="h-3.5 w-3.5" /> Hide Solution</>
                      : <><Eye className="h-3.5 w-3.5" /> View Solution</>
                  }
                </button>

                {/* AI Assistant quick-launch */}
                <button
                  onClick={() => setShowAIAssistant(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-violet-500/30 bg-gradient-to-r from-violet-600/10 to-purple-600/10 hover:from-violet-600/20 hover:to-purple-600/20 text-violet-400 text-xs font-bold transition-all"
                >
                  <Bot className="h-3.5 w-3.5" />
                  Open AI Assistant
                  <Sparkles className="h-3.5 w-3.5" />
                </button>
              </GlassCard>

              {/* Solution panel */}
              {showSolution && solutionData && (
                <GlassCard className="space-y-4 border-accent-purple/20" glow>
                  <div className="flex items-center justify-between border-b border-dark-border pb-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-accent-purple" />
                      <span>Optimal Solution — {LANG_LABELS[language]}</span>
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUseSolution(solutionData.solution)}
                        className="px-2 py-1 rounded bg-accent-purple/10 border border-accent-purple/30 hover:bg-accent-purple/20 text-accent-purple text-[10px] font-black transition-all"
                      >
                        Load into Editor
                      </button>
                      <button
                        onClick={() => handleCopy(solutionData.solution)}
                        className="p-1 rounded bg-dark-bg border border-dark-border hover:bg-dark-hover text-gray-400 hover:text-white transition-colors"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Clipboard className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  {solutionData.explanation && (
                    <div className="p-3 bg-dark-bg/60 border border-accent-purple/10 rounded-xl text-[11px] text-gray-300 leading-relaxed">
                      <span className="text-accent-purple font-bold block mb-1">📋 Approach</span>
                      {solutionData.explanation}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 bg-dark-bg border border-dark-border rounded-xl">
                      <span className="text-[9px] uppercase font-bold text-gray-500 block">Time Complexity</span>
                      <span className="text-xs font-black text-white">{solutionData.timeComplexity || 'O(N)'}</span>
                    </div>
                    <div className="p-2.5 bg-dark-bg border border-dark-border rounded-xl">
                      <span className="text-[9px] uppercase font-bold text-gray-500 block">Space Complexity</span>
                      <span className="text-xs font-black text-white">{solutionData.spaceComplexity || 'O(1)'}</span>
                    </div>
                  </div>

                  <pre className="bg-dark-bg p-4 border border-dark-border rounded-xl font-mono text-[10px] text-emerald-400 overflow-x-auto leading-relaxed max-h-64">
                    <code>{solutionData.solution}</code>
                  </pre>
                </GlassCard>
              )}

              {/* Execution output */}
              {executionResult && (
                <GlassCard className="space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-primary-400" />
                    <span>Execution Output Console</span>
                    {executionResult.consoleLog && (
                      <span className="text-[9px] text-gray-500 font-normal normal-case ml-auto">{executionResult.consoleLog}</span>
                    )}
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    {executionResult.results?.map((tc: any) => (
                      <div
                        key={tc.testCaseIndex}
                        className={`p-3.5 rounded-xl border text-xs font-medium ${
                          tc.status === 'Passed'
                            ? 'bg-emerald-950/10 border-emerald-900/50 text-emerald-400'
                            : tc.status === 'Error'
                              ? 'bg-orange-950/10 border-orange-900/50 text-orange-400'
                              : 'bg-red-950/10 border-red-900/50 text-red-400'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1 min-w-0">
                            <span className="text-[10px] uppercase font-bold block">
                              Case {tc.testCaseIndex} — {tc.status}
                            </span>
                            <p className="text-[10px] text-gray-400 truncate">Input: {tc.input} • {tc.durationMs}ms</p>
                            {tc.error && <p className="text-[10px] font-mono mt-1 text-orange-300 break-words">{tc.error}</p>}
                            {tc.logs && (
                              <div className="mt-2 p-2 bg-dark-bg/60 border border-dark-border/50 rounded text-[9px] font-mono text-gray-300">
                                <span className="text-gray-500 font-bold block mb-1">stdout:</span>
                                <pre className="whitespace-pre-wrap">{tc.logs}</pre>
                              </div>
                            )}
                          </div>
                          <div className="text-right text-[10px] font-mono leading-normal shrink-0">
                            <p><span className="text-gray-500">Exp:</span> {tc.expected}</p>
                            <p><span className="text-gray-300">Got:</span> {tc.output || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* AI Review after submission */}
              {submissionResult?.aiReview && (
                <GlassCard className="space-y-4 border-accent-purple/20" glow>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-dark-border pb-3">
                    <Cpu className="h-4 w-4 text-accent-purple" />
                    <span>AI Code Review & Complexity Optimization</span>
                    {submissionResult.status && (
                      <span className={`ml-auto px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                        submissionResult.status === 'Accepted'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}>
                        {submissionResult.status}
                      </span>
                    )}
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-dark-bg border border-dark-border rounded-xl">
                      <span className="text-[9px] uppercase font-bold text-gray-500 block">Time Complexity</span>
                      <span className="text-xs font-black text-white">{submissionResult.aiReview.timeComplexity}</span>
                    </div>
                    <div className="p-3 bg-dark-bg border border-dark-border rounded-xl">
                      <span className="text-[9px] uppercase font-bold text-gray-500 block">Space Complexity</span>
                      <span className="text-xs font-black text-white">{submissionResult.aiReview.spaceComplexity}</span>
                    </div>
                  </div>

                  {submissionResult.aiReview.codeSmells?.filter((s: string) => s && s !== 'None detected.').length > 0 && (
                    <div>
                      <span className="text-[9px] uppercase font-bold text-red-400 flex items-center gap-1 mb-1">
                        <AlertTriangle className="h-3 w-3" /> Code Smells Detected
                      </span>
                      <ul className="list-disc pl-4 text-xs text-gray-400 space-y-1">
                        {submissionResult.aiReview.codeSmells.map((smell: string, i: number) => (
                          <li key={i}>{smell}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {submissionResult.aiReview.optimizationSuggestions?.length > 0 && (
                    <div>
                      <span className="text-[9px] uppercase font-bold text-accent-purple block mb-1">Optimization Guidelines</span>
                      <ul className="list-disc pl-4 text-xs text-gray-400 space-y-1">
                        {submissionResult.aiReview.optimizationSuggestions.map((sug: string, i: number) => (
                          <li key={i}>{sug}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {submissionResult.aiReview.refactoredCode && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase font-bold text-emerald-400">Refactored Clean Code</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUseCorrection(submissionResult.aiReview.refactoredCode)}
                            className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-black transition-all flex items-center gap-1"
                          >
                            <ChevronRight className="h-3 w-3" /> Use Corrected Code
                          </button>
                          <button
                            onClick={() => handleCopy(submissionResult.aiReview.refactoredCode)}
                            className="p-1 rounded bg-dark-bg border border-dark-border hover:bg-dark-hover text-gray-400 hover:text-white transition-colors"
                          >
                            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Clipboard className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                      <pre className="bg-dark-bg p-4 border border-dark-border rounded-xl font-mono text-[10px] text-gray-300 overflow-x-auto leading-relaxed max-h-60">
                        <code>{submissionResult.aiReview.refactoredCode}</code>
                      </pre>
                    </div>
                  )}
                </GlassCard>
              )}
            </div>

            {/* ── RIGHT PANEL: Editor ─────────────────────────────────────────── */}
            <div className="sticky top-6">
              <GlassCard className="flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-dark-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Editor Console</span>
                    <span className="px-2 py-0.5 rounded bg-amber-900/20 border border-amber-500/30 text-[9px] text-amber-400 font-bold">
                      Sandbox
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReset}
                      title="Reset to default template"
                      className="p-1 rounded border border-dark-border bg-dark-bg hover:bg-dark-hover text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as Language)}
                      className="bg-dark-bg border border-dark-border rounded-xl px-3 py-1.5 text-xs text-white cursor-pointer focus:outline-none"
                    >
                      {(Object.entries(LANG_LABELS) as [Language, string][]).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Code editor area */}
                <div className="relative border border-dark-border rounded-xl overflow-hidden bg-[#070A13]">
                  <div className="flex font-mono text-[10px] select-none text-gray-700 bg-dark-bg/60 border-b border-dark-border/40 px-4 py-1.5 justify-between items-center">
                    <span>{LANG_FILENAMES[language]}</span>
                    <span className="text-gray-600">{code.split('\n').length} lines</span>
                  </div>
                  <div className="flex">
                    {/* Line numbers */}
                    <div className="w-10 py-3 text-right pr-2 text-gray-700 bg-dark-bg/30 text-[10px] font-mono border-r border-dark-border/40 select-none leading-relaxed shrink-0">
                      {Array.from({ length: lineCount }).map((_, i) => (
                        <div key={i}>{i + 1}</div>
                      ))}
                    </div>
                    {/* Code textarea */}
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      spellCheck={false}
                      autoCapitalize="off"
                      autoCorrect="off"
                      className="w-full bg-transparent px-4 py-3 text-xs text-emerald-400 placeholder-gray-700 focus:outline-none resize-none code-editor-textarea leading-relaxed font-mono"
                      style={{ minHeight: '24rem' }}
                      onKeyDown={(e) => {
                        if (e.key === 'Tab') {
                          e.preventDefault();
                          const el = e.currentTarget;
                          const start = el.selectionStart;
                          const end = el.selectionEnd;
                          const newVal = code.substring(0, start) + '    ' + code.substring(end);
                          setCode(newVal);
                          setTimeout(() => { el.selectionStart = el.selectionEnd = start + 4; }, 0);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-3 border-t border-dark-border pt-4">
                  <Button
                    variant="secondary"
                    onClick={handleRunCode}
                    loading={running}
                    disabled={submitting || solutionLoading}
                    className="flex items-center gap-1.5"
                  >
                    <Play className="h-4 w-4 text-primary-400 fill-primary-400" />
                    <span>Run Test Cases</span>
                  </Button>

                  <Button
                    onClick={handleSubmitCode}
                    loading={submitting}
                    disabled={running || solutionLoading}
                    variant="primary"
                    className="flex items-center gap-1.5"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Submit Assessment</span>
                  </Button>
                </div>
              </GlassCard>
            </div>
          </div>
        )}
      </div>

      {/* Slide-in animation */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
};
