import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ShieldCheck } from 'lucide-react';
import { authStart, authSuccess, authFailure } from '../store/authSlice';
import type { RootState } from '../store';
import api from '../utils/api';
import { useToast } from '../components/Toast';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      return showToast('Please fill in all fields.', 'error');
    }

    dispatch(authStart());

    try {
      const response = await api.post('/auth/login', { email, password });
      dispatch(authSuccess({ user: response.data.user, token: response.data.accessToken }));
      showToast('Welcome back! Login successful.', 'success');
      navigate('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please check credentials.';
      dispatch(authFailure(message));
      showToast(message, 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4 relative">
      <div className="absolute top-8 left-8 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary-600 to-accent-purple flex items-center justify-center font-bold text-white text-xs">
            CP
          </div>
          <span className="font-extrabold text-xs text-white tracking-widest uppercase">CareerPrep Pro</span>
        </Link>
      </div>

      <div className="w-full max-w-md">
        <GlassCard glow className="p-8">
          <div className="text-center mb-6">
            <div className="h-12 w-12 rounded-2xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="h-6 w-6 text-primary-400" />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Access Your Portal</h2>
            <p className="text-gray-400 text-xs mt-2">Log in to continue your placement preparation.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Email Address</label>
              <div className="relative">
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 transition-colors"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-500" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] uppercase font-bold text-gray-400">Password</label>
                <Link to="/forgot-password" className="text-[10px] font-bold text-primary-400 hover:text-primary-300">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 transition-colors"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-500" />
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full mt-4">
              Log In
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-accent-purple hover:text-accent-pink transition-colors">
              Sign Up
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
};
