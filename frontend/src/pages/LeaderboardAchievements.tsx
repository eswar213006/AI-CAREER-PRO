import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { 
  Trophy, Award, Users, Star, Flame, Target, Compass, 
  Crown, ShieldCheck, Zap, ChevronRight, Gift
} from 'lucide-react';

interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  solvedCount: number;
  isMe: boolean;
}

interface BadgeItem {
  id: string;
  title: string;
  desc: string;
  unlocked: boolean;
  icon: string;
}

const STATIC_LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, name: 'Sneha Rao', avatar: '👩‍💻', xp: 1420, solvedCount: 48, isMe: false },
  { rank: 2, name: 'Eswar Student', avatar: '👨‍💻', xp: 1250, solvedCount: 37, isMe: true },
  { rank: 3, name: 'Nikhil Kumar', avatar: '👨‍🎓', xp: 980, solvedCount: 29, isMe: false },
  { rank: 4, name: 'Aakash Verma', avatar: '🧑‍💻', xp: 820, solvedCount: 22, isMe: false }
];

const STATIC_BADGES: BadgeItem[] = [
  { id: '1', title: 'DSA Knight', desc: 'Solve 25+ DSA problems optimally in sandbox.', unlocked: true, icon: '⚔️' },
  { id: '2', title: 'STAR HR Communicator', desc: 'Unlock 85%+ score on behavioral HR evaluations.', unlocked: true, icon: '🎙️' },
  { id: '3', title: 'Resume Wizard', desc: 'Optimize ATS resume evaluation rating above 80.', unlocked: true, icon: '📜' },
  { id: '4', title: 'Contest Master', desc: 'Participate and place in 5 competitive mock hubs.', unlocked: false, icon: '👑' },
  { id: '5', title: 'Code Streaker', desc: 'Maintain a 7-day daily challenge streak.', unlocked: false, icon: '🔥' }
];

export const LeaderboardAchievements: React.FC = () => {
  const { showToast } = useToast();
  const [boardType, setBoardType] = useState<'global' | 'friends'>('global');

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary-400" />
          <span>Leaderboard & Merit Achievements</span>
        </h2>
        <p className="text-xs text-gray-400">
          Monitor your rank positioning, unlocked merit badges, and earn XP points relative to global candidates.
        </p>
      </div>

      {/* Gamification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="flex items-center gap-3 p-4 border-amber-500/25">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Crown className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-black text-gray-500">Global Rank Position</span>
            <h4 className="text-base font-black text-white">#2 Rank</h4>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-3 p-4 border-primary-500/25">
          <div className="p-2.5 rounded-xl bg-primary-500/10 border border-primary-500/30 text-primary-400">
            <Star className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-black text-gray-500">Badges Unlocked</span>
            <h4 className="text-base font-black text-white">
              {STATIC_BADGES.filter(b => b.unlocked).length} / {STATIC_BADGES.length} Badges
            </h4>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-3 p-4 border-emerald-500/25">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-black text-gray-500">Tier Level</span>
            <h4 className="text-base font-black text-white">Platinum Tier</h4>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Leaderboard Column */}
        <GlassCard className="space-y-4">
          <div className="flex justify-between items-center border-b border-dark-border pb-3">
            <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-accent-purple" />
              <span>Rankings Board</span>
            </h3>

            {/* Toggle */}
            <div className="flex gap-1 border border-dark-border rounded-xl p-0.5 bg-dark-bg/60">
              {['global', 'friends'].map(type => (
                <button
                  key={type}
                  onClick={() => setBoardType(type as any)}
                  className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${
                    boardType === type 
                      ? 'bg-primary-600/20 text-white border border-primary-500/30' 
                      : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-gray-300">
            {STATIC_LEADERBOARD.map(user => (
              <div 
                key={user.rank}
                className={`flex justify-between items-center p-3 rounded-xl border transition-all duration-200 ${
                  user.isMe 
                    ? 'bg-primary-950/20 border-primary-500/40 text-white font-extrabold shadow-inner' 
                    : 'bg-dark-bg/60 border-dark-border text-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`h-6 w-6 rounded-full flex items-center justify-center font-black text-[10px] ${
                    user.rank === 1 ? 'bg-yellow-500 text-dark-bg' :
                    user.rank === 2 ? 'bg-gray-350 text-dark-bg' :
                    user.rank === 3 ? 'bg-amber-700 text-dark-bg' : 'bg-dark-border text-white'
                  }`}>
                    {user.rank}
                  </span>
                  <span className="text-xl">{user.avatar}</span>
                  <div>
                    <h5 className="font-extrabold">{user.name} {user.isMe && <span className="text-[8px] uppercase text-primary-400 bg-primary-600/10 px-1.5 py-0.5 rounded border border-primary-500/30 ml-1">You</span>}</h5>
                    <p className="text-[9px] text-gray-500 mt-0.5">{user.solvedCount} Problems solved</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-black text-emerald-400">+{user.xp} XP</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Achievements / Badges Column */}
        <GlassCard className="space-y-4">
          <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-dark-border pb-3">
            <Award className="h-4.5 w-4.5 text-primary-400" />
            <span>Merit Badges Catalog</span>
          </h3>

          <div className="space-y-3">
            {STATIC_BADGES.map(badge => (
              <div 
                key={badge.id}
                className={`p-3.5 rounded-xl border flex items-start gap-4 transition-all duration-200 ${
                  badge.unlocked 
                    ? 'bg-dark-bg/60 border-dark-border text-gray-300' 
                    : 'bg-dark-bg/20 border-dark-border/40 opacity-50'
                }`}
              >
                <span className="text-3xl shrink-0 p-1.5 bg-dark-bg border border-dark-border rounded-xl">
                  {badge.icon}
                </span>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-extrabold text-white">
                    <span>{badge.title}</span>
                    {badge.unlocked ? (
                      <span className="text-[8px] uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded">Unlocked</span>
                    ) : (
                      <span className="text-[8px] uppercase bg-dark-border border border-dark-border text-gray-500 px-2 py-0.5 rounded">Locked</span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

      </div>
    </div>
  );
};
export default LeaderboardAchievements;
