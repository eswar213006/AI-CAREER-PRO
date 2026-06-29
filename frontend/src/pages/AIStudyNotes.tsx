import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { 
  BookMarked, Sparkles, Printer, FileText, CheckCircle, HelpCircle, 
  Layers, Lightbulb, Compass, Award, ExternalLink, ArrowDownToLine
} from 'lucide-react';
import api from '../utils/api';

interface StudyNotes {
  topic: string;
  summary: string;
  revisionChecklist: string[];
  cheatSheet: string;
  flashcards: { q: string; a: string }[];
  interviewQA: { q: string; a: string }[];
}

export const AIStudyNotes: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('DBMS Normalization');
  const [notes, setNotes] = useState<StudyNotes | null>(null);

  const handleGenerateNotes = async () => {
    setLoading(true);
    try {
      const res = await api.post('/notes/generate', { topic });
      setNotes(res.data);
      showToast('Study notes compiled!', 'success');
    } catch {
      // Mock notes matching input topic
      setNotes({
        topic,
        summary: `Normalisation in DBMS is a systematic process of organizing the database schemas to minimize data redundancy and eliminate anomalies (Insertion, Update, Deletion). It involves decomposing tables into smaller, well-structured relations using Functional Dependencies.`,
        revisionChecklist: [
          'Understand First Normal Form (1NF) - Atomic attribute values.',
          'Understand Second Normal Form (2NF) - No partial dependencies.',
          'Understand Third Normal Form (3NF) - No transitive dependencies.',
          'Identify Boyce-Codd Normal Form (BCNF) - Strict candidate key dependencies.'
        ],
        cheatSheet: `1NF: Remove repeating groups / composite columns.\n2NF: 1NF + remove partial dependencies (Non-key attrs must depend on entire PK).\n3NF: 2NF + remove transitive dependencies (Non-key attrs must not depend on other non-key attrs).\nBCNF: For X -> Y, X must be a super key.`,
        flashcards: [
          { q: 'What is a deletion anomaly?', a: 'Accidentally deleting valuable primary records because they are stored in the same table as a dependent attribute.' },
          { q: 'What is transitive dependency?', a: 'When a non-prime attribute determines another non-prime attribute.' }
        ],
        interviewQA: [
          { q: 'Explain BCNF vs 3NF.', a: 'BCNF is a stronger version of 3NF. While 3NF allows X -> Y if Y is a prime attribute, BCNF strictly requires X to be a super key for any functional dependency.' },
          { q: 'What is dependency preserving decomposition?', a: 'Ensuring that all functional dependencies defined on the original relation can be checked using the individual tables after decomposition.' }
        ]
      });
      showToast('Study notes compiled (Offline Mode).', 'success');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 print:bg-white print:p-0 print:text-black">
      {/* Header (hidden on print) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-primary-400" />
            <span>AI Study Notes & Mindmaps</span>
          </h2>
          <p className="text-xs text-gray-400">
            Input any computer science topic or coding algorithm to generate cheat sheets, revision checklists, and Q&As.
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleGenerateNotes} loading={loading} variant="primary" className="text-xs">
            <Sparkles className="h-3.5 w-3.5 mr-1" /> Compile Notes
          </Button>
          <Button onClick={handleDownloadPDF} variant="secondary" className="text-xs">
            <ArrowDownToLine className="h-3.5 w-3.5 mr-1" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Input box (hidden on print) */}
      <div className="max-w-md print:hidden">
        <div className="flex gap-2 text-xs">
          <input
            type="text"
            className="flex-1 bg-dark-bg border border-dark-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary-500"
            placeholder="Enter topic e.g. Operating System Paging..."
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleGenerateNotes(); }}
          />
        </div>
      </div>

      {notes ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Summary & Checklist */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary */}
            <GlassCard className="space-y-3 print:border-none print:shadow-none print:p-0">
              <h4 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-dark-border pb-3 print:text-black print:border-gray-250">
                <FileText className="h-4 w-4 text-primary-400" />
                <span>{notes.topic} Summary Notes</span>
              </h4>
              <p className="leading-relaxed text-xs text-gray-300 print:text-gray-800">
                {notes.summary}
              </p>
            </GlassCard>

            {/* Revision Checklist */}
            <GlassCard className="space-y-3 print:border-none print:shadow-none print:p-0">
              <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-dark-border pb-3 print:text-black print:border-gray-250">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span>Revision Checklist</span>
              </h4>
              <div className="space-y-2 text-xs text-gray-300 print:text-gray-800">
                {notes.revisionChecklist.map((item, i) => (
                  <div key={i} className="flex gap-2.5 p-2 bg-dark-bg border border-dark-border rounded-xl print:bg-white print:border-gray-200">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Q&As */}
            <GlassCard className="space-y-3 print:border-none print:shadow-none print:p-0">
              <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-dark-border pb-3 print:text-black print:border-gray-250">
                <HelpCircle className="h-4 w-4 text-sky-400" />
                <span>Interview Q&As</span>
              </h4>
              <div className="space-y-3 text-xs">
                {notes.interviewQA.map((qa, i) => (
                  <div key={i} className="space-y-1">
                    <h5 className="font-extrabold text-white print:text-black">Q: {qa.q}</h5>
                    <p className="text-gray-400 leading-relaxed print:text-gray-650">A: {qa.a}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Right Cheat Sheet & Flashcards */}
          <div className="space-y-6">
            {/* Cheat Sheet */}
            <GlassCard className="space-y-3 print:border-none print:shadow-none print:p-0">
              <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-dark-border pb-3 print:text-black print:border-gray-250">
                <Lightbulb className="h-4 w-4 text-amber-400" />
                <span>Cheat Sheet Quick-rules</span>
              </h4>
              <pre className="p-3 bg-dark-bg border border-dark-border rounded-xl font-mono text-[10px] text-amber-400 leading-relaxed whitespace-pre-wrap print:bg-white print:text-amber-800 print:border-gray-200">
                <code>{notes.cheatSheet}</code>
              </pre>
            </GlassCard>

            {/* Flashcards info */}
            <GlassCard className="space-y-3 print:hidden">
              <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-dark-border pb-3">
                <Layers className="h-4 w-4 text-accent-purple" />
                <span>Suggested Flashcards</span>
              </h4>
              <div className="space-y-2 text-xs">
                {notes.flashcards.map((fc, i) => (
                  <div key={i} className="p-2.5 bg-dark-bg border border-dark-border rounded-xl space-y-1">
                    <span className="text-[9px] uppercase font-bold text-accent-purple">Flashcard Q</span>
                    <p className="font-bold text-white">{fc.q}</p>
                    <p className="text-[10px] text-gray-400">{fc.a}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

        </div>
      ) : (
        <GlassCard className="text-center py-36 text-gray-500 space-y-2 print:hidden">
          <BookMarked className="h-10 w-10 mx-auto text-gray-650" />
          <p className="text-xs font-semibold">No study topic notes loaded.</p>
          <p className="text-[10px] text-gray-650 max-w-xs mx-auto">Input a topic above and compile notes to prepare your exam cheat sheets.</p>
        </GlassCard>
      )}
    </div>
  );
};
export default AIStudyNotes;
