import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from './store';
import { authStart, authSuccess, authFailure } from './store/authSlice';
import api from './utils/api';

// Components (always needed — not lazy)
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';

// Lazy-loaded pages — each is loaded only when the route is visited
// This means a broken page won't crash the whole app
const Landing              = lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })));
const Login                = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register             = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const ForgotPassword       = lazy(() => import('./pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const Dashboard            = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const ResumeAnalyzer       = lazy(() => import('./pages/ResumeAnalyzer').then(m => ({ default: m.ResumeAnalyzer })));
const InterviewSetup       = lazy(() => import('./pages/InterviewSetup').then(m => ({ default: m.InterviewSetup })));
const MockInterview        = lazy(() => import('./pages/MockInterview').then(m => ({ default: m.MockInterview })));
const CodingSandbox        = lazy(() => import('./pages/CodingSandbox').then(m => ({ default: m.CodingSandbox })));
const PrepHub              = lazy(() => import('./pages/PrepHub').then(m => ({ default: m.PrepHub })));
const AdminPanel           = lazy(() => import('./pages/AdminPanel').then(m => ({ default: m.AdminPanel })));

// 20 New Modules — lazy loaded
const CompanyPrep          = lazy(() => import('./pages/CompanyPrep').then(m => ({ default: m.CompanyPrep })));
const PlacementReadiness   = lazy(() => import('./pages/PlacementReadiness').then(m => ({ default: m.PlacementReadiness })));
const AICareerMentor       = lazy(() => import('./pages/AICareerMentor').then(m => ({ default: m.AICareerMentor })));
const StudyPlanner         = lazy(() => import('./pages/StudyPlanner').then(m => ({ default: m.StudyPlanner })));
const ATSResumeBuilder     = lazy(() => import('./pages/ATSResumeBuilder').then(m => ({ default: m.ATSResumeBuilder })));
const JDMatcher            = lazy(() => import('./pages/JDMatcher').then(m => ({ default: m.JDMatcher })));
const LinkedInOptimizer    = lazy(() => import('./pages/LinkedInOptimizer').then(m => ({ default: m.LinkedInOptimizer })));
const ProjectGenerator     = lazy(() => import('./pages/ProjectGenerator').then(m => ({ default: m.ProjectGenerator })));
const AIStudyNotes         = lazy(() => import('./pages/AIStudyNotes').then(m => ({ default: m.AIStudyNotes })));
const FlashcardsPractice   = lazy(() => import('./pages/FlashcardsPractice').then(m => ({ default: m.FlashcardsPractice })));
const DailyChallenges      = lazy(() => import('./pages/DailyChallenges').then(m => ({ default: m.DailyChallenges })));
const DetailedAnalytics    = lazy(() => import('./pages/DetailedAnalytics').then(m => ({ default: m.DetailedAnalytics })));
const MockHRInterview      = lazy(() => import('./pages/MockHRInterview').then(m => ({ default: m.MockHRInterview })));
const ContestHub           = lazy(() => import('./pages/ContestHub').then(m => ({ default: m.ContestHub })));
const RecruiterPortal      = lazy(() => import('./pages/RecruiterPortal').then(m => ({ default: m.RecruiterPortal })));
const LeaderboardAchievements = lazy(() => import('./pages/LeaderboardAchievements').then(m => ({ default: m.LeaderboardAchievements })));
const CommunityDiscussion  = lazy(() => import('./pages/CommunityDiscussion').then(m => ({ default: m.CommunityDiscussion })));
const PreferencesSettings  = lazy(() => import('./pages/PreferencesSettings').then(m => ({ default: m.PreferencesSettings })));

// ── Page Loading Fallback ────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh] flex-col gap-3">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
    <p className="text-gray-500 text-xs animate-pulse">Loading page…</p>
  </div>
);

// ── Route Guards ─────────────────────────────────────────────────────────────
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-bg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

// ── Dashboard Layout Shell ────────────────────────────────────────────────────
const DashboardLayout: React.FC = () => {
  const location = useLocation();

  const getHeaderTitle = (pathname: string) => {
    const titles: Record<string, string> = {
      '/dashboard':         'Candidate Dashboard',
      '/readiness':         'AI Placement Readiness Score',
      '/analytics':         'Detailed Performance Analytics',
      '/coding':            'V8 Sandbox Compiler',
      '/resume-builder':    'ATS Resume Builder',
      '/jd-matcher':        'ATS Resume vs Job Description',
      '/linkedin-optimizer':'LinkedIn Profile Optimizer',
      '/notes':             'AI Topic Notes & Mindmaps',
      '/project-gen':       'AI Project Blueprints',
      '/mentor':            'AI Career Mentor Advisor',
      '/study-planner':     'AI Study Planner Schedule',
      '/company-prep':      'Company Specific Prep Portal',
      '/challenges':        'Daily Streak Challenges',
      '/flashcards':        'Flip Flashcards Quiz',
      '/prep-hub':          'Placement Practice Hub',
      '/interview':         'AI Mock Coding Configuration',
      '/hr-interview':      'Behavioral Mock HR Simulator',
      '/contest-hub':       'Competitive Coding Contest Calendar',
      '/leaderboard':       'Leaderboard Achievements',
      '/community':         'Forums Discussion Board',
      '/recruiter-portal':  'Recruiter Sourcing Workspace',
      '/settings':          'System Configuration Settings',
      '/admin':             'Admin System Logs',
      '/resume':            'AI Resume Analyzer',
    };
    if (pathname.startsWith('/interview/active')) return 'Active Mock Simulator';
    return titles[pathname] || 'AI CareerPrep Pro';
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-dark-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={getHeaderTitle(location.pathname)} />
        <main className="flex-1 overflow-y-auto px-8 py-6 pb-16">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/dashboard"         element={<Dashboard />} />
              <Route path="/readiness"         element={<PlacementReadiness />} />
              <Route path="/analytics"         element={<DetailedAnalytics />} />
              <Route path="/coding"            element={<CodingSandbox />} />
              <Route path="/resume-builder"    element={<ATSResumeBuilder />} />
              <Route path="/jd-matcher"        element={<JDMatcher />} />
              <Route path="/linkedin-optimizer"element={<LinkedInOptimizer />} />
              <Route path="/notes"             element={<AIStudyNotes />} />
              <Route path="/project-gen"       element={<ProjectGenerator />} />
              <Route path="/mentor"            element={<AICareerMentor />} />
              <Route path="/study-planner"     element={<StudyPlanner />} />
              <Route path="/company-prep"      element={<CompanyPrep />} />
              <Route path="/challenges"        element={<DailyChallenges />} />
              <Route path="/flashcards"        element={<FlashcardsPractice />} />
              <Route path="/prep-hub"          element={<PrepHub />} />
              <Route path="/interview"         element={<InterviewSetup />} />
              <Route path="/interview/active"  element={<MockInterview />} />
              <Route path="/hr-interview"      element={<MockHRInterview />} />
              <Route path="/contest-hub"       element={<ContestHub />} />
              <Route path="/leaderboard"       element={<LeaderboardAchievements />} />
              <Route path="/community"         element={<CommunityDiscussion />} />
              <Route path="/recruiter-portal"  element={<RecruiterPortal />} />
              <Route path="/settings"          element={<PreferencesSettings />} />
              <Route path="/admin"             element={<AdminPanel />} />
              <Route path="/resume"            element={<ResumeAnalyzer />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
};

// ── Root App ─────────────────────────────────────────────────────────────────
export const App: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkSession = async () => {
      dispatch(authStart());
      try {
        const response = await api.get('/auth/profile');
        const token = localStorage.getItem('accessToken') || '';
        dispatch(authSuccess({ user: response.data.user, token }));
      } catch {
        dispatch(authFailure('Session expired or not logged in.'));
      }
    };
    checkSession();
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-dark-bg">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
        </div>
      }>
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route path="/login" element={
            <PublicRoute><Login /></PublicRoute>
          } />

          <Route path="/register" element={
            <PublicRoute><Register /></PublicRoute>
          } />

          <Route path="/forgot-password" element={
            <PublicRoute><ForgotPassword /></PublicRoute>
          } />

          <Route path="/*" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
