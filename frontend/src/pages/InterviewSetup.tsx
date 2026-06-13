import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Video, 
  ShieldCheck, 
  Briefcase, 
  Award, 
  Building, 
  Sparkles, 
  Mic, 
  MicOff, 
  CheckCircle, 
  AlertCircle, 
  Info 
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import api from '../utils/api';

export const InterviewSetup: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [jobRole, setJobRole] = useState('Software Engineer');
  const [experienceLevel, setExperienceLevel] = useState('Fresher');
  const [difficulty, setDifficulty] = useState('Medium');
  const [interviewType, setInterviewType] = useState('Technical');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);

  // Microphone test state
  const [testRecording, setTestRecording] = useState(false);
  const [testTranscript, setTestTranscript] = useState('');
  const testRecognitionRef = useRef<any>(null);

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

  const experienceLevels = [
    { value: 'Fresher', label: 'Fresher / Graduate' },
    { value: '1-2 Years', label: 'Junior (1-2 Years)' },
    { value: '3-5 Years', label: 'Mid-Level (3-5 Years)' },
    { value: '5+ Years', label: 'Senior (5+ Years)' },
  ];

  const difficulties = ['Easy', 'Medium', 'Hard'];

  const interviewTypes = [
    { value: 'Technical', label: 'Technical Assessment' },
    { value: 'HR', label: 'HR Roundtable' },
    { value: 'Behavioral', label: 'Behavioral (STAR Method)' },
    { value: 'System Design', label: 'System Design Architecture' },
    { value: 'Mixed', label: 'Comprehensive Mixed' },
  ];

  const companies = [
    { value: '', label: 'General Technical Mock' },
    { value: 'Google', label: 'Google India' },
    { value: 'Amazon', label: 'Amazon Development Centre' },
    { value: 'Microsoft', label: 'Microsoft IDC' },
    { value: 'Meta', label: 'Meta Careers' },
    { value: 'Netflix', label: 'Netflix Streaming' },
    { value: 'TCS', label: 'TCS Digital / Ninja' },
    { value: 'Infosys', label: 'Infosys Power Programmer' },
    { value: 'Wipro', label: 'Wipro NLTH' },
    { value: 'Accenture', label: 'Accenture ACI' },
    { value: 'Capgemini', label: 'Capgemini Analyst' }
  ];

  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/interview/generate', {
        jobRole,
        experienceLevel,
        difficulty,
        interviewType,
        company: company || undefined
      });

      const interviewId = response.data.interview._id || response.data.interview.id;
      showToast('Interview session initialized successfully!', 'success');
      navigate(`/interview/active?id=${interviewId}`);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to initialize session.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const startTestMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Speech Recognition is not supported by your browser. Please use Chrome.', 'error');
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setTestTranscript(transcript);
      };

      rec.onerror = (e: any) => {
        console.error(e);
        showToast('Speech test failed or mic access was blocked.', 'error');
        setTestRecording(false);
      };

      rec.onend = () => {
        setTestRecording(false);
      };

      rec.start();
      testRecognitionRef.current = rec;
      setTestRecording(true);
      setTestTranscript('');
      showToast('Mic active! Start speaking to test transcription...', 'info');
    } catch (err) {
      console.error(err);
      setTestRecording(false);
    }
  };

  const stopTestMic = () => {
    if (testRecognitionRef.current) {
      testRecognitionRef.current.stop();
    }
    setTestRecording(false);
  };

  const getInterviewGuidelines = (type: string) => {
    switch (type) {
      case 'Technical':
        return 'Focus on explaining your logical flow step-by-step. Speak about data structure choices, time complexity (Big-O), spatial optimization, and edge-cases.';
      case 'HR':
        return 'Keep your tone confident, positive, and align your values with the target company culture. Practice answering standard questions like "Tell me about yourself" and goals.';
      case 'Behavioral':
        return 'Strictly apply the STAR framework (Situation, Task, Action, Result). State the context, details of your specific responsibilities, what actions you drove, and the measurable impact.';
      case 'System Design':
        return 'Structure your architecture from small to large: 1. Scope requirements -> 2. Define key APIs -> 3. High-level architecture (DB, load balancer, caches) -> 4. Scale bottlenecks.';
      case 'Mixed':
        return 'Prepare for rapid shifts between analytical technical concepts, abstract system scaling problems, and STAR behavioral questions.';
      default:
        return 'Answer each prompt clearly. Highlight your strengths, structured methods, and past project examples.';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Video className="h-5 w-5 text-primary-400" />
          <span>AI Mock Interview Simulator</span>
        </h2>
        <p className="text-xs text-gray-400">
          Configure interview levels, verify system hardware, and start full-length conversational mock sessions evaluated by Gemini.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Configurator */}
        <div className="lg:col-span-7">
          <GlassCard glow className="p-8">
            <div className="flex items-center gap-2 mb-6 text-primary-400">
              <Sparkles className="h-5 w-5 fill-primary-400" />
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Interview Configurator</h3>
            </div>

            <form onSubmit={handleStartInterview} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Job role */}
              <div className="flex flex-col gap-1.5">
                <label className="block text-[10px] uppercase font-bold text-gray-400">Job Role</label>
                <div className="relative">
                  <select
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl pl-11 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary-500 appearance-none cursor-pointer"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-500" />
                </div>
              </div>

              {/* Experience level */}
              <div className="flex flex-col gap-1.5">
                <label className="block text-[10px] uppercase font-bold text-gray-400">Experience Level</label>
                <div className="relative">
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl pl-11 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary-500 appearance-none cursor-pointer"
                  >
                    {experienceLevels.map((el) => (
                      <option key={el.value} value={el.value}>
                        {el.label}
                      </option>
                    ))}
                  </select>
                  <Award className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-500" />
                </div>
              </div>

              {/* Target company */}
              <div className="flex flex-col gap-1.5">
                <label className="block text-[10px] uppercase font-bold text-gray-400">Target Company Pattern</label>
                <div className="relative">
                  <select
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl pl-11 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary-500 appearance-none cursor-pointer"
                  >
                    {companies.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-500" />
                </div>
              </div>

              {/* Difficulty */}
              <div className="flex flex-col gap-1.5">
                <label className="block text-[10px] uppercase font-bold text-gray-400">Interview Difficulty</label>
                <div className="flex gap-3">
                  {difficulties.map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${
                        difficulty === diff
                          ? 'bg-primary-500/10 border-primary-500 text-primary-400 shadow-inner'
                          : 'bg-dark-bg border-dark-border text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interview type */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="block text-[10px] uppercase font-bold text-gray-400">Interview Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {interviewTypes.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setInterviewType(t.value)}
                      className={`py-3 px-2 text-[10px] font-bold uppercase tracking-wider rounded-xl border transition-all text-center flex items-center justify-center min-h-[50px] ${
                        interviewType === t.value
                          ? 'bg-gradient-to-tr from-primary-600/20 to-primary-500/10 border-primary-500 text-white shadow-inner'
                          : 'bg-dark-bg border-dark-border text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 mt-4">
                <Button type="submit" loading={loading} className="w-full py-3">
                  Initialize Mock Interview Session
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>

        {/* Right Column: Pre-interview Guidelines and Hardware Tests */}
        <div className="lg:col-span-5 space-y-6">
          {/* Hardware Speech Checklist */}
          <GlassCard className="p-6 border-primary-500/20">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Mic className="h-4.5 w-4.5 text-primary-400" />
              <span>Hardware & Speech Engine Check</span>
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs border-b border-dark-border pb-3">
                <span className="text-gray-400">Speech Recognition Engine:</span>
                {((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4" /> Supported
                  </span>
                ) : (
                  <span className="text-red-400 font-bold flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" /> Unsupported (Use Chrome)
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Test your microhpone transcription before starting a live session:
                </p>
                <div className="flex gap-3 items-center">
                  {testRecording ? (
                    <button
                      type="button"
                      onClick={stopTestMic}
                      className="px-3 py-1.5 text-[10px] font-bold text-white bg-red-600 rounded-lg hover:bg-red-500 transition-colors flex items-center gap-1.5 animate-pulse"
                    >
                      <MicOff className="h-3.5 w-3.5" />
                      Stop Test
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startTestMic}
                      className="px-3 py-1.5 text-[10px] font-bold text-primary-400 bg-primary-500/10 border border-primary-500/30 rounded-lg hover:bg-primary-500/20 transition-colors flex items-center gap-1.5"
                    >
                      <Mic className="h-3.5 w-3.5" />
                      Start Mic Test
                    </button>
                  )}
                </div>
                {testTranscript && (
                  <div className="p-3 bg-dark-bg/60 border border-dark-border rounded-lg">
                    <span className="text-[9px] uppercase font-bold text-gray-500 block mb-1">Transcribed words:</span>
                    <p className="text-[11px] text-emerald-400 italic">"{testTranscript}"</p>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Prep Guide Strategy */}
          <GlassCard className="p-6 border-accent-purple/20">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-accent-purple" />
              <span>Preparation Guidelines</span>
            </h3>

            <div className="bg-dark-bg/60 border border-dark-border p-4 rounded-xl space-y-2 mb-4">
              <span className="text-[9px] uppercase font-black text-accent-purple tracking-widest block flex items-center gap-1">
                <Info className="h-3.5 w-3.5" />
                {interviewType} Response Framework
              </span>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                {getInterviewGuidelines(interviewType)}
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-[9px] uppercase font-bold text-gray-500 block tracking-wider">Session Rules Checklist</span>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2.5 text-[11px] text-gray-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent-purple mt-1.5 flex-shrink-0" />
                  <span>The session generates **5 target questions** tailored to your config.</span>
                </li>
                <li className="flex items-start gap-2.5 text-[11px] text-gray-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent-purple mt-1.5 flex-shrink-0" />
                  <span>Aim to speak for **1 to 2 minutes** per answer to ensure structural depth.</span>
                </li>
                <li className="flex items-start gap-2.5 text-[11px] text-gray-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent-purple mt-1.5 flex-shrink-0" />
                  <span>You can edit or review the text transcript manually before clicking Next.</span>
                </li>
              </ul>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default InterviewSetup;
