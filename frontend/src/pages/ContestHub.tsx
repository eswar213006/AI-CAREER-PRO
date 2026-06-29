import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { 
  Briefcase, Calendar, Star, Clock, Trophy, ExternalLink,
  ChevronRight, RefreshCw, Zap, ShieldAlert
} from 'lucide-react';

interface ContestItem {
  id: string;
  platform: 'LeetCode' | 'Codeforces' | 'CodeChef' | 'HackerRank';
  title: string;
  date: string;
  time: string;
  duration: string;
  registered: boolean;
}

const STATIC_CONTESTS: ContestItem[] = [
  { id: '1', platform: 'LeetCode', title: 'Weekly Contest 402', date: 'Sunday, July 5', time: '08:00 AM IST', duration: '1.5 Hours', registered: true },
  { id: '2', platform: 'Codeforces', title: 'Div. 3 Round 956', date: 'Friday, July 3', time: '08:05 PM IST', duration: '2.0 Hours', registered: false },
  { id: '3', platform: 'CodeChef', title: 'Starters 142 (Div. 2)', date: 'Wednesday, July 1', time: '08:00 PM IST', duration: '2.0 Hours', registered: false },
  { id: '4', platform: 'HackerRank', title: 'Placement coding sprint v8', date: 'Monday, July 6', time: '10:00 AM IST', duration: '3.0 Hours', registered: true }
];

export const ContestHub: React.FC = () => {
  const { showToast } = useToast();
  const [contests, setContests] = useState<ContestItem[]>(STATIC_CONTESTS);

  const toggleRegister = (id: string) => {
    const next = contests.map(c => {
      if (c.id === id) {
        showToast(c.registered ? 'Deregistered from contest.' : 'Successfully registered! Reminder configured.', 'success');
        return { ...c, registered: !c.registered };
      }
      return c;
    });
    setContests(next);
  };

  const getPlatformStyle = (platform: string) => {
    switch (platform) {
      case 'LeetCode': return 'bg-amber-950/20 border-amber-500/30 text-amber-400';
      case 'Codeforces': return 'bg-sky-950/20 border-sky-500/30 text-sky-400';
      case 'CodeChef': return 'bg-orange-950/20 border-orange-500/30 text-orange-400';
      default: return 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary-400" />
          <span>Competitive Coding Contest Hub</span>
        </h2>
        <p className="text-xs text-gray-400">
          Sync upcoming contest schedules across LeetCode, Codeforces, CodeChef, and HackerRank. Configure notifications.
        </p>
      </div>

      {/* Stats and Rankings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rating Metrics card */}
        <GlassCard className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-600/10 border border-primary-500/20 text-primary-400">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-black text-gray-500">LeetCode Rating</span>
              <h4 className="text-base font-black text-white">1840 (Knight)</h4>
            </div>
          </div>
          <span className="text-[10px] text-gray-500 font-bold">Top 6.8% global</span>
        </GlassCard>

        {/* Practice metrics card */}
        <GlassCard className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-black text-gray-500">Codeforces Rank</span>
              <h4 className="text-base font-black text-white">1420 (Specialist)</h4>
            </div>
          </div>
          <span className="text-[10px] text-gray-500 font-bold">12 contests played</span>
        </GlassCard>
      </div>

      {/* Contest List Grid */}
      <div className="space-y-4">
        <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
          <Calendar className="h-4.5 w-4.5 text-primary-400" />
          <span>Upcoming Coding Contests</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contests.map(contest => (
            <GlassCard key={contest.id} className="p-4 flex flex-col justify-between h-40 border-dark-border/40">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${getPlatformStyle(contest.platform)}`}>
                    {contest.platform}
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {contest.duration}
                  </span>
                </div>

                <div>
                  <h5 className="text-xs font-extrabold text-white leading-tight">{contest.title}</h5>
                  <p className="text-[10px] text-gray-400 font-semibold mt-1">
                    {contest.date} • {contest.time}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-dark-border/20 mt-4">
                <button
                  onClick={() => toggleRegister(contest.id)}
                  className={`text-[10px] font-bold py-1 px-3.5 rounded-xl border transition-all ${
                    contest.registered
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
                      : 'bg-primary-600/10 border-primary-500/20 text-primary-400 hover:text-white'
                  }`}
                >
                  {contest.registered ? 'Registered ✓' : 'Register Now'}
                </button>

                <a
                  href={`https://${contest.platform.toLowerCase()}.com`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-500 hover:text-white p-1 rounded hover:bg-dark-hover transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};
export default ContestHub;
