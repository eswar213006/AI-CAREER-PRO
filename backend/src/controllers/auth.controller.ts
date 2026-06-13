import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbService } from '../utils/dbService';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

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
    const mockVerificationToken = Math.random().toString(36).substring(2, 15);

    const newUser = await dbService.user.create({
      email,
      password: hashedPassword,
      isVerified: true, // Auto-verify for simulation simplicity
      verificationToken: mockVerificationToken,
      role: email.startsWith('admin@') ? 'admin' : 'student',
      profile: {
        name,
        targetRole: targetRole || 'Software Engineer',
        experienceLevel: 'Fresher',
        targetCompanies: [],
      },
      stats: {
        xp: 100, // starting bonus
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
        codingChallengesCompleted: 0,
        totalInterviewsTaken: 0,
        readinessScore: 35, // starting readiness
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

    // Create default progress tracking document
    await dbService.progress.create({
      userId: newUser._id || (newUser as any).id,
      subjects: [
        { subjectName: 'Java & OOPs', mcqsTaken: 0, mcqsCorrect: 0, level: 15 },
        { subjectName: 'DBMS & SQL', mcqsTaken: 0, mcqsCorrect: 0, level: 10 },
        { subjectName: 'Operating Systems', mcqsTaken: 0, mcqsCorrect: 0, level: 5 },
        { subjectName: 'Computer Networks', mcqsTaken: 0, mcqsCorrect: 0, level: 8 },
        { subjectName: 'Quantitative Aptitude', mcqsTaken: 0, mcqsCorrect: 0, level: 20 },
      ],
      placementReadinessTrend: [
        { date: new Date().toISOString().split('T')[0], score: 35 },
      ],
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

    const { accessToken, refreshToken } = generateTokens(newUser);

    // Set HTTP-Only Cookie for Refresh Token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const userObj = { ...newUser };
    delete userObj.password;

    res.status(201).json({
      message: 'Account created successfully.',
      user: userObj,
      accessToken,
    });
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
      const lastActiveDateObj = new Date(lastActive);
      const todayDateObj = new Date(todayStr);
      const diffTime = Math.abs(todayDateObj.getTime() - lastActiveDateObj.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Active consecutive day
        newStreak += 1;
        if (newStreak > newLongest) {
          newLongest = newStreak;
        }
      } else if (diffDays > 1) {
        // Streak broken
        newStreak = 1;
      }
    }

    // Award daily login XP (20 XP)
    let extraXp = 0;
    if (lastActive !== todayStr) {
      extraXp = 20;
    }

    // Update streak stats & active logs
    const currentXp = (user.stats?.xp || 0) + extraXp;
    const updatedUser = await dbService.user.findByIdAndUpdate(user._id || (user as any).id, {
      $set: {
        'stats.currentStreak': newStreak,
        'stats.longestStreak': newLongest,
        'stats.lastActiveDate': todayStr,
        'stats.xp': currentXp,
      }
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

    res.status(200).json({
      message: 'Login successful.',
      user: userObj,
      accessToken,
    });
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
      if (err) {
        return res.status(403).json({ message: 'Expired or invalid refresh token.' });
      }

      const user = await dbService.user.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: 'User account not found.' });
      }

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
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const user = await dbService.user.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

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
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const { name, bio, targetRole, experienceLevel, targetCompanies } = req.body;

    const updated = await dbService.user.findByIdAndUpdate(userId, {
      $set: {
        'profile.name': name,
        'profile.bio': bio,
        'profile.targetRole': targetRole,
        'profile.experienceLevel': experienceLevel,
        'profile.targetCompanies': targetCompanies,
      }
    });

    if (!updated) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const userObj = { ...updated };
    delete userObj.password;

    res.status(200).json({
      message: 'Profile updated successfully.',
      user: userObj,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await dbService.user.findOne({ email });
    if (!user) {
      // Respond positive for security obfuscation
      return res.status(200).json({ message: 'If the email exists, a reset link has been dispatched.' });
    }

    const resetToken = Math.random().toString(36).substring(2, 15);
    const expireTime = (Date.now() + 3600000).toString(); // 1 hour expiry

    await dbService.user.findByIdAndUpdate(user._id || (user as any).id, {
      $set: {
        resetPasswordToken: resetToken,
        resetPasswordExpire: expireTime,
      }
    });

    res.status(200).json({
      message: 'Reset link generated successfully.',
      token: resetToken, // Returned directly for local/dev mock evaluation
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
    const expiry = Number(user.resetPasswordExpire);
    if (Date.now() > expiry) {
      return res.status(400).json({ message: 'Reset token has expired.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await dbService.user.findByIdAndUpdate(user._id || (user as any).id, {
      $set: {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpire: undefined,
      }
    });

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
