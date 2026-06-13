import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Briefcase } from 'lucide-react';
import { authStart, authSuccess, authFailure } from '../store/authSlice';
import type { RootState } from '../store';
import api from '../utils/api';
import { useToast } from '../components/Toast';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const { loading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !targetRole) {
      return showToast('Please fill in all fields.', 'error');
    }

    dispatch(authStart());

    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        targetRole,
      });
      dispatch(authSuccess({ user: response.data.user, token: response.data.accessToken }));
      showToast('Registration successful! Welcome to CareerPrep Pro.', 'success');
      navigate('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      dispatch(authFailure(message));
      showToast(message, 'error');
    }
  };

  const roles = [
    'Software Engineer',
    'Java Developer',
    'Full Stack Developer',
    'Backend Developer',
    'Frontend Developer',
    'Data Analyst',
    'Data Scientist',
    'AI/ML Engineer',
    'DevOps Engineer',
    'Cloud Engineer',
    'QA Engineer',
    'Product Manager',
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4 py-12 relative">
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
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Create Your Account</h2>
            <p className="text-gray-400 text-xs mt-2">Get access to custom mock runs and resume optimization.</p>
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Full Name</label>
              <div className="relative">
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 transition-colors"
                />
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-500" />
              </div>
            </div>

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
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Target Position</label>
              <div className="relative">
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl pl-11 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary-500 transition-colors appearance-none cursor-pointer"
                >
                  {roles.map((r) => (
                    <option key={r} value={r} className="bg-dark-card text-white">
                      {r}
                    </option>
                  ))}
                </select>
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-500" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Create Password</label>
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
              Sign Up
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-accent-purple hover:text-accent-pink transition-colors">
              Log In
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
};
