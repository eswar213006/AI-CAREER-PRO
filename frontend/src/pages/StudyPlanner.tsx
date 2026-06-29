import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { 
  Calendar, Clock, CheckSquare, Compass, Play, BookOpen, AlertCircle,
  Award, Sparkles, ChevronRight, Zap, Target
} from 'lucide-react';
import api from '../utils/api';

interface DailyTask {
  day: number;
  task: string;
  category: 'coding' | 'theory' | 'revision' | 'mock';
  resources: string[];
}

interface WeeklyMilestone {
  week: number;
  goal: string;
  checked: boolean;
}

interface PlanDetails {
  company: string;
  duration: number;
  dailyTasks: DailyTask[];
  weeklyGoals: WeeklyMilestone[];
}

export const StudyPlanner: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState('Amazon');
  const [skillLevel, setSkillLevel] = useState('Intermediate');
  const [hours, setHours] = useState(3);
  const [duration, setDuration] = useState(30);
  const [plan, setPlan] = useState<PlanDetails | null>(null);

  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const res = await api.post('/study-planner/generate', { company, skillLevel, hours, duration });
      setPlan(res.data);
      showToast('Custom preparation plan created!', 'success');
    } catch {
      // Mock calendar plan matching duration
      const totalWeeks = Math.ceil(duration / 7);
      const generatedTasks: DailyTask[] = Array.from({ length: Math.min(duration, 14) }).map((_, idx) => {
        const dayNum = idx + 1;
        let cat: 'coding' | 'theory' | 'revision' | 'mock' = 'coding';
        let tStr = `Solve company-specific array tagged questions.`;
        if (dayNum % 7 === 0) {
          cat = 'mock';
          tStr = `Take a mock interview for ${company} rounds under time constraints.`;
        } else if (dayNum % 6 === 0) {
          cat = 'revision';
          tStr = `Revise sorting logic and DBMS normal forms.`;
        } else if (dayNum % 2 === 0) {
          cat = 'theory';
          tStr = `Study OS process concurrency models and semaphores.`;
        }
        return {
          day: dayNum,
          task: tStr,
          category: cat,
          resources: ['Prep Hub SQL Guide', 'V8 Sandbox Two-Sum problem']
        };
      });

      const generatedWeeks: WeeklyMilestone[] = Array.from({ length: totalWeeks }).map((_, idx) => ({
        week: idx + 1,
        goal: `Complete core DSA patterns & start company tagged mock drills`,
        checked: false
      }));

      setPlan({
        company,
        duration,
        dailyTasks: generatedTasks,
        weeklyGoals: generatedWeeks
      });
      showToast('Custom preparation plan created (Offline Mode).', 'success');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWeekly = (idx: number) => {
    if (!plan) return;
    const nextGoals = [...plan.weeklyGoals];
    nextGoals[idx].checked = !nextGoals[idx].checked;
    setPlan({ ...plan, weeklyGoals: nextGoals });
    showToast('Goal completed status updated.', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary-400" />
          <span>AI Preparation Planner & Scheduler</span>
        </h2>
        <p className="text-xs text-gray-400">
          Generate custom study roadmaps mapping daily task checklists, resources, revision targets, and mocks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Form: Plan Configuration */}
        <GlassCard className="space-y-4">
          <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-dark-border pb-3">
            <Sparkles className="h-4 w-4 text-primary-400" />
            <span>Generate Study Blueprint</span>
          </h3>

          <div className="space-y-3.5 text-xs text-gray-300">
            {/* Target Company */}
            <div className="space-y-1.5">
              <label className="font-bold text-gray-400">Target Company</label>
              <select
                value={company}
                onChange={e => setCompany(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                {['Amazon', 'Microsoft', 'Google', 'Adobe', 'Oracle', 'Atlassian', 'Infosys', 'TCS', 'Wipro', 'Deloitte'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Skill Level */}
            <div className="space-y-1.5">
              <label className="font-bold text-gray-400">Current Skill Rating</label>
              <div className="grid grid-cols-3 gap-2">
                {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSkillLevel(level)}
                    className={`py-2 border rounded-xl font-bold text-[10px] uppercase transition-all ${
                      skillLevel === level 
                        ? 'bg-primary-600/20 border-primary-500 text-white' 
                        : 'bg-dark-bg/60 border-dark-border text-gray-400 hover:text-white'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Hours Daily */}
            <div className="space-y-1.5">
              <label className="font-bold text-gray-400">Available Daily Hours ({hours} hrs)</label>
              <input
                type="range"
                min="1"
                max="12"
                className="w-full h-1.5 bg-dark-bg rounded-lg appearance-none cursor-pointer accent-primary-500"
                value={hours}
                onChange={e => setHours(Number(e.target.value))}
              />
            </div>

            {/* Target Duration */}
            <div className="space-y-1.5">
              <label className="font-bold text-gray-400">Preparation Timeline</label>
              <div className="grid grid-cols-4 gap-2">
                {[30, 60, 90, 180].map(days => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setDuration(days)}
                    className={`py-2 border rounded-xl font-bold text-[10px] uppercase transition-all ${
                      duration === days 
                        ? 'bg-primary-600/20 border-primary-500 text-white' 
                        : 'bg-dark-bg/60 border-dark-border text-gray-400 hover:text-white'
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={handleGeneratePlan}
            loading={loading}
            className="w-full py-2.5 mt-2 flex items-center justify-center gap-1.5"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Generate Study Plan</span>
          </Button>
        </GlassCard>

        {/* Right Side: Renders Generated Plan calendar and weekly targets */}
        <div className="lg:col-span-2 space-y-6">
          {plan ? (
            <div className="space-y-6">
              
              {/* Weekly Goals Checklist */}
              <GlassCard className="space-y-4">
                <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-dark-border pb-3">
                  <CheckSquare className="h-4.5 w-4.5 text-accent-purple" />
                  <span>Weekly Milestone Map</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {plan.weeklyGoals.map((milestone, i) => (
                    <div
                      key={i}
                      onClick={() => handleToggleWeekly(i)}
                      className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                        milestone.checked 
                          ? 'bg-emerald-950/15 border-emerald-900/30 text-gray-400 line-through' 
                          : 'bg-dark-bg/60 border-dark-border text-gray-200 hover:border-gray-500'
                      }`}
                    >
                      <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                        milestone.checked ? 'bg-emerald-500 border-emerald-500 text-dark-bg' : 'border-gray-500'
                      }`}>
                        {milestone.checked && <span className="text-[9px] font-black">✓</span>}
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase block text-gray-500">Week {milestone.week}</span>
                        <p className="text-[10px] font-bold mt-0.5 leading-relaxed">{milestone.goal}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Daily Tasks List */}
              <GlassCard className="space-y-4">
                <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-dark-border pb-3">
                  <Clock className="h-4.5 w-4.5 text-primary-400" />
                  <span>First 14 Days Roadmap</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plan.dailyTasks.map((task, idx) => (
                    <div key={idx} className="p-3.5 bg-dark-bg/50 border border-dark-border rounded-xl space-y-2 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-white bg-dark-border px-2 py-0.5 rounded-lg">Day {task.day}</span>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase border ${
                            task.category === 'coding' ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' :
                            task.category === 'mock' ? 'bg-red-950/20 border-red-900/30 text-red-400' :
                            task.category === 'revision' ? 'bg-amber-950/20 border-amber-900/30 text-amber-400' :
                            'bg-sky-950/20 border-sky-900/30 text-sky-400'
                          }`}>
                            {task.category}
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-gray-200 leading-relaxed">{task.task}</p>
                      </div>

                      <div className="pt-2 border-t border-dark-border/30">
                        <span className="text-[8px] uppercase text-gray-500 font-bold block mb-1">Recommended Guides</span>
                        <div className="flex flex-wrap gap-1">
                          {task.resources.map((res, i) => (
                            <span key={i} className="px-2 py-0.5 bg-dark-bg border border-dark-border rounded text-[9px] text-gray-400">
                              {res}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

            </div>
          ) : (
            <GlassCard className="text-center py-24 text-gray-500 space-y-2">
              <Calendar className="h-10 w-10 mx-auto text-gray-600" />
              <p className="text-xs font-semibold">No study roadmap loaded.</p>
              <p className="text-[10px] text-gray-650 max-w-xs mx-auto">Select target company, deadline constraints, and click Generate.</p>
            </GlassCard>
          )}
        </div>

      </div>
    </div>
  );
};
export default StudyPlanner;
