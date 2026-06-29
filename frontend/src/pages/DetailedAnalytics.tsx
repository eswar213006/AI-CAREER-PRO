import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { 
  BarChart2, TrendingUp, Layers, HelpCircle, Activity, Award,
  CheckCircle, ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  Radar, BarChart, Bar, Cell
} from 'recharts';

const LEARNING_HISTORY = [
  { week: 'Wk 1', xp: 120, problems: 5 },
  { week: 'Wk 2', xp: 240, problems: 12 },
  { week: 'Wk 3', xp: 450, problems: 18 },
  { week: 'Wk 4', xp: 680, problems: 29 },
  { week: 'Wk 5', xp: 950, problems: 37 },
  { week: 'Wk 6', xp: 1280, problems: 48 }
];

const TOPIC_STRENGTHS = [
  { topic: 'Recursion', score: 85 },
  { topic: 'Dynamic Programming', score: 62 },
  { topic: 'Graphs', score: 70 },
  { topic: 'Trees', score: 80 },
  { topic: 'Greedy', score: 75 },
  { topic: 'Arrays/Strings', score: 92 }
];

const COMPANY_READINESS = [
  { company: 'Amazon', index: 68, fill: '#7c3aed' },
  { company: 'Microsoft', index: 65, fill: '#3b82f6' },
  { company: 'Google', index: 60, fill: '#ec4899' },
  { company: 'Adobe', index: 72, fill: '#f59e0b' },
  { company: 'Oracle', index: 78, fill: '#10b981' }
];

// Activity calendar squares (Heatmap mockup)
const HEATMAP_WEEKS = Array.from({ length: 24 }).map((_, wIdx) => {
  return Array.from({ length: 7 }).map((_, dIdx) => {
    // Randomize activity levels (0 to 4)
    const level = Math.floor(Math.random() * 5);
    return { level };
  });
});

export const DetailedAnalytics: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-primary-400" />
          <span>Detailed Performance Analytics</span>
        </h2>
        <p className="text-xs text-gray-400">
          Visualize learning progress curves, target company compatibility indexes, algorithmic topic heatmaps, and stats.
        </p>
      </div>

      {/* Top row stats summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 space-y-1">
          <span className="text-[9px] uppercase font-black text-gray-500">Problems Solved</span>
          <div className="text-xl font-black text-white flex items-baseline gap-1">
            <span>55 Problems</span>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center">
              +12% <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 space-y-1">
          <span className="text-[9px] uppercase font-black text-gray-500">Mock Assessments</span>
          <div className="text-xl font-black text-white flex items-baseline gap-1">
            <span>18 Trials</span>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center">
              +8% <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 space-y-1">
          <span className="text-[9px] uppercase font-black text-gray-500">Average ATS rating</span>
          <div className="text-xl font-black text-white flex items-baseline gap-1">
            <span>78 Score</span>
            <span className="text-[10px] text-gray-500 font-bold">Optimal</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 space-y-1">
          <span className="text-[9px] uppercase font-black text-gray-500">Study Streak Multiplier</span>
          <div className="text-xl font-black text-white flex items-baseline gap-1">
            <span>x1.2 XP</span>
            <span className="text-[10px] text-amber-400 font-bold">Active</span>
          </div>
        </GlassCard>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Area Chart: Learning History */}
        <GlassCard className="space-y-4 p-6">
          <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary-400" />
            <span>Learning Curve & XP Accumulation</span>
          </h4>
          <div className="h-56 w-full text-[10px] font-bold">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={LEARNING_HISTORY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" stroke="#475569" />
                <YAxis stroke="#475569" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Area type="monotone" dataKey="xp" stroke="#7c3aed" fillOpacity={1} fill="url(#colorXp)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Radar Chart: DSA Strengths */}
        <GlassCard className="space-y-4 p-6">
          <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-2">
            <Layers className="h-4 w-4 text-accent-purple" />
            <span>Algorithmic Topic Mastery</span>
          </h4>
          <div className="h-56 w-full text-[9px] font-bold">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={TOPIC_STRENGTHS}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="topic" tick={{ fill: '#94a3b8' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569' }} />
                <Radar name="Mastery" dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Heatmap Row */}
      <GlassCard className="space-y-4 p-6">
        <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary-400" />
          <span>Algorithmic sandbox submissions heatmap</span>
        </h4>
        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin">
          {HEATMAP_WEEKS.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1 shrink-0">
              {week.map((day, dIdx) => (
                <div
                  key={dIdx}
                  className={`h-3 w-3 rounded-sm ${
                    day.level === 0 ? 'bg-[#131629] border border-dark-border/40' :
                    day.level === 1 ? 'bg-primary-900/30 text-primary-500' :
                    day.level === 2 ? 'bg-primary-700/50' :
                    day.level === 3 ? 'bg-primary-500/70' :
                    'bg-primary-400'
                  }`}
                  title={`Activity score: ${day.level}`}
                />
              ))}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Bar Chart: Target Company Readiness */}
      <GlassCard className="space-y-4 p-6">
        <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-2">
          <Award className="h-4 w-4 text-emerald-400" />
          <span>Company Eligibility Matching Index</span>
        </h4>
        <div className="h-56 w-full text-[10px] font-bold">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={COMPANY_READINESS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="company" stroke="#475569" />
              <YAxis stroke="#475569" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
              <Bar dataKey="index" radius={[5, 5, 0, 0]}>
                {COMPANY_READINESS.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

    </div>
  );
};
export default DetailedAnalytics;
