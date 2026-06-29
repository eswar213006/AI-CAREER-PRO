import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { 
  Compass, Sparkles, Code2, Server, Database, Folders, FileText, 
  Terminal, Globe, RefreshCw, Clipboard
} from 'lucide-react';
import api from '../utils/api';

interface GeneratedProject {
  title: string;
  overview: string;
  architecture: string;
  databaseDesign: string;
  folderStructure: string;
  apiDesign: string;
  deploymentGuide: string;
  resumeBullets: string[];
}

export const ProjectGenerator: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tech, setTech] = useState('React & Node.js');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [domain, setDomain] = useState('FinTech');
  const [project, setProject] = useState<GeneratedProject | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await api.post('/project-gen/generate', { tech, difficulty, domain });
      setProject(res.data);
      showToast('Project blueprint generated successfully!', 'success');
    } catch {
      // Mock project blueprints matching choices
      setProject({
        title: `AI-Powered ${domain} Ledger`,
        overview: `A modern, high-performance web system designed for ${domain} operations utilizing a ${tech} stack. Focuses on security, transaction auditing, and responsive components.`,
        architecture: `Client-Server architecture with clean segregation. Node backend coordinates API gateways and background workers while React orchestrates State management.`,
        databaseDesign: `Table "users" { id (PK), name, email }\nTable "transactions" { id (PK), amount, user_id (FK), status, timestamp }\nIndexes configured on (user_id, timestamp) for rapid range query execution.`,
        folderStructure: `├── client/\n│   ├── src/\n│   │   ├── components/\n│   │   └── pages/\n└── server/\n    ├── src/\n    │   ├── controllers/\n    │   ├── models/\n    │   └── routes/\n    └── package.json`,
        apiDesign: `POST /api/auth/register - Register user\nGET /api/transactions - Fetch user ledger\nPOST /api/transactions/create - Create audited transactions`,
        deploymentGuide: `1. Containerize backend & frontend using Docker.\n2. Configure reverse proxy with Nginx.\n3. Deploy database using AWS RDS instance.\n4. Wire environment variables (.env) securely.`,
        resumeBullets: [
          `Architected and deployed a production-ready ${domain} tracking system using ${tech} and containerized deployment workflow.`,
          `Engineered transactional integrity checks reducing operational synchronization bottlenecks by 18% during concurrent testing.`,
          `Mapped RESTful endpoints securely and integrated responsive client state flows.`
        ]
      });
      showToast('Project blueprint generated (Offline Mode).', 'success');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Compass className="h-5 w-5 text-primary-400" />
          <span>AI Project Idea & Blueprint Generator</span>
        </h2>
        <p className="text-xs text-gray-400">
          Generate complete project blueprints including architectural summaries, database design, API routing, and resume bullet descriptions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Form Settings */}
        <GlassCard className="space-y-4">
          <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-dark-border pb-3">
            <Code2 className="h-4 w-4 text-primary-400" />
            <span>Project Settings</span>
          </h3>

          <div className="space-y-3.5 text-xs text-gray-300">
            {/* Tech Stack */}
            <div className="space-y-1">
              <label className="font-bold text-gray-400">Technology Stack</label>
              <select
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-white"
                value={tech}
                onChange={e => setTech(e.target.value)}
              >
                {['React & Node.js', 'Python & Django/FastAPI', 'Spring Boot & Java', 'Go & Gin Ecosystem'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div className="space-y-1">
              <label className="font-bold text-gray-400">Complexity Difficulty</label>
              <select
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-white"
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
              >
                {['Beginner', 'Intermediate', 'Advanced'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Domain */}
            <div className="space-y-1">
              <label className="font-bold text-gray-400">Business Domain</label>
              <select
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-white"
                value={domain}
                onChange={e => setDomain(e.target.value)}
              >
                {['FinTech', 'E-commerce', 'Social Media / Forum', 'Healthcare Tech', 'AI/ML SaaS Tool'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <Button onClick={handleGenerate} loading={loading} className="w-full py-2.5 flex items-center justify-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            <span>Generate Project Blueprint</span>
          </Button>
        </GlassCard>

        {/* Right Side: Renders Generated Project Details */}
        <div className="lg:col-span-2 space-y-6">
          {project ? (
            <div className="space-y-6 text-xs text-gray-300">
              
              {/* Title & Overview */}
              <GlassCard className="space-y-2 border-primary-500/20">
                <h4 className="text-sm font-extrabold text-white flex items-center justify-between">
                  <span>{project.title}</span>
                  <span className="text-[8px] uppercase font-black px-2 py-0.5 rounded border border-primary-500/30 bg-primary-600/10 text-primary-400">
                    {difficulty}
                  </span>
                </h4>
                <p className="leading-relaxed text-gray-450">{project.overview}</p>
              </GlassCard>

              {/* Architecture & DB */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlassCard className="space-y-2">
                  <h5 className="text-[10px] font-black uppercase text-white flex items-center gap-1.5 border-b border-dark-border pb-2">
                    <Server className="h-4 w-4 text-accent-purple" /> Architecture Plan
                  </h5>
                  <p className="leading-relaxed">{project.architecture}</p>
                </GlassCard>

                <GlassCard className="space-y-2">
                  <h5 className="text-[10px] font-black uppercase text-white flex items-center gap-1.5 border-b border-dark-border pb-2">
                    <Database className="h-4 w-4 text-emerald-400" /> Database Schema (SQL/NoSQL)
                  </h5>
                  <pre className="p-2.5 bg-dark-bg border border-dark-border rounded-xl font-mono text-[9px] text-emerald-400 leading-normal max-h-32 overflow-y-auto">
                    <code>{project.databaseDesign}</code>
                  </pre>
                </GlassCard>
              </div>

              {/* Folder & API Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlassCard className="space-y-2">
                  <h5 className="text-[10px] font-black uppercase text-white flex items-center gap-1.5 border-b border-dark-border pb-2">
                    <Folders className="h-4 w-4 text-amber-400" /> Recommended Directory Tree
                  </h5>
                  <pre className="p-2.5 bg-dark-bg border border-dark-border rounded-xl font-mono text-[9px] text-amber-400 leading-normal">
                    <code>{project.folderStructure}</code>
                  </pre>
                </GlassCard>

                <GlassCard className="space-y-2">
                  <h5 className="text-[10px] font-black uppercase text-white flex items-center gap-1.5 border-b border-dark-border pb-2">
                    <Terminal className="h-4 w-4 text-sky-400" /> API Endpoint Templates
                  </h5>
                  <pre className="p-2.5 bg-dark-bg border border-dark-border rounded-xl font-mono text-[9px] text-sky-400 leading-normal">
                    <code>{project.apiDesign}</code>
                  </pre>
                </GlassCard>
              </div>

              {/* Resume bullet points */}
              <GlassCard className="space-y-3">
                <h5 className="text-[10px] font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-dark-border pb-3">
                  <FileText className="h-4 w-4 text-primary-400" />
                  <span>Resume Description Bullet Points</span>
                </h5>
                <div className="space-y-2">
                  {project.resumeBullets.map((bullet, i) => (
                    <div key={i} className="p-2.5 bg-dark-bg border border-dark-border rounded-xl flex justify-between items-center gap-3">
                      <p className="italic">"{bullet}"</p>
                      <button onClick={() => handleCopy(bullet)} className="p-1 rounded bg-dark-bg border border-dark-border hover:bg-dark-hover text-gray-500 hover:text-white shrink-0">
                        <Clipboard className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Deployment info */}
              <GlassCard className="space-y-2">
                <h5 className="text-[10px] font-black uppercase text-white flex items-center gap-1.5 border-b border-dark-border pb-2">
                  <Globe className="h-4 w-4 text-emerald-400" /> Deployment & Production Guide
                </h5>
                <p className="whitespace-pre-line leading-relaxed">{project.deploymentGuide}</p>
              </GlassCard>

            </div>
          ) : (
            <GlassCard className="text-center py-36 text-gray-500 space-y-2">
              <Code2 className="h-10 w-10 mx-auto text-gray-650" />
              <p className="text-xs font-semibold">No project blueprint created.</p>
              <p className="text-[10px] text-gray-650 max-w-xs mx-auto">Select stack options and domain and generate.</p>
            </GlassCard>
          )}
        </div>

      </div>
    </div>
  );
};
export default ProjectGenerator;
