import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { dbService } from '../utils/dbService';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

// ─── Email Service ─────────────────────────────────────────────────────────────
const isEmailConfigured = () =>
  !!(process.env.EMAIL_USER && process.env.EMAIL_PASS &&
     process.env.EMAIL_USER.trim() !== '' && process.env.EMAIL_PASS.trim() !== '');

const createTransporter = () => {
  if (!isEmailConfigured()) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendVerificationEmail = async (email: string, name: string, token: string) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verifyLink = `${frontendUrl}/verify-email?token=${token}`;

  if (!isEmailConfigured()) {
    // Simulation mode — print token to console
    console.log('\n📧 ─────────────────────────────────────────────────────');
    console.log(`   EMAIL SIMULATION — Verification for: ${email}`);
    console.log(`   Token: ${token}`);
    console.log(`   Link:  ${verifyLink}`);
    console.log('─────────────────────────────────────────────────────────\n');
    return;
  }

  const transporter = createTransporter();
  await transporter!.sendMail({
    from: process.env.EMAIL_FROM || `"AI CareerPrep Pro" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '✅ Verify your AI CareerPrep Pro account',
    html: `
      <div style="font-family:Inter,sans-serif;background:#0f0f1a;color:#e2e8f0;padding:40px;max-width:580px;margin:auto;border-radius:16px;border:1px solid #2d2d4a;">
        <h1 style="color:#818cf8;font-size:24px;margin-bottom:8px;">AI CareerPrep Pro</h1>
        <p style="color:#94a3b8;font-size:14px;margin-bottom:32px;">Your AI-powered placement preparation platform</p>
        <h2 style="color:#f1f5f9;font-size:20px;">Welcome, ${name}! 🎉</h2>
        <p style="color:#cbd5e1;font-size:14px;line-height:1.7;">
          Thank you for registering. Please verify your email address to activate your account and start your placement journey.
        </p>
        <div style="text-align:center;margin:36px 0;">
          <a href="${verifyLink}" style="background:linear-gradient(135deg,#818cf8,#a78bfa);color:#fff;text-decoration:none;padding:14px 36px;border-radius:12px;font-weight:700;font-size:15px;display:inline-block;">
            ✅ Verify My Email
          </a>
        </div>
        <p style="color:#64748b;font-size:12px;text-align:center;">This link expires in 24 hours. If you didn't create this account, ignore this email.</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (email: string, token: string) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;

  if (!isEmailConfigured()) {
    console.log('\n📧 ─────────────────────────────────────────────────────');
    console.log(`   EMAIL SIMULATION — Password reset for: ${email}`);
    console.log(`   Token: ${token}`);
    console.log(`   Link:  ${resetLink}`);
    console.log('─────────────────────────────────────────────────────────\n');
    return;
  }

  const transporter = createTransporter();
  await transporter!.sendMail({
    from: process.env.EMAIL_FROM || `"AI CareerPrep Pro" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Reset your AI CareerPrep Pro password',
    html: `
      <div style="font-family:Inter,sans-serif;background:#0f0f1a;color:#e2e8f0;padding:40px;max-width:580px;margin:auto;border-radius:16px;border:1px solid #2d2d4a;">
        <h1 style="color:#818cf8;font-size:24px;margin-bottom:8px;">AI CareerPrep Pro</h1>
        <h2 style="color:#f1f5f9;font-size:20px;margin-top:24px;">Password Reset Request 🔐</h2>
        <p style="color:#cbd5e1;font-size:14px;line-height:1.7;">
          We received a request to reset the password for your account. Click the button below to set a new password.
          This link is valid for <strong style="color:#f59e0b;">1 hour</strong> only.
        </p>
        <div style="text-align:center;margin:36px 0;">
          <a href="${resetLink}" style="background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;text-decoration:none;padding:14px 36px;border-radius:12px;font-weight:700;font-size:15px;display:inline-block;">
            🔑 Reset My Password
          </a>
        </div>
        <p style="color:#64748b;font-size:12px;text-align:center;">If you didn't request a password reset, please ignore this email. Your password won't change.</p>
      </div>
    `,
  });
};

// ─── Token Helpers ─────────────────────────────────────────────────────────────
const generateTokens = (user: any) => {
  const secret = process.env.JWT_SECRET || 'supersecretaccesskey12345!';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkey67890!';

  const accessToken = jwt.sign(
    { id: user._id || user.id, email: user.email, role: user.role },
    secret,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user._id || user.id, email: user.email, role: user.role },
    refreshSecret,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// ─── Auth Controllers ──────────────────────────────────────────────────────────

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, targetRole } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    const existingUser = await dbService.user.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const emailEnabled = isEmailConfigured();

    const newUser = await dbService.user.create({
      email,
      password: hashedPassword,
      isVerified: !emailEnabled, // Auto-verify only when email is not configured (simulation mode)
      verificationToken: emailEnabled ? verificationToken : undefined,
      role: email.startsWith('admin@') ? 'admin' : 'student',
      profile: {
        name,
        targetRole: targetRole || 'Software Engineer',
        experienceLevel: 'Fresher',
        targetCompanies: [],
      },
      stats: {
        xp: 100,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
        codingChallengesCompleted: 0,
        totalInterviewsTaken: 0,
        readinessScore: 35,
        atsScore: 0,
      },
      achievements: [
        {
          id: 'welcome',
          title: 'Welcome aboard!',
          description: 'Created your AI CareerPrep Pro account successfully.',
          unlockedAt: new Date().toISOString(),
          icon: '🎉',
        },
      ],
      dailyChallenges: [
        {
          date: new Date().toISOString().split('T')[0],
          challengeId: 'first_login',
          completed: true,
          completedAt: new Date().toISOString(),
        },
      ],
    });

    await dbService.progress.create({
      userId: newUser._id || (newUser as any).id,
      subjects: [
        { subjectName: 'Java & OOPs', mcqsTaken: 0, mcqsCorrect: 0, level: 15 },
        { subjectName: 'DBMS & SQL', mcqsTaken: 0, mcqsCorrect: 0, level: 10 },
        { subjectName: 'Operating Systems', mcqsTaken: 0, mcqsCorrect: 0, level: 5 },
        { subjectName: 'Computer Networks', mcqsTaken: 0, mcqsCorrect: 0, level: 8 },
        { subjectName: 'Quantitative Aptitude', mcqsTaken: 0, mcqsCorrect: 0, level: 20 },
      ],
      placementReadinessTrend: [{ date: new Date().toISOString().split('T')[0], score: 35 }],
      weakTopics: ['DSA', 'System Design'],
      roadmap: [
        { phase: 1, title: 'Build Foundations', status: 'in-progress', description: 'Review core subjects like Java/OOPs and DBMS cheat sheets.' },
        { phase: 2, title: 'Resume Optimization', status: 'todo', description: 'Upload and evaluate resume against target job description.' },
        { phase: 3, title: 'Practice Coding Rounds', status: 'todo', description: 'Solve 5 easy/medium coding problems inside compiler sandbox.' },
        { phase: 4, title: 'Mock Interviews', status: 'todo', description: 'Complete 1 Technical and 1 Behavioral full mock interview round.' },
      ],
      dailyGoals: [
        { text: 'Take a Mini MCQ Practice Quiz', completed: false, points: 10 },
        { text: 'Run and compile code in sandbox', completed: false, points: 15 },
      ],
      weeklyGoals: [
        { text: 'Analyze Resume ATS compatibility', completed: false, points: 40 },
        { text: 'Complete a full length AI Mock Interview', completed: false, points: 80 },
      ],
    });

    // Send verification email (or simulate it)
    try {
      await sendVerificationEmail(email, name, verificationToken);
    } catch (emailError: any) {
      console.error('Failed to send verification email:', emailError.message);
    }

    const { accessToken, refreshToken } = generateTokens(newUser);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userObj = { ...newUser };
    delete userObj.password;

    res.status(201).json({
      message: emailEnabled
        ? 'Account created! Please check your email to verify your account.'
        : 'Account created successfully.',
      user: userObj,
      accessToken,
      emailVerificationRequired: emailEnabled,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query as { token: string };
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required.' });
    }

    const users = await dbService.user.find({ verificationToken: token });
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired verification token.' });
    }

    const user = users[0];
    await dbService.user.findByIdAndUpdate(user._id || (user as any).id, {
      $set: { isVerified: true, verificationToken: undefined },
    });

    res.status(200).json({ message: 'Email verified successfully! You can now login.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await dbService.user.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Streak update logic
    const todayStr = new Date().toISOString().split('T')[0];
    let newStreak = user.stats.currentStreak || 1;
    let newLongest = user.stats.longestStreak || 1;
    const lastActive = user.stats.lastActiveDate;

    if (lastActive) {
      const diffDays = Math.ceil(
        Math.abs(new Date(todayStr).getTime() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) {
        newStreak += 1;
        if (newStreak > newLongest) newLongest = newStreak;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    }

    let extraXp = 0;
    if (lastActive !== todayStr) extraXp = 20;

    const currentXp = (user.stats?.xp || 0) + extraXp;
    const updatedUser = await dbService.user.findByIdAndUpdate(user._id || (user as any).id, {
      $set: {
        'stats.currentStreak': newStreak,
        'stats.longestStreak': newLongest,
        'stats.lastActiveDate': todayStr,
        'stats.xp': currentXp,
      },
    });

    const { accessToken, refreshToken } = generateTokens(updatedUser);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userObj = { ...updatedUser };
    delete userObj.password;

    res.status(200).json({ message: 'Login successful.', user: userObj, accessToken });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token missing.' });
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkey67890!';
    jwt.verify(refreshToken, refreshSecret, async (err: any, decoded: any) => {
      if (err) return res.status(403).json({ message: 'Expired or invalid refresh token.' });
      const user = await dbService.user.findById(decoded.id);
      if (!user) return res.status(404).json({ message: 'User account not found.' });
      const { accessToken } = generateTokens(user);
      res.status(200).json({ accessToken });
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully.' });
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized.' });

    const user = await dbService.user.findById(userId);
    if (!user) return res.status(404).json({ message: 'User profile not found.' });

    const userObj = { ...user };
    delete userObj.password;
    res.status(200).json({ user: userObj });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized.' });

    const { name, bio, targetRole, experienceLevel, targetCompanies } = req.body;
    const updated = await dbService.user.findByIdAndUpdate(userId, {
      $set: {
        'profile.name': name,
        'profile.bio': bio,
        'profile.targetRole': targetRole,
        'profile.experienceLevel': experienceLevel,
        'profile.targetCompanies': targetCompanies,
      },
    });

    if (!updated) return res.status(404).json({ message: 'User not found.' });
    const userObj = { ...updated };
    delete userObj.password;
    res.status(200).json({ message: 'Profile updated successfully.', user: userObj });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const user = await dbService.user.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: 'If the email exists, a reset link has been dispatched.' });
    }

    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expireTime = (Date.now() + 3600000).toString(); // 1 hour

    await dbService.user.findByIdAndUpdate(user._id || (user as any).id, {
      $set: { resetPasswordToken: resetToken, resetPasswordExpire: expireTime },
    });

    // Send reset email (or simulate)
    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (emailError: any) {
      console.error('Failed to send reset email:', emailError.message);
    }

    res.status(200).json({
      message: 'If the email exists, a reset link has been dispatched.',
      ...(isEmailConfigured() ? {} : { token: resetToken }), // Only expose token in simulation mode
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required.' });
    }

    const users = await dbService.user.find({ resetPasswordToken: token });
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    const user = users[0];
    if (Date.now() > Number(user.resetPasswordExpire)) {
      return res.status(400).json({ message: 'Reset token has expired.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await dbService.user.findByIdAndUpdate(user._id || (user as any).id, {
      $set: { password: hashedPassword, resetPasswordToken: undefined, resetPasswordExpire: undefined },
    });

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
