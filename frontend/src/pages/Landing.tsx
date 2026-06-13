import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Terminal, 
  Cpu, 
  BookOpen, 
  FileCheck, 
  MessageSquare,
  Users,
  Target,
  Trophy,
  CheckCircle2,
  ChevronDown,
  Mail,
  MapPin,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const stats = [
    { value: '500K+', label: 'Mock Challenges Solved', icon: <Terminal className="text-primary-400" /> },
    { value: '180K+', label: 'AI Interviews Evaluated', icon: <MessageSquare className="text-accent-purple" /> },
    { value: '94.2%', label: 'Placement Rate Success', icon: <Target className="text-accent-emerald" /> },
    { value: '80+', label: 'Global Tech Company Scans', icon: <Cpu className="text-accent-pink" /> }
  ];

  const features = [
    {
      title: 'ATS Resume Review',
      description: 'Upload your PDF resume. Our AI extracts text, grades ATS compliance, flags skill gaps, and suggests key phrasing changes.',
      icon: <FileCheck className="h-6 w-6 text-primary-400" />,
      color: 'from-primary-500/20 to-blue-500/5'
    },
    {
      title: 'Voice Mock Interviews',
      description: 'Answer technical or behavioral prompts hands-free using Speech-to-Text. Analyzes pronunciation, pace WPM, and filler words.',
      icon: <MessageSquare className="h-6 w-6 text-accent-purple" />,
      color: 'from-accent-purple/20 to-pink-500/5'
    },
    {
      title: 'Coding assessment sandbox',
      description: 'An online code editor supporting JavaScript/Java execution. Compiles test cases and returns deep AI complexity reviews.',
      icon: <Terminal className="h-6 w-6 text-accent-cyan" />,
      color: 'from-accent-cyan/20 to-emerald-500/5'
    },
    {
      title: 'Subject preparation hub',
      description: 'Master core CS fundamentals (Java, SQL/DBMS, OS, Computer Networks) with cheat sheets, MCQs, and roadmap targets.',
      icon: <BookOpen className="h-6 w-6 text-accent-pink" />,
      color: 'from-accent-pink/20 to-red-500/5'
    }
  ];

  const pricing = [
    {
      name: 'Starter',
      price: '$0',
      period: 'Forever Free',
      description: 'Perfect for students exploring placement paths.',
      features: ['2 Resume ATS scans', '3 AI technical interviews', 'Basic coding sandbox', 'OS & DBMS cheat sheets'],
      buttonText: 'Sign Up Free',
      popular: false,
      variant: 'secondary' as const
    },
    {
      name: 'Career Pro',
      price: '$19',
      period: '/ month',
      description: 'Best for active job seekers targeting tier-1 giants.',
      features: ['Unlimited Resume reviews', 'Unlimited voice mock sessions', 'Company specific mocks (Google, Amazon)', 'AI code optimization tips', 'Full practice MCQ access', 'Custom AI Roadmap'],
      buttonText: 'Upgrade to Pro',
      popular: true,
      variant: 'accent' as const
    },
    {
      name: 'University / Team',
      price: 'Custom',
      period: 'Contact Sales',
      description: 'For colleges aiming to boost placement graphs.',
      features: ['Enterprise batch parsing', 'Custom college dashboard', 'LMS platform integrations', 'Detailed student analytics reports', 'Custom admin logs'],
      buttonText: 'Talk to Sales',
      popular: false,
      variant: 'secondary' as const
    }
  ];

  const faqs = [
    {
      question: 'How does the voice interview evaluation work?',
      answer: 'Our module uses the browser\'s built-in Web Speech API to transcribe your speech. Our backend computes your speaking speed (WPM) and runs regex filters to count filler words like "um" or "like" before submitting the text to Gemini for grading.'
    },
    {
      question: 'Do I need to install a Java runtime to run code?',
      answer: 'No! JavaScript runs in our secure Node.js sandbox VM, while Java and Python run on a syntax check generator fallback. Everything compiles and returns test case statuses immediately in your browser.'
    },
    {
      question: 'What target companies are supported?',
      answer: 'We generate company-specific question patterns for Google, Microsoft, Meta, Amazon, Netflix, Infosys, TCS, Wipro, Accenture, Cognizant, and Capgemini.'
    },
    {
      question: 'Can I use this for university preparation?',
      answer: 'Yes! Our Placement Hub contains revision topics for Operating Systems, SQL, Computer Networks, and Aptitude tests, complete with multiple-choice quizzes.'
    }
  ];

  return (
    <div className="min-h-screen relative bg-dark-bg text-gray-200">
      {/* Navbar overlay */}
      <nav className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between z-40 relative">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-purple flex items-center justify-center font-bold text-white shadow-lg">
            CP
          </div>
          <span className="font-extrabold text-sm text-white tracking-wider">CAREERPREP PRO</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xs font-semibold text-gray-400 hover:text-white transition-colors">
            Log In
          </Link>
          <Button onClick={() => navigate('/register')} size="sm">
            Sign Up
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 pt-16 pb-24 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-[10px] font-bold tracking-widest uppercase">
            ⚡ Powered by Gemini Generative AI
          </span>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mt-8 tracking-tight leading-tight max-w-4xl mx-auto">
            Bridge the Gap to Your Dream Offer with <span className="gradient-text">AI CareerPrep Pro</span>
          </h1>
          
          <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto mt-6 leading-relaxed">
            Upload resumes, check ATS scoring indices, solve compiler coding rounds, and complete company-specific voice interview evaluations using real-time generative intelligence.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
            <Button onClick={() => navigate('/register')} size="lg" className="flex items-center gap-2">
              <span>Start Free Training</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                Access Student Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Dashboard preview screenshot mock */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 max-w-5xl mx-auto rounded-2xl overflow-hidden border border-dark-border shadow-2xl relative"
        >
          <div className="bg-dark-card/90 px-4 py-3 border-b border-dark-border flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-amber-500/50" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
            <span className="text-[10px] text-gray-500 ml-4 font-mono select-none">https://app.aicareerprep.pro/dashboard</span>
          </div>
          <div className="bg-dark-bg p-8 flex flex-col gap-6 text-left">
            <div className="flex flex-wrap gap-4">
              <GlassCard className="flex-1 min-w-[200px] border-primary-500/20" glow>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Interview Readiness</span>
                <p className="text-3xl font-extrabold text-white mt-2">86%</p>
                <div className="w-full bg-dark-border h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-primary-500 h-full rounded-full" style={{ width: '86%' }} />
                </div>
              </GlassCard>
              <GlassCard className="flex-1 min-w-[200px] border-accent-purple/20">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">ATS Score index</span>
                <p className="text-3xl font-extrabold text-white mt-2">78 / 100</p>
                <div className="w-full bg-dark-border h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-accent-purple h-full rounded-full" style={{ width: '78%' }} />
                </div>
              </GlassCard>
              <GlassCard className="flex-1 min-w-[200px] border-accent-pink/20">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">XP & Level</span>
                <p className="text-3xl font-extrabold text-white mt-2">4,850 XP</p>
                <span className="text-[10px] text-accent-pink font-bold mt-2 block">🔥 5 Day active streak</span>
              </GlassCard>
            </div>
            
            <div className="p-5 rounded-xl border border-dark-border bg-dark-card/30 flex justify-between items-center">
              <div>
                <p className="text-xs text-primary-400 font-bold uppercase">Ready for your interview?</p>
                <p className="text-white text-xs mt-1">Google Software Engineer Mock Round (Technical)</p>
              </div>
              <Button size="sm" className="shrink-0 flex items-center gap-1.5">
                <span>Start Mock Session</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="bg-dark-card/20 border-y border-dark-border py-16">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center flex flex-col items-center gap-2">
              <div className="p-3 bg-dark-card rounded-xl border border-dark-border shadow-inner">
                {stat.icon}
              </div>
              <span className="text-3xl font-black text-white mt-2 leading-none">{stat.value}</span>
              <span className="text-xs text-gray-400 max-w-[150px] mx-auto font-medium">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-primary-500 font-bold text-xs uppercase tracking-wider">Enterprise Prep Kit</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-3 leading-tight">Everything You Need to Ace Placement Rounds</h2>
          <p className="text-gray-400 text-xs mt-4">We cover resume checking, behavioral speed drills, coding execution, and roadmap tracking in a single portal.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-16">
          {features.map((feat, idx) => (
            <GlassCard key={idx} className={`bg-gradient-to-tr ${feat.color} hover:shadow-2xl`}>
              <div className="p-3.5 bg-dark-bg rounded-xl border border-dark-border inline-block shadow-inner">
                {feat.icon}
              </div>
              <h3 className="text-base font-bold text-white mt-5">{feat.title}</h3>
              <p className="text-gray-400 text-xs mt-2 leading-relaxed">{feat.description}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-8 py-16 border-t border-dark-border">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-accent-purple font-bold text-xs uppercase tracking-wider">Alumni Success</span>
          <h2 className="text-3xl font-extrabold text-white mt-3">Used by Placed Students</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <GlassCard>
            <p className="text-gray-400 text-xs leading-relaxed italic">
              "The voice interview evaluations completely changed my preparation. Detecting my usage of filler words like 'basically' allowed me to focus on speaking with clarity during my real interview at Google."
            </p>
            <div className="flex items-center gap-3 mt-6">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary-500 to-accent-cyan flex items-center justify-center text-xs font-bold text-white">AR</div>
              <div>
                <p className="text-xs font-bold text-white">Aditya Rao</p>
                <p className="text-[10px] text-gray-500">Software Engineer @ Google</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <p className="text-gray-400 text-xs leading-relaxed italic">
              "The ATS Resume Analyzer flagged five critical missing skills that I didn't list in my projects. Fixed the copy, got shortlisted for Amazon within two weeks!"
            </p>
            <div className="flex items-center gap-3 mt-6">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-accent-purple to-accent-pink flex items-center justify-center text-xs font-bold text-white">SP</div>
              <div>
                <p className="text-xs font-bold text-white">Sana Patel</p>
                <p className="text-[10px] text-gray-500">Full Stack Developer @ Amazon</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <p className="text-gray-400 text-xs leading-relaxed italic">
              "I loved the practice prep hub. Having OS and DBMS cheat sheets plus code review feedback on time/space complexity solved my end-to-end doubts without context switching."
            </p>
            <div className="flex items-center gap-3 mt-6">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-500 to-accent-purple flex items-center justify-center text-xs font-bold text-white">KK</div>
              <div>
                <p className="text-xs font-bold text-white">Karan Kumar</p>
                <p className="text-[10px] text-gray-500">System Developer @ TCS</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Pricing Matrix */}
      <section className="max-w-7xl mx-auto px-8 py-24 border-t border-dark-border">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-accent-pink font-bold text-xs uppercase tracking-wider">Flexible SaaS Tiers</span>
          <h2 className="text-3xl font-extrabold text-white mt-3">Invest in Your Technical Future</h2>
          <p className="text-gray-400 text-xs mt-3">Start with our free limits and upgrade as you begin scheduling real interviews.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {pricing.map((tier, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-2xl border backdrop-blur-md relative flex flex-col justify-between transition-all duration-300 ${
                tier.popular
                  ? 'bg-gradient-to-b from-primary-950/20 to-dark-card border-primary-500 shadow-2xl scale-105 z-10'
                  : 'bg-dark-card/60 border-dark-border'
              }`}
            >
              {tier.popular && (
                <span className="absolute top-0 right-8 -translate-y-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-accent-purple to-accent-pink text-white text-[9px] font-black tracking-widest uppercase">
                  RECOMMENDED
                </span>
              )}
              
              <div>
                <span className="text-xs font-black uppercase text-gray-400 tracking-widest">{tier.name}</span>
                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                  <span className="text-xs text-gray-500">{tier.period}</span>
                </div>
                <p className="text-xs text-gray-400 mt-4 leading-relaxed">{tier.description}</p>
                
                <hr className="border-dark-border my-6" />
                
                <ul className="flex flex-col gap-3">
                  {tier.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-xs text-gray-300 font-medium">
                      <CheckCircle2 className="h-4.5 w-4.5 text-primary-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Button
                  onClick={() => navigate('/register')}
                  variant={tier.variant}
                  className="w-full"
                >
                  {tier.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-8 py-16 border-t border-dark-border">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-accent-cyan font-bold text-xs uppercase tracking-wider">Support Accordion</span>
          <h2 className="text-3xl font-extrabold text-white mt-3">Frequently Asked Questions</h2>
        </div>

        <div className="flex flex-col gap-4 mt-12">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-dark-border bg-dark-card/30 overflow-hidden transition-all"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full text-left px-6 py-4 flex justify-between items-center text-xs font-bold text-white hover:bg-dark-hover transition-colors"
              >
                <span>{faq.question}</span>
                <ChevronDown className={`h-4.5 w-4.5 text-gray-400 transition-transform duration-200 ${activeFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {activeFaq === idx && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 pt-1 text-xs text-gray-400 leading-relaxed border-t border-dark-border/40">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-5xl mx-auto px-8 py-20 border-t border-dark-border">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <span className="text-primary-500 font-bold text-xs uppercase tracking-wider">Get in Touch</span>
            <h2 className="text-3xl font-extrabold text-white mt-3">We'd love to hear from you</h2>
            <p className="text-gray-400 text-xs mt-4 leading-relaxed">
              Have questions about platform integration for your institution? Our engineering team is happy to schedule a comprehensive walkthrough of the AI configurations.
            </p>

            <div className="flex flex-col gap-4 mt-8">
              <div className="flex items-center gap-3.5 text-xs text-gray-300 font-semibold">
                <Mail className="h-5 w-5 text-primary-400" />
                <span>support@aicareerprep.pro</span>
              </div>
              <div className="flex items-center gap-3.5 text-xs text-gray-300 font-semibold">
                <Phone className="h-5 w-5 text-accent-purple" />
                <span>+1 (555) 234-5678</span>
              </div>
              <div className="flex items-center gap-3.5 text-xs text-gray-300 font-semibold">
                <MapPin className="h-5 w-5 text-accent-pink" />
                <span>San Francisco, CA, USA</span>
              </div>
            </div>
          </div>

          <GlassCard>
            <form onSubmit={(e) => { e.preventDefault(); alert('Message logged successfully! We will follow up.'); }} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="john@example.com"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="How can we help your engineering career transition?"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
              <Button type="submit" className="w-full mt-2">
                Send Query Message
              </Button>
            </form>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-border bg-dark-card/10 py-12">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary-600 to-accent-purple flex items-center justify-center font-bold text-white text-xs">
              CP
            </div>
            <span className="font-bold text-xs text-white tracking-widest">CAREERPREP PRO</span>
          </div>
          
          <div className="flex gap-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            <span className="cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
            <span className="cursor-pointer hover:text-white transition-colors">Terms of Service</span>
          </div>
          
          <p className="text-[10px] text-gray-600">
            &copy; 2026 AI CareerPrep Pro Systems. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
