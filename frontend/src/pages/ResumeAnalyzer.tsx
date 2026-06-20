import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  FileUp, FileCheck, CheckCircle2, XCircle, Lightbulb, Check,
  ShieldAlert, Wand2, Copy, Download, Clipboard, ClipboardCheck,
  ChevronRight, Loader2, Sparkles, Target, Code2
} from 'lucide-react';
import type { RootState } from '../store';
import { updateUser } from '../store/authSlice';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import api from '../utils/api';

// Inline simple markdown renderer (avoids dependency issues)
const renderMarkdown = (md: string): string => {
  return md
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-black text-white mt-6 mb-2">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-extrabold text-primary-400 mt-5 mb-2 border-b border-dark-border pb-1">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-bold text-white mt-4 mb-1">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-gray-400 italic">$1</em>')
    .replace(/^- (.+)$/gm, '<li class="flex gap-2 text-xs text-gray-300 mt-1"><span class="text-primary-400 mt-0.5 shrink-0">•</span><span>$1</span></li>')
    .replace(/(<li[\s\S]*?<\/li>)+/gm, (match) => `<ul class="mt-1 space-y-0.5">${match}</ul>`)
    .replace(/^(?!<[h|l|u])(.*\S.*)$/gm, '<p class="text-xs text-gray-300 leading-relaxed">$1</p>')
    .replace(/\n\n/g, '<br/>');
};

const ROLES = [
  'Software Engineer', 'Java Developer', 'Full Stack Developer',
  'Backend Developer', 'Frontend Developer', 'Data Analyst',
  'Data Scientist', 'AI/ML Engineer', 'DevOps Engineer',
  'Cloud Engineer', 'QA Engineer', 'Product Manager',
];

const EXPERIENCE_LEVELS = ['Fresher (0-1 years)', 'Junior (1-3 years)', 'Mid-Level (3-5 years)', 'Senior (5+ years)'];

const COMMON_STACKS: Record<string, string> = {
  'Software Engineer': 'JavaScript, TypeScript, React, Node.js, Python, REST APIs, Git',
  'Java Developer': 'Java, Spring Boot, Hibernate, Maven, MySQL, Docker, REST APIs',
  'Full Stack Developer': 'React, Node.js, Express, MongoDB, TypeScript, TailwindCSS, Git',
  'Backend Developer': 'Node.js, Python, PostgreSQL, Redis, Docker, Kubernetes, REST APIs',
  'Frontend Developer': 'React, TypeScript, Next.js, TailwindCSS, Figma, GraphQL',
  'Data Analyst': 'Python, SQL, Pandas, Matplotlib, Power BI, Excel, Tableau',
  'Data Scientist': 'Python, TensorFlow, PyTorch, Scikit-learn, Pandas, NLP, Statistics',
  'AI/ML Engineer': 'Python, PyTorch, TensorFlow, Hugging Face, LangChain, FastAPI',
  'DevOps Engineer': 'Docker, Kubernetes, Jenkins, Terraform, AWS, CI/CD, Ansible',
  'Cloud Engineer': 'AWS, Azure, GCP, Terraform, Docker, Kubernetes, IAM, VPC',
  'QA Engineer': 'Selenium, Cypress, Jest, TestNG, Postman, JIRA, Python',
  'Product Manager': 'Product Roadmapping, Agile, JIRA, Figma, SQL, A/B Testing, Analytics',
};

export const ResumeAnalyzer: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'ats' | 'builder'>('ats');

  // ATS State
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState(user?.profile?.targetRole || 'Software Engineer');
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<any>(null);

  // Builder State
  const [builderRole, setBuilderRole] = useState(user?.profile?.targetRole || 'Software Engineer');
  const [experienceLevel, setExperienceLevel] = useState('Fresher (0-1 years)');
  const [techStack, setTechStack] = useState(COMMON_STACKS['Software Engineer']);
  const [projectSummaries, setProjectSummaries] = useState('');
  const [builderPdfFile, setBuilderPdfFile] = useState<File | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedMarkdown, setGeneratedMarkdown] = useState('');
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf') {
        showToast('Please upload a PDF file.', 'error');
        return;
      }
      setFile(selected);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return showToast('Please select a PDF file first.', 'error');
    setAnalyzing(true);
    setReport(null);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('targetRole', targetRole);
    try {
      const response = await api.post('/resume/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setReport(response.data.report);
      showToast('Resume ATS analysis completed! +50 XP earned.', 'success');
      if (user) {
        dispatch(updateUser({
          ...user,
          profile: { ...user.profile, resumeUrl: response.data.resumeUrl },
          stats: { ...user.stats, atsScore: response.data.report.atsScore, xp: user.stats.xp + 50 }
        }));
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'ATS analysis failed.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!techStack.trim()) return showToast('Please enter your tech stack.', 'error');
    setGenerating(true);
    setGeneratedMarkdown('');
    try {
      const formData = new FormData();
      formData.append('targetRole', builderRole);
      formData.append('experienceLevel', experienceLevel);
      formData.append('techStack', techStack);
      formData.append('projectSummaries', projectSummaries);
      if (builderPdfFile) {
        formData.append('resume', builderPdfFile);
      }
      const response = await api.post('/resume/generate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setGeneratedMarkdown(response.data.markdown || '');
      showToast('AI Resume generated successfully! +30 XP earned.', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Resume generation failed.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMarkdown);
    setCopied(true);
    showToast('Resume markdown copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${builderRole.replace(/\s+/g, '_')}_Resume.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Resume downloaded as .md file!', 'success');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-primary-400" />
          <span>Resume Hub</span>
        </h2>
        <p className="text-xs text-gray-400">
          Analyze your existing resume for ATS compliance or let AI build a fully optimized resume from scratch.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 p-1 bg-dark-card border border-dark-border rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('ats')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ats'
              ? 'bg-primary-500/10 border border-primary-500/30 text-primary-400 shadow-inner'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Target className="h-3.5 w-3.5" />
          ATS Grader
        </button>
        <button
          onClick={() => setActiveTab('builder')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'builder'
              ? 'bg-accent-purple/10 border border-accent-purple/30 text-accent-purple shadow-inner'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Wand2 className="h-3.5 w-3.5" />
          AI Builder
        </button>
      </div>

      {/* ─── ATS GRADER TAB ─── */}
      {activeTab === 'ats' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <GlassCard className="lg:col-span-1 space-y-5">
            <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Analyze Configuration</h3>
            <form onSubmit={handleUpload} className="flex flex-col gap-5">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Target Job Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary-500 cursor-pointer"
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Resume File (PDF)</label>
                <div className="border border-dashed border-dark-border rounded-xl p-6 hover:bg-dark-hover/30 hover:border-gray-500 transition-colors relative flex flex-col items-center justify-center text-center cursor-pointer">
                  <input type="file" accept=".pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <FileUp className="h-8 w-8 text-primary-400 mb-2" />
                  {file ? (
                    <div>
                      <p className="text-xs font-bold text-white max-w-[200px] truncate">{file.name}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB • PDF</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-gray-300 font-semibold">Drag & Drop Resume</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">Supports PDF only (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>
              <Button type="submit" loading={analyzing} className="w-full">Analyze ATS Score</Button>
            </form>
          </GlassCard>

          <div className="lg:col-span-2">
            {analyzing ? (
              <GlassCard className="space-y-6 animate-pulse">
                <div className="flex items-center gap-4 border-b border-dark-border pb-4">
                  <div className="h-16 w-16 bg-dark-border rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-dark-border rounded" />
                    <div className="h-3 w-48 bg-dark-border rounded" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 w-full bg-dark-border rounded" />
                  <div className="h-3 w-5/6 bg-dark-border rounded" />
                </div>
              </GlassCard>
            ) : report ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <GlassCard className="flex items-center gap-5 border-primary-500/20" glow>
                    <div className="h-16 w-16 rounded-full border-4 border-primary-500/30 flex items-center justify-center font-black text-lg text-white">
                      {report.atsScore}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Overall ATS Grade</h4>
                      <p className="text-[10px] text-gray-400 mt-1 leading-normal">Based on technology keywords, project formats, and structural layouts.</p>
                    </div>
                  </GlassCard>
                  <GlassCard className="flex items-center gap-5 border-accent-purple/20">
                    <div className="h-16 w-16 rounded-full border-4 border-accent-purple/30 flex items-center justify-center font-black text-lg text-white">
                      {report.skillCoverage}%
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Target Skill Match</h4>
                      <p className="text-[10px] text-gray-400 mt-1 leading-normal">Matching key tools from the standard recruiter search list.</p>
                    </div>
                  </GlassCard>
                </div>

                {report.keywordsToInclude?.length > 0 && (
                  <GlassCard className="border-amber-500/20">
                    <h3 className="text-xs uppercase font-bold text-amber-400 tracking-wider flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4" />
                      Keywords to Add (Boost Your ATS)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {report.keywordsToInclude.map((kw: string, i: number) => (
                        <span key={i} className="px-3 py-1 rounded-lg bg-amber-900/20 border border-amber-800/40 text-amber-300 text-[10px] font-bold">{kw}</span>
                      ))}
                    </div>
                  </GlassCard>
                )}

                <GlassCard>
                  <h3 className="text-xs uppercase font-bold text-white tracking-wider flex items-center gap-2 mb-3">
                    <ShieldAlert className="h-4 w-4 text-red-400" />
                    Missing Skills Identified
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {report.missingSkills.map((s: string, idx: number) => (
                      <span key={idx} className="px-3 py-1.5 rounded-lg bg-red-950/20 border border-red-900/50 text-red-400 text-xs font-semibold">{s}</span>
                    ))}
                  </div>
                </GlassCard>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassCard className="border-emerald-500/20">
                    <h4 className="text-xs font-bold text-emerald-400 mb-3 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      Resume Strengths
                    </h4>
                    <ul className="flex flex-col gap-2">
                      {report.strengths.map((str: string, i: number) => (
                        <li key={i} className="flex gap-2.5 text-xs text-gray-300 font-medium leading-relaxed">
                          <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                  <GlassCard className="border-red-500/20">
                    <h4 className="text-xs font-bold text-red-400 mb-3 flex items-center gap-1.5">
                      <XCircle className="h-4 w-4" />
                      Areas of Weakness
                    </h4>
                    <ul className="flex flex-col gap-2">
                      {report.weaknesses.map((w: string, i: number) => (
                        <li key={i} className="flex gap-2.5 text-xs text-gray-300 font-medium leading-relaxed">
                          <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </div>

                <GlassCard className="border-accent-pink/20">
                  <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
                    <Lightbulb className="h-4 w-4 text-accent-pink" />
                    Suggestions for Improvement
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {report.suggestions.map((s: string, i: number) => (
                      <li key={i} className="flex gap-2.5 text-xs text-gray-300 font-medium leading-relaxed">
                        <ChevronRight className="h-4 w-4 text-accent-pink shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>

                <GlassCard className="border-accent-purple/20">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-accent-purple flex items-center gap-1.5">
                      <Wand2 className="h-4 w-4" />
                      Want a Better Resume?
                    </h3>
                  </div>
                  <p className="text-[10px] text-gray-400 mb-3 leading-relaxed">
                    Your ATS score is <span className="text-white font-bold">{report.atsScore}/100</span>. Use the AI Builder tab to generate a fully optimized, ATS-ready resume for <span className="text-accent-purple font-bold">{targetRole}</span> from scratch.
                  </p>
                  <button
                    onClick={() => { setBuilderRole(targetRole); setActiveTab('builder'); }}
                    className="text-[10px] font-bold text-accent-purple hover:text-purple-300 flex items-center gap-1 transition-colors"
                  >
                    Open AI Builder <ChevronRight className="h-3 w-3" />
                  </button>
                </GlassCard>
              </div>
            ) : (
              <GlassCard className="flex flex-col items-center justify-center text-center p-12 min-h-[400px]">
                <FileUp className="h-12 w-12 text-gray-600 mb-4" />
                <h3 className="text-base font-bold text-gray-400">No Resume Analyzed</h3>
                <p className="text-xs text-gray-500 max-w-[280px] mt-1.5">
                  Upload your resume on the left panel to trigger your technical ATS scorecard.
                </p>
              </GlassCard>
            )}
          </div>
        </div>
      )}

      {/* ─── AI BUILDER TAB ─── */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Builder Config */}
          <GlassCard className="lg:col-span-1 space-y-5">
            <div>
              <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Resume Configuration</h3>
              <p className="text-[10px] text-gray-500 mt-1">Fill in your details and AI will generate a complete ATS-optimized resume.</p>
            </div>

            <form onSubmit={handleGenerate} className="flex flex-col gap-5">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Target Role</label>
                <select
                  value={builderRole}
                  onChange={(e) => {
                    setBuilderRole(e.target.value);
                    setTechStack(COMMON_STACKS[e.target.value] || '');
                  }}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent-purple cursor-pointer"
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent-purple cursor-pointer"
                >
                  {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                  Tech Stack & Skills
                </label>
                <p className="text-[9px] text-gray-600 mb-1.5">Pre-filled based on role. Edit as needed.</p>
                <textarea
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  rows={3}
                  placeholder="React, Node.js, MongoDB, TypeScript..."
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-accent-purple resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                  Your Projects / Experience (Optional)
                </label>
                <p className="text-[9px] text-gray-600 mb-1.5">Brief summaries of real projects you want included.</p>
                <textarea
                  value={projectSummaries}
                  onChange={(e) => setProjectSummaries(e.target.value)}
                  rows={4}
                  placeholder="e.g. Built a food delivery app with React and Node.js; Used Redis for caching; Reduced load time by 50%..."
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-accent-purple resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                  Upload Existing Resume (Optional)
                </label>
                <p className="text-[9px] text-gray-600 mb-1.5">Upload your PDF so AI uses your real name & context.</p>
                <div className="border border-dashed border-dark-border rounded-xl p-4 hover:bg-dark-hover/30 hover:border-accent-purple/40 transition-colors relative flex items-center gap-3 cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) setBuilderPdfFile(e.target.files[0]);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <FileUp className="h-5 w-5 text-accent-purple shrink-0" />
                  <div className="min-w-0">
                    {builderPdfFile ? (
                      <>
                        <p className="text-xs font-bold text-white truncate">{builderPdfFile.name}</p>
                        <p className="text-[9px] text-gray-500">{(builderPdfFile.size / 1024).toFixed(0)} KB • PDF</p>
                      </>
                    ) : (
                      <p className="text-[10px] text-gray-500">Click to upload PDF (optional)</p>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-accent-purple to-primary-500 text-white text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {generating ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><Wand2 className="h-4 w-4" /> Generate AI Resume</>
                )}
              </button>
            </form>

            {/* Tips */}
            <div className="mt-2 p-3 bg-dark-bg/60 border border-dark-border rounded-xl">
              <p className="text-[9px] font-bold text-gray-500 uppercase mb-2">💡 Pro Tips</p>
              <ul className="space-y-1.5 text-[9px] text-gray-500">
                <li>• Add real metrics to your projects (e.g., "50% faster load time")</li>
                <li>• Include your specific tech stack keywords to beat ATS filters</li>
                <li>• Copy the output and paste directly into Notion, Overleaf, or Google Docs</li>
              </ul>
            </div>
          </GlassCard>

          {/* Generated Resume Output */}
          <div className="lg:col-span-2">
            {generating ? (
              <GlassCard className="space-y-6 animate-pulse min-h-[600px]">
                <div className="flex items-center gap-3 border-b border-dark-border pb-4">
                  <Loader2 className="h-5 w-5 text-accent-purple animate-spin" />
                  <span className="text-sm text-gray-400 font-medium">AI is generating your personalized resume...</span>
                </div>
                <div className="space-y-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-3 bg-dark-border rounded" style={{ width: `${60 + (i * 5) % 40}%` }} />
                  ))}
                </div>
              </GlassCard>
            ) : generatedMarkdown ? (
              <div className="space-y-4">
                {/* Action bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Resume Generated Successfully</span>
                    <span className="text-[9px] text-gray-500 px-2 py-0.5 bg-dark-card border border-dark-border rounded-full">Markdown Format</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dark-border hover:bg-dark-hover text-xs font-bold text-gray-300 transition-colors"
                    >
                      {copied ? <ClipboardCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Clipboard className="h-3.5 w-3.5" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-accent-purple/30 bg-accent-purple/10 hover:bg-accent-purple/20 text-xs font-bold text-accent-purple transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download .md
                    </button>
                  </div>
                </div>

                {/* Rendered resume */}
                <GlassCard className="min-h-[600px]">
                  <div
                    className="prose-custom leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(generatedMarkdown) }}
                  />
                </GlassCard>

                {/* Raw markdown toggle */}
                <details className="group">
                  <summary className="text-[10px] font-bold text-gray-500 cursor-pointer hover:text-gray-300 flex items-center gap-1">
                    <Code2 className="h-3 w-3" />
                    View Raw Markdown
                  </summary>
                  <pre className="mt-2 p-4 bg-dark-bg border border-dark-border rounded-xl text-[10px] font-mono text-gray-400 whitespace-pre-wrap overflow-x-auto max-h-96">
                    {generatedMarkdown}
                  </pre>
                </details>
              </div>
            ) : (
              <GlassCard className="flex flex-col items-center justify-center text-center p-12 min-h-[500px] border-accent-purple/10">
                <div className="h-20 w-20 rounded-full bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center mb-6">
                  <Wand2 className="h-9 w-9 text-accent-purple" />
                </div>
                <h3 className="text-lg font-extrabold text-white mb-2">AI Resume Generator</h3>
                <p className="text-xs text-gray-500 max-w-[320px] leading-relaxed">
                  Configure your target role and tech stack on the left. The AI will craft a fully formatted, ATS-optimized resume using the Google XYZ formula — ready to be used in placements.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {['ATS Optimized', 'XYZ Bullet Format', 'Role-Specific Keywords', 'Download as .md'].map((tag) => (
                    <span key={tag} className="px-3 py-1 text-[9px] font-bold rounded-full border border-accent-purple/20 text-accent-purple bg-accent-purple/5">
                      ✓ {tag}
                    </span>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
