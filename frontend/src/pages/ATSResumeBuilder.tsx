import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { 
  FileText, Award, Layers, Plus, Trash2, Printer, Sparkles, CheckCircle, 
  HelpCircle, Compass, Target, ArrowDownToLine
} from 'lucide-react';
import api from '../utils/api';

interface ExperienceItem { company: string; role: string; duration: string; desc: string; }
interface ProjectItem { title: string; tech: string; desc: string; }
interface EducationItem { school: string; degree: string; score: string; year: string; }

export const ATSResumeBuilder: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Form Fields
  const [name, setName] = useState('Eswar Student');
  const [email, setEmail] = useState('student@aicareerprep.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [linkedin, setLinkedin] = useState('linkedin.com/in/eswar-student');
  const [github, setGithub] = useState('github.com/eswar213006');
  const [skills, setSkills] = useState('Java, TypeScript, SQL, React, Node.js, DSA, Operating Systems');
  
  const [education, setEducation] = useState<EducationItem[]>([
    { school: 'Tech Institute of Science', degree: 'B.Tech in Computer Science', score: '8.8 CGPA', year: '2022 - 2026' }
  ]);
  const [projects, setProjects] = useState<ProjectItem[]>([
    { title: 'Placement Preparation Hub', tech: 'React, Node.js, Express, MongoDB', desc: 'Integrated modular placement dashboard for students with offline DB fallback capability.' }
  ]);
  const [experience, setExperience] = useState<ExperienceItem[]>([
    { company: 'Software Solutions Ltd', role: 'Software Engineer Intern', duration: '3 Months (2025)', desc: 'Optimized server middleware handling API latency issues.' }
  ]);
  const [achievements, setAchievements] = useState('Ranked top 5% in CodeChef division assessments; Unlocked all merit badges.');
  const [certifications, setCertifications] = useState('AWS Certified Cloud Practitioner; Gemini generative AI certificate.');
  const [languages, setLanguages] = useState('English, Telugu, Hindi');

  const addEducation = () => setEducation([...education, { school: '', degree: '', score: '', year: '' }]);
  const removeEducation = (i: number) => setEducation(education.filter((_, idx) => idx !== i));

  const addProject = () => setProjects([...projects, { title: '', tech: '', desc: '' }]);
  const removeProject = (i: number) => setProjects(projects.filter((_, idx) => idx !== i));

  const addExperience = () => setExperience([...experience, { company: '', role: '', duration: '', desc: '' }]);
  const removeExperience = (i: number) => setExperience(experience.filter((_, idx) => idx !== i));

  const handleEvaluateATS = async () => {
    setLoading(true);
    try {
      const payload = { name, email, phone, skills, education, projects, experience, achievements, certifications };
      const res = await api.post('/resume/analyze', payload);
      setAtsScore(res.data.atsScore);
      setSuggestions(res.data.suggestions);
    } catch {
      // Mock ATS Evaluator
      const skillCount = skills.split(',').length;
      let calculatedScore = 55 + (skillCount * 3) + (projects.length * 5) + (experience.length * 5);
      calculatedScore = Math.min(calculatedScore, 98);
      setAtsScore(calculatedScore);
      
      const tips = [];
      if (skillCount < 8) tips.push('Add more relevant industry terms (e.g. DBMS, operating systems, agile methodology).');
      if (projects.length < 2) tips.push('Add at least two technical projects to showcase implementation depth.');
      if (!linkedin.includes('linkedin.com/')) tips.push('Verify your LinkedIn profile URL structure.');
      if (experience.length === 0) tips.push('Consider adding relevant academic leadership or coding coordinator experience.');
      setSuggestions(tips.length > 0 ? tips : ['Excellent profile density. Ready for HR dispatch!']);
      showToast('ATS rating analysis complete.', 'success');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 print:bg-white print:p-0 print:text-black">
      {/* Header (hidden on print) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-400" />
            <span>ATS Resume Builder & Evaluator</span>
          </h2>
          <p className="text-xs text-gray-400">
            Build clean, print-friendly resume sections and calculate real-time ATS optimization guidelines.
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleEvaluateATS} loading={loading} variant="secondary" className="text-xs">
            <Sparkles className="h-3.5 w-3.5 mr-1" /> Evaluate ATS
          </Button>
          <Button onClick={handlePrint} variant="primary" className="text-xs">
            <Printer className="h-3.5 w-3.5 mr-1" /> Export / Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start print:grid-cols-1">
        
        {/* Left Input Fields (hidden on print) */}
        <div className="space-y-5 print:hidden">
          <GlassCard className="space-y-4">
            <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-dark-border pb-3">
              <Compass className="h-4 w-4 text-primary-400" /> Contact Info & Credentials
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-300">
              <div className="space-y-1">
                <label className="font-bold text-gray-400">Full Name</label>
                <input className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-white" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-gray-400">Email Address</label>
                <input className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-white" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-gray-400">Phone Number</label>
                <input className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-white" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-gray-400">LinkedIn Profile</label>
                <input className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-white" value={linkedin} onChange={e => setLinkedin(e.target.value)} />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="font-bold text-gray-400">GitHub Link</label>
                <input className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-white" value={github} onChange={e => setGithub(e.target.value)} />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="space-y-4">
            <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-dark-border pb-3">
              <Layers className="h-4 w-4 text-accent-purple" /> Skills inventory (Comma Separated)
            </h4>
            <div className="text-xs space-y-1">
              <label className="font-bold text-gray-400">Technical Skills</label>
              <textarea className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-white resize-none" rows={3} value={skills} onChange={e => setSkills(e.target.value)} />
            </div>
          </GlassCard>

          {/* Education list */}
          <GlassCard className="space-y-4">
            <div className="flex justify-between items-center border-b border-dark-border pb-3">
              <h4 className="text-xs font-black uppercase text-white tracking-wider">Education Details</h4>
              <button onClick={addEducation} className="p-1 rounded bg-primary-600/10 border border-primary-500/20 text-primary-400 hover:text-white transition-colors">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            {education.map((edu, idx) => (
              <div key={idx} className="p-3 bg-dark-bg/60 border border-dark-border rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-400">Institution #{idx+1}</span>
                  <button onClick={() => removeEducation(idx)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="School Name" className="bg-dark-bg border border-dark-border rounded-lg px-2.5 py-1.5 text-white" value={edu.school} onChange={e => {
                    const next = [...education]; next[idx].school = e.target.value; setEducation(next);
                  }} />
                  <input placeholder="Degree" className="bg-dark-bg border border-dark-border rounded-lg px-2.5 py-1.5 text-white" value={edu.degree} onChange={e => {
                    const next = [...education]; next[idx].degree = e.target.value; setEducation(next);
                  }} />
                  <input placeholder="Score / CGPA" className="bg-dark-bg border border-dark-border rounded-lg px-2.5 py-1.5 text-white" value={edu.score} onChange={e => {
                    const next = [...education]; next[idx].score = e.target.value; setEducation(next);
                  }} />
                  <input placeholder="Year" className="bg-dark-bg border border-dark-border rounded-lg px-2.5 py-1.5 text-white" value={edu.year} onChange={e => {
                    const next = [...education]; next[idx].year = e.target.value; setEducation(next);
                  }} />
                </div>
              </div>
            ))}
          </GlassCard>

          {/* Projects and experience builder can be collapsed similarly */}
        </div>

        {/* Right Side: Resume Live Preview */}
        <div className="space-y-6">
          {/* ATS Score card (hidden on print) */}
          {atsScore !== null && (
            <GlassCard className="space-y-3 border-emerald-500/20 print:hidden">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black uppercase text-white">ATS System Scan Complete</h4>
                <span className="text-base font-black text-emerald-400">{atsScore}/100 Score</span>
              </div>
              <div className="h-2 w-full bg-dark-bg rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${atsScore}%` }} />
              </div>
              <ul className="list-disc pl-4 text-[10px] text-gray-400 space-y-1">
                {suggestions.map((tip, i) => <li key={i}>{tip}</li>)}
              </ul>
            </GlassCard>
          )}

          {/* Clean Resume sheet layout */}
          <div className="bg-white text-black p-8 rounded-xl shadow-2xl space-y-6 font-serif max-h-[800px] overflow-y-auto print:max-h-none print:shadow-none print:p-0">
            {/* Header */}
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold uppercase tracking-wide">{name}</h2>
              <p className="text-[10px] font-sans text-gray-600">
                {email} • {phone}
              </p>
              <p className="text-[9px] font-mono text-gray-500">
                {linkedin} • {github}
              </p>
            </div>

            <hr className="border-gray-300" />

            {/* Education */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-200 pb-1">Education</h3>
              {education.map((edu, i) => (
                <div key={i} className="flex justify-between items-start text-[11px]">
                  <div>
                    <h5 className="font-bold">{edu.school || 'Institution'}</h5>
                    <p className="text-gray-600">{edu.degree || 'Degree'}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">{edu.score || 'CGPA'}</span>
                    <p className="text-gray-500 text-[10px]">{edu.year || 'Duration'}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-200 pb-1">Skills</h3>
              <p className="text-[11px] leading-relaxed">{skills || 'Add technical skills...'}</p>
            </div>

            {/* Projects */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-200 pb-1">Academic Projects</h3>
              {projects.map((proj, i) => (
                <div key={i} className="space-y-1 text-[11px]">
                  <div className="flex justify-between items-center font-bold">
                    <span>{proj.title || 'Project Title'}</span>
                    <span className="text-[9px] font-sans font-normal text-gray-500">({proj.tech})</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{proj.desc || 'Project description summary...'}</p>
                </div>
              ))}
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-200 pb-1">Experience</h3>
              {experience.map((exp, i) => (
                <div key={i} className="space-y-1 text-[11px]">
                  <div className="flex justify-between items-start font-bold">
                    <div>
                      <span>{exp.company || 'Company'}</span>
                      <span className="text-gray-600 font-normal block text-[10px]">{exp.role || 'Role'}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-normal">{exp.duration}</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{exp.desc || 'Describe work responsibility...'}</p>
                </div>
              ))}
            </div>

            {/* Certs and Achievements */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-200 pb-1">Certifications</h3>
                <p className="text-[10px] leading-relaxed text-gray-600">{certifications}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-200 pb-1">Achievements</h3>
                <p className="text-[10px] leading-relaxed text-gray-600">{achievements}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default ATSResumeBuilder;
