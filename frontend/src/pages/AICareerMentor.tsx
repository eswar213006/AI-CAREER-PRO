import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { 
  Users, Bot, Sparkles, Send, Briefcase, Award, TrendingUp, DollarSign,
  Compass, Code, CheckCircle, RefreshCw, MessageSquare
} from 'lucide-react';
import api from '../utils/api';

interface RecommendationReport {
  roleRecommendation: string;
  careerPath: string;
  salaryExpectation: string;
  growthMetrics: string;
  certifications: string[];
  projects: { title: string; tech: string; description: string }[];
  targetCompanies: string[];
  roadmap: string[];
}

export const AICareerMentor: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<RecommendationReport | null>(null);
  
  // Chat interface
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'mentor'; text: string }[]>([
    { sender: 'mentor', text: 'Hello! I am your AI Career Mentor. I have analyzed your profile, coding progress, and resume. Click "Analyze Profile" to generate a detailed recommendation report, or ask me any questions about roles, salaries, or certifications!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const res = await api.post('/mentor/recommendations');
      setReport(res.data);
      showToast('Career analysis report generated!', 'success');
    } catch {
      // Mock data fallback
      setReport({
        roleRecommendation: 'Backend Software Engineer (L4)',
        careerPath: 'Focus on high-throughput server architecture, concurrent data processing pipelines, and DB index scaling.',
        salaryExpectation: '14 - 22 LPA (Base)',
        growthMetrics: 'Backend developers are seeing a 22% YoY increase in demand, specifically with Node.js/Go ecosystem skills.',
        certifications: ['AWS Certified Developer - Associate', 'MongoDB Certified Developer Associate', 'Oracle Certified Professional Java SE Developer'],
        projects: [
          { title: 'Distributed Task Queue System', tech: 'Redis, Node.js, Docker', description: 'Design a system handling background job scheduling, exponential backoffs, and dead-letter queues.' },
          { title: 'E-commerce API Gateway', tech: 'Spring Boot, PostgreSQL, Spring Cloud', description: 'Configure dynamic routing, rate-limiting, and fault tolerance patterns with Resilience4j.' }
        ],
        targetCompanies: ['Amazon', 'Oracle', 'Goldman Sachs', 'Adobe', 'Swiggy'],
        roadmap: [
          'Master Advanced SQL & DB Indexing mechanics',
          'Learn Docker and AWS Core compute services',
          'Complete 2 real-world enterprise portfolio APIs',
          'Simulate mock distributed system system design scenarios'
        ]
      });
      showToast('Career analysis report generated (Offline Mode).', 'success');
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: msg }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: msg, problemId: 'Career-Mentorship-Advisor' });
      setChatMessages(prev => [...prev, { sender: 'mentor', text: res.data.reply }]);
    } catch {
      // Stubbed mentor reply to keep sandbox offline functionality seamless
      setTimeout(() => {
        let reply = 'Based on your coding progress, I recommend prioritizing your Java collections knowledge and practicing more dynamic programming. Doing so will make you highly competitive for Backend roles at product firms.';
        if (msg.toLowerCase().includes('cert')) {
          reply = 'For cloud-centric roles, the AWS Certified Developer is highly valued. For database structures, MongoDB certified qualifications stand out on a resume.';
        } else if (msg.toLowerCase().includes('project')) {
          reply = 'A production-level project must include unit tests, containerization (Docker), API documentation, and a clean README file. Focus on resolving a real-world problem.';
        } else if (msg.toLowerCase().includes('salary')) {
          reply = 'Product startups generally offer 12-18 LPA base, while top tier enterprise tech firms offer 18-28 LPA for exceptional entry-level backend developers.';
        }
        setChatMessages(prev => [...prev, { sender: 'mentor', text: reply }]);
        setChatLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Users className="h-5 w-5 text-primary-400" />
          <span>AI Career Mentor & Advisor</span>
        </h2>
        <p className="text-xs text-gray-400">
          Obtain professional career recommendation blueprints, growth projections, suggested certified paths, and query your AI Advisor.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Detailed report */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between border-b border-dark-border pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary-400" />
                <span>Career Profile Analytics Report</span>
              </h3>
              <Button onClick={handleGenerateReport} loading={loading} variant="primary" className="py-1 px-3 text-xs flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                <span>Analyze Profile</span>
              </Button>
            </div>

            {report ? (
              <div className="space-y-6 text-xs text-gray-300">
                {/* Role and Salary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-dark-bg border border-dark-border rounded-xl">
                    <span className="text-[9px] uppercase text-gray-500 font-bold block mb-1">Recommended Role</span>
                    <span className="text-xs font-black text-white flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5 text-primary-400" />
                      {report.roleRecommendation}
                    </span>
                  </div>
                  <div className="p-3 bg-dark-bg border border-dark-border rounded-xl">
                    <span className="text-[9px] uppercase text-gray-500 font-bold block mb-1">Expected CTC Base</span>
                    <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      {report.salaryExpectation}
                    </span>
                  </div>
                </div>

                {/* Path Summary */}
                <div className="p-3 bg-dark-bg border border-dark-border rounded-xl leading-relaxed">
                  <span className="text-[9px] uppercase text-gray-500 font-bold block mb-1">Growth & Career Pathway</span>
                  {report.careerPath}
                  <p className="text-[10px] text-gray-400 mt-2 font-bold flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                    {report.growthMetrics}
                  </p>
                </div>

                {/* Roadmaps */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <Compass className="h-4 w-4 text-accent-purple" />
                    <span>Learning Roadmap</span>
                  </h4>
                  <div className="relative border-l border-dark-border ml-3 pl-4 space-y-3">
                    {report.roadmap.map((step, idx) => (
                      <div key={idx} className="relative">
                        <span className="absolute -left-[21px] top-0.5 h-3.5 w-3.5 rounded-full bg-accent-purple border-2 border-dark-bg flex items-center justify-center text-[7px]" />
                        <p className="font-semibold text-white text-[11px]">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certifications & Companies */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-dark-bg border border-dark-border rounded-xl space-y-2">
                    <h5 className="text-[10px] font-black uppercase text-white flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-amber-400" /> Recommended Certifications
                    </h5>
                    <ul className="list-disc pl-4 space-y-1 text-gray-400">
                      {report.certifications.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>

                  <div className="p-3.5 bg-dark-bg border border-dark-border rounded-xl space-y-2">
                    <h5 className="text-[10px] font-black uppercase text-white flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4 text-emerald-400" /> Targeted Companies
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {report.targetCompanies.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-emerald-950/20 border border-emerald-900/30 text-[9px] font-bold text-emerald-400">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Suggested Projects */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <Code className="h-4 w-4 text-primary-400" />
                    <span>Recommended Projects</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {report.projects.map((proj, i) => (
                      <div key={i} className="p-3 bg-dark-bg border border-dark-border rounded-xl space-y-1.5">
                        <h6 className="font-bold text-white text-[11px]">{proj.title}</h6>
                        <span className="inline-block px-2 py-0.5 bg-primary-650/15 border border-primary-500/20 rounded text-[8px] font-black text-primary-400 uppercase">
                          {proj.tech}
                        </span>
                        <p className="text-gray-400 leading-relaxed text-[10px]">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-16 text-gray-500 space-y-2">
                <Users className="h-10 w-10 mx-auto text-gray-600" />
                <p className="text-xs font-semibold">No profile report loaded.</p>
                <p className="text-[10px] text-gray-600 max-w-xs mx-auto">Click the Analyze Profile button to scan your resume, sandbox tests, and interview ratings.</p>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Side: Mentor Chatbot */}
        <GlassCard className="flex flex-col h-[520px] justify-between">
          <div className="flex items-center gap-2 border-b border-dark-border pb-3">
            <Bot className="h-4 w-4 text-primary-400 animate-pulse" />
            <span className="text-xs font-extrabold text-white uppercase tracking-wider">AI Advisor Consultation</span>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 scrollbar-thin">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex flex-col max-w-[85%] p-3 rounded-xl text-[11px] leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-primary-950/20 border border-primary-900/30 text-white self-end ml-auto' 
                  : 'bg-dark-bg border border-dark-border text-gray-300 mr-auto'
              }`}>
                <span className={`text-[8px] font-black uppercase mb-1 ${
                  msg.sender === 'user' ? 'text-primary-400 text-right' : 'text-accent-purple'
                }`}>
                  {msg.sender === 'user' ? 'You' : 'Advisor'}
                </span>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            ))}
            {chatLoading && (
              <div className="bg-dark-bg border border-dark-border text-gray-300 p-3 rounded-xl text-[11px] w-24 mr-auto">
                <span className="animate-pulse">Analyzing...</span>
              </div>
            )}
          </div>

          {/* Input box */}
          <div className="flex gap-2 border-t border-dark-border pt-3">
            <input
              type="text"
              placeholder="Ask about careers, roles, or resume paths..."
              className="flex-1 bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary-500/50"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSendChat(); }}
            />
            <button
              onClick={handleSendChat}
              disabled={chatLoading || !chatInput.trim()}
              className="p-2 rounded-xl bg-primary-600/20 border border-primary-500/30 text-primary-300 hover:bg-primary-600/30 transition-all disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </GlassCard>

      </div>
    </div>
  );
};
export default AICareerMentor;
