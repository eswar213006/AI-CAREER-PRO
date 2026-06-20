import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  FileUp, FileCheck, CheckCircle2, XCircle, Lightbulb, Check,
  ShieldAlert, Wand2, Copy, Download, Clipboard, ClipboardCheck,
  ChevronRight, Loader2, Sparkles, Target, Code2,
  User, Briefcase, GraduationCap, Award, FolderGit2, ChevronDown,
  Plus, Trash2
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
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary-400 hover:underline font-semibold">$1</a>')
    .replace(/^- (.+)$/gm, '<li class="flex gap-2 text-xs text-gray-300 mt-1"><span class="text-primary-400 mt-0.5 shrink-0">•</span><span>$1</span></li>')
    .replace(/(<li[\s\S]*?<\/li>)+/gm, (match) => `<ul class="mt-1 space-y-0.5">${match}</ul>`)
    .replace(/^(?!<[h|l|u|a])(.*\S.*)$/gm, '<p class="text-xs text-gray-300 leading-relaxed">$1</p>')
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

  const [activeTab, setActiveTab] = useState<'ats' | 'builder' | 'enhancer'>('ats');

  // ATS State
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState(user?.profile?.targetRole || 'Software Engineer');
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<any>(null);

  // Builder State
  const [builderRole, setBuilderRole] = useState(user?.profile?.targetRole || 'Software Engineer');
  const [experienceLevel, setExperienceLevel] = useState('Fresher (0-1 years)');
  const [techStack, setTechStack] = useState(COMMON_STACKS['Software Engineer']);
  const [builderPdfFile, setBuilderPdfFile] = useState<File | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedMarkdown, setGeneratedMarkdown] = useState('');
  const [copied, setCopied] = useState(false);

  // Dynamic Arrays for multiple entries
  const [educations, setEducations] = useState<Array<{ college: string; degree: string; gradYear: string; cgpa: string; }>>([
    { college: '', degree: '', gradYear: '', cgpa: '' }
  ]);
  const [experiences, setExperiences] = useState<Array<{ company: string; role: string; duration: string; achievements: string; }>>([
    { company: '', role: '', duration: '', achievements: '' }
  ]);

  // Contact / Additional Fields
  const [fullName, setFullName] = useState(user?.profile?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [projectDetails, setProjectDetails] = useState('');
  const [certifications, setCertifications] = useState('');
  const [hobbies, setHobbies] = useState('');

  // Enhancer State
  const [enhancerFile, setEnhancerFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Active accordion section
  const [openSection, setOpenSection] = useState<'contact' | 'profile' | 'education' | 'experience' | 'additional'>('contact');

  // Education Helpers
  const addEducation = () => {
    setEducations([...educations, { college: '', degree: '', gradYear: '', cgpa: '' }]);
  };

  const removeEducation = (index: number) => {
    if (educations.length > 1) {
      setEducations(educations.filter((_, i) => i !== index));
    } else {
      setEducations([{ college: '', degree: '', gradYear: '', cgpa: '' }]);
    }
  };

  const updateEducation = (index: number, field: keyof typeof educations[0], value: string) => {
    const updated = [...educations];
    updated[index] = { ...updated[index], [field]: value };
    setEducations(updated);
  };

  // Experience Helpers
  const addExperience = () => {
    setExperiences([...experiences, { company: '', role: '', duration: '', achievements: '' }]);
  };

  const removeExperience = (index: number) => {
    if (experiences.length > 1) {
      setExperiences(experiences.filter((_, i) => i !== index));
    } else {
      setExperiences([{ company: '', role: '', duration: '', achievements: '' }]);
    }
  };

  const updateExperience = (index: number, field: keyof typeof experiences[0], value: string) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

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

  const handleEnhancerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf') {
        showToast('Please upload a PDF file.', 'error');
        return;
      }
      setEnhancerFile(selected);
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

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enhancerFile) return showToast('Please select your old resume PDF file.', 'error');
    setExtracting(true);
    const formData = new FormData();
    formData.append('resume', enhancerFile);
    try {
      const response = await api.post('/resume/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = response.data.data;
      if (data) {
        setFullName(data.fullName || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setGithub(data.github || '');
        setLinkedin(data.linkedin || '');
        setPortfolio(data.portfolio || '');
        setTechStack(data.techStack || '');

        if (Array.isArray(data.educations) && data.educations.length > 0) {
          setEducations(data.educations);
        } else {
          setEducations([{ college: '', degree: '', gradYear: '', cgpa: '' }]);
        }

        if (Array.isArray(data.experiences) && data.experiences.length > 0) {
          setExperiences(data.experiences);
        } else {
          setExperiences([{ company: '', role: '', duration: '', achievements: '' }]);
        }

        setCertifications(data.certifications || '');
        setHobbies(data.hobbies || '');
        setIsPrefilled(true);

        showToast('Successfully extracted details from your resume!', 'success');
        setActiveTab('builder');
        setOpenSection('contact');
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Resume extraction failed. Make sure it is not scanned or empty.', 'error');
    } finally {
      setExtracting(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!techStack.trim()) return showToast('Please enter your tech stack.', 'error');
    if (!fullName.trim()) return showToast('Please enter your full name.', 'error');
    if (!email.trim()) return showToast('Please enter your email.', 'error');

    setGenerating(true);
    setGeneratedMarkdown('');
    try {
      const formData = new FormData();
      formData.append('targetRole', builderRole);
      formData.append('experienceLevel', experienceLevel);
      formData.append('techStack', techStack);
      formData.append('fullName', fullName);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('github', github);
      formData.append('linkedin', linkedin);
      formData.append('portfolio', portfolio);
      
      // Fallback fields for backwards compatibility
      formData.append('college', educations[0]?.college || '');
      formData.append('degree', educations[0]?.degree || '');
      formData.append('gradYear', educations[0]?.gradYear || '');
      formData.append('cgpa', educations[0]?.cgpa || '');
      formData.append('experienceDetails', experiences[0] ? `${experiences[0].role} at ${experiences[0].company}: ${experiences[0].achievements}` : '');
      
      formData.append('projectDetails', projectDetails);
      formData.append('certifications', certifications);
      formData.append('hobbies', hobbies);

      // JSON stringified arrays
      formData.append('educations', JSON.stringify(educations));
      formData.append('experiences', JSON.stringify(experiences));

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

  const handleDownloadPdf = () => {
    if (!generatedMarkdown) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Popup blocked! Please allow popups to download PDF.', 'error');
      return;
    }

    // Normalize markdown line endings
    const normalizedMarkdown = generatedMarkdown.replace(/\r\n/g, '\n');

    // Parse Markdown to print-friendly clean HTML
    const cleanHtml = normalizedMarkdown
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>[\s\S]*?<\/li>)+/gm, (match) => `<ul>${match}</ul>`)
      .replace(/^(?!<[h|l|u|a])(.*\S.*)$/gm, '<p>$1</p>')
      .replace(/\n\n/g, '<br/>');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${builderRole.replace(/\s+/g, '_')}_Resume</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #111827;
              line-height: 1.5;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              background-color: white;
            }
            
            h1 {
              font-size: 26px;
              font-weight: 700;
              text-align: center;
              margin: 0 0 6px 0;
              letter-spacing: -0.02em;
            }
            
            /* Center email and links paragraph directly below name */
            h1 + p, h1 + p > em {
              text-align: center;
              font-size: 11px;
              color: #4b5563;
              margin-top: 0;
              margin-bottom: 20px;
              display: block;
              font-style: normal;
            }

            h1 + p a {
              color: #2563eb;
              text-decoration: none;
              font-weight: 500;
            }

            h1 + p a:hover {
              text-decoration: underline;
            }
            
            h2 {
              font-size: 14px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              border-bottom: 1.5px solid #1f2937;
              padding-bottom: 3px;
              margin-top: 22px;
              margin-bottom: 10px;
              color: #111827;
            }
            
            h3 {
              font-size: 12px;
              font-weight: 600;
              margin-top: 10px;
              margin-bottom: 4px;
              color: #111827;
            }
            
            p, li {
              font-size: 11.5px;
              color: #374151;
              margin: 4px 0;
            }
            
            ul {
              padding-left: 18px;
              margin: 4px 0;
            }
            
            li {
              margin-bottom: 3px;
            }
            
            strong {
              font-weight: 600;
              color: #111827;
            }
            
            a {
              color: #2563eb;
              text-decoration: none;
            }
            
            a:hover {
              text-decoration: underline;
            }
            
            @media print {
              body {
                padding: 0;
                margin: 0;
              }
              @page {
                size: A4;
                margin: 15mm 20mm 15mm 20mm;
              }
            }
          </style>
        </head>
        <body>
          <div>
            ${cleanHtml}
          </div>
          <script>
            window.addEventListener('DOMContentLoaded', () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 400);
            });
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    showToast('PDF print preview launched!', 'success');
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
          Analyze your existing resume for ATS compliance, build an optimized resume from scratch, or enhance your old resume using AI.
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
          AI Scratch Builder
        </button>
        <button
          onClick={() => setActiveTab('enhancer')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'enhancer'
              ? 'bg-accent-pink/10 border border-accent-pink/30 text-accent-pink shadow-inner'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Resume Enhancer
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
                      <CheckCircle2 className="h-4.5 w-4.5" />
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
                      <XCircle className="h-4.5 w-4.5" />
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
                    Your ATS score is <span className="text-white font-bold">{report.atsScore}/100</span>. Use the AI Scratch Builder tab to generate a fully optimized, ATS-ready resume for <span className="text-accent-purple font-bold">{targetRole}</span> from scratch.
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

      {/* ─── AI SCRATCH BUILDER TAB ─── */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Builder Config */}
          <GlassCard className="lg:col-span-1 space-y-5">
            <div>
              <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Resume Configuration</h3>
              <p className="text-[10px] text-gray-500 mt-1">Fill in your details and AI will generate a complete ATS-optimized resume.</p>
            </div>

            {isPrefilled && (
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                  <p className="text-[10px] text-emerald-300 font-medium">
                    Form pre-filled successfully from old resume!
                  </p>
                </div>
                <button
                  onClick={() => setIsPrefilled(false)}
                  className="text-[9px] text-emerald-400 hover:text-emerald-300 underline font-bold"
                >
                  Dismiss
                </button>
              </div>
            )}

            <form onSubmit={handleGenerate} className="flex flex-col gap-4">
              {/* SECTION 1: CONTACT INFORMATION */}
              <div className="border border-dark-border rounded-xl overflow-hidden bg-dark-bg/40">
                <button
                  type="button"
                  onClick={() => setOpenSection(openSection === 'contact' ? '' as any : 'contact')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-dark-card/60 hover:bg-dark-hover/40 transition-colors"
                >
                  <div className="flex items-center gap-2 text-white">
                    <User className="h-4 w-4 text-primary-400" />
                    <span className="text-xs font-bold">1. Contact Information</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${openSection === 'contact' ? 'rotate-180' : ''}`} />
                </button>
                {openSection === 'contact' && (
                  <div className="p-4 border-t border-dark-border space-y-3">
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        required
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Email Address *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john.doe@example.com"
                        required
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="123-456-7890"
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">GitHub Profile</label>
                      <input
                        type="text"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        placeholder="github.com/yourusername"
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">LinkedIn Profile</label>
                      <input
                        type="text"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="linkedin.com/in/yourusername"
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Portfolio Website</label>
                      <input
                        type="text"
                        value={portfolio}
                        onChange={(e) => setPortfolio(e.target.value)}
                        placeholder="yourportfolio.com (optional)"
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: PROFESSIONAL PROFILE */}
              <div className="border border-dark-border rounded-xl overflow-hidden bg-dark-bg/40">
                <button
                  type="button"
                  onClick={() => setOpenSection(openSection === 'profile' ? '' as any : 'profile')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-dark-card/60 hover:bg-dark-hover/40 transition-colors"
                >
                  <div className="flex items-center gap-2 text-white">
                    <Briefcase className="h-4 w-4 text-primary-400" />
                    <span className="text-xs font-bold">2. Job Profile & Skills</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${openSection === 'profile' ? 'rotate-180' : ''}`} />
                </button>
                {openSection === 'profile' && (
                  <div className="p-4 border-t border-dark-border space-y-3">
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Target Role</label>
                      <select
                        value={builderRole}
                        onChange={(e) => {
                          setBuilderRole(e.target.value);
                          setTechStack(COMMON_STACKS[e.target.value] || '');
                        }}
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500 cursor-pointer"
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Experience Level</label>
                      <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500 cursor-pointer"
                      >
                        {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Tech Stack & Skills *</label>
                      <textarea
                        value={techStack}
                        onChange={(e) => setTechStack(e.target.value)}
                        rows={3}
                        required
                        placeholder="React, Node.js, MongoDB, TypeScript..."
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500 resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: EDUCATION */}
              <div className="border border-dark-border rounded-xl overflow-hidden bg-dark-bg/40">
                <button
                  type="button"
                  onClick={() => setOpenSection(openSection === 'education' ? '' as any : 'education')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-dark-card/60 hover:bg-dark-hover/40 transition-colors"
                >
                  <div className="flex items-center gap-2 text-white">
                    <GraduationCap className="h-4 w-4 text-primary-400" />
                    <span className="text-xs font-bold">3. Education Records</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${openSection === 'education' ? 'rotate-180' : ''}`} />
                </button>
                {openSection === 'education' && (
                  <div className="p-4 border-t border-dark-border space-y-4">
                    {educations.map((edu, idx) => (
                      <div key={idx} className="relative p-3 border border-dark-border/60 rounded-xl bg-dark-bg/60 space-y-2.5 mb-2">
                        {educations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEducation(idx)}
                            className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Remove Education"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Education #{idx + 1}</span>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">College/University</label>
                          <input
                            type="text"
                            value={edu.college}
                            onChange={(e) => updateEducation(idx, 'college', e.target.value)}
                            placeholder="XYZ Institute of Technology"
                            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Degree & Branch</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                            placeholder="B.E. / B.Tech in Computer Science"
                            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Graduation Year</label>
                            <input
                              type="text"
                              value={edu.gradYear}
                              onChange={(e) => updateEducation(idx, 'gradYear', e.target.value)}
                              placeholder="2025"
                              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">CGPA / GPA</label>
                            <input
                              type="text"
                              value={edu.cgpa}
                              onChange={(e) => updateEducation(idx, 'cgpa', e.target.value)}
                              placeholder="8.5 / 10"
                              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addEducation}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-4 border border-dashed border-dark-border hover:border-primary-500/50 hover:bg-primary-500/5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Education Record
                    </button>
                  </div>
                )}
              </div>

              {/* SECTION 4: EXPERIENCE & PROJECTS */}
              <div className="border border-dark-border rounded-xl overflow-hidden bg-dark-bg/40">
                <button
                  type="button"
                  onClick={() => setOpenSection(openSection === 'experience' ? '' as any : 'experience')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-dark-card/60 hover:bg-dark-hover/40 transition-colors"
                >
                  <div className="flex items-center gap-2 text-white">
                    <FolderGit2 className="h-4 w-4 text-primary-400" />
                    <span className="text-xs font-bold">4. Experience & Projects</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${openSection === 'experience' ? 'rotate-180' : ''}`} />
                </button>
                {openSection === 'experience' && (
                  <div className="p-4 border-t border-dark-border space-y-4">
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase font-bold text-gray-400">Work / Internship Experience</label>
                      <p className="text-[8px] text-gray-500">Include roles, company names, and achievements using XYZ format.</p>
                    </div>

                    {experiences.map((exp, idx) => (
                      <div key={idx} className="relative p-3 border border-dark-border/60 rounded-xl bg-dark-bg/60 space-y-2.5 mb-2">
                        {experiences.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeExperience(idx)}
                            className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Remove Experience"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Experience #{idx + 1}</span>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Company Name</label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                              placeholder="TechCorp Inc."
                              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Job Title / Role</label>
                            <input
                              type="text"
                              value={exp.role}
                              onChange={(e) => updateExperience(idx, 'role', e.target.value)}
                              placeholder="Software Engineer Intern"
                              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Duration / Period</label>
                          <input
                            type="text"
                            value={exp.duration}
                            onChange={(e) => updateExperience(idx, 'duration', e.target.value)}
                            placeholder="June 2024 – Present or 6 Months"
                            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Achievements & Impact</label>
                          <textarea
                            value={exp.achievements}
                            onChange={(e) => updateExperience(idx, 'achievements', e.target.value)}
                            rows={3}
                            placeholder="e.g. Engineered a scalable REST API using Node.js, reducing latency by 30% by integrating Redis caching."
                            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500 resize-none"
                          />
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={addExperience}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-4 border border-dashed border-dark-border hover:border-primary-500/50 hover:bg-primary-500/5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-all mb-4"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Experience Record
                    </button>

                    <div className="border-t border-dark-border/40 pt-4">
                      <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Key Technical Projects</label>
                      <p className="text-[8px] text-gray-500 mb-1.5">Briefly describe 1-2 major projects, their technologies, and impact.</p>
                      <textarea
                        value={projectDetails}
                        onChange={(e) => setProjectDetails(e.target.value)}
                        rows={3}
                        placeholder="e.g. E-Commerce Backend: Designed REST APIs handling 10k+ requests/min. Utilized Redis for sessions..."
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500 resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 5: EXTRA DETAILS */}
              <div className="border border-dark-border rounded-xl overflow-hidden bg-dark-bg/40">
                <button
                  type="button"
                  onClick={() => setOpenSection(openSection === 'additional' ? '' as any : 'additional')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-dark-card/60 hover:bg-dark-hover/40 transition-colors"
                >
                  <div className="flex items-center gap-2 text-white">
                    <Award className="h-4 w-4 text-primary-400" />
                    <span className="text-xs font-bold">5. Additional Info & PDF</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${openSection === 'additional' ? 'rotate-180' : ''}`} />
                </button>
                {openSection === 'additional' && (
                  <div className="p-4 border-t border-dark-border space-y-3">
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Certifications & Achievements</label>
                      <textarea
                        value={certifications}
                        onChange={(e) => setCertifications(e.target.value)}
                        rows={2}
                        placeholder="e.g. AWS Certified Developer Associate, Google Kickstart top 5%..."
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Hobbies & Extracurriculars</label>
                      <textarea
                        value={hobbies}
                        onChange={(e) => setHobbies(e.target.value)}
                        rows={2}
                        placeholder="e.g. Competitive Programming club lead, Volunteered at local shelter..."
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">
                        Upload Existing Resume (Optional)
                      </label>
                      <p className="text-[8px] text-gray-500 mb-1.5">Uses your existing PDF resume text for context.</p>
                      <div className="border border-dashed border-dark-border rounded-lg p-3 hover:bg-dark-hover/30 hover:border-primary-500/40 transition-colors relative flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) setBuilderPdfFile(e.target.files[0]);
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <FileUp className="h-4 w-4 text-primary-400 shrink-0" />
                        <div className="min-w-0">
                          {builderPdfFile ? (
                            <>
                              <p className="text-xs font-bold text-white truncate">{builderPdfFile.name}</p>
                              <p className="text-[8px] text-gray-500">{(builderPdfFile.size / 1024).toFixed(0)} KB • PDF</p>
                            </>
                          ) : (
                            <p className="text-[9px] text-gray-500">Click to upload PDF</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-accent-purple to-primary-500 text-white text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
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
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dark-border hover:bg-dark-hover text-xs font-bold text-gray-300 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download .md
                    </button>
                    <button
                      onClick={handleDownloadPdf}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-accent-purple/30 bg-accent-purple/10 hover:bg-accent-purple/20 text-xs font-bold text-accent-purple transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download PDF
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

      {/* ─── RESUME ENHANCER TAB ─── */}
      {activeTab === 'enhancer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <GlassCard className="lg:col-span-1 space-y-5 border-accent-pink/20">
            <div>
              <h3 className="text-xs uppercase font-bold text-accent-pink tracking-wider">Enhance Old Resume</h3>
              <p className="text-[10px] text-gray-500 mt-1">
                Upload your old PDF resume. AI will extract all details and auto-populate the Builder form.
              </p>
            </div>

            <form onSubmit={handleExtract} className="flex flex-col gap-5">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Old Resume (PDF)</label>
                <div className="border border-dashed border-dark-border rounded-xl p-6 hover:bg-dark-hover/30 hover:border-gray-500 transition-colors relative flex flex-col items-center justify-center text-center cursor-pointer">
                  <input type="file" accept=".pdf" onChange={handleEnhancerFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <FileUp className="h-8 w-8 text-accent-pink mb-2" />
                  {enhancerFile ? (
                    <div>
                      <p className="text-xs font-bold text-white max-w-[200px] truncate">{enhancerFile.name}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{(enhancerFile.size / (1024 * 1024)).toFixed(2)} MB • PDF</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-gray-300 font-semibold">Drag & Drop Resume</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">Supports PDF only (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>
              <Button type="submit" loading={extracting} className="w-full bg-gradient-to-r from-accent-pink to-accent-purple border-none hover:opacity-90">
                {extracting ? 'Extracting details...' : 'Extract & Pre-fill Form'}
              </Button>
            </form>
          </GlassCard>

          <div className="lg:col-span-2">
            {extracting ? (
              <GlassCard className="space-y-6 animate-pulse min-h-[400px] border-accent-pink/10">
                <div className="flex items-center gap-3 border-b border-dark-border pb-4">
                  <Loader2 className="h-5 w-5 text-accent-pink animate-spin" />
                  <span className="text-sm text-gray-400 font-medium">Extracting and structuring your resume details...</span>
                </div>
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-3 bg-dark-border rounded" style={{ width: `${50 + (i * 7) % 40}%` }} />
                  ))}
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="flex flex-col items-center justify-center text-center p-12 min-h-[400px] border-accent-pink/15">
                <div className="h-20 w-20 rounded-full bg-accent-pink/10 border border-accent-pink/20 flex items-center justify-center mb-6">
                  <Sparkles className="h-9 w-9 text-accent-pink" />
                </div>
                <h3 className="text-lg font-extrabold text-white mb-2">Resume Enhancer</h3>
                <p className="text-xs text-gray-500 max-w-[320px] leading-relaxed">
                  Have an old resume? Upload it here. Our AI will automatically parse all sections (education, experience, contact info, skills) and load them into the dynamic multi-field AI Scratch Builder.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {['Automated Parsing', 'Education Auto-Fill', 'Experience Auto-Fill', 'Editable Form Output'].map((tag) => (
                    <span key={tag} className="px-3 py-1 text-[9px] font-bold rounded-full border border-accent-pink/20 text-accent-pink bg-accent-pink/5">
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
