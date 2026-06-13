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
  FileText 
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

export const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const { showToast } = useToast();
  
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [roadRefreshing, setRoadRefreshing] = useState(false);

  const fetchProgress = async () => {
    try {
      const response = await api.get('/learning/progress');
      setProgressData(response.data.progress);
    } catch (error: any) {
      showToast('Failed to retrieve learning progress details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleToggleGoal = async (goalType: 'daily' | 'weekly', text: string, currentCompleted: boolean) => {
    try {
      const newCompleted = !currentCompleted;
      const response = await api.post('/learning/goal/update', {
        goalType,
        goalText: text,
        completed: newCompleted
      });
      
      // Update local progress states
      if (progressData) {
        const updated = { ...progressData };
        if (goalType === 'daily') {
          updated.dailyGoals = updated.dailyGoals.map((g: any) => g.text === text ? { ...g, completed: newCompleted } : g);
        } else {
          updated.weeklyGoals = updated.weeklyGoals.map((g: any) => g.text === text ? { ...g, completed: newCompleted } : g);
        }
        setProgressData(updated);
      }

      // Update Redux XP points if earned
      if (response.data.xpEarned > 0 && user) {
        const updatedUser = {
          ...user,
          stats: {
            ...user.stats,
            xp: user.stats.xp + response.data.xpEarned
          }
        };
        dispatch(updateUser(updatedUser));
        showToast(`Goal accomplished! +${response.data.xpEarned} XP awarded!`, 'success');
      } else {
        showToast('Goal status updated.', 'info');
      }
    } catch (err) {
      showToast('Failed to update goal.', 'error');
    }
  };

  const handleRefreshRoadmap = async () => {
    setRoadRefreshing(true);
    try {
      const response = await api.post('/roadmap/generate');
      setProgressData((prev: any) => ({
        ...prev,
        roadmap: response.data.roadmap
      }));
      showToast('AI Learning Roadmap generated successfully!', 'success');
    } catch (error) {
      showToast('Failed to refresh roadmap.', 'error');
    } finally {
      setRoadRefreshing(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  // Radar chart parser for CS topics
  const radarData = progressData?.subjects.map((sub: any) => ({
    subject: sub.subjectName,
    proficiency: sub.level,
    fullMark: 100
  })) || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner Greeting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 glass-panel border-primary-500/20 glow-border">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome, {user.profile?.name || 'Candidate'}</h2>
          <p className="text-gray-400 text-xs mt-1">
            Targeting <span className="text-primary-400 font-bold">{user.profile?.targetRole || 'Software Engineer'}</span> position. Keep practicing to boost your readiness.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-widest">Global Rank</span>
            <span className="text-base font-black text-white">#1,482</span>
          </div>
          <div className="h-10 w-10 bg-primary-500/10 border border-primary-500/30 rounded-xl flex items-center justify-center font-black text-primary-400 text-sm">
            L3
          </div>
        </div>
      </div>

      {/* Grid: Primary readiness scores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="border-primary-500/20" glow>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Interview Readiness</span>
            <Target className="h-5 w-5 text-primary-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-3xl font-black text-white">{user.stats?.readinessScore || 0}%</span>
            <span className="text-[10px] text-emerald-400 font-bold">Good</span>
          </div>
          <span className="text-[9px] text-gray-500 block mt-1.5 leading-snug">
            Calculated via AI Mock Interviews (70% historical average + 30% recent mock).
          </span>
          <div className="w-full bg-dark-border h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-primary-500 h-full rounded-full" style={{ width: `${user.stats?.readinessScore || 0}%` }} />
          </div>
        </GlassCard>

        <GlassCard className="border-accent-purple/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Resume ATS Score</span>
            <FileText className="h-5 w-5 text-accent-purple" />
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-3xl font-black text-white">{user.stats?.atsScore || 0}/100</span>
            <span className="text-[10px] text-gray-400">Target: 80+</span>
          </div>
          <span className="text-[9px] text-gray-500 block mt-1.5 leading-snug">
            Evaluated by scanning your PDF resume against core skills for the target role.
          </span>
          <div className="w-full bg-dark-border h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-accent-purple h-full rounded-full" style={{ width: `${user.stats?.atsScore || 0}%` }} />
          </div>
        </GlassCard>

        <GlassCard className="border-accent-pink/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Mock Rounds</span>
            <Clock className="h-5 w-5 text-accent-pink" />
          </div>
          <p className="text-3xl font-black text-white mt-4">{user.stats?.totalInterviewsTaken || 0}</p>
          <span className="text-[10px] text-gray-500 block mt-2 font-medium">Coding rounds completed: {user.stats?.codingChallengesCompleted || 0}</span>
        </GlassCard>

        <GlassCard className="border-orange-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Daily Streaks</span>
            <Flame className="h-5 w-5 text-orange-400" />
          </div>
          <p className="text-3xl font-black text-white mt-4">{user.stats?.currentStreak || 1} Days</p>
          <span className="text-[10px] text-orange-400/80 font-bold block mt-2">Personal Best: {user.stats?.longestStreak || 1} Days</span>
        </GlassCard>
      </div>

      {/* Grid: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <GlassCard className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-primary-400" />
              <span>Readiness Progress Trend</span>
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={progressData?.placementReadinessTrend || []}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorReadiness" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3D73FF" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3D73FF" stopOpacity={0}/>
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
          </div>
        </GlassCard>

        {/* Radar CS topics Proficiencies */}
        <GlassCard className="flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <BookOpen className="h-4.5 w-4.5 text-accent-purple" />
              <span>CS Mastery Radar</span>
            </h3>
            <div className="h-64 w-full flex items-center justify-center">
              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#22324D" />
                    <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" fontSize={8} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#9CA3AF" fontSize={7} />
                    <Radar name="Proficiency" dataKey="proficiency" stroke="#A855F7" fill="#A855F7" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <span className="text-xs text-gray-500">No mock metrics recorded yet.</span>
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Grid: Challenges, Roadmaps, Weak Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Daily Goals Checklist */}
        <GlassCard className="flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <CheckSquare className="h-4.5 w-4.5 text-accent-pink" />
              <span>Daily Tasks</span>
            </h3>
            <div className="flex flex-col gap-3">
              {progressData?.dailyGoals.map((goal: any, idx: number) => (
                <div
                  key={idx}
                  onClick={() => handleToggleGoal('daily', goal.text, goal.completed)}
                  className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    goal.completed
                      ? 'bg-emerald-950/20 border-emerald-900/50 text-gray-400'
                      : 'bg-dark-card border-dark-border text-gray-200 hover:border-gray-600'
                  }`}
                >
                  <div className={`h-4.5 w-4.5 rounded border flex items-center justify-center shrink-0 ${
                    goal.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-500'
                  }`}>
                    {goal.completed && <span className="text-[10px] font-bold">✓</span>}
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs ${goal.completed ? 'line-through' : 'font-medium'}`}>{goal.text}</p>
                    <span className="text-[9px] text-gray-500 block mt-0.5">+{goal.points} XP rewarded</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Weak topics & achievements list */}
        <GlassCard className="flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
              <span>Areas of Improvement</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {progressData?.weakTopics.map((topic: string, i: number) => (
                <span key={i} className="px-3.5 py-1.5 rounded-full bg-red-950/20 border border-red-900/50 text-red-400 text-xs font-semibold">
                  ⚠️ {topic}
                </span>
              ))}
            </div>
            
            <hr className="border-dark-border my-6" />

            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Award className="h-4.5 w-4.5 text-accent-purple" />
              <span>Achievements ({user.achievements?.length || 0})</span>
            </h3>
            <div className="flex flex-col gap-2">
              {user.achievements?.map((ach: any) => (
                <div key={ach.id} className="p-3 bg-dark-bg border border-dark-border rounded-xl flex items-center gap-3">
                  <span className="text-2xl shrink-0">{ach.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">{ach.title}</h4>
                    <p className="text-[9px] text-gray-400 mt-0.5">{ach.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Personalized Roadmap Phases */}
        <GlassCard className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Map className="h-4.5 w-4.5 text-primary-400" />
                <span>AI Study Roadmap</span>
              </h3>
              <button
                disabled={roadRefreshing}
                onClick={handleRefreshRoadmap}
                className="p-1.5 rounded-lg border border-dark-border hover:bg-dark-hover hover:border-gray-500 transition-colors disabled:opacity-50"
                title="Regenerate roadmap with Gemini"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-gray-400 ${roadRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            <div className="relative pl-4 border-l border-dark-border flex flex-col gap-5">
              {progressData?.roadmap.map((step: any) => (
                <div key={step.phase} className="relative">
                  <div className={`absolute -left-[23px] top-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center bg-dark-bg text-[8px] font-black ${
                    step.status === 'completed'
                      ? 'border-emerald-500 text-emerald-400'
                      : step.status === 'in-progress'
                      ? 'border-primary-500 text-primary-400'
                      : 'border-gray-500 text-gray-400'
                  }`}>
                    {step.phase}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight capitalize">{step.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-1 leading-normal">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
