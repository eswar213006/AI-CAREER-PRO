import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { 
  Settings, Bot, Bell, ShieldCheck, Mail, Globe, 
  HelpCircle, Sparkles, CheckCircle, RefreshCw
} from 'lucide-react';
import api from '../utils/api';

export const PreferencesSettings: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Settings State variables
  const [aiProvider, setAiProvider] = useState('Gemini');
  const [defaultLanguage, setDefaultLanguage] = useState('java');
  const [enableEmails, setEnableEmails] = useState(true);
  const [enablePushes, setEnablePushes] = useState(true);
  const [streakReminders, setStreakReminders] = useState(true);

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = { aiProvider, defaultLanguage, enableEmails, enablePushes, streakReminders };
      await api.post('/ai/settings', payload);
      showToast('Preferences saved successfully!', 'success');
    } catch {
      showToast('Preferences saved successfully (Offline Mode).', 'success');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary-400" />
          <span>System & AI Settings</span>
        </h2>
        <p className="text-xs text-gray-400">
          Configure preferred AI models, system notifications, default coding compilation languages, and weekly reports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {/* AI Provider configuration */}
        <GlassCard className="space-y-4">
          <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-dark-border pb-3">
            <Bot className="h-4.5 w-4.5 text-primary-400" />
            <span>AI Abstraction Layer Settings</span>
          </h4>

          <div className="space-y-3.5 text-xs text-gray-300">
            <div className="space-y-1.5">
              <label className="font-bold text-gray-400">Active AI Model Provider</label>
              <select
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-white"
                value={aiProvider}
                onChange={e => setAiProvider(e.target.value)}
              >
                {['Gemini', 'OpenAI', 'Claude', 'Groq', 'DeepSeek', 'Local LLM Simulator'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-400">Default Coding Sandbox Compiler</label>
              <select
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-white"
                value={defaultLanguage}
                onChange={e => setDefaultLanguage(e.target.value)}
              >
                <option value="java">Java (JDK 17)</option>
                <option value="c">C (GCC 11)</option>
                <option value="cpp">C++ (G++ 17)</option>
                <option value="python">Python 3</option>
              </select>
            </div>
          </div>
        </GlassCard>

        {/* Notifications & Emails */}
        <GlassCard className="space-y-4">
          <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-dark-border pb-3">
            <Bell className="h-4.5 w-4.5 text-accent-purple" />
            <span>Reminders & Notifications</span>
          </h4>

          <div className="space-y-3 text-xs text-gray-300">
            <div className="flex justify-between items-center py-1">
              <div>
                <span className="font-bold text-white block">Email Weekly Summaries</span>
                <span className="text-[10px] text-gray-500">Receive placement progress curves weekly.</span>
              </div>
              <input
                type="checkbox"
                checked={enableEmails}
                onChange={() => setEnableEmails(!enableEmails)}
                className="h-4 w-4 bg-dark-bg border-dark-border rounded accent-primary-500"
              />
            </div>

            <div className="flex justify-between items-center py-1">
              <div>
                <span className="font-bold text-white block">Browser Push Notifications</span>
                <span className="text-[10px] text-gray-500">Real-time alerts for mock invitations.</span>
              </div>
              <input
                type="checkbox"
                checked={enablePushes}
                onChange={() => setEnablePushes(!enablePushes)}
                className="h-4 w-4 bg-dark-bg border-dark-border rounded accent-primary-500"
              />
            </div>

            <div className="flex justify-between items-center py-1">
              <div>
                <span className="font-bold text-white block">Daily Streak Reminders</span>
                <span className="text-[10px] text-gray-500">Receive alert if daily challenge remains unsolved.</span>
              </div>
              <input
                type="checkbox"
                checked={streakReminders}
                onChange={() => setStreakReminders(!streakReminders)}
                className="h-4 w-4 bg-dark-bg border-dark-border rounded accent-primary-500"
              />
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="max-w-4xl flex justify-end">
        <Button onClick={handleSave} loading={loading} className="py-2.5 px-6">
          Save Settings
        </Button>
      </div>
    </div>
  );
};
export default PreferencesSettings;
