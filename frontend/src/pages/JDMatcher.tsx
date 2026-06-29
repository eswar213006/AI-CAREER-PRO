import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { 
  FileCheck, Sparkles, Upload, FileText, CheckCircle, AlertTriangle, 
  HelpCircle, BarChart2, TrendingUp, Info
} from 'lucide-react';
import api from '../utils/api';

interface MatchDetails {
  matchPercentage: number;
  interviewProbability: number;
  missingKeywords: string[];
  matchedKeywords: string[];
  suggestions: string[];
}

export const JDMatcher: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [report, setReport] = useState<MatchDetails | null>(null);

  const handleMatch = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      showToast('Please fill out both fields.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/jd-matcher/analyze', { resumeText, jobDescription });
      setReport(res.data);
      showToast('JD comparison complete!', 'success');
    } catch {
      // Mock analyzer logic
      const jdWords = jobDescription.toLowerCase().split(/\s+/);
      const resumeWords = resumeText.toLowerCase().split(/\s+/);
      
      const commonKeywords = ['java', 'react', 'typescript', 'sql', 'dsa', 'dbms', 'aws', 'docker', 'kubernetes', 'system design'];
      const matched = commonKeywords.filter(w => jdWords.includes(w) && resumeWords.includes(w));
      const missing = commonKeywords.filter(w => jdWords.includes(w) && !resumeWords.includes(w));
      
      const matchPct = 40 + (matched.length * 8) - (missing.length * 3);
      const matchedPercentage = Math.max(Math.min(matchPct, 95), 10);
      
      setReport({
        matchPercentage: matchedPercentage,
        interviewProbability: Math.round(matchedPercentage * 0.9),
        missingKeywords: missing.length > 0 ? missing : ['No major missing keywords found.'],
        matchedKeywords: matched.length > 0 ? matched : ['No matching keywords found.'],
        suggestions: [
          'Incorporate missing technical skills into your Skills and Projects description.',
          'Quantify achievement bullet points (e.g. Optimized database performance by 25%).',
          'Align your resume headline with target job description naming.'
        ]
      });
      showToast('JD comparison complete (Offline Mode).', 'success');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-primary-400" />
          <span>ATS Resume VS Job Description Matcher</span>
        </h2>
        <p className="text-xs text-gray-400">
          Compare your resume qualifications against detailed Job Descriptions to find gaps, missing keywords, and match percentages.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Left Input Fields */}
        <div className="space-y-5">
          <GlassCard className="space-y-3">
            <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-dark-border pb-3">
              <FileText className="h-4 w-4 text-primary-400" />
              <span>Resume Text / Paste Details</span>
            </h4>
            <textarea
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-3 text-xs text-emerald-400 font-mono resize-none focus:outline-none focus:border-primary-500/50"
              rows={8}
              placeholder="Paste the raw text of your resume here..."
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
            />
          </GlassCard>

          <GlassCard className="space-y-3">
            <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-dark-border pb-3">
              <Sparkles className="h-4 w-4 text-accent-purple" />
              <span>Target Job Description</span>
            </h4>
            <textarea
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-3 text-xs text-gray-300 resize-none focus:outline-none focus:border-accent-purple/50"
              rows={8}
              placeholder="Paste the requirements or job description from hiring board..."
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
            />
          </GlassCard>

          <Button onClick={handleMatch} loading={loading} className="w-full py-2.5 flex items-center justify-center gap-1">
            <Sparkles className="h-4 w-4 mr-1" /> Compare Resume vs JD
          </Button>
        </div>

        {/* Right Side: Renders comparison details */}
        <div className="space-y-6">
          {report ? (
            <div className="space-y-6 text-xs text-gray-300">
              
              {/* Overall Match Score */}
              <div className="grid grid-cols-2 gap-4">
                <GlassCard className="flex flex-col items-center justify-center p-5 text-center space-y-2">
                  <span className="text-[9px] uppercase font-bold text-gray-500 block">ATS Match Score</span>
                  <div className="text-3xl font-black text-emerald-400">{report.matchPercentage}%</div>
                  <span className="text-[8px] font-black uppercase text-emerald-500/70">Matching index</span>
                </GlassCard>

                <GlassCard className="flex flex-col items-center justify-center p-5 text-center space-y-2">
                  <span className="text-[9px] uppercase font-bold text-gray-500 block">Interview Probability</span>
                  <div className="text-3xl font-black text-primary-400">{report.interviewProbability}%</div>
                  <span className="text-[8px] font-black uppercase text-primary-500/70">Probability Index</span>
                </GlassCard>
              </div>

              {/* Keyword Analytics */}
              <div className="grid grid-cols-2 gap-4">
                <GlassCard className="space-y-2">
                  <h5 className="text-[10px] font-black uppercase text-emerald-400 flex items-center gap-1.5 border-b border-dark-border pb-2">
                    <CheckCircle className="h-4 w-4" /> Matched Keywords
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {report.matchedKeywords.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-emerald-950/20 border border-emerald-900/30 text-[9px] font-bold text-emerald-400 uppercase">
                        {kw}
                      </span>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="space-y-2">
                  <h5 className="text-[10px] font-black uppercase text-red-400 flex items-center gap-1.5 border-b border-dark-border pb-2">
                    <AlertTriangle className="h-4 w-4" /> Missing Keywords
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {report.missingKeywords.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-red-950/20 border border-red-900/30 text-[9px] font-bold text-red-400 uppercase">
                        {kw}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              </div>

              {/* Suggestions */}
              <GlassCard className="space-y-3">
                <h5 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-dark-border pb-3">
                  <Info className="h-4 w-4 text-primary-400" />
                  <span>Resume Enhancement Guidelines</span>
                </h5>
                <div className="space-y-2.5">
                  {report.suggestions.map((sug, i) => (
                    <div key={i} className="p-3 bg-dark-bg border border-dark-border rounded-xl flex items-start gap-3">
                      <span className="h-5 w-5 rounded-lg bg-primary-600/10 border border-primary-500/20 flex items-center justify-center text-[10px] font-black text-primary-400 shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-xs text-gray-300 leading-relaxed">{sug}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>

            </div>
          ) : (
            <GlassCard className="text-center py-36 text-gray-500 space-y-2">
              <Upload className="h-10 w-10 mx-auto text-gray-600" />
              <p className="text-xs font-semibold">No comparison data analyzed.</p>
              <p className="text-[10px] text-gray-650 max-w-xs mx-auto">Fill in the Resume text and target Job Description, then trigger comparison analysis.</p>
            </GlassCard>
          )}
        </div>

      </div>
    </div>
  );
};
export default JDMatcher;
