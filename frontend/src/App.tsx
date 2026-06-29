import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from './store';
import { authStart, authSuccess, authFailure } from './store/authSlice';
import api from './utils/api';

// Components & Pages imports
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { ResumeAnalyzer } from './pages/ResumeAnalyzer';
import { InterviewSetup } from './pages/InterviewSetup';
import { MockInterview } from './pages/MockInterview';
import { CodingSandbox } from './pages/CodingSandbox';
import { PrepHub } from './pages/PrepHub';
import { AdminPanel } from './pages/AdminPanel';
import { ForgotPassword } from './pages/ForgotPassword';

// 20 Modules - New Pages
import { CompanyPrep } from './pages/CompanyPrep';
import { PlacementReadiness } from './pages/PlacementReadiness';
import { AICareerMentor } from './pages/AICareerMentor';
import { StudyPlanner } from './pages/StudyPlanner';
import { ATSResumeBuilder } from './pages/ATSResumeBuilder';
import { JDMatcher } from './pages/JDMatcher';
import { LinkedInOptimizer } from './pages/LinkedInOptimizer';
import { ProjectGenerator } from './pages/ProjectGenerator';
import { AIStudyNotes } from './pages/AIStudyNotes';
import { FlashcardsPractice } from './pages/FlashcardsPractice';
import { DailyChallenges } from './pages/DailyChallenges';
import { DetailedAnalytics } from './pages/DetailedAnalytics';
import { MockHRInterview } from './pages/MockHRInterview';
import { ContestHub } from './pages/ContestHub';
import { RecruiterPortal } from './pages/RecruiterPortal';
import { LeaderboardAchievements } from './pages/LeaderboardAchievements';
import { PreferencesSettings } from './pages/PreferencesSettings';

// Protected Route Guard
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

// Public Route Guard (Redirects away from login/register if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

// Layout Shell for Dashboard Pages
const DashboardLayout: React.FC = () => {
  const location = useLocation();

  // Map pathnames to beautiful Navbar headers
  const getHeaderTitle = (pathname: string) => {
    if (pathname === '/dashboard') return 'Candidate Dashboard';
    if (pathname === '/readiness') return 'AI Placement Readiness Score';
    if (pathname === '/analytics') return 'Detailed Performance Analytics';
    if (pathname === '/coding') return 'V8 Sandbox Compiler';
    if (pathname === '/resume-builder') return 'ATS Resume Builder';
    if (pathname === '/jd-matcher') return 'ATS Resume vs Job Description';
    if (pathname === '/linkedin-optimizer') return 'LinkedIn Profile Optimizer';
    if (pathname === '/notes') return 'AI Topic Notes & Mindmaps';
    if (pathname === '/project-gen') return 'AI Project Blueprints';
    
    if (pathname === '/mentor') return 'AI Career Mentor Advisor';
    if (pathname === '/study-planner') return 'AI Study Planner Schedule';
    if (pathname === '/company-prep') return 'Company Specific Prep Portal';
    if (pathname === '/challenges') return 'Daily Streak Challenges';
    if (pathname === '/flashcards') return 'Flip Flashcards Quiz';
    if (pathname === '/prep-hub') return 'Placement Practice Hub';
    
    if (pathname === '/interview') return 'AI Mock Coding Configuration';
    if (pathname.startsWith('/interview/active')) return 'Active Mock Simulator';
    if (pathname === '/hr-interview') return 'Behavioral Mock HR Simulator';
    
    if (pathname === '/contest-hub') return 'Competitive Coding Contest Calendar';
    if (pathname === '/leaderboard') return 'Leaderboard Achievements';
    if (pathname === '/community') return 'Forums Discussion Board';
    
    if (pathname === '/recruiter-portal') return 'Recruiter Sourcing Workspace';
    if (pathname === '/settings') return 'System Configuration Settings';
    if (pathname === '/admin') return 'Admin System Logs';
    return 'AI CareerPrep Pro';
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-dark-bg">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content frame */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={getHeaderTitle(location.pathname)} />
        <main className="flex-1 overflow-y-auto px-8 py-6 pb-16">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/readiness" element={<PlacementReadiness />} />
            <Route path="/analytics" element={<DetailedAnalytics />} />
            <Route path="/coding" element={<CodingSandbox />} />
            <Route path="/resume-builder" element={<ATSResumeBuilder />} />
            <Route path="/jd-matcher" element={<JDMatcher />} />
            <Route path="/linkedin-optimizer" element={<LinkedInOptimizer />} />
            <Route path="/notes" element={<AIStudyNotes />} />
            <Route path="/project-gen" element={<ProjectGenerator />} />
            
            <Route path="/mentor" element={<AICareerMentor />} />
            <Route path="/study-planner" element={<StudyPlanner />} />
            <Route path="/company-prep" element={<CompanyPrep />} />
            <Route path="/challenges" element={<DailyChallenges />} />
            <Route path="/flashcards" element={<FlashcardsPractice />} />
            <Route path="/prep-hub" element={<PrepHub />} />
            
            <Route path="/interview" element={<InterviewSetup />} />
            <Route path="/interview/active" element={<MockInterview />} />
            <Route path="/hr-interview" element={<MockHRInterview />} />
            
            <Route path="/contest-hub" element={<ContestHub />} />
            <Route path="/leaderboard" element={<LeaderboardAchievements />} />
            <Route path="/community" element={<CommunityDiscussion />} />
            
            <Route path="/recruiter-portal" element={<RecruiterPortal />} />
            <Route path="/settings" element={<PreferencesSettings />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/resume" element={<ResumeAnalyzer />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  const dispatch = useDispatch();

  // Restore session on mount (HTTP-only refresh token validation)
  useEffect(() => {
    const checkSession = async () => {
      dispatch(authStart());
      try {
        const response = await api.get('/auth/profile');
        const token = localStorage.getItem('accessToken') || '';
        dispatch(authSuccess({ user: response.data.user, token }));
      } catch (err) {
        dispatch(authFailure('Session expired or not logged in.'));
      }
    };
    checkSession();
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Routes */}
        <Route path="/" element={<Landing />} />
        
        {/* Guarded Auth Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />

        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } />

        {/* Protected Dashboard Shell */}
        <Route path="/*" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
