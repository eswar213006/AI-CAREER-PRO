import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Briefcase, CheckCircle, Sparkles } from 'lucide-react';
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
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

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
      const response = await api.post('/auth/register', { name, email, password, targetRole });

      if (response.data.emailVerificationRequired) {
        // Email verification flow — show pending screen instead of auto-login
        dispatch(authFailure('')); // Clear loading state
        setEmailVerificationRequired(true);
        setRegisteredEmail(email);
      } else {
        // Auto-verified (simulation mode) — go to dashboard directly
        dispatch(authSuccess({ user: response.data.user, token: response.data.accessToken }));
        showToast('🎉 Registration successful! Welcome to AI CareerPrep Pro.', 'success');
        navigate('/dashboard');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      dispatch(authFailure(message));
      showToast(message, 'error');
    }
  };

  const roles = [
    'Software Engineer', 'Java Developer', 'Full Stack Developer', 'Backend Developer',
    'Frontend Developer', 'Data Analyst', 'Data Scientist', 'AI/ML Engineer',
    'DevOps Engineer', 'Cloud Engineer', 'QA Engineer', 'Product Manager',
  ];

  // ── Email verification pending screen ─────────────────────────────────────
  if (emailVerificationRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4 py-12">
        <div className="w-full max-w-md">
          <GlassCard glow className="p-10 text-center">
            {/* Animated mail icon */}
            <div className="relative mx-auto mb-6 w-20 h-20">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-purple/30 to-primary-500/20 border border-accent-purple/30 flex items-center justify-center animate-pulse">
                <Mail className="h-9 w-9 text-accent-purple" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-dark-card flex items-center justify-center">
                <CheckCircle className="h-3.5 w-3.5 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">Check your inbox!</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              We sent a verification link to<br />
              <span className="font-bold text-primary-400">{registeredEmail}</span>
            </p>

            <div className="bg-dark-bg/60 border border-dark-border rounded-xl p-4 text-left space-y-2 mb-6">
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Next steps</p>
              {[
                '📧 Open the email from AI CareerPrep Pro',
                '🔗 Click the "Verify My Email" button in the email',
                '🚀 You\'ll be redirected to login automatically',
              ].map((step, i) => (
                <p key={i} className="text-xs text-gray-300 flex items-start gap-2">
                  <span>{step}</span>
                </p>
              ))}
            </div>

            <p className="text-[11px] text-gray-500 mb-4">
              Didn't receive it? Check your spam folder, or{' '}
              <button
                onClick={handleRegister as any}
                className="text-accent-purple hover:text-accent-pink transition-colors font-bold"
              >
                resend the email
              </button>
            </p>

            <Button onClick={() => navigate('/login')} variant="secondary" className="w-full">
              Proceed to Login
            </Button>

            <p className="text-[10px] text-gray-600 mt-4 flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3" />
              Your 100 XP welcome bonus is ready and waiting!
            </p>
          </GlassCard>
        </div>
      </div>
    );
  }

  // ── Registration form ──────────────────────────────────────────────────────
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
            <p className="text-gray-400 text-xs mt-2">Get access to AI mock interviews, resume analysis & placement prep.</p>
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Full Name</label>
              <div className="relative">
                <input
                  required type="text" value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 transition-colors"
                />
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Email Address</label>
              <div className="relative">
                <input
                  required type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 transition-colors"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
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
                    <option key={r} value={r} className="bg-dark-card text-white">{r}</option>
                  ))}
                </select>
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Create Password</label>
              <div className="relative">
                <input
                  required type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  minLength={6}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 transition-colors"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full mt-4">
              Create Account
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
