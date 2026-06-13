import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Key } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import api from '../utils/api';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const { showToast } = useToast();

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return showToast('Please enter your email address.', 'error');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.token) {
        setToken(res.data.token);
        setStep('reset');
        showToast('Reset token generated. Enter it below to set a new password.', 'info');
      } else {
        showToast(res.data.message, 'info');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Request failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newPassword) return showToast('Token and password are required.', 'error');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: newPassword });
      showToast('Password reset successfully! Please log in.', 'success');
      setStep('email');
      setEmail('');
      setToken('');
      setNewPassword('');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Reset failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4">
      <div className="absolute top-8 left-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary-600 to-accent-purple flex items-center justify-center font-bold text-white text-xs">CP</div>
          <span className="font-extrabold text-xs text-white tracking-widest uppercase">CareerPrep Pro</span>
        </Link>
      </div>

      <div className="w-full max-w-md">
        <GlassCard glow className="p-8">
          <div className="text-center mb-6">
            <div className="h-12 w-12 rounded-2xl bg-accent-purple/10 border border-accent-purple/30 flex items-center justify-center mx-auto mb-4">
              <Key className="h-6 w-6 text-accent-purple" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              {step === 'email' ? 'Forgot Password' : 'Reset Password'}
            </h2>
            <p className="text-gray-400 text-xs mt-2">
              {step === 'email' ? 'Enter your email to receive a reset token.' : 'Enter the token and your new password.'}
            </p>
          </div>

          {step === 'email' ? (
            <form onSubmit={handleForgot} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Email Address</label>
                <div className="relative">
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@university.edu"
                    className="w-full bg-dark-bg border border-dark-border rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 transition-colors" />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-500" />
                </div>
              </div>
              <Button type="submit" loading={loading} className="w-full mt-2">Request Reset Token</Button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Reset Token</label>
                <input required type="text" value={token} onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste token here"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 transition-colors font-mono" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">New Password</label>
                <input required type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 transition-colors" />
              </div>
              <Button type="submit" loading={loading} className="w-full mt-2">Reset Password</Button>
              <button type="button" onClick={() => setStep('email')} className="text-xs text-gray-400 hover:text-white text-center transition-colors">
                ← Back to email
              </button>
            </form>
          )}

          <p className="text-center text-xs text-gray-400 mt-6">
            Remember your password?{' '}
            <Link to="/login" className="font-bold text-accent-purple hover:text-accent-pink transition-colors">Log In</Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
};
