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
  ChevronRight
} from 'lucide-react';
import type { RootState } from '../store';

export const Sidebar: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Resume Optimizer', path: '/resume', icon: <FileText className="h-5 w-5" /> },
    { name: 'Mock Interviews', path: '/interview', icon: <Video className="h-5 w-5" /> },
    { name: 'Coding Sandbox', path: '/coding', icon: <Code2 className="h-5 w-5" /> },
    { name: 'Practice Prep Hub', path: '/prep-hub', icon: <BookOpen className="h-5 w-5" /> },
  ];

  return (
    <aside className="w-64 h-screen border-r border-dark-border bg-dark-card/40 backdrop-blur-md flex flex-col justify-between shrink-0">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="px-6 py-5 border-b border-dark-border flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-purple flex items-center justify-center font-bold text-white shadow-lg shadow-primary-500/20">
            CP
          </div>
          <div>
            <span className="font-extrabold text-sm text-white tracking-wider font-sans">CAREERPREP</span>
            <span className="block text-[10px] text-primary-400 font-bold tracking-widest -mt-1">PRO SYSTEM</span>
          </div>
        </div>

        {/* Navigation lists */}
        <nav className="p-4 flex flex-col gap-1.5">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-600/20 to-primary-500/10 border border-primary-500/30 text-white shadow-inner'
                    : 'text-gray-400 hover:bg-dark-hover hover:text-gray-100 hover:translate-x-0.5'
                }`
              }
            >
              <div className="flex items-center gap-3.5">
                {item.icon}
                <span>{item.name}</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
            </NavLink>
          ))}

          {/* Admin panel option */}
          {user && user.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 mt-4 border border-dashed ${
                  isActive
                    ? 'bg-red-950/20 border-red-500/50 text-red-300 shadow-inner'
                    : 'border-red-900/30 text-red-400/80 hover:bg-red-950/10 hover:text-red-300 hover:translate-x-0.5'
                }`
              }
            >
              <div className="flex items-center gap-3.5">
                <ShieldAlert className="h-5 w-5" />
                <span>Admin Panel</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-red-700" />
            </NavLink>
          )}
        </nav>
      </div>

      {/* Footer link to landing */}
      <div className="p-4 border-t border-dark-border">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-gray-400 hover:bg-dark-hover hover:text-white transition-colors duration-200"
        >
          <Home className="h-5 w-5 text-gray-500" />
          <span>Back to Landing</span>
        </NavLink>
      </div>
    </aside>
  );
};
