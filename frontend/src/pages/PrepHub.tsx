import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BookOpen, CheckCircle, HelpCircle, FileText, Check, X, Award, Sparkles, Map, ChevronRight } from 'lucide-react';
import type { RootState } from '../store';
import { updateUser } from '../store/authSlice';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import api from '../utils/api';

interface SubjectInfo {
  key: string;
  name: string;
  badge: string;
  notes: string[];
}

export const PrepHub: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const [activeSubject, setActiveSubject] = useState<string>('java');
  const [mcqBank, setMcqBank] = useState<Record<string, any[]>>({});
  const [progress, setProgress] = useState<any>(null);
  
  // MCQ state
  const [currentMcqIdx, setCurrentMcqIdx] = useState(0);
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const subjects: SubjectInfo[] = [
    {
      key: 'java',
      name: 'Java & OOPs',
      badge: 'OOPs, Threads, Collections',
      notes: [
        'Inheritance: Mechanism where a child object acquires properties of a parent class. Supports code reusability.',
        'Polymorphism: Capability of a method to perform differently based on the calling object (Method Overloading vs. Overriding).',
        'Abstraction: Process of hiding details and showing essential declarations (Abstract classes vs. Interfaces).',
        'Encapsulation: Binding data attributes and setter methods into a single class container to protect access.',
        'HashMap: Works on the principle of hashing. Has O(1) time complexity for search/inserts but is not thread-safe.'
      ]
    },
    {
      key: 'dbms',
      name: 'DBMS & SQL',
      badge: 'Normal forms, Transactions, Joins',
      notes: [
        'Normalization: Process of organizing database structures to reduce redundancy and maintain integrity (1NF, 2NF, 3NF, BCNF).',
        'ACID Properties: Atomicity (all or nothing), Consistency, Isolation (independent execution), and Durability (persistence).',
        'Indexes: Data structures (typically B-Trees) that speed up query retrieves at the cost of slower writes.',
        'Primary Key vs. Unique Key: Primary Key cannot accept null values and is unique; Unique Key accepts a single null entry.'
      ]
    },
    {
      key: 'os',
      name: 'Operating Systems',
      badge: 'Processes, Paging, Scheduling',
      notes: [
        'Process vs. Thread: A Process is a heavy running program with its own memory; a Thread is a lightweight sub-task sharing resources.',
        'Virtual Memory: Memory management technique creating an illusion of larger main memory using disk paging.',
        'Deadlock: State where threads are blocked waiting for resources held by each other. Conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.'
      ]
    },
    {
      key: 'networks',
      name: 'Computer Networks',
      badge: 'OSI layers, TCP/UDP, DNS',
      notes: [
        'OSI Model: 7 Layers: Physical, Data Link, Network (IP routing), Transport (TCP/UDP segments), Session, Presentation, Application.',
        'TCP vs. UDP: TCP is connection-oriented, reliable, and performs handshakes; UDP is connectionless, fast, and prone to packet losses.',
        'HTTP vs. HTTPS: HTTPS encrypts packet data using SSL/TLS protocols over port 443; HTTP uses port 80 in plain text.'
      ]
    },
    {
      key: 'aptitude',
      name: 'Quantitative Aptitude',
      badge: 'Time-speed, Work, Ratio',
      notes: [
        'Time & Distance: Speed = Distance / Time. To convert m/s to km/h, multiply by 18/5. To convert km/h to m/s, multiply by 5/18.',
        'Time & Work: If A can do a task in X days, A\'s 1-day work is 1/X. If A and B work together: 1/Total = 1/X + 1/Y.',
        'Percentages: Profit% = (Profit / Cost Price) * 100. Loss% = (Loss / Cost Price) * 100.'
      ]
    }
  ];

  const fetchMcqs = async () => {
    try {
      const mcqResponse = await api.get('/learning/mcqs');
      setMcqBank(mcqResponse.data.bank);
      
      const progResponse = await api.get('/learning/progress');
      setProgress(progResponse.data.progress);
    } catch (err) {
      showToast('Failed to load practice quizzes.', 'error');
    }
  };

  useEffect(() => {
    fetchMcqs();
  }, []);

  useEffect(() => {
    // Reset MCQ console when subject changes
    setCurrentMcqIdx(0);
    setSelectedAnswerIdx(null);
    setChecked(false);
  }, [activeSubject]);

  const handleCheckAnswer = async () => {
    if (selectedAnswerIdx === null || !mcqBank[activeSubject]) return;
    
    const activeMcqList = mcqBank[activeSubject];
    const mcq = activeMcqList[currentMcqIdx];
    const correct = selectedAnswerIdx === mcq.answer;
    
    setIsCorrect(correct);
    setChecked(true);

    try {
      const response = await api.post('/learning/mcq/submit', {
        subjectKey: activeSubject,
        questionId: mcq.id,
        isCorrect: correct
      });

      // Update progress levels
      setProgress(response.data.progress);
      
      // Update Redux XP points
      if (response.data.xpEarned > 0 && user) {
        const updatedUser = {
          ...user,
          stats: {
            ...user.stats,
            xp: user.stats.xp + response.data.xpEarned
          }
        };
        dispatch(updateUser(updatedUser));
        showToast(correct ? `Correct! +15 XP earned.` : `Incorrect. +5 XP earned.`, correct ? 'success' : 'info');
      }
    } catch (err) {
      showToast('Failed to register score.', 'error');
    }
  };

  const handleNextQuestion = () => {
    const activeMcqList = mcqBank[activeSubject] || [];
    if (currentMcqIdx < activeMcqList.length - 1) {
      setCurrentMcqIdx((prev) => prev + 1);
      setSelectedAnswerIdx(null);
      setChecked(false);
    } else {
      showToast('You completed all MCQs in this section! Feel free to review notes.', 'success');
      setCurrentMcqIdx(0);
      setSelectedAnswerIdx(null);
      setChecked(false);
    }
  };

  const activeMcqs = mcqBank[activeSubject] || [];
  const currentMcq = activeMcqs[currentMcqIdx];

  // Lookup target subject progress level
  const activeSubjectInfo = subjects.find(s => s.key === activeSubject);
  const matchedProgress = progress?.subjects.find((ps: any) => ps.subjectName.toLowerCase().includes(activeSubject.slice(0,3)));
  const currentLevel = matchedProgress ? matchedProgress.level : 20;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary-400" />
          <span>Placement Practice & Core Subjects Hub</span>
        </h2>
        <p className="text-xs text-gray-400 font-medium">Review core computer science concepts, check revision cheat sheets, and solve multiple-choice quizzes.</p>
      </div>

      {/* Grid: Subjects Selector tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {subjects.map((sub) => {
          const isActive = activeSubject === sub.key;
          return (
            <button
              key={sub.key}
              onClick={() => setActiveSubject(sub.key)}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                isActive
                  ? 'bg-gradient-to-tr from-primary-600/20 to-primary-500/10 border-primary-500 text-white shadow-inner scale-102'
                  : 'bg-dark-card border-dark-border text-gray-400 hover:border-gray-600'
              }`}
            >
              <BookOpen className={`h-5 w-5 mb-2 ${isActive ? 'text-primary-400' : 'text-gray-500'}`} />
              <span className="text-xs font-bold block">{sub.name}</span>
              <span className="text-[8px] text-gray-500 block font-medium mt-1 leading-normal truncate max-w-[120px]">{sub.badge}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left column: Cheat Sheets and Notes */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="border-primary-500/20" glow>
            <div className="flex items-center justify-between border-b border-dark-border pb-3 mb-4">
              <h3 className="text-xs uppercase font-bold text-primary-400 tracking-wider flex items-center gap-2">
                <FileText className="h-4.5 w-4.5" />
                <span>Revision Cheat Sheets: {activeSubjectInfo?.name}</span>
              </h3>
              <span className="px-3 py-1 rounded-xl bg-primary-500/10 border border-primary-500/20 text-[10px] font-bold text-primary-400">
                Mastery Level: {currentLevel}%
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {activeSubjectInfo?.notes.map((note, index) => (
                <div key={index} className="p-4 bg-dark-bg/60 border border-dark-border rounded-xl text-xs text-gray-300 leading-relaxed">
                  {note}
                </div>
              ))}
            </div>
          </GlassCard>

          {/* User Roadmap Step Summary */}
          {progress && progress.roadmap && (
            <GlassCard>
              <h3 className="text-xs uppercase font-bold text-white tracking-wider flex items-center gap-2 mb-4">
                <Map className="h-4.5 w-4.5 text-accent-purple" />
                <span>Roadmap Goal Progression</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {progress.roadmap.slice(0, 2).map((step: any) => (
                  <div key={step.phase} className="p-4 bg-dark-bg border border-dark-border rounded-xl">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                      step.status === 'in-progress' 
                        ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' 
                        : 'bg-dark-border text-gray-500 border border-dark-border'
                    }`}>{step.status}</span>
                    <h4 className="text-xs font-bold text-white mt-2 leading-tight">{step.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">{step.description}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>

        {/* Right column: MCQ practice console */}
        <div className="lg:col-span-1">
          {currentMcq ? (
            <GlassCard glow className="border-accent-purple/20 space-y-5">
              <div className="flex justify-between items-center border-b border-dark-border pb-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <HelpCircle className="h-4.5 w-4.5 text-accent-purple" />
                  <span>Interactive Mini Quiz</span>
                </h3>
                <span className="text-[10px] text-gray-500 font-bold">Q {currentMcqIdx + 1} of {activeMcqs.length}</span>
              </div>

              <p className="text-xs font-bold text-white leading-relaxed">{currentMcq.question}</p>

              {/* Options */}
              <div className="flex flex-col gap-2.5">
                {currentMcq.options.map((opt: string, idx: number) => {
                  const isSelected = selectedAnswerIdx === idx;
                  const showSuccess = checked && idx === currentMcq.answer;
                  const showFailure = checked && isSelected && !isCorrect;

                  let optionBorder = 'border-dark-border bg-dark-bg/60 text-gray-300';
                  if (isSelected) optionBorder = 'border-primary-500 bg-primary-950/20 text-white';
                  if (showSuccess) optionBorder = 'border-emerald-500 bg-emerald-950/20 text-emerald-400 font-bold';
                  if (showFailure) optionBorder = 'border-red-500 bg-red-950/20 text-red-400';

                  return (
                    <button
                      key={idx}
                      disabled={checked}
                      onClick={() => setSelectedAnswerIdx(idx)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-xs leading-normal transition-all flex justify-between items-center ${optionBorder}`}
                    >
                      <span>{opt}</span>
                      {showSuccess && <Check className="h-4 w-4 shrink-0 text-emerald-500" />}
                      {showFailure && <X className="h-4 w-4 shrink-0 text-red-500" />}
                    </button>
                  );
                })}
              </div>

              {/* Answer Feedback / Explanation details */}
              {checked && (
                <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                  isCorrect ? 'bg-emerald-950/15 border-emerald-900/40 text-emerald-300' : 'bg-red-950/15 border-red-900/40 text-red-300'
                }`}>
                  <p className="font-bold flex items-center gap-1.5 mb-1 text-[11px]">
                    {isCorrect ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    <span>{isCorrect ? 'Correct Answer!' : 'Incorrect Choice'}</span>
                  </p>
                  <span>{currentMcq.explanation}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="border-t border-dark-border pt-4">
                {!checked ? (
                  <Button
                    onClick={handleCheckAnswer}
                    disabled={selectedAnswerIdx === null}
                    className="w-full"
                  >
                    Check Answer
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextQuestion}
                    variant="secondary"
                    className="w-full flex items-center gap-1.5 justify-center"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="flex flex-col items-center justify-center text-center p-8 min-h-[300px]">
              <Sparkles className="h-10 w-10 text-gray-600 mb-4" />
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">No Active Quizzes</h3>
              <p className="text-[10px] text-gray-500 max-w-[200px] mt-1.5">MCQ questions are being configured. Try reviewing other subjects.</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};
