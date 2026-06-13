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
  ChevronRight,
  BookOpen
} from 'lucide-react';
import type { RootState } from '../store';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import api from '../utils/api';

export const CodingSandbox: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { showToast } = useToast();

  const [problems, setProblems] = useState<any[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<'javascript' | 'java' | 'python'>('javascript');
  
  // Execution states
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Fetch problems list
  const fetchProblems = async () => {
    try {
      const response = await api.get('/coding/problems');
      setProblems(response.data.problems);
      if (response.data.problems.length > 0) {
        setSelectedProblem(response.data.problems[0]);
      }
    } catch (err) {
      showToast('Failed to load coding problems.', 'error');
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  // Update default code templates on language/problem switch
  useEffect(() => {
    if (selectedProblem) {
      setCode(selectedProblem.defaultTemplates[language] || '');
      setExecutionResult(null);
      setSubmissionResult(null);
    }
  }, [selectedProblem, language]);

  const handleRunCode = async () => {
    if (!selectedProblem) return;
    setRunning(true);
    setExecutionResult(null);

    try {
      const response = await api.post('/coding/run', {
        problemId: selectedProblem.id,
        code,
        language
      });
      setExecutionResult(response.data);
      showToast('Code executed successfully!', 'success');
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
      const response = await api.post('/coding/submit', {
        problemId: selectedProblem.id,
        code,
        language
      });
      setSubmissionResult(response.data.submission);
      setExecutionResult({ results: response.data.runLogs });
      
      if (response.data.submission.status === 'Accepted') {
        showToast('Accepted! All test cases passed. +70 XP earned.', 'success');
      } else {
        showToast(`Submission ended with status: ${response.data.submission.status}`, 'warning');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Submission failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Code copied to clipboard.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary-400" />
            <span>Integrated Coding Workspace</span>
          </h2>
          <p className="text-xs text-gray-400">Solve DSA rounds. Write code, test assertions, and review AI Big-O complexity optimizations.</p>
        </div>

        {/* Problem selector badges */}
        <div className="flex flex-wrap gap-2">
          {problems.map((prob) => (
            <button
              key={prob.id}
              onClick={() => setSelectedProblem(prob)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
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
          {/* Left Panel: Description */}
          <div className="space-y-6">
            <GlassCard className="space-y-4">
              <div className="flex items-center justify-between border-b border-dark-border pb-3">
                <h3 className="text-base font-extrabold text-white">{selectedProblem.title}</h3>
                <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                  selectedProblem.difficulty === 'Easy' 
                    ? 'bg-emerald-950/20 border border-emerald-900/50 text-emerald-400' 
                    : 'bg-amber-950/20 border border-amber-900/50 text-amber-400'
                }`}>
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
            </GlassCard>

            {/* Test Case execution results console */}
            {executionResult && (
              <GlassCard className="space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="h-4.5 w-4.5 text-primary-400" />
                  <span>Execution Output Console</span>
                </h3>
                
                <div className="flex flex-col gap-2.5">
                  {executionResult.results?.map((tc: any) => (
                    <div
                      key={tc.testCaseIndex}
                      className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium ${
                        tc.status === 'Passed'
                          ? 'bg-emerald-950/10 border-emerald-900/50 text-emerald-400'
                          : 'bg-red-950/10 border-red-900/50 text-red-400'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold block">Case {tc.testCaseIndex} Status: {tc.status}</span>
                        <p className="text-[10px] text-gray-400">Input: {tc.input} • Time: {tc.durationMs}ms</p>
                        {tc.error && <p className="text-[10px] text-red-400 font-mono mt-1">{tc.error}</p>}
                        {tc.logs && (
                          <div className="mt-2 p-2 bg-dark-bg/60 border border-dark-border/50 rounded text-[9px] font-mono text-gray-300">
                            <span className="text-gray-500 font-bold block mb-1">console.log output:</span>
                            <pre className="whitespace-pre-wrap leading-relaxed">{tc.logs}</pre>
                          </div>
                        )}
                      </div>
                      <div className="text-right text-[10px] font-mono leading-normal">
                        <p><span className="text-gray-500">Exp:</span> {tc.expected}</p>
                        <p><span className="text-gray-300">Got:</span> {tc.output || 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* AI Review Optimizer Report */}
            {submissionResult && submissionResult.aiReview && (
              <GlassCard className="space-y-4 border-accent-purple/20" glow>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-dark-border pb-3">
                  <Cpu className="h-4.5 w-4.5 text-accent-purple" />
                  <span>AI Code review & Complexity Optimization</span>
                </h3>

                {/* Complexities */}
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

                {/* Suggestions and Smells */}
                <div className="space-y-3">
                  {submissionResult.aiReview.codeSmells?.length > 0 && (
                    <div>
                      <span className="text-[9px] uppercase font-bold text-red-400 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Code Smells Detected</span>
                      </span>
                      <ul className="list-disc pl-4 text-xs text-gray-400 mt-1 leading-normal space-y-1">
                        {submissionResult.aiReview.codeSmells.map((smell: string, idx: number) => (
                          <li key={idx}>{smell}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <span className="text-[9px] uppercase font-bold text-accent-purple">Optimization Guidelines</span>
                    <ul className="list-disc pl-4 text-xs text-gray-400 mt-1 leading-normal space-y-1">
                      {submissionResult.aiReview.optimizationSuggestions.map((sug: string, idx: number) => (
                        <li key={idx}>{sug}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Optimized snippet */}
                {submissionResult.aiReview.refactoredCode && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase font-bold text-emerald-400">Refactored Clean Code</span>
                      <button
                        onClick={() => handleCopyCode(submissionResult.aiReview.refactoredCode)}
                        className="p-1 rounded bg-dark-bg border border-dark-border hover:bg-dark-hover transition-colors text-gray-400 hover:text-white"
                        title="Copy code"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Clipboard className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <pre className="bg-dark-bg p-4 border border-dark-border rounded-xl font-mono text-[10px] text-gray-300 overflow-x-auto leading-relaxed max-h-60">
                      <code>{submissionResult.aiReview.refactoredCode}</code>
                    </pre>
                  </div>
                )}
              </GlassCard>
            )}
          </div>

          {/* Right Panel: Editor panel */}
          <GlassCard className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-dark-border pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Editor Console</span>
                {language !== 'javascript' && (
                  <span className="px-2 py-0.5 rounded bg-amber-900/20 border border-amber-500/30 text-[9px] text-amber-400 font-bold ml-2" title="Java and Python run in mock static analysis mode. Use JavaScript for full VM execution.">
                    Static Mock Mode
                  </span>
                )}
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-dark-bg border border-dark-border rounded-xl px-3 py-1.5 text-xs text-white cursor-pointer focus:outline-none"
              >
                <option value="javascript">JavaScript (ES6)</option>
                <option value="java">Java (JDK 17)</option>
                <option value="python">Python 3</option>
              </select>
            </div>

            {/* Code Textarea Area */}
            <div className="relative border border-dark-border rounded-xl overflow-hidden bg-[#070A13]">
              <div className="flex font-mono text-[10px] select-none text-gray-700 bg-dark-bg/60 border-b border-dark-border/40 px-4 py-1.5">
                <span>{language === 'javascript' ? 'index.js' : language === 'java' ? 'Solution.java' : 'solution.py'}</span>
              </div>
              <div className="flex">
                {/* Simulated Line numbers */}
                <div className="w-9 py-3 text-right pr-2 text-gray-600 bg-dark-bg/30 text-[10px] font-mono border-r border-dark-border/40 select-none">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                {/* Code inputs */}
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck="false"
                  className="w-full bg-transparent px-4 py-3 text-xs text-emerald-400 placeholder-gray-700 focus:outline-none resize-none code-editor-textarea h-96 leading-relaxed font-mono"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 border-t border-dark-border pt-4">
              <Button
                variant="secondary"
                onClick={handleRunCode}
                loading={running}
                disabled={submitting}
                className="flex items-center gap-1.5"
              >
                <Play className="h-4 w-4 text-primary-400 fill-primary-400" />
                <span>Run Test Cases</span>
              </Button>
              
              <Button
                onClick={handleSubmitCode}
                loading={submitting}
                disabled={running}
                variant="primary"
                className="flex items-center gap-1.5"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Submit Assessment</span>
              </Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
