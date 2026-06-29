import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { 
  HelpCircle, MessageSquare, Send, Bot, Play, RotateCcw,
  CheckCircle, AlertCircle, Award, Volume2, Mic, MicOff
} from 'lucide-react';
import api from '../utils/api';

interface FeedbackReport {
  grammarScore: number;
  communicationScore: number;
  confidenceScore: number;
  feedbackText: string;
}

export const MockHRInterview: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [reports, setReports] = useState<Record<number, FeedbackReport>>({});
  const [recording, setRecording] = useState(false);

  const QUESTIONS = [
    { id: '1', category: 'Behavioral', q: 'Tell me about a time you had to deal with a difficult teammate. How did you resolve the conflict?' },
    { id: '2', category: 'Resume', q: 'Walk me through the most technically challenging project listed on your resume. What did you learn?' },
    { id: '3', category: 'Leadership', q: 'Describe a situation where you had to lead a project under tight constraints. How did you organize the team?' },
    { id: '4', category: 'Conflict', q: 'How do you handle negative feedback from a project supervisor or team coordinator?' }
  ];

  const handleEvaluate = async () => {
    const answer = answers[activeQuestionIdx] || '';
    if (!answer.trim()) {
      showToast('Please type an answer to evaluate.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/hr-mock/evaluate', { question: QUESTIONS[activeQuestionIdx].q, answer });
      setReports({ ...reports, [activeQuestionIdx]: res.data });
      showToast('Response evaluated!', 'success');
    } catch {
      // Mock evaluation matching answer density
      const len = answer.trim().length;
      const gScore = Math.min(65 + Math.floor(len / 6), 96);
      const cScore = Math.min(60 + Math.floor(len / 5), 94);
      const conf = len > 80 ? 90 : 70;
      
      setReports({
        ...reports,
        [activeQuestionIdx]: {
          grammarScore: gScore,
          communicationScore: cScore,
          confidenceScore: conf,
          feedbackText: len > 80
            ? '✅ Strong logical structure and detailed answer. Good job detailing the action taken. Consider using more standard industry buzzwords.'
            : '⚠️ The response is slightly short. Try to elaborate on your actions and target outcomes using the STAR method (Situation, Task, Action, Result).'
        }
      });
      showToast('Response evaluated (Offline Mode).', 'success');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveQuestionIdx(i => (i + 1) % QUESTIONS.length);
  };

  const handleReset = () => {
    setAnswers({ ...answers, [activeQuestionIdx]: '' });
    const nextReports = { ...reports };
    delete nextReports[activeQuestionIdx];
    setReports(nextReports);
  };

  const toggleRecording = () => {
    if (recording) {
      setAnswers({ ...answers, [activeQuestionIdx]: (answers[activeQuestionIdx] || '') + ' I worked with my team to map database indexes.' });
      showToast('Voice transcription finished.', 'success');
    } else {
      showToast('Simulating microphone capture...', 'info');
    }
    setRecording(!recording);
  };

  const currentQ = QUESTIONS[activeQuestionIdx];
  const currentReport = reports[activeQuestionIdx];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary-400" />
          <span>AI Behavioral & HR Interview Simulator</span>
        </h2>
        <p className="text-xs text-gray-400">
          Simulate behavioral hiring rounds. Input your response (text or audio transcription) and get immediate feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left Panel: Question card & Text Input */}
        <div className="lg:col-span-2 flex flex-col justify-between space-y-6">
          <GlassCard className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-dark-border pb-3">
                <span className="text-[9px] uppercase font-black px-2.5 py-0.5 rounded border border-rose-500/20 bg-rose-600/10 text-rose-400">
                  {currentQ.category}
                </span>
                <span className="text-[10px] text-gray-500 font-bold">
                  Question {activeQuestionIdx + 1} of {QUESTIONS.length}
                </span>
              </div>

              {/* Bot statement */}
              <div className="flex gap-3 items-start">
                <div className="p-2 rounded-xl bg-rose-600/10 border border-rose-500/20 text-rose-400 shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">HR Representative</h4>
                  <p className="text-[11px] text-gray-300 leading-relaxed mt-0.5">{currentQ.q}</p>
                </div>
              </div>

              {/* Text Answer */}
              <div className="space-y-2 pt-4">
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-500">
                  <span>YOUR ANSWER</span>
                  <button onClick={toggleRecording} className="flex items-center gap-1 hover:text-white transition-colors text-rose-400">
                    {recording ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                    <span>{recording ? 'Stop Recording' : 'Speak Answer'}</span>
                  </button>
                </div>
                <textarea
                  className="w-full bg-dark-bg border border-dark-border rounded-xl p-3.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-rose-500/50 resize-none leading-relaxed"
                  rows={6}
                  placeholder="Type your structured answer here (Try using the STAR format)..."
                  value={answers[activeQuestionIdx] || ''}
                  onChange={e => setAnswers({ ...answers, [activeQuestionIdx]: e.target.value })}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2.5 border-t border-dark-border/20 pt-4 mt-6">
              <button
                onClick={handleReset}
                className="px-3 py-2 rounded-xl border border-dark-border bg-dark-bg hover:bg-dark-hover text-gray-400 hover:text-white text-xs transition-all flex items-center gap-1"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
              
              <Button
                onClick={handleEvaluate}
                loading={loading}
                className="px-4 py-2 flex items-center gap-1 bg-rose-600/20 border border-rose-500/30 text-rose-300 hover:bg-rose-600/30"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Evaluate Answer</span>
              </Button>

              <Button
                onClick={handleNext}
                variant="secondary"
                className="px-3 py-2"
              >
                <span>Next Question</span>
              </Button>
            </div>
          </GlassCard>
        </div>

        {/* Right Panel: Feedback report */}
        <GlassCard className="h-full flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-dark-border pb-3">
            <Award className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-extrabold text-white uppercase tracking-wider">Evaluation & Scores</span>
          </div>

          {currentReport ? (
            <div className="flex-1 flex flex-col justify-between py-4 space-y-4 text-xs">
              <div className="space-y-4">
                {/* Score breakdown metrics */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400">
                      <span>Grammar & Tone</span>
                      <span>{currentReport.grammarScore}%</span>
                    </div>
                    <div className="h-1.5 bg-dark-bg rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${currentReport.grammarScore}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400">
                      <span>STAR Communication Flow</span>
                      <span>{currentReport.communicationScore}%</span>
                    </div>
                    <div className="h-1.5 bg-dark-bg rounded-full overflow-hidden">
                      <div className="h-full bg-sky-400 rounded-full" style={{ width: `${currentReport.communicationScore}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400">
                      <span>Vocabulary Confidence</span>
                      <span>{currentReport.confidenceScore}%</span>
                    </div>
                    <div className="h-1.5 bg-dark-bg rounded-full overflow-hidden">
                      <div className="h-full bg-rose-450 rounded-full" style={{ width: `${currentReport.confidenceScore}%` }} />
                    </div>
                  </div>
                </div>

                {/* Feedback text */}
                <div className="p-3 bg-dark-bg border border-dark-border rounded-xl leading-relaxed text-gray-300">
                  <span className="text-[9px] uppercase font-bold text-rose-400 block mb-1">Evaluator Notes</span>
                  {currentReport.feedbackText}
                </div>
              </div>

              <div className="border-t border-dark-border/20 pt-4 mt-6 text-[10px] text-gray-500 leading-relaxed italic">
                Tip: Speak clearly, pause between logical sections, and always start with a brief context outline.
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 space-y-2 py-10">
              <MessageSquare className="h-10 w-10 text-gray-650" />
              <p className="text-xs font-semibold">No feedback generated yet.</p>
              <p className="text-[10px] text-gray-650 max-w-xs px-4">Provide your response on the left and submit it to see comprehensive scores.</p>
            </div>
          )}
        </GlassCard>

      </div>
    </div>
  );
};
export default MockHRInterview;
