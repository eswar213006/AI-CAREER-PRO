import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Timer, 
  Mic, 
  MicOff, 
  ArrowRight, 
  XOctagon, 
  SkipForward, 
  CheckCircle,
  Volume2,
  AlertCircle,
  Radio,
  MessageSquare
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import api from '../utils/api';

export const MockInterview: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const queryParams = new URLSearchParams(location.search);
  const interviewId = queryParams.get('id');

  const [interview, setInterview] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [micPermission, setMicPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Timer state
  const [timerSec, setTimerSec] = useState(0);
  const [questionDurations, setQuestionDurations] = useState<number[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Result state
  const [report, setReport] = useState<any>(null);

  // Fetch active interview details
  const fetchInterview = async () => {
    try {
      const response = await api.get('/interview/history');
      const activeSession = response.data.interviews.find((i: any) => i._id === interviewId || i.id === interviewId);
      if (!activeSession) {
        showToast('Active interview session not found.', 'error');
        navigate('/interview');
        return;
      }
      setInterview(activeSession);
    } catch (err) {
      showToast('Failed to load session details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!interviewId) {
      navigate('/interview');
      return;
    }
    fetchInterview();
  }, [interviewId]);

  // Timer triggers
  useEffect(() => {
    if (interview && !report && !completing) {
      setTimerSec(0);
      timerIntervalRef.current = setInterval(() => {
        setTimerSec((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [currentIdx, interview, report, completing]);

  // Mic permission check on mount
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then((result) => {
        setMicPermission(result.state === 'granted' ? 'granted' : result.state === 'denied' ? 'denied' : 'unknown');
        result.onchange = () => {
          setMicPermission(result.state === 'granted' ? 'granted' : result.state === 'denied' ? 'denied' : 'unknown');
        };
      }).catch(() => {});
    }
  }, []);

  // Speech recognition setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (final) {
        setUserAnswer((prev) => prev + (prev ? ' ' : '') + final);
        setInterimTranscript('');
      } else {
        setInterimTranscript(interim);
      }
    };

    rec.onerror = (e: any) => {
      if (e.error === 'not-allowed') {
        setMicPermission('denied');
        showToast('Microphone access denied. Please allow mic access in browser settings.', 'error');
      } else {
        console.error('Speech recognition error:', e.error);
      }
      setIsRecording(false);
      setInterimTranscript('');
    };

    rec.onend = () => {
      setIsRecording(false);
      setInterimTranscript('');
    };

    recognitionRef.current = rec;
  }, []);

  const toggleRecording = async () => {
    if (!speechSupported) {
      showToast('Speech recognition is not supported in this browser. Use Chrome for best results.', 'error');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      setInterimTranscript('');
    } else {
      // Request mic permission explicitly
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicPermission('granted');
        recognitionRef.current?.start();
        setIsRecording(true);
        showToast('🎙️ Microphone active — start speaking!', 'info');
      } catch (err) {
        setMicPermission('denied');
        showToast('Microphone access denied. Please allow mic in browser settings.', 'error');
      }
    }
  };

  // Text-to-Speech: read question aloud
  const readQuestionAloud = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.9;
    utter.pitch = 1;
    utter.lang = 'en-US';
    window.speechSynthesis.speak(utter);
  };

  const formatTimer = (sec: number) => {
    const minStr = Math.floor(sec / 60).toString().padStart(2, '0');
    const secStr = (sec % 60).toString().padStart(2, '0');
    return `${minStr}:${secStr}`;
  };

  const handleSaveAnswer = async () => {
    if (!interview) return;
    setSaving(true);
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    try {
      const q = interview.questions[currentIdx];
      await api.post('/interview/answer', {
        interviewId,
        questionId: q.id,
        userAnswer: userAnswer.trim()
      });

      // Track duration
      const durations = [...questionDurations];
      durations[currentIdx] = timerSec;
      setQuestionDurations(durations);

      // Save locally
      const updated = { ...interview };
      updated.questions[currentIdx].userAnswer = userAnswer.trim();
      setInterview(updated);
    } catch (error) {
      showToast('Failed to save response.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    await handleSaveAnswer();
    setUserAnswer('');
    setCurrentIdx((prev) => prev + 1);
  };

  const handleSkip = () => {
    // Record 0 duration
    const durations = [...questionDurations];
    durations[currentIdx] = 0;
    setQuestionDurations(durations);

    setUserAnswer('');
    setCurrentIdx((prev) => prev + 1);
  };

  const handleEndInterview = async () => {
    await handleSaveAnswer();
    setCompleting(true);

    try {
      const response = await api.post('/interview/complete', {
        interviewId,
        durations: [...questionDurations, timerSec] // capture last question timer
      });

      setReport(response.data.report);
      showToast(`Interview Evaluated! +${response.data.earnedXP || 0} XP gained.`, 'success');
    } catch (error) {
      showToast('Evaluation dispatch failed.', 'error');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (report) {
    /* Show Score Breakdown and Evaluations */
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <span>Interview Performance Card</span>
          </h2>
          <p className="text-xs text-gray-400">Review technical scores, communication summaries, and AI speech improvements.</p>
        </div>

        {/* Global Grades Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <GlassCard className="border-primary-500/20 text-center" glow>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Overall Score</span>
            <p className="text-4xl font-black text-white mt-3">{report.score?.overall}%</p>
            <div className="w-full bg-dark-border h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-primary-500 h-full rounded-full" style={{ width: `${report.score?.overall}%` }} />
            </div>
          </GlassCard>

          <GlassCard className="border-accent-purple/20 text-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Technical Grade</span>
            <p className="text-4xl font-black text-accent-purple mt-3">{report.score?.technical}%</p>
            <div className="w-full bg-dark-border h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-accent-purple h-full rounded-full" style={{ width: `${report.score?.technical}%` }} />
            </div>
          </GlassCard>

          <GlassCard className="border-accent-pink/20 text-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Communication</span>
            <p className="text-4xl font-black text-accent-pink mt-3">{report.score?.communication}%</p>
            <div className="w-full bg-dark-border h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-accent-pink h-full rounded-full" style={{ width: `${report.score?.communication}%` }} />
            </div>
          </GlassCard>

          <GlassCard className="border-accent-cyan/20 text-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Confidence Score</span>
            <p className="text-4xl font-black text-accent-cyan mt-3">{report.score?.confidence}%</p>
            <div className="w-full bg-dark-border h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-accent-cyan h-full rounded-full" style={{ width: `${report.score?.confidence}%` }} />
            </div>
          </GlassCard>
        </div>

        {/* Voice and Speech Report Card */}
        <GlassCard className="border-orange-500/20">
          <h3 className="text-xs font-bold text-white tracking-wider flex items-center gap-2 mb-4">
            <Volume2 className="h-5 w-5 text-orange-400 animate-pulse" />
            <span>AI Voice Speaking & Fluency Report</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[9px] uppercase font-bold text-gray-500 block">Average Speed</span>
              <p className="text-2xl font-black text-white">{report.voiceReport?.speakingSpeedWpm} WPM</p>
              <span className="text-[10px] text-emerald-400 font-bold block mt-1">✓ Normal conversational speed</span>
            </div>
            
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[9px] uppercase font-bold text-gray-500 block">Filler word Count</span>
              <p className="text-2xl font-black text-red-400">{report.voiceReport?.fillerWordCount} filler words</p>
              <span className="text-[10px] text-gray-500 block">Matches found: {report.voiceReport?.fillerWordsDetected.join(', ') || 'None!'}</span>
            </div>

            <div className="p-4 bg-dark-bg/60 border border-dark-border rounded-xl text-xs text-gray-400 leading-relaxed">
              {report.voiceReport?.reportSummary}
            </div>
          </div>
        </GlassCard>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="border-emerald-500/20">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle className="h-4.5 w-4.5" />
              <span>Strengths Demonstrated</span>
            </h3>
            <ul className="flex flex-col gap-2">
              {report.aiDetailedFeedback?.strengths.map((str: string, idx: number) => (
                <li key={idx} className="flex gap-2.5 text-xs text-gray-300 font-medium leading-relaxed">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard className="border-red-500/20">
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertCircle className="h-4.5 w-4.5" />
              <span>Weaknesses / Gaps</span>
            </h3>
            <ul className="flex flex-col gap-2">
              {report.aiDetailedFeedback?.weaknesses.map((w: string, idx: number) => (
                <li key={idx} className="flex gap-2.5 text-xs text-gray-300 font-medium leading-relaxed">
                  <span className="text-red-500 font-bold">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>

        {/* Question by Question Reviews */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Detailed Answers Review</h3>
          {report.questions?.map((q: any, idx: number) => (
            <GlassCard key={q.id} className="space-y-4">
              <div className="flex justify-between items-start border-b border-dark-border pb-3">
                <div>
                  <span className="px-2 py-0.5 rounded bg-dark-bg border border-dark-border text-[9px] font-black text-gray-400">Q{idx + 1}</span>
                  <p className="text-xs font-extrabold text-white mt-1.5 leading-relaxed">{q.text}</p>
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-primary-500/10 border border-primary-500/20 text-xs font-bold text-primary-400">
                  {q.score || 0} / 10
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block uppercase font-bold">Your answer transcript</span>
                <p className="text-xs text-gray-300 mt-1 bg-dark-bg p-3.5 rounded-xl border border-dark-border min-h-[50px] leading-relaxed">
                  {q.userAnswer || 'No response.'}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-primary-400 block uppercase font-bold">AI Corrective Feedback</span>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  {q.feedback}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="flex gap-4">
          <Button onClick={() => navigate('/dashboard')} variant="secondary">
            Back to Dashboard
          </Button>
          <Button onClick={() => navigate('/interview')}>
            Start Another Mock
          </Button>
        </div>
      </div>
    );
  }

  // Active question details
  const activeQuestion = interview?.questions[currentIdx];

  const getQuestionTips = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'technical':
      case 'technical assessment':
        return {
          title: '💡 Technical Structure Strategy',
          steps: [
            '1. Clarify constraints (ask/state assumptions about input sizes, null values).',
            '2. Propose a brute force approach to show you understand the base logic.',
            '3. Optimize: Suggest better algorithms, data structures (HashMap, double pointer, etc.).',
            '4. Analyze: Clearly state the resulting Time & Space complexities (Big-O).'
          ]
        };
      case 'behavioral':
      case 'behavioral (star method)':
        return {
          title: '💡 Behavioral STAR Strategy',
          steps: [
            '1. Situation: Briefly describe the background context, challenge, or task.',
            '2. Task: Outline what your specific responsibility or goal was.',
            '3. Action: Detail exactly what steps you took (use "I did" rather than "We did").',
            '4. Result: Share the positive, quantifiable outcome (e.g., saved 10 hours, improved by 20%).'
          ]
        };
      case 'system design':
      case 'system design architecture':
        return {
          title: '💡 System Design Strategy',
          steps: [
            '1. Functional Requirements (what APIs are needed) & Non-functional (availability, latency).',
            '2. API signature definition (endpoints, JSON request/response formats).',
            '3. Core Database schema design and scaling layers (SQL vs NoSQL, indexes, caching).',
            '4. Explain scaling (Load Balancing, horizontal scaling, partitioning, replication).'
          ]
        };
      case 'hr':
      case 'hr roundtable':
        return {
          title: '💡 HR Round Strategy',
          steps: [
            '1. Express clear enthusiasm and alignment with the team / company principles.',
            '2. Be structured: explain why your background matches the role directly.',
            '3. Frame weaknesses as areas of active improvement and learning goals.'
          ]
        };
      default:
        return {
          title: '💡 General Framework Strategy',
          steps: [
            '1. Structure: Introduction -> Methodical Explanation -> Conclusion.',
            '2. Clarity: Avoid rambling; focus on the primary solution and core concepts.',
            '3. Verification: Ensure all parts of the question prompt are addressed.'
          ]
        };
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      {/* Console header */}
      <div className="flex justify-between items-center bg-dark-card/90 px-6 py-4 border border-dark-border rounded-2xl">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-xl bg-primary-500/10 border border-primary-500/30 text-xs font-black text-primary-400 capitalize">
            {interview?.interviewType} Mode
          </span>
          <span className="text-xs text-gray-500 font-bold">{interview?.jobRole} ({interview?.difficulty})</span>
        </div>
        <div className="flex items-center gap-2 text-white font-mono text-sm px-4 py-2.5 rounded-xl bg-dark-bg border border-dark-border">
          <Timer className="h-4.5 w-4.5 text-primary-400" />
          <span>{formatTimer(timerSec)}</span>
        </div>
      </div>

      {/* Active Question Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Index timeline */}
        <GlassCard className="md:col-span-1 p-4 flex flex-col gap-2">
          <span className="text-[9px] uppercase font-bold text-gray-500 block tracking-widest mb-2">Progress Map</span>
          {interview?.questions.map((q: any, i: number) => (
            <div
              key={q.id}
              className={`flex items-center gap-3 p-2.5 rounded-xl border text-[11px] font-bold ${
                currentIdx === i
                  ? 'bg-primary-500/15 border-primary-500 text-white'
                  : q.userAnswer
                  ? 'bg-emerald-950/10 border-emerald-900/50 text-emerald-400'
                  : 'bg-dark-bg/60 border-dark-border text-gray-500'
              }`}
            >
              <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                currentIdx === i ? 'bg-primary-500 text-white' : q.userAnswer ? 'bg-emerald-600 text-white' : 'bg-dark-border'
              }`}>
                {i + 1}
              </div>
              <span>Question {i + 1}</span>
            </div>
          ))}
        </GlassCard>

        {/* Content panel */}
        <div className="md:col-span-3 flex flex-col gap-6">
          <GlassCard glow className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="px-2.5 py-1 rounded bg-primary-500/10 border border-primary-500/20 text-[9px] font-black text-primary-400 uppercase tracking-widest">Question {currentIdx + 1} of 5</span>
              <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
                Category: <span className="text-primary-400 capitalize">{activeQuestion?.category || interview?.interviewType}</span>
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-white leading-relaxed mt-2">{activeQuestion?.text}</h3>
            
            {/* Framework guidelines */}
            <div className="mt-4 p-4 rounded-xl border border-dark-border bg-dark-bg/60 text-xs">
              <p className="font-bold text-gray-300 mb-2">{getQuestionTips(activeQuestion?.category || interview?.interviewType).title}</p>
              <ul className="space-y-1.5 text-gray-400">
                {getQuestionTips(activeQuestion?.category || interview?.interviewType).steps.map((step: string, sIdx: number) => (
                  <li key={sIdx} className="leading-relaxed pl-1">{step}</li>
                ))}
              </ul>
            </div>
          </GlassCard>

          {/* Recording panel */}
          <GlassCard className="space-y-4">
            {/* Mic permission warning */}
            {micPermission === 'denied' && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-amber-500/30 bg-amber-950/10 text-xs text-amber-300">
                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Microphone access is blocked. Go to browser settings → Site Settings → Microphone → Allow, then refresh this page.</span>
              </div>
            )}
            {!speechSupported && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-orange-500/30 bg-orange-950/10 text-xs text-orange-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Speech recognition is not supported in this browser. Please use <strong>Google Chrome</strong> for the voice interview feature. You can still type your answers below.</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-center flex-wrap gap-3">
                <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" /> Your Answer Transcript
                </span>
                {isRecording ? (
                  <span className="px-2 py-0.5 rounded-full bg-red-600/10 border border-red-500/30 text-[9px] font-bold text-red-400 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    <Radio className="h-3 w-3 animate-pulse" />
                    Live Recording
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-dark-bg border border-dark-border text-[9px] font-bold text-gray-500 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-600" />
                    Mic Idle
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-[9px] font-bold text-primary-400">
                  {userAnswer.trim().split(/\s+/).filter(Boolean).length} Words
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* TTS read-aloud button */}
                {'speechSynthesis' in window && (
                  <button
                    onClick={() => readQuestionAloud(activeQuestion?.text || '')}
                    title="Read question aloud"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dark-border hover:border-gray-500 text-gray-500 hover:text-gray-300 text-xs font-bold transition-all"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Read Aloud</span>
                  </button>
                )}

                {/* Mic toggle button */}
                <button
                  onClick={toggleRecording}
                  disabled={micPermission === 'denied'}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-xs transition-all ${
                    isRecording
                      ? 'bg-red-600 hover:bg-red-500 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]'
                      : micPermission === 'denied'
                      ? 'bg-dark-bg border-dark-border text-gray-600 cursor-not-allowed opacity-50'
                      : 'bg-primary-500/10 hover:bg-primary-500/20 border-primary-500/30 text-primary-400'
                  }`}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  <span>{isRecording ? 'Stop Mic' : 'Start Speaking'}</span>
                </button>
              </div>
            </div>

            {/* Live interim transcript bubble */}
            {isRecording && interimTranscript && (
              <div className="px-4 py-3 rounded-xl border border-primary-500/30 bg-primary-950/10 text-xs text-gray-400 italic leading-relaxed">
                <span className="text-primary-400 font-bold not-italic">🎙️ Listening: </span>
                {interimTranscript}
                <span className="animate-pulse text-primary-400">|</span>
              </div>
            )}

            {/* Waveform bars animation when recording */}
            {isRecording && (
              <div className="flex items-center justify-center gap-1 py-2">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-primary-500/70 rounded-full w-1"
                    style={{
                      height: `${8 + Math.random() * 20}px`,
                      animationName: 'waveBar',
                      animationDuration: `${0.4 + (i % 4) * 0.15}s`,
                      animationTimingFunction: 'ease-in-out',
                      animationIterationCount: 'infinite',
                      animationDirection: 'alternate',
                    }}
                  />
                ))}
              </div>
            )}

            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              rows={7}
              placeholder="🎙️ Click 'Start Speaking' to use voice input, or type your answer here directly..."
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 transition-colors leading-relaxed"
            />

            <p className="text-[10px] text-gray-600 text-center">
              Voice input uses your browser's built-in speech recognition (works best in Chrome). You can also type or edit your answer manually.
            </p>
          </GlassCard>

          {/* Console Action buttons */}
          <div className="flex justify-between items-center gap-4">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to exit? Your progress in this session will not be saved.')) {
                  navigate('/interview');
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-900/30 bg-red-950/10 hover:bg-red-950/20 text-red-400 text-xs font-bold"
            >
              <XOctagon className="h-4 w-4" />
              <span>Quit Interview</span>
            </button>

            <div className="flex gap-3">
              {currentIdx < 4 ? (
                <>
                  <button
                    onClick={handleSkip}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-dark-border hover:bg-dark-hover text-xs font-bold text-gray-400"
                  >
                    <SkipForward className="h-4 w-4" />
                    <span>Skip Question</span>
                  </button>
                  <Button onClick={handleNext} loading={saving} className="flex items-center gap-1.5">
                    <span>Next Question</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button onClick={handleEndInterview} loading={completing} variant="accent" className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4" />
                  <span>Submit & End Interview</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
