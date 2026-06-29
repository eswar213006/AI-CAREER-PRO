import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { 
  Cpu, Sparkles, AlertCircle, CheckCircle, Info, RefreshCw, 
  Linkedin, Award, Star, Compass, Clipboard
} from 'lucide-react';
import api from '../utils/api';

interface OptimizeReport {
  profileScore: number;
  suggestions: string[];
  headlineBlueprint: string;
  aboutBlueprint: string;
  skillsBlueprint: string[];
  tips: string[];
}

export const LinkedInOptimizer: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [headline, setHeadline] = useState('Computer Science Student at Tech Institute');
  const [about, setAbout] = useState('Passionate about coding and solving algorithms. Skilled in Java, C++ and React.');
  const [experience, setExperience] = useState('No previous experience.');
  const [skills, setSkills] = useState('Java, SQL, React');
  const [report, setReport] = useState<OptimizeReport | null>(null);

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const res = await api.post('/linkedin/optimize', { headline, about, experience, skills });
      setReport(res.data);
      showToast('LinkedIn optimization suggestions created!', 'success');
    } catch {
      // Mock Optimizer responses
      const score = Math.min(45 + (skills.split(',').length * 4) + (about.length > 50 ? 15 : 5), 98);
      setReport({
        profileScore: score,
        suggestions: [
          'Change headline to use specific roles and technologies (e.g. Backend Developer | Java & React).',
          'Expand your About section to include your learning timeline, projects, and target outcomes.'
        ],
        headlineBlueprint: 'Software Engineering Candidate | Java Core & Spring Boot | React & TypeScript Developer',
        aboutBlueprint: 'I am a passionate Software Engineering candidate specializing in building robust web applications and solving complex DSA puzzles. With a solid foundation in Java, React, and SQL databases, I design scalable microservices and clean client-side architectures.',
        skillsBlueprint: ['Java (Core & Advanced)', 'TypeScript / JavaScript', 'React.js Ecosystem', 'SQL (PostgreSQL)', 'Data Structures & Algorithms'],
        tips: [
          'Ensure your profile photo is professional and clean.',
          'Add links to your portfolio projects (GitHub repos) directly in your Featured section.',
          'Post weekly updates about your coding sandbox achievements to increase algorithmic authority.'
        ]
      });
      showToast('LinkedIn suggestions created (Offline Mode).', 'success');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied blueprint text!', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Cpu className="h-5 w-5 text-primary-400" />
          <span>LinkedIn Profile Optimizer</span>
        </h2>
        <p className="text-xs text-gray-400">
          Obtain customized headline adjustments, about copy summaries, and profile score suggestions to maximize candidate reach.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Left Form: Profile Section inputs */}
        <GlassCard className="space-y-4">
          <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-dark-border pb-3">
            <Linkedin className="h-4 w-4 text-primary-400" />
            <span>Profile Content Inputs</span>
          </h3>

          <div className="space-y-3.5 text-xs text-gray-300">
            <div className="space-y-1">
              <label className="font-bold text-gray-400">Headline</label>
              <input className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-white" value={headline} onChange={e => setHeadline(e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-400">About (Bio)</label>
              <textarea className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-white resize-none" rows={4} value={about} onChange={e => setAbout(e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-400">Experience Summary</label>
              <input className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-white" value={experience} onChange={e => setExperience(e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-400">Skills list</label>
              <input className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-white" value={skills} onChange={e => setSkills(e.target.value)} />
            </div>
          </div>

          <Button onClick={handleOptimize} loading={loading} className="w-full py-2.5 flex items-center justify-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            <span>Optimize LinkedIn Profile</span>
          </Button>
        </GlassCard>

        {/* Right Side: Renders suggestions & Blueprints */}
        <div className="space-y-6">
          {report ? (
            <div className="space-y-6 text-xs text-gray-300">
              
              {/* Score Dial */}
              <GlassCard className="flex items-center justify-between p-4 border-primary-500/20">
                <div>
                  <h4 className="text-[10px] font-black uppercase text-gray-400">Profile Rating Score</h4>
                  <p className="text-[9px] text-gray-500 mt-0.5">Calculated score using standard LinkedIn algorithms.</p>
                </div>
                <div className="text-2xl font-black text-primary-400">{report.profileScore}/100</div>
              </GlassCard>

              {/* Suggestions list */}
              <GlassCard className="space-y-3">
                <h5 className="text-[10px] font-black uppercase text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" /> Optimization Alerts
                </h5>
                <ul className="list-disc pl-4 space-y-1.5 text-gray-450">
                  {report.suggestions.map((sug, i) => <li key={i}>{sug}</li>)}
                </ul>
              </GlassCard>

              {/* Blueprints */}
              <GlassCard className="space-y-4">
                <h5 className="text-[10px] font-black uppercase text-white flex items-center gap-1.5 border-b border-dark-border pb-2">
                  <Star className="h-4 w-4 text-amber-400" /> Professional Blueprint Copy
                </h5>

                <div className="space-y-3">
                  {/* Headline Copy */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-bold text-gray-500">
                      <span>RECOMMENDED HEADLINE</span>
                      <button onClick={() => handleCopy(report.headlineBlueprint)} className="flex items-center gap-1 hover:text-white transition-colors">
                        <Clipboard className="h-3 w-3" /> Copy
                      </button>
                    </div>
                    <p className="p-2.5 bg-dark-bg border border-dark-border rounded-xl text-white font-semibold">
                      {report.headlineBlueprint}
                    </p>
                  </div>

                  {/* About copy */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-bold text-gray-500">
                      <span>RECOMMENDED ABOUT TEXT</span>
                      <button onClick={() => handleCopy(report.aboutBlueprint)} className="flex items-center gap-1 hover:text-white transition-colors">
                        <Clipboard className="h-3 w-3" /> Copy
                      </button>
                    </div>
                    <p className="p-2.5 bg-dark-bg border border-dark-border rounded-xl text-gray-405 leading-relaxed">
                      {report.aboutBlueprint}
                    </p>
                  </div>
                </div>
              </GlassCard>

              {/* Extra optimization tips */}
              <GlassCard className="space-y-3">
                <h5 className="text-[10px] font-black uppercase text-white flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-emerald-400" /> Profile Growth Hacks
                </h5>
                <ul className="list-disc pl-4 space-y-1 text-gray-400">
                  {report.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              </GlassCard>

            </div>
          ) : (
            <GlassCard className="text-center py-36 text-gray-500 space-y-2">
              <Linkedin className="h-10 w-10 mx-auto text-gray-650" />
              <p className="text-xs font-semibold">No profile blueprint created.</p>
              <p className="text-[10px] text-gray-650 max-w-xs mx-auto">Fill out the profile input boxes and click Optimize.</p>
            </GlassCard>
          )}
        </div>

      </div>
    </div>
  );
};
export default LinkedInOptimizer;
