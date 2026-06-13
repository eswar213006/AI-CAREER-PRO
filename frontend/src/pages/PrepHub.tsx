import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  BookOpen, CheckCircle, HelpCircle, FileText, Check, X, Award,
  Sparkles, Map, ChevronRight, Building2, Users, Zap, RefreshCw,
  ChevronDown, ChevronUp, ExternalLink, Brain, Target
} from 'lucide-react';
import type { RootState } from '../store';
import { updateUser } from '../store/authSlice';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import api from '../utils/api';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface SubjectInfo { key: string; name: string; badge: string; notes: string[]; }
interface HrQuestion { id: string; question: string; keyPoints: string[]; category: string; }
interface CompanyGuide {
  id: string; name: string; type: string; difficulty: string; package: string;
  rounds: string[]; focusAreas: string[]; tips: string[]; logo: string;
}

type ActiveTab = 'mcq' | 'hr' | 'company' | 'roadmap';

// ─── Static Subject Notes ─────────────────────────────────────────────────────
const subjects: SubjectInfo[] = [
  {
    key: 'java', name: 'Java & OOPs', badge: 'OOPs, Threads, Collections',
    notes: [
      '🔹 Inheritance: Child object acquires parent class properties. Promotes code reusability. Use extends keyword.',
      '🔹 Polymorphism: Method behaves differently based on calling object. Overloading (compile-time) vs Overriding (runtime).',
      '🔹 Abstraction: Hide implementation details via Abstract classes (partial abstraction) or Interfaces (full abstraction).',
      '🔹 Encapsulation: Bind data + methods in a class. Use private fields + public getters/setters.',
      '🔹 HashMap: O(1) average for get/put using hashing. NOT thread-safe. Use ConcurrentHashMap for thread safety.',
      '🔹 final keyword: Variable → constant; Method → cannot override; Class → cannot extend.',
      '🔹 JVM Memory: Heap (objects), Stack (local vars/frames), Method Area (class metadata), PC Register.',
    ]
  },
  {
    key: 'dbms', name: 'DBMS & SQL', badge: 'Normal forms, Transactions, Joins',
    notes: [
      '🔹 Normalization: 1NF (atomic values) → 2NF (no partial deps) → 3NF (no transitive deps) → BCNF (all deps on candidate key).',
      '🔹 ACID: Atomicity (all or nothing), Consistency (valid state), Isolation (independent), Durability (persists after commit).',
      '🔹 Indexes: B-Tree structure. Speeds up reads but slows writes. Clustered index = physical order of rows.',
      '🔹 Primary Key vs Unique Key: PK — no NULL, one per table. UK — allows one NULL, multiple per table.',
      '🔹 JOINs: INNER (matching rows), LEFT (all left + match), RIGHT (all right + match), FULL OUTER (all rows both sides).',
      '🔹 Transactions: BEGIN → operations → COMMIT / ROLLBACK. SAVEPOINT creates intermediate restore point.',
      '🔹 Deadlock: Two txns each hold a lock the other needs. Prevention: timeout, lock ordering, WAIT-DIE scheme.',
    ]
  },
  {
    key: 'os', name: 'Operating Systems', badge: 'Processes, Paging, Scheduling',
    notes: [
      '🔹 Process vs Thread: Process has own memory space (heavy). Thread shares memory with parent process (lightweight).',
      '🔹 CPU Scheduling: FCFS (simple, convoy effect), SJF (min avg wait), Round Robin (time quantum, best for interactive).',
      '🔹 Virtual Memory: Allows processes to use more memory than RAM by using disk (page file/swap space).',
      '🔹 Deadlock conditions (Coffman): Mutual Exclusion + Hold & Wait + No Preemption + Circular Wait.',
      '🔹 Semaphore: Binary (mutex) or Counting. wait(S) decrements; signal(S) increments. Used for synchronization.',
      '🔹 Page Replacement: FIFO (simple, Belady anomaly), LRU (least recently used), Optimal (theoretical best).',
      '🔹 Thrashing: CPU spends more time swapping pages than executing. Solution: Reduce degree of multiprogramming.',
    ]
  },
  {
    key: 'networks', name: 'Computer Networks', badge: 'OSI layers, TCP/UDP, DNS',
    notes: [
      '🔹 OSI 7 Layers: Physical → Data Link → Network (IP) → Transport (TCP/UDP) → Session → Presentation → Application.',
      '🔹 TCP vs UDP: TCP = connection-oriented, reliable, ordered, slower. UDP = connectionless, fast, used for video/DNS.',
      '🔹 HTTP methods: GET (read), POST (create), PUT (replace), PATCH (update), DELETE (remove). Idempotent: GET/PUT/DELETE.',
      '🔹 DNS: Resolves domain names to IP. Hierarchy: Root → TLD (.com) → Authoritative → Resolver (local cache).',
      '🔹 TCP 3-Way Handshake: SYN → SYN-ACK → ACK. 4-Way Termination: FIN → FIN-ACK → FIN → FIN-ACK.',
      '🔹 Subnetting: CIDR notation /24 = 256 IPs (254 usable). /16 = 65,536. Private ranges: 10.x, 172.16-31.x, 192.168.x.',
      '🔹 Load Balancer: Distributes traffic (Round Robin, Least Connections, IP Hash). Improves availability & scalability.',
    ]
  },
  {
    key: 'aptitude', name: 'Quantitative Aptitude', badge: 'Time-speed, Work, Ratio',
    notes: [
      '🔹 Speed & Distance: Speed = Distance / Time. km/h → m/s: × 5/18. m/s → km/h: × 18/5.',
      '🔹 Time & Work: If A does work in X days → A\'s 1-day work = 1/X. Together: 1/T = 1/X + 1/Y.',
      '🔹 Percentage: % change = (change/original) × 100. Successive % (a then b): a + b + ab/100.',
      '🔹 Profit & Loss: Profit% = Profit/CP × 100. SP = CP × (1 + P%/100). Discount% on MP not CP.',
      '🔹 Simple Interest: SI = (P × R × T) / 100. Compound: A = P(1 + R/100)^T. CI = A - P.',
      '🔹 Ratio & Proportion: If A:B = m:n, then A = m/(m+n) × Total. Inverse proportion: A₁B₁ = A₂B₂.',
      '🔹 Permutation: nPr = n!/(n-r)!. Combination: nCr = n!/(r!(n-r)!). Probability = Favourable/Total outcomes.',
    ]
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export const PrepHub: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const { showToast } = useToast();

  // Tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('mcq');
  const [activeSubject, setActiveSubject] = useState<string>('java');

  // MCQ state
  const [mcqBank, setMcqBank] = useState<Record<string, any[]>>({});
  const [progress, setProgress] = useState<any>(null);
  const [currentMcqIdx, setCurrentMcqIdx] = useState(0);
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [mcqLoading, setMcqLoading] = useState(true);

  // HR state
  const [hrQuestions, setHrQuestions] = useState<HrQuestion[]>([]);
  const [hrLoading, setHrLoading] = useState(false);
  const [expandedHr, setExpandedHr] = useState<string | null>(null);
  const [hrCategory, setHrCategory] = useState<string>('all');

  // Company state
  const [companies, setCompanies] = useState<CompanyGuide[]>([]);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);

  // Roadmap state
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchMcqs = async () => {
    setMcqLoading(true);
    try {
      const [mcqRes, progRes] = await Promise.all([
        api.get('/learning/mcqs'),
        api.get('/learning/progress'),
      ]);
      setMcqBank(mcqRes.data.bank);
      setProgress(progRes.data.progress);
    } catch {
      showToast('Failed to load practice quizzes.', 'error');
    } finally {
      setMcqLoading(false);
    }
  };

  const fetchHrQuestions = async () => {
    if (hrQuestions.length > 0) return;
    setHrLoading(true);
    try {
      const res = await api.get('/hr');
      setHrQuestions(res.data.questions || res.data || []);
    } catch {
      showToast('Failed to load HR questions.', 'error');
    } finally {
      setHrLoading(false);
    }
  };

  const fetchCompanies = async () => {
    if (companies.length > 0) return;
    setCompanyLoading(true);
    try {
      const res = await api.get('/company');
      setCompanies(res.data.guides || res.data || []);
    } catch {
      showToast('Failed to load company guides.', 'error');
    } finally {
      setCompanyLoading(false);
    }
  };

  useEffect(() => { fetchMcqs(); }, []);

  useEffect(() => {
    if (activeTab === 'hr') fetchHrQuestions();
    if (activeTab === 'company') fetchCompanies();
  }, [activeTab]);

  useEffect(() => {
    setCurrentMcqIdx(0);
    setSelectedAnswerIdx(null);
    setChecked(false);
  }, [activeSubject]);

  // ── MCQ handlers ───────────────────────────────────────────────────────────
  const handleCheckAnswer = async () => {
    if (selectedAnswerIdx === null || !mcqBank[activeSubject]) return;
    const mcq = mcqBank[activeSubject][currentMcqIdx];
    const correct = selectedAnswerIdx === mcq.answer;
    setIsCorrect(correct);
    setChecked(true);
    try {
      const response = await api.post('/learning/mcq/submit', {
        subjectKey: activeSubject,
        questionId: mcq.id,
        isCorrect: correct,
      });
      setProgress(response.data.progress);
      if (response.data.xpEarned > 0 && user) {
        dispatch(updateUser({ ...user, stats: { ...user.stats, xp: user.stats.xp + response.data.xpEarned } }));
        showToast(correct ? `✅ Correct! +${response.data.xpEarned} XP` : `❌ Incorrect. +${response.data.xpEarned} XP`, correct ? 'success' : 'info');
      }
    } catch {
      showToast('Failed to register score.', 'error');
    }
  };

  const handleNextQuestion = () => {
    const list = mcqBank[activeSubject] || [];
    if (currentMcqIdx < list.length - 1) {
      setCurrentMcqIdx(p => p + 1);
    } else {
      setCurrentMcqIdx(0);
      showToast('🎉 All questions completed! Starting over.', 'success');
    }
    setSelectedAnswerIdx(null);
    setChecked(false);
  };

  // ── Roadmap generator ──────────────────────────────────────────────────────
  const handleGenerateRoadmap = async () => {
    setRoadmapLoading(true);
    try {
      const res = await api.post('/learning/roadmap/generate', {});
      setProgress((prev: any) => ({ ...prev, roadmap: res.data.roadmap }));
      showToast('✨ AI roadmap regenerated!', 'success');
    } catch {
      showToast('Failed to generate roadmap.', 'error');
    } finally {
      setRoadmapLoading(false);
    }
  };

  // ── Derived values ─────────────────────────────────────────────────────────
  const activeMcqs = mcqBank[activeSubject] || [];
  const currentMcq = activeMcqs[currentMcqIdx];
  const activeSubjectInfo = subjects.find(s => s.key === activeSubject);
  const matchedProgress = progress?.subjects?.find((ps: any) => ps.subjectName.toLowerCase().includes(activeSubject.slice(0, 3)));
  const currentLevel = matchedProgress?.level ?? 20;

  const hrCategories = ['all', ...Array.from(new Set(hrQuestions.map((q: HrQuestion) => q.category)))];
  const filteredHr = hrCategory === 'all' ? hrQuestions : hrQuestions.filter(q => q.category === hrCategory);

  const tabs = [
    { id: 'mcq' as ActiveTab, label: 'MCQ Practice', icon: HelpCircle, color: 'text-primary-400' },
    { id: 'hr' as ActiveTab, label: 'HR Questions', icon: Users, color: 'text-accent-purple' },
    { id: 'company' as ActiveTab, label: 'Company Guides', icon: Building2, color: 'text-accent-cyan' },
    { id: 'roadmap' as ActiveTab, label: 'My Roadmap', icon: Map, color: 'text-accent-pink' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary-400" />
          <span>Placement Practice Hub</span>
        </h2>
        <p className="text-xs text-gray-400 font-medium">
          MCQ quizzes • HR interview prep • Company-specific guides • AI-generated roadmap
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-dark-border pb-4">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-dark-card border border-primary-500/40 text-white shadow-inner'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-dark-card/60 border border-transparent'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? tab.color : 'text-gray-600'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB: MCQ Practice ─────────────────────────────────────────────── */}
      {activeTab === 'mcq' && (
        <div className="space-y-6">
          {/* Subject selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {subjects.map(sub => {
              const isActive = activeSubject === sub.key;
              return (
                <button
                  key={sub.key}
                  onClick={() => setActiveSubject(sub.key)}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                    isActive
                      ? 'bg-gradient-to-tr from-primary-600/20 to-primary-500/10 border-primary-500 text-white shadow-inner'
                      : 'bg-dark-card border-dark-border text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <Brain className={`h-5 w-5 mb-2 ${isActive ? 'text-primary-400' : 'text-gray-500'}`} />
                  <span className="text-xs font-bold block">{sub.name}</span>
                  <span className="text-[8px] text-gray-500 block font-medium mt-1 leading-normal">{sub.badge}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Cheat Sheet column */}
            <div className="lg:col-span-2 space-y-4">
              <GlassCard className="border-primary-500/20" glow>
                <div className="flex items-center justify-between border-b border-dark-border pb-3 mb-4">
                  <h3 className="text-xs uppercase font-bold text-primary-400 tracking-wider flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Revision Cheat Sheet — {activeSubjectInfo?.name}</span>
                  </h3>
                  <span className="px-3 py-1 rounded-xl bg-primary-500/10 border border-primary-500/20 text-[10px] font-bold text-primary-400">
                    Mastery: {currentLevel}%
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {activeSubjectInfo?.notes.map((note, i) => (
                    <div key={i} className="p-3.5 bg-dark-bg/60 border border-dark-border rounded-xl text-xs text-gray-300 leading-relaxed">
                      {note}
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Progress bar per subject */}
              {progress?.subjects && (
                <GlassCard>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Target className="h-4 w-4 text-accent-cyan" />
                    Subject Mastery Levels
                  </h3>
                  <div className="space-y-3">
                    {progress.subjects.map((sub: any) => (
                      <div key={sub.subjectName}>
                        <div className="flex justify-between text-[10px] font-bold mb-1">
                          <span className="text-gray-400">{sub.subjectName}</span>
                          <span className="text-primary-400">{sub.level}%</span>
                        </div>
                        <div className="w-full bg-dark-border h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-primary-600 to-accent-purple h-full rounded-full transition-all duration-700"
                            style={{ width: `${sub.level}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
            </div>

            {/* MCQ Quiz panel */}
            <div className="lg:col-span-1">
              {mcqLoading ? (
                <GlassCard className="flex items-center justify-center min-h-[300px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
                </GlassCard>
              ) : currentMcq ? (
                <GlassCard glow className="border-accent-purple/20 space-y-5">
                  <div className="flex justify-between items-center border-b border-dark-border pb-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-accent-purple" />
                      <span>Mini Quiz</span>
                    </h3>
                    <span className="text-[10px] text-gray-500 font-bold">Q {currentMcqIdx + 1}/{activeMcqs.length}</span>
                  </div>

                  <p className="text-xs font-bold text-white leading-relaxed">{currentMcq.question}</p>

                  <div className="flex flex-col gap-2.5">
                    {currentMcq.options.map((opt: string, idx: number) => {
                      const isSelected = selectedAnswerIdx === idx;
                      const showSuccess = checked && idx === currentMcq.answer;
                      const showFailure = checked && isSelected && !isCorrect;
                      let cls = 'border-dark-border bg-dark-bg/60 text-gray-300';
                      if (isSelected) cls = 'border-primary-500 bg-primary-950/20 text-white';
                      if (showSuccess) cls = 'border-emerald-500 bg-emerald-950/20 text-emerald-400 font-bold';
                      if (showFailure) cls = 'border-red-500 bg-red-950/20 text-red-400';
                      return (
                        <button key={idx} disabled={checked} onClick={() => setSelectedAnswerIdx(idx)}
                          className={`w-full text-left px-4 py-3 rounded-xl border text-xs leading-normal transition-all flex justify-between items-center ${cls}`}>
                          <span>{opt}</span>
                          {showSuccess && <Check className="h-4 w-4 shrink-0 text-emerald-500" />}
                          {showFailure && <X className="h-4 w-4 shrink-0 text-red-500" />}
                        </button>
                      );
                    })}
                  </div>

                  {checked && (
                    <div className={`p-4 rounded-xl border text-xs leading-relaxed ${isCorrect ? 'bg-emerald-950/15 border-emerald-900/40 text-emerald-300' : 'bg-red-950/15 border-red-900/40 text-red-300'}`}>
                      <p className="font-bold flex items-center gap-1.5 mb-1">
                        {isCorrect ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        {isCorrect ? 'Correct!' : 'Incorrect'}
                      </p>
                      <span className="text-[11px]">{currentMcq.explanation}</span>
                    </div>
                  )}

                  <div className="border-t border-dark-border pt-4">
                    {!checked ? (
                      <Button onClick={handleCheckAnswer} disabled={selectedAnswerIdx === null} className="w-full">
                        Check Answer
                      </Button>
                    ) : (
                      <Button onClick={handleNextQuestion} variant="secondary" className="w-full flex items-center gap-1.5 justify-center">
                        Next Question <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </GlassCard>
              ) : (
                <GlassCard className="flex flex-col items-center justify-center text-center p-8 min-h-[300px]">
                  <Sparkles className="h-10 w-10 text-gray-600 mb-4" />
                  <p className="text-xs text-gray-500">Questions loading...</p>
                </GlassCard>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: HR Questions ─────────────────────────────────────────────── */}
      {activeTab === 'hr' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {hrQuestions.length} HR interview questions with model answers & key talking points.
            </p>
            {/* Category filter */}
            <div className="flex gap-2 flex-wrap justify-end">
              {hrCategories.map(cat => (
                <button key={cat} onClick={() => setHrCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                    hrCategory === cat
                      ? 'bg-accent-purple/10 border-accent-purple/40 text-accent-purple'
                      : 'border-dark-border text-gray-500 hover:text-gray-300'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {hrLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-purple" />
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHr.map((q, i) => (
                <GlassCard key={q.id} className="border-accent-purple/10 cursor-pointer"
                  onClick={() => setExpandedHr(expandedHr === q.id ? null : q.id)}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black text-accent-purple uppercase tracking-widest px-2 py-0.5 rounded bg-accent-purple/10 border border-accent-purple/20">
                          {q.category}
                        </span>
                        <span className="text-[9px] text-gray-600 font-bold">Q{i + 1}</span>
                      </div>
                      <p className="text-xs font-bold text-white leading-relaxed">{q.question}</p>
                    </div>
                    {expandedHr === q.id
                      ? <ChevronUp className="h-4 w-4 text-gray-500 shrink-0 mt-1" />
                      : <ChevronDown className="h-4 w-4 text-gray-500 shrink-0 mt-1" />}
                  </div>

                  {expandedHr === q.id && (
                    <div className="mt-4 pt-4 border-t border-dark-border space-y-3">
                      <h4 className="text-[10px] uppercase font-black text-accent-purple tracking-widest">
                        Key Talking Points
                      </h4>
                      <ul className="space-y-2">
                        {q.keyPoints.map((point, pi) => (
                          <li key={pi} className="flex gap-2.5 text-xs text-gray-300 leading-relaxed">
                            <span className="text-accent-purple font-black shrink-0">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="p-3 bg-dark-bg/60 border border-dark-border rounded-xl text-[10px] text-gray-500 mt-2">
                        💡 <strong className="text-gray-400">Tip:</strong> Use the STAR method — Situation, Task, Action, Result — to structure your answer for behavioral questions.
                      </div>
                    </div>
                  )}
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Company Guides ───────────────────────────────────────────── */}
      {activeTab === 'company' && (
        <div className="space-y-6">
          <p className="text-xs text-gray-400">
            Detailed placement guides for top companies — rounds, focus areas, and insider tips.
          </p>

          {companyLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-cyan" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companies.map((company: CompanyGuide) => (
                <GlassCard key={company.id} className="border-accent-cyan/10 cursor-pointer transition-all hover:border-accent-cyan/30"
                  onClick={() => setExpandedCompany(expandedCompany === company.id ? null : company.id)}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-dark-bg border border-dark-border flex items-center justify-center text-2xl shrink-0">
                      {company.logo || '🏢'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-black text-white">{company.name}</h3>
                          <p className="text-[10px] text-gray-500 font-medium">{company.type}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                            company.difficulty === 'High'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : company.difficulty === 'Medium'
                              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {company.difficulty}
                          </span>
                          <span className="text-[10px] font-bold text-accent-cyan">{company.package}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {expandedCompany === company.id && (
                    <div className="mt-5 pt-4 border-t border-dark-border space-y-4">
                      {/* Rounds */}
                      <div>
                        <h4 className="text-[10px] uppercase font-black text-accent-cyan tracking-widest mb-2">Interview Rounds</h4>
                        <div className="flex flex-wrap gap-2">
                          {company.rounds.map((round, ri) => (
                            <span key={ri} className="px-3 py-1 rounded-full bg-dark-bg border border-dark-border text-[10px] text-gray-300 font-medium">
                              {ri + 1}. {round}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Focus areas */}
                      <div>
                        <h4 className="text-[10px] uppercase font-black text-accent-purple tracking-widest mb-2">Focus Areas</h4>
                        <div className="flex flex-wrap gap-2">
                          {company.focusAreas.map((area, ai) => (
                            <span key={ai} className="px-2 py-1 rounded-lg bg-accent-purple/10 border border-accent-purple/20 text-[10px] text-accent-purple font-medium">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Tips */}
                      <div>
                        <h4 className="text-[10px] uppercase font-black text-amber-400 tracking-widest mb-2">Insider Tips</h4>
                        <ul className="space-y-1.5">
                          {company.tips.map((tip, ti) => (
                            <li key={ti} className="flex gap-2 text-[11px] text-gray-300 leading-relaxed">
                              <span className="text-amber-400 font-black shrink-0">💡</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end mt-3">
                    {expandedCompany === company.id
                      ? <ChevronUp className="h-4 w-4 text-gray-600" />
                      : <ChevronDown className="h-4 w-4 text-gray-600" />}
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: My Roadmap ───────────────────────────────────────────────── */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {user?.profile?.targetRole ? `Personalized for: ${user.profile.targetRole}` : 'Your AI-powered placement roadmap'}
            </p>
            <Button
              onClick={handleGenerateRoadmap}
              disabled={roadmapLoading}
              variant="secondary"
              className="flex items-center gap-2 text-xs"
            >
              {roadmapLoading
                ? <><div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-current" /> Generating...</>
                : <><Zap className="h-3.5 w-3.5" /> Regenerate with AI</>}
            </Button>
          </div>

          {progress?.roadmap ? (
            <div className="space-y-4">
              {progress.roadmap.map((step: any, i: number) => (
                <GlassCard key={step.phase} className={`border-l-2 transition-all ${
                  step.status === 'in-progress' ? 'border-l-primary-500' :
                  step.status === 'done' ? 'border-l-emerald-500' : 'border-l-dark-border'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                      step.status === 'in-progress' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' :
                      step.status === 'done' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      'bg-dark-bg text-gray-600 border border-dark-border'
                    }`}>
                      {step.status === 'done' ? '✓' : step.phase}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          step.status === 'in-progress' ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' :
                          step.status === 'done' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          'bg-dark-border text-gray-600 border border-dark-border'
                        }`}>
                          {step.status === 'in-progress' ? '🔥 In Progress' : step.status === 'done' ? '✅ Done' : '⏳ Up Next'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-tight mb-1">{step.title}</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">{step.description}</p>
                      {step.resources?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {step.resources.map((r: string, ri: number) => (
                            <span key={ri} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-dark-bg border border-dark-border text-[10px] text-gray-400">
                              <ExternalLink className="h-2.5 w-2.5" /> {r}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="flex flex-col items-center text-center py-12 gap-4">
              <RefreshCw className="h-10 w-10 text-gray-600" />
              <div>
                <p className="text-sm font-bold text-white">No Roadmap Yet</p>
                <p className="text-xs text-gray-500 mt-1">Click "Regenerate with AI" to generate your personalized plan.</p>
              </div>
              <Button onClick={handleGenerateRoadmap} disabled={roadmapLoading}>
                <Zap className="h-4 w-4 mr-2" /> Generate My Roadmap
              </Button>
            </GlassCard>
          )}

          {/* Daily & Weekly Goals */}
          {progress && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-400" /> Daily Goals
                </h3>
                <div className="space-y-2">
                  {progress.dailyGoals?.map((goal: any, gi: number) => (
                    <div key={gi} className={`flex items-center gap-3 p-3 rounded-xl border text-xs ${
                      goal.completed ? 'border-emerald-500/20 bg-emerald-950/10' : 'border-dark-border'
                    }`}>
                      <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                        goal.completed ? 'border-emerald-500 bg-emerald-500' : 'border-gray-600'
                      }`}>
                        {goal.completed && <Check className="h-2.5 w-2.5 text-white" />}
                      </div>
                      <span className={goal.completed ? 'text-gray-500 line-through' : 'text-gray-300'}>{goal.text}</span>
                      <span className="ml-auto text-[10px] font-bold text-amber-400">+{goal.points} XP</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
              <GlassCard>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Target className="h-4 w-4 text-accent-cyan" /> Weekly Goals
                </h3>
                <div className="space-y-2">
                  {progress.weeklyGoals?.map((goal: any, gi: number) => (
                    <div key={gi} className={`flex items-center gap-3 p-3 rounded-xl border text-xs ${
                      goal.completed ? 'border-emerald-500/20 bg-emerald-950/10' : 'border-dark-border'
                    }`}>
                      <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                        goal.completed ? 'border-emerald-500 bg-emerald-500' : 'border-gray-600'
                      }`}>
                        {goal.completed && <Check className="h-2.5 w-2.5 text-white" />}
                      </div>
                      <span className={goal.completed ? 'text-gray-500 line-through' : 'text-gray-300'}>{goal.text}</span>
                      <span className="ml-auto text-[10px] font-bold text-accent-cyan">+{goal.points} XP</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
