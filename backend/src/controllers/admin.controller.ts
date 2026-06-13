import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { dbService } from '../utils/dbService';
import { jsonDb } from '../utils/jsonDb';
import { checkUseMongoDB } from '../config/db';

export const getStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await dbService.user.find({});
    const interviews = await dbService.interview.find({});
    const submissions = await dbService.submission.find({});

    const totalUsers = users.length;
    const activeUsers = users.filter((u: any) => {
      const todayStr = new Date().toISOString().split('T')[0];
      return u.stats.lastActiveDate === todayStr;
    }).length;

    const totalInterviews = interviews.length;
    const totalSubmissions = submissions.length;

    // AI Usage statistics (Simulated for monitoring dashboard)
    const aiUsageStats = {
      dailyTokenConsumption: [
        { date: 'Mon', resumeTokens: 12000, interviewTokens: 45000, codingTokens: 15000 },
        { date: 'Tue', resumeTokens: 18000, interviewTokens: 52000, codingTokens: 22000 },
        { date: 'Wed', resumeTokens: 15000, interviewTokens: 60000, codingTokens: 28000 },
        { date: 'Thu', resumeTokens: 25000, interviewTokens: 75000, codingTokens: 35000 },
        { date: 'Fri', resumeTokens: 32000, interviewTokens: 90000, codingTokens: 42000 },
        { date: 'Sat', resumeTokens: 10000, interviewTokens: 40000, codingTokens: 18000 },
        { date: 'Sun', resumeTokens: 8000, interviewTokens: 35000, codingTokens: 12000 }
      ],
      totalRequestsThisMonth: 1240,
      averageResponseTimeMs: 1450,
      successRate: 99.8
    };

    // Revenue metrics (Future ready)
    const revenueMetrics = {
      totalRevenue: 2490, // mock SaaS revenue
      activeSubscriptions: 83,
      growthTrend: 12.5
    };

    res.status(200).json({
      stats: {
        totalUsers,
        activeUsers: activeUsers || 1, // ensure at least 1 for display
        totalInterviews,
        totalSubmissions,
        aiUsageStats,
        revenueMetrics
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await dbService.user.find({});
    // Remove passwords before returning
    const cleanedUsers = users.map((u: any) => {
      const uObj = { ...u };
      delete uObj.password;
      return uObj;
    });

    res.status(200).json({ users: cleanedUsers });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ message: 'User ID and Role are required.' });
    }

    if (role !== 'student' && role !== 'admin') {
      return res.status(400).json({ message: 'Invalid role value.' });
    }

    const updated = await dbService.user.findByIdAndUpdate(userId, {
      $set: { role }
    });

    if (!updated) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'User role updated successfully.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
