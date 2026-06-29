import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { 
  Users, Search, Star, Award, Code2, Video, Github,
  Linkedin, Briefcase, ChevronRight, CheckCircle
} from 'lucide-react';

interface CandidateProfile {
  id: string;
  name: string;
  avatar: string;
  readinessScore: number;
  xp: number;
  github: string;
  projectsCount: number;
  interviewAvg: number;
  atsScore: number;
  role: string;
  shortlisted: boolean;
}

const STATIC_CANDIDATES: CandidateProfile[] = [
  { id: '1', name: 'Eswar Student', avatar: '👨‍💻', readinessScore: 88, xp: 1250, github: 'github.com/eswar213006', projectsCount: 3, interviewAvg: 85, atsScore: 82, role: 'Backend Engineer', shortlisted: false },
  { id: '2', name: 'Nikhil Kumar', avatar: '👨‍🎓', readinessScore: 78, xp: 980, github: 'github.com/nikhil-k', projectsCount: 2, interviewAvg: 72, atsScore: 78, role: 'Full Stack Engineer', shortlisted: true },
  { id: '3', name: 'Sneha Rao', avatar: '👩‍💻', readinessScore: 92, xp: 1420, github: 'github.com/sneha-r', projectsCount: 4, interviewAvg: 90, atsScore: 88, role: 'Frontend Engineer', shortlisted: false },
  { id: '4', name: 'Aakash Verma', avatar: '🧑‍💻', readinessScore: 70, xp: 820, github: 'github.com/aakash-v', projectsCount: 2, interviewAvg: 68, atsScore: 74, role: 'Backend Intern', shortlisted: false }
];

export const RecruiterPortal: React.FC = () => {
  const { showToast } = useToast();
  const [candidates, setCandidates] = useState<CandidateProfile[]>(STATIC_CANDIDATES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);

  const toggleShortlist = (id: string) => {
    const next = candidates.map(c => {
      if (c.id === id) {
        showToast(c.shortlisted ? 'Candidate removed from shortlist.' : 'Candidate shortlisted!', 'success');
        return { ...c, shortlisted: !c.shortlisted };
      }
      return c;
    });
    setCandidates(next);
    if (selectedCandidate?.id === id) {
      setSelectedCandidate({ ...selectedCandidate, shortlisted: !selectedCandidate.shortlisted });
    }
  };

  const filtered = candidates.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Users className="h-5 w-5 text-primary-400" />
          <span>Recruiter Talent Sourcing Hub</span>
        </h2>
        <p className="text-xs text-gray-400">
          Source top technical talent. Filter candidates by verified DSA performance, mock interviews score, and ATS profiles.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Filter candidates by name or target role..."
          className="w-full pl-10 pr-4 py-2 text-xs bg-dark-card/60 border border-dark-border rounded-xl text-white focus:outline-none focus:border-primary-500 transition-all"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Candidates List Column */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.map(c => (
            <GlassCard key={c.id} className="flex justify-between items-center p-4 border-dark-border/40 hover:border-gray-700 transition-all duration-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{c.avatar}</span>
                <div>
                  <h4 className="text-xs font-extrabold text-white">{c.name}</h4>
                  <p className="text-[10px] text-gray-400 font-bold">{c.role} • Level {Math.floor(c.xp / 400) + 1}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-gray-300">
                <div className="text-center">
                  <span className="text-[9px] uppercase font-bold text-gray-500 block">Readiness</span>
                  <span className="font-extrabold text-primary-400">{c.readinessScore}%</span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] uppercase font-bold text-gray-500 block">Mock Avg</span>
                  <span className="font-extrabold text-white">{c.interviewAvg}%</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleShortlist(c.id)}
                    className={`py-1 px-3 rounded-lg border text-[10px] font-bold ${
                      c.shortlisted 
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' 
                        : 'bg-dark-bg border-dark-border text-gray-400 hover:text-white'
                    }`}
                  >
                    {c.shortlisted ? 'Shortlisted ✓' : 'Shortlist'}
                  </button>
                  <button
                    onClick={() => setSelectedCandidate(c)}
                    className="p-1.5 rounded-lg border border-dark-border bg-dark-bg text-gray-450 hover:text-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Selected Candidate Details panel */}
        {selectedCandidate ? (
          <GlassCard className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-dark-border pb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedCandidate.avatar}</span>
                <div>
                  <h3 className="text-sm font-extrabold text-white">{selectedCandidate.name}</h3>
                  <p className="text-[10px] text-gray-450 font-bold uppercase">{selectedCandidate.role}</p>
                </div>
              </div>
              <button onClick={() => toggleShortlist(selectedCandidate.id)} className="p-1 rounded bg-dark-bg border border-dark-border text-gray-450 hover:text-white">
                <Star className={`h-4 w-4 ${selectedCandidate.shortlisted ? 'text-yellow-400 fill-yellow-400' : ''}`} />
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-300">
              <div className="p-3 bg-dark-bg border border-dark-border rounded-xl">
                <span className="text-[8px] uppercase font-bold text-gray-500 block mb-1">DSA Problems Solved</span>
                <span className="font-extrabold text-white flex items-center gap-1">
                  <Code2 className="h-3.5 w-3.5 text-primary-400" />
                  {selectedCandidate.projectsCount * 14} Solved
                </span>
              </div>
              <div className="p-3 bg-dark-bg border border-dark-border rounded-xl">
                <span className="text-[8px] uppercase font-bold text-gray-500 block mb-1">Mock Interview Performance</span>
                <span className="font-extrabold text-white flex items-center gap-1">
                  <Video className="h-3.5 w-3.5 text-accent-purple" />
                  {selectedCandidate.interviewAvg}% Avg
                </span>
              </div>
            </div>

            {/* Resume details */}
            <div className="p-3.5 bg-dark-bg/60 border border-dark-border rounded-xl space-y-2 text-xs">
              <h5 className="text-[10px] font-black uppercase text-white">LinkedIn / Portfolio Integrity</h5>
              <div className="space-y-1.5 font-mono text-[10px] text-gray-400">
                <p className="flex items-center gap-1.5"><Github className="h-3.5 w-3.5 text-gray-500" /> {selectedCandidate.github}</p>
                <p className="flex items-center gap-1.5"><Linkedin className="h-3.5 w-3.5 text-gray-500" /> linkedin.com/in/{selectedCandidate.name.toLowerCase().replace(/\s+/g, '-')}</p>
              </div>
            </div>

            {/* Shortlist button */}
            <Button
              onClick={() => showToast(`Interview invitation dispatched to ${selectedCandidate.name}!`, 'success')}
              className="w-full py-2.5 flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Schedule Interview</span>
            </Button>
          </GlassCard>
        ) : (
          <GlassCard className="text-center py-24 text-gray-500 space-y-2">
            <Users className="h-10 w-10 mx-auto text-gray-650" />
            <p className="text-xs font-semibold">Select candidate profile</p>
            <p className="text-[10px] text-gray-650 max-w-xs mx-auto">Click detail arrow next to candidate list to inspect full portfolio scores.</p>
          </GlassCard>
        )}

      </div>
    </div>
  );
};
export default RecruiterPortal;
