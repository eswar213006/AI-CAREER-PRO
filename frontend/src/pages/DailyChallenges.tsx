import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { 
  Flame, Award, Code2, HelpCircle, UserCheck, BookOpen, Compass, 
  CheckCircle, ArrowRight, Zap, Target, Star
} from 'lucide-react';
import api from '../utils/api';

interface ChallengeTask {
  id: string;
  type: 'coding' | 'mcq' | 'hr' | 'cs' | 'puzzle' | 'aptitude';
  title: string;
  desc: string;
  points: number;
  completed: boolean;
}

export const DailyChallenges: React.FC = () => {
  const { showToast } = useToast();
  const [streak, setStreak] = useState(5);
  const [multiplier, setMultiplier] = useState(1.2);
  const [xp, setXp] = useState(420);
  
  const [tasks, setTasks] = useState<ChallengeTask[]>([
    { id: '1', type: 'coding', title: 'Daily Coding Assessment', desc: 'Solve "Two Sum" optimal space-time complexity solution.', points: 50, completed: false },
    { id: '2', type: 'mcq', title: 'DBMS Normal forms quiz', desc: 'Identify dependency preservation properties in relation decompositions.', points: 20, completed: true },
    { id: '3', type: 'hr', title: 'Behavioral scenario review', desc: 'Prepare your answer for "How do you handle project deadline stress?"', points: 30, completed: false },
    { id: '4', type: 'cs', title: 'Operating Systems summary', desc: 'Review Page Replacement (LRU, Optimal) anomalies.', points: 15, completed: false },
    { id: '5', type: 'puzzle', title: 'River Crossing Riddle', desc: 'Solve the classical Wolf, Goat, and Cabbage routing problem.', points: 25, completed: false },
    { id: '6', type: 'aptitude', title: 'Probability computation', desc: 'Solve coin toss combinations and probability questions.', points: 20, completed: true }
  ]);

  const handleSolve = (id: string, pts: number) => {
    const next = tasks.map(t => {
      if (t.id === id) {
        if (!t.completed) {
          setXp(x => x + Math.round(pts * multiplier));
          showToast(`Completed! Unlocked +${Math.round(pts * multiplier)} XP (includes x${multiplier} multiplier).`, 'success');
        }
        return { ...t, completed: true };
      }
      return t;
    });
    setTasks(next);

    // If all tasks are completed, increment streak
    if (next.every(t => t.completed)) {
      setStreak(s => s + 1);
      setMultiplier(m => Number((m + 0.1).toFixed(2)));
      showToast('🎉 All daily challenges completed! Streak incremented!', 'success');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'coding': return <Code2 className="h-4 w-4 text-emerald-400" />;
      case 'mcq': return <HelpCircle className="h-4 w-4 text-sky-400" />;
      case 'hr': return <UserCheck className="h-4 w-4 text-rose-400" />;
      case 'cs': return <BookOpen className="h-4 w-4 text-primary-400" />;
      case 'puzzle': return <Compass className="h-4 w-4 text-amber-400" />;
      default: return <Zap className="h-4 w-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Flame className="h-5 w-5 text-amber-400" />
          <span>Daily Challenges & Streak Milestones</span>
        </h2>
        <p className="text-xs text-gray-400">
          Unlock XP bonuses and grow your ranking by solving coding, aptitude, and theoretical challenges daily.
        </p>
      </div>

      {/* Streak Dashboard Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="flex items-center justify-between p-4 border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Flame className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-black text-gray-500">Current Streak</span>
              <h4 className="text-base font-black text-white">{streak} Days Active</h4>
            </div>
          </div>
          <span className="text-xs font-black text-amber-400 bg-amber-950/20 px-2 py-0.5 rounded border border-amber-900/35">
            x{multiplier} Multiplier
          </span>
        </GlassCard>

        <GlassCard className="flex items-center gap-3 p-4 border-primary-500/20">
          <div className="p-2.5 rounded-xl bg-primary-500/10 border border-primary-500/30 text-primary-400">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-black text-gray-500">Earned XP Level</span>
            <h4 className="text-base font-black text-white">{xp} Points</h4>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-3 p-4 border-emerald-500/20">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-black text-gray-500">Daily Progress</span>
            <h4 className="text-base font-black text-white">
              {tasks.filter(t => t.completed).length} / {tasks.length} Completed
            </h4>
          </div>
        </GlassCard>
      </div>

      {/* Quote card */}
      <GlassCard className="p-4 italic text-xs text-gray-400 leading-relaxed border-l-4 border-primary-500">
        "Consistency beats talent when talent fails to act consistently. Build your placement readiness routine one block at a time."
      </GlassCard>

      {/* Tasks checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map(task => (
          <div
            key={task.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between h-36 ${
              task.completed 
                ? 'bg-emerald-950/10 border-emerald-900/25 text-gray-400' 
                : 'bg-dark-card border-dark-border text-white hover:border-gray-600'
            }`}
          >
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="flex items-center gap-1.5 uppercase tracking-wide">
                  {getIcon(task.type)}
                  {task.type} Challenge
                </span>
                <span className="text-emerald-400 font-extrabold">+{task.points} XP</span>
              </div>
              <h4 className="text-xs font-black leading-tight mt-1">{task.title}</h4>
              <p className="text-[10px] text-gray-400 leading-relaxed mt-0.5">{task.desc}</p>
            </div>

            <div className="flex items-center justify-between border-t border-dark-border/20 pt-2 mt-4">
              <span className="text-[9px] text-gray-550 uppercase font-black tracking-widest">
                {task.completed ? 'COMPLETED' : 'PENDING'}
              </span>
              {!task.completed ? (
                <button
                  onClick={() => handleSolve(task.id, task.points)}
                  className="flex items-center gap-1 text-[10px] font-bold text-primary-400 hover:text-white transition-colors"
                >
                  <span>Solve Task</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default DailyChallenges;
