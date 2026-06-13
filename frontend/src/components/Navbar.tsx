import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Flame, Award, LogOut, User as UserIcon } from 'lucide-react';
import type { RootState } from '../store';
import { logoutSuccess } from '../store/authSlice';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import { useToast } from './Toast';

interface NavbarProps {
  title: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      dispatch(logoutSuccess());
      showToast('Logged out successfully.', 'success');
      navigate('/');
    } catch (error: any) {
      showToast('Logout failed.', 'error');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 border-b border-dark-border bg-dark-bg/80 backdrop-blur-md">
      {/* Title */}
      <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>

      {/* Action panel */}
      <div className="flex items-center gap-6">
        {user && (
          <>
            {/* Streak count */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-semibold text-xs cursor-default hover:scale-105 transition-transform duration-200" title="Daily Active Streak">
              <Flame className="h-4 w-4 fill-orange-500" />
              <span>{user.stats?.currentStreak || 0} Day Streak</span>
            </div>

            {/* XP Points */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 font-semibold text-xs cursor-default hover:scale-105 transition-transform duration-200" title="XP Points">
              <Award className="h-4 w-4 fill-primary-500" />
              <span>{user.stats?.xp || 0} XP</span>
            </div>
          </>
        )}

        {/* Theme Toggler */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-dark-border bg-dark-card hover:bg-dark-hover hover:border-gray-500 transition-colors text-gray-400 hover:text-gray-100"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-blue-500" />}
        </button>

        {user && (
          <div className="flex items-center gap-3 pl-4 border-l border-dark-border">
            {/* Profile Brief */}
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-white">{user.profile?.name}</p>
              <p className="text-[10px] text-gray-400 capitalize">{user.role}</p>
            </div>
            
            <div className="relative group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-purple flex items-center justify-center font-bold text-white text-sm cursor-pointer shadow-md shadow-primary-900/20">
                {user.profile?.name ? user.profile.name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
              </div>

              {/* Profile dropdown */}
              <div className="absolute right-0 mt-2 w-48 py-2 bg-dark-card border border-dark-border rounded-xl shadow-2xl invisible group-hover:visible hover:visible transition-all opacity-0 group-hover:opacity-100 duration-200 z-50">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-dark-hover hover:text-white flex items-center gap-2"
                >
                  <UserIcon className="h-3.5 w-3.5 text-gray-400" />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-950/20 hover:text-red-300 flex items-center gap-2 border-t border-dark-border mt-1"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
