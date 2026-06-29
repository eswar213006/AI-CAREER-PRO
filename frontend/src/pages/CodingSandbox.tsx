import React, { useEffect, useState } from 'react';
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

        {/* Problem selector badges */}
        <div className="flex flex-wrap gap-2 max-w-2xl justify-end">
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
                      // Tab key inserts 4 spaces
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
  );
};
