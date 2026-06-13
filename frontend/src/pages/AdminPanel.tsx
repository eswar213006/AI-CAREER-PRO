import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Users, 
  Cpu, 
  TrendingUp, 
  Terminal, 
  Video, 
  UserX, 
  UserCheck, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import type { RootState } from '../store';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import api from '../utils/api';

export const AdminPanel: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { showToast } = useToast();

  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      const statsResponse = await api.get('/admin/stats');
      setStats(statsResponse.data.stats);

      const usersResponse = await api.get('/admin/users');
      setUsersList(usersResponse.data.users);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Access Denied. Admins only.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleToggleRole = async (targetUserId: string, currentRole: 'student' | 'admin') => {
    setActionLoading(targetUserId);
    const newRole = currentRole === 'student' ? 'admin' : 'student';

    try {
      await api.put('/admin/user/role', {
        userId: targetUserId,
        role: newRole
      });

      // Update local state
      setUsersList((prev) =>
        prev.map((u) => (u._id === targetUserId || u.id === targetUserId ? { ...u, role: newRole } : u))
      );
      showToast('User authorization role updated successfully.', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Role modification failed.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  // Restrict access if unauthorized
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-md mx-auto space-y-4">
        <div className="h-16 w-16 bg-red-950/20 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-500 animate-bounce">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Access Prohibited</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          The requested page contains administrator controls. Your account does not have access permissions. Please contact team systems.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-red-500" />
          <span>System Admin Operations Console</span>
        </h2>
        <p className="text-xs text-gray-400">Monitor Gemini API traffic loads, manage user authorization roles, and inspect dashboard metrics.</p>
      </div>

      {/* KPI stats metrics */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard className="border-primary-500/20 flex items-center gap-4">
            <div className="h-11 w-11 bg-primary-500/10 border border-primary-500/20 rounded-xl flex items-center justify-center text-primary-400">
              <Users className="h-5.5 w-5.5" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-gray-500 block">Total Registrations</span>
              <p className="text-2xl font-black text-white">{stats.totalUsers}</p>
              <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">Active today: {stats.activeUsers}</span>
            </div>
          </GlassCard>

          <GlassCard className="border-accent-purple/20 flex items-center gap-4">
            <div className="h-11 w-11 bg-accent-purple/10 border border-accent-purple/20 rounded-xl flex items-center justify-center text-accent-purple">
              <Video className="h-5.5 w-5.5" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-gray-500 block">Mocks Conducted</span>
              <p className="text-2xl font-black text-white">{stats.totalInterviews}</p>
              <span className="text-[9px] text-gray-500 block">Gemini evaluations</span>
            </div>
          </GlassCard>

          <GlassCard className="border-accent-cyan/20 flex items-center gap-4">
            <div className="h-11 w-11 bg-accent-cyan/10 border border-accent-cyan/20 rounded-xl flex items-center justify-center text-accent-cyan">
              <Terminal className="h-5.5 w-5.5" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-gray-500 block">Coding Submissions</span>
              <p className="text-2xl font-black text-white">{stats.totalSubmissions}</p>
              <span className="text-[9px] text-gray-500 block">V8 Sandbox VM executions</span>
            </div>
          </GlassCard>

          <GlassCard className="border-emerald-500/20 flex items-center gap-4">
            <div className="h-11 w-11 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
              <TrendingUp className="h-5.5 w-5.5" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-gray-500 block">Monthly MRR (Mock)</span>
              <p className="text-2xl font-black text-white">${stats.revenueMetrics?.totalRevenue}</p>
              <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">+{stats.revenueMetrics?.growthTrend}% growth</span>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Grid: Gemini API Token usage area charts */}
      {stats?.aiUsageStats && (
        <GlassCard className="space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Cpu className="h-4.5 w-4.5 text-accent-purple" />
            <span>AI Token Traffic monitor (Weekly Request load)</span>
          </h3>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.aiUsageStats.dailyTokenConsumption}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#22324D" opacity={0.3} />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={9} />
                <YAxis stroke="#9CA3AF" fontSize={9} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161F30', borderColor: '#22324D', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontSize: '10px' }}
                  itemStyle={{ fontSize: '10px' }}
                />
                <Legend wrapperStyle={{ fontSize: '9px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="resumeTokens" stackId="1" stroke="#3D73FF" fill="#3D73FF" fillOpacity={0.3} name="Resume parser (Tokens)" />
                <Area type="monotone" dataKey="interviewTokens" stackId="1" stroke="#A855F7" fill="#A855F7" fillOpacity={0.3} name="Interview Evaluator (Tokens)" />
                <Area type="monotone" dataKey="codingTokens" stackId="1" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.3} name="Sandbox reviews (Tokens)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      {/* Users table */}
      <GlassCard className="space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Student & Admin Accounts Database</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-dark-border text-gray-500 font-bold uppercase tracking-wider">
                <th className="pb-3.5 pl-2">Name</th>
                <th className="pb-3.5">Email Address</th>
                <th className="pb-3.5">System Role</th>
                <th className="pb-3.5">XP Points</th>
                <th className="pb-3.5">Streak</th>
                <th className="pb-3.5 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/40 font-medium">
              {usersList.map((usr) => (
                <tr key={usr._id || usr.id} className="text-gray-300 hover:bg-dark-hover/10 transition-colors">
                  <td className="py-4 pl-2 font-bold text-white">{usr.profile?.name || 'N/A'}</td>
                  <td className="py-4 font-mono text-gray-400">{usr.email}</td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                      usr.role === 'admin' 
                        ? 'bg-red-950/20 border-red-500/40 text-red-400' 
                        : 'bg-primary-950/20 border-primary-500/40 text-primary-400'
                    }`}>
                      {usr.role}
                    </span>
                  </td>
                  <td className="py-4 font-bold">{usr.stats?.xp || 0} XP</td>
                  <td className="py-4 text-orange-400 font-bold">🔥 {usr.stats?.currentStreak || 1} day</td>
                  <td className="py-4 pr-2 text-right">
                    <button
                      disabled={actionLoading !== null || usr.email === user.email}
                      onClick={() => handleToggleRole(usr._id || usr.id, usr.role)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                        usr.role === 'admin'
                          ? 'border-red-900/30 bg-red-950/15 hover:bg-red-950/30 text-red-400'
                          : 'border-emerald-900/30 bg-emerald-950/15 hover:bg-emerald-950/30 text-emerald-400'
                      } disabled:opacity-30 disabled:cursor-not-allowed`}
                    >
                      {usr.role === 'admin' ? (
                        <>
                          <UserX className="h-3.5 w-3.5" />
                          <span>Revoke Admin</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Promote Admin</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
