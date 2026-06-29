import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  LayoutDashboard, 
  FileText, 
  Video, 
  Code2, 
  BookOpen, 
  ShieldAlert, 
  Home, 
  Award,
  ChevronRight,
  TrendingUp,
  Building2,
  Calendar,
  Compass,
  Cpu,
  BookMarked,
  Layers,
  MessageSquare,
  Trophy,
  Users,
  Settings,
  HelpCircle,
  Briefcase,
  Flame,
  FileCheck
} from 'lucide-react';
import type { RootState } from '../store';

export const Sidebar: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const navigationGroups = [
    {
      title: 'Dashboard & Analytics',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
        { name: 'Placement Readiness', path: '/readiness', icon: <TrendingUp className="h-4.5 w-4.5" /> },
        { name: 'Detailed Analytics', path: '/analytics', icon: <Layers className="h-4.5 w-4.5" /> },
      ]
    },
    {
      title: 'AI Development Kits',
      items: [
        { name: 'Coding Sandbox', path: '/coding', icon: <Code2 className="h-4.5 w-4.5" /> },
        { name: 'ATS Resume Builder', path: '/resume-builder', icon: <FileText className="h-4.5 w-4.5" /> },
        { name: 'JD Matcher', path: '/jd-matcher', icon: <FileCheck className="h-4.5 w-4.5" /> },
        { name: 'LinkedIn Optimizer', path: '/linkedin-optimizer', icon: <Cpu className="h-4.5 w-4.5" /> },
        { name: 'AI Notes & Mindmaps', path: '/notes', icon: <BookMarked className="h-4.5 w-4.5" /> },
        { name: 'Project Generator', path: '/project-gen', icon: <Compass className="h-4.5 w-4.5" /> },
      ]
    },
    {
      title: 'Placement Practice',
      items: [
        { name: 'AI Career Mentor', path: '/mentor', icon: <Users className="h-4.5 w-4.5" /> },
        { name: 'AI Study Planner', path: '/study-planner', icon: <Calendar className="h-4.5 w-4.5" /> },
        { name: 'Company Preparation', path: '/company-prep', icon: <Building2 className="h-4.5 w-4.5" /> },
        { name: 'Daily Streaks', path: '/challenges', icon: <Flame className="h-4.5 w-4.5" /> },
        { name: 'Flip Flashcards', path: '/flashcards', icon: <Layers className="h-4.5 w-4.5" /> },
        { name: 'Prep Practice Hub', path: '/prep-hub', icon: <BookOpen className="h-4.5 w-4.5" /> },
      ]
    },
    {
      title: 'Interviews & Community',
      items: [
        { name: 'Coding Mock Setup', path: '/interview', icon: <Video className="h-4.5 w-4.5" /> },
        { name: 'Behavioral HR Mock', path: '/hr-interview', icon: <HelpCircle className="h-4.5 w-4.5" /> },
        { name: 'Contest Hub Calendar', path: '/contest-hub', icon: <Briefcase className="h-4.5 w-4.5" /> },
        { name: 'Leaderboard & Merit', path: '/leaderboard', icon: <Trophy className="h-4.5 w-4.5" /> },
        { name: 'Discussion Forums', path: '/community', icon: <MessageSquare className="h-4.5 w-4.5" /> },
        { name: 'Recruiter Workspace', path: '/recruiter-portal', icon: <Users className="h-4.5 w-4.5" /> },
        { name: 'System Settings', path: '/settings', icon: <Settings className="h-4.5 w-4.5" /> },
      ]
    }
  ];

  return (
    <aside className="w-64 h-screen border-r border-dark-border bg-dark-card/40 backdrop-blur-md flex flex-col justify-between shrink-0 overflow-y-auto scrollbar-thin">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="px-6 py-5 border-b border-dark-border flex items-center gap-3 sticky top-0 bg-dark-bg/85 backdrop-blur z-10">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-purple flex items-center justify-center font-bold text-white shadow-lg shadow-primary-500/20">
            CP
          </div>
          <div>
            <span className="font-extrabold text-sm text-white tracking-wider font-sans">CAREERPREP</span>
            <span className="block text-[10px] text-primary-400 font-bold tracking-widest -mt-1">PRO SYSTEM</span>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="p-4 flex flex-col gap-6">
          {navigationGroups.map((group, index) => (
            <div key={index} className="flex flex-col gap-1.5">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black px-4 mb-1 block">
                {group.title}
              </span>
              {group.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-2.5 rounded-xl text-[11px] font-bold tracking-wide transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-600/20 to-primary-500/10 border border-primary-500/30 text-white shadow-inner'
                        : 'text-gray-400 hover:bg-dark-hover hover:text-gray-100 hover:translate-x-0.5'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-500/40" />
                </NavLink>
              ))}
            </div>
          ))}

          {/* Admin panel option */}
          {user && user.role === 'admin' && (
            <div className="flex flex-col gap-1 border-t border-dark-border pt-4">
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-2.5 rounded-xl text-[11px] font-bold tracking-wide transition-all duration-200 border border-dashed ${
                    isActive
                      ? 'bg-red-950/20 border-red-500/50 text-red-300 shadow-inner'
                      : 'border-red-900/30 text-red-400/80 hover:bg-red-950/10 hover:text-red-300 hover:translate-x-0.5'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-4.5 w-4.5" />
                  <span>Admin Panel</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-red-700/50" />
              </NavLink>
            </div>
          )}
        </div>
      </div>

      {/* Footer link to landing */}
      <div className="p-4 border-t border-dark-border bg-dark-bg/45 mt-auto">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold text-gray-400 hover:bg-dark-hover hover:text-white transition-colors duration-200"
        >
          <Home className="h-4.5 w-4.5 text-gray-500" />
          <span>Back to Landing</span>
        </NavLink>
      </div>
    </aside>
  );
};
