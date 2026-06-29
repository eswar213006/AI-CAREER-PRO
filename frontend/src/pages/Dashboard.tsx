import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Flame, 
  Award, 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Map, 
  RefreshCw, 
  FileText,
  Zap,
  Star,
  Activity
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import type { RootState } from '../store';
import { updateUser } from '../store/authSlice';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import api from '../utils/api';

// ── Fallback data (shown when backend is unreachable) ─────────────────────────
const FALLBACK_PROGRESS = {
  placementReadinessTrend: [
    { date: 'Jan', score: 30 },
    { date: 'Feb', score: 42 },
    { date: 'Mar', score: 55 },
    { date: 'Apr', score: 61 },
    { date: 'May', score: 70 },
    { date: 'Jun', score: 78 },
  ],
  subjects: [
    { subjectName: 'DSA', level: 72 },
    { subjectName: 'OS', level: 55 },
    { subjectName: 'DBMS', level: 63 },
    { subjectName: 'Networks', level: 48 },
    { subjectName: 'System Design', level: 40 },
    { subjectName: 'OOP', level: 80 },
  ],
  dailyGoals: [
    { text: 'Solve 2 LeetCode problems', completed: false, points: 50 },
    { text: 'Review OS concepts for 30 min', completed: false, points: 30 },
    { text: 'Complete 1 mock HR round', completed: false, points: 40 },
    { text: 'Read system design article', completed: false, points: 20 },
  ],
  weeklyGoals: [
    { text: 'Finish Arrays & Strings module', completed: false, points: 200 },
    { text: 'Submit 1 resume for ATS review', completed: false, points: 100 },
  ],
  weakTopics: ['Dynamic Programming', 'Graph Algorithms', 'OS Scheduling', 'Network Protocols'],
  roadmap: [
    { phase: 1, title: 'Foundation Strengthening', description: 'Master core DSA — arrays, strings, recursion, and sorting algorithms.', status: 'completed' },
    { phase: 2, title: 'Intermediate Algorithms', description: 'Graphs, trees, dynamic programming, and greedy strategies.', status: 'in-progress' },
    { phase: 3, title: 'CS Core Subjects', description: 'OS, DBMS, Networks & OOP — frequently asked in campus interviews.', status: 'pending' },
    { phase: 4, title: 'System Design & HR', description: 'Low-level design, HLD basics, and behavioral interview preparation.', status: 'pending' },
  ],
};

export const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const { showToast } = useToast();
  
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [roadRefreshing, setRoadRefreshing] = useState(false);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const response = await api.get('/learning/progress');
      setProgressData(response.data.progress);
    } catch (error: any) {
      // Use fallback data silently — no error toast spam
      setProgressData(FALLBACK_PROGRESS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleToggleGoal = async (goalType: 'daily' | 'weekly', text: string, currentCompleted: boolean) => {
    // Optimistic UI update first
    const newCompleted = !currentCompleted;
    setProgressData((prev: any) => {
      if (!prev) return prev;
      const updated = { ...prev };
      if (goalType === 'daily') {
        updated.dailyGoals = (updated.dailyGoals || []).map((g: any) =>
          g.text === text ? { ...g, completed: newCompleted } : g
        );
      } else {
        updated.weeklyGoals = (updated.weeklyGoals || []).map((g: any) =>
          g.text === text ? { ...g, completed: newCompleted } : g
        );
      }
      return updated;
    });

    try {
      const response = await api.post('/learning/goal/update', {
        goalType,
        goalText: text,
        completed: newCompleted
      });

      if (response.data.xpEarned > 0 && user) {
        const updatedUser = {
          ...user,
          stats: { ...user.stats, xp: (user.stats?.xp || 0) + response.data.xpEarned }
        };
        dispatch(updateUser(updatedUser));
        showToast(`Goal accomplished! +${response.data.xpEarned} XP awarded!`, 'success');
      } else {
        showToast(newCompleted ? '✅ Goal marked complete!' : 'Goal unmarked.', 'info');
      }
    } catch {
      // Backend unreachable — optimistic update already applied, just notify
      showToast(newCompleted ? '✅ Goal marked complete!' : 'Goal unmarked.', 'info');
    }
  };

  const handleRefreshRoadmap = async () => {
    setRoadRefreshing(true);
    try {
      const response = await api.post('/roadmap/generate');
      setProgressData((prev: any) => ({ ...prev, roadmap: response.data.roadmap }));
      showToast('AI Learning Roadmap regenerated!', 'success');
    } catch {
      showToast('Roadmap refresh unavailable offline.', 'error');
    } finally {
      setRoadRefreshing(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
        <p className="text-gray-500 text-xs animate-pulse">Loading your dashboard…</p>
      </div>
    );
  }

  // Safe data accessors with fallback arrays
  const trend    = progressData?.placementReadinessTrend || FALLBACK_PROGRESS.placementReadinessTrend;
  const subjects = progressData?.subjects                || FALLBACK_PROGRESS.subjects;
  const daily    = progressData?.dailyGoals              || FALLBACK_PROGRESS.dailyGoals;
  const weak     = progressData?.weakTopics              || FALLBACK_PROGRESS.weakTopics;
  const roadmap  = progressData?.roadmap                 || FALLBACK_PROGRESS.roadmap;

  const radarData = subjects.map((sub: any) => ({
    subject: sub.subjectName,
    proficiency: sub.level,
    fullMark: 100,
  }));

  const completedDaily = daily.filter((g: any) => g.completed).length;
  const dailyPercent   = daily.length > 0 ? Math.round((completedDaily / daily.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Top greeting banner ────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 glass-panel border-primary-500/20 glow-border rounded-2xl">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="text-primary-400">{user.profile?.name || 'Candidate'}</span> 👋
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Targeting{' '}
            <span className="text-accent-purple font-bold">{user.profile?.targetRole || 'Software Engineer'}</span>{' '}
            — you're making great progress. Keep it up!
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-widest">Global Rank</span>
            <span className="text-base font-black text-white">#1,482</span>
          </div>
          <div className="h-11 w-11 bg-gradient-to-tr from-primary-600 to-accent-purple rounded-xl flex items-center justify-center font-black text-white text-sm shadow-lg shadow-primary-900/30">
            L3
          </div>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Interview Readiness */}
        <GlassCard className="border-primary-500/20" glow>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Interview Readiness</span>
            <Target className="h-5 w-5 text-primary-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-3xl font-black text-white">{user.stats?.readinessScore || 72}%</span>
            <span className="text-[10px] text-emerald-400 font-bold">Good</span>
          </div>
          <span className="text-[9px] text-gray-500 block mt-1.5 leading-snug">
            AI-calculated from mock interviews + coding performance.
          </span>
          <div className="w-full bg-dark-border h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-600 to-primary-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${user.stats?.readinessScore || 72}%` }}
            />
          </div>
        </GlassCard>

        {/* ATS Score */}
        <GlassCard className="border-accent-purple/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Resume ATS Score</span>
            <FileText className="h-5 w-5 text-accent-purple" />
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-3xl font-black text-white">{user.stats?.atsScore || 64}/100</span>
            <span className="text-[10px] text-gray-400">Target: 80+</span>
          </div>
          <span className="text-[9px] text-gray-500 block mt-1.5 leading-snug">
            Upload your resume to get a live ATS score.
          </span>
          <div className="w-full bg-dark-border h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-accent-purple to-accent-pink h-full rounded-full transition-all duration-700"
              style={{ width: `${user.stats?.atsScore || 64}%` }}
            />
          </div>
        </GlassCard>

        {/* Mock Rounds */}
        <GlassCard className="border-accent-pink/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Mock Rounds</span>
            <Activity className="h-5 w-5 text-accent-pink" />
          </div>
          <p className="text-3xl font-black text-white mt-4">{user.stats?.totalInterviewsTaken || 8}</p>
          <span className="text-[10px] text-gray-500 block mt-2 font-medium">
            Coding challenges: {user.stats?.codingChallengesCompleted || 24} solved
          </span>
          <div className="mt-4 flex gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${i < (user.stats?.totalInterviewsTaken || 8) ? 'bg-accent-pink' : 'bg-dark-border'}`}
              />
            ))}
          </div>
        </GlassCard>

        {/* Streak */}
        <GlassCard className="border-orange-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Daily Streak</span>
            <Flame className="h-5 w-5 text-orange-400" />
          </div>
          <p className="text-3xl font-black text-white mt-4">{user.stats?.currentStreak || 5} Days 🔥</p>
          <span className="text-[10px] text-orange-400/80 font-bold block mt-2">
            Personal Best: {user.stats?.longestStreak || 12} Days
          </span>
          <div className="mt-4 flex gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className={`h-5 flex-1 rounded ${i < (user.stats?.currentStreak || 5) ? 'bg-orange-500/80' : 'bg-dark-border'} transition-all`}
              />
            ))}
          </div>
        </GlassCard>
      </div>

      {/* ── Charts Row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Readiness Trend */}
        <GlassCard className="lg:col-span-2">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary-400" />
            Readiness Progress Trend
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReadiness" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3D73FF" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#3D73FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#22324D" opacity={0.3} />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={9} />
                <YAxis stroke="#9CA3AF" fontSize={9} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#161F30', borderColor: '#22324D', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontSize: '10px' }}
                  itemStyle={{ color: '#6690FF', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="score" stroke="#3D73FF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReadiness)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* CS Mastery Radar */}
        <GlassCard>
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-accent-purple" />
            CS Mastery Radar
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#22324D" />
                  <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" fontSize={8} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#9CA3AF" fontSize={7} />
                  <Radar name="Proficiency" dataKey="proficiency" stroke="#A855F7" fill="#A855F7" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-gray-500">No metrics recorded yet.</span>
            )}
          </div>
        </GlassCard>
      </div>

      {/* ── Daily Goals + Weak Areas + Roadmap ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Daily Goals */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-accent-pink" />
              Daily Tasks
            </h3>
            <span className="text-[10px] font-bold text-primary-400 bg-primary-500/10 px-2 py-1 rounded-full">
              {completedDaily}/{daily.length} done • {dailyPercent}%
            </span>
          </div>
          <div className="w-full bg-dark-border h-1 rounded-full mb-4 overflow-hidden">
            <div className="bg-accent-pink h-full rounded-full transition-all duration-500" style={{ width: `${dailyPercent}%` }} />
          </div>
          <div className="flex flex-col gap-3">
            {daily.map((goal: any, idx: number) => (
              <div
                key={idx}
                onClick={() => handleToggleGoal('daily', goal.text, goal.completed)}
                className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer select-none transition-all duration-200 ${
                  goal.completed
                    ? 'bg-emerald-950/20 border-emerald-900/40 opacity-70'
                    : 'bg-dark-card border-dark-border hover:border-gray-600 hover:bg-dark-hover'
                }`}
              >
                <div className={`h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                  goal.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-500'
                }`}>
                  {goal.completed && <span className="text-[9px] font-black text-white">✓</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs truncate ${goal.completed ? 'line-through text-gray-500' : 'text-gray-200 font-medium'}`}>
                    {goal.text}
                  </p>
                  <span className="text-[9px] text-primary-400/80 font-bold">+{goal.points} XP</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Weak Areas + Achievements */}
        <GlassCard>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Focus Areas
          </h3>
          <div className="flex flex-wrap gap-2 mb-5">
            {weak.length > 0 ? weak.map((topic: string, i: number) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-red-950/20 border border-red-900/40 text-red-400 text-[11px] font-semibold">
                ⚠️ {topic}
              </span>
            )) : (
              <span className="text-xs text-gray-500">No weak areas detected yet.</span>
            )}
          </div>

          <hr className="border-dark-border my-4" />

          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-accent-purple" />
            Achievements ({user.achievements?.length || 3})
          </h3>
          <div className="flex flex-col gap-2">
            {(user.achievements && user.achievements.length > 0 ? user.achievements : [
              { id: '1', icon: '🏆', title: 'First Solve', description: 'Solved your first coding problem.' },
              { id: '2', icon: '🔥', title: '5-Day Streak', description: 'Maintained a 5-day daily streak.' },
              { id: '3', icon: '⭐', title: 'Resume Hero', description: 'Uploaded and got an ATS score.' },
            ]).map((ach: any) => (
              <div key={ach.id} className="p-3 bg-dark-bg border border-dark-border rounded-xl flex items-center gap-3 hover:border-accent-purple/40 transition-colors">
                <span className="text-xl shrink-0">{ach.icon}</span>
                <div>
                  <h4 className="text-xs font-bold text-white">{ach.title}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">{ach.description}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* AI Study Roadmap */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Map className="h-4 w-4 text-primary-400" />
              AI Study Roadmap
            </h3>
            <button
              disabled={roadRefreshing}
              onClick={handleRefreshRoadmap}
              className="p-1.5 rounded-lg border border-dark-border hover:bg-dark-hover hover:border-gray-500 transition-colors disabled:opacity-50"
              title="Regenerate roadmap with AI"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-gray-400 ${roadRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="relative pl-5 border-l border-dark-border flex flex-col gap-5">
            {roadmap.map((step: any) => (
              <div key={step.phase} className="relative">
                <div className={`absolute -left-[25px] top-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center bg-dark-bg text-[8px] font-black ${
                  step.status === 'completed'  ? 'border-emerald-500 text-emerald-400 shadow-sm shadow-emerald-900/40' :
                  step.status === 'in-progress'? 'border-primary-500 text-primary-400 shadow-sm shadow-primary-900/40 animate-pulse' :
                                                  'border-gray-600 text-gray-500'
                }`}>
                  {step.status === 'completed' ? '✓' : step.phase}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white capitalize">{step.title}</h4>
                    {step.status === 'in-progress' && (
                      <span className="text-[9px] bg-primary-500/10 text-primary-400 border border-primary-500/30 px-1.5 py-0.5 rounded-full font-bold">Active</span>
                    )}
                    {step.status === 'completed' && (
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-bold">Done</span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* ── Quick Action Strip ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: <Zap className="h-5 w-5 text-yellow-400" />, label: 'Daily Challenge', href: '/daily-challenges', color: 'yellow' },
          { icon: <BookOpen className="h-5 w-5 text-blue-400" />,  label: 'Practice MCQ',     href: '/mcq',              color: 'blue'   },
          { icon: <Star className="h-5 w-5 text-purple-400" />,   label: 'Flashcards',       href: '/flashcards',       color: 'purple' },
          { icon: <Target className="h-5 w-5 text-pink-400" />,   label: 'Mock Interview',    href: '/mock-interview',   color: 'pink'   },
        ].map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 p-4 rounded-xl bg-dark-card border border-dark-border hover:bg-dark-hover hover:border-gray-600 transition-all duration-200 group"
          >
            <div className="h-9 w-9 rounded-lg bg-dark-bg border border-dark-border flex items-center justify-center group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <span className="text-xs font-semibold text-gray-300 group-hover:text-white transition-colors">{item.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
};
