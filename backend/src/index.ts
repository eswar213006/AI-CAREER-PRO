import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { rateLimit } from 'express-rate-limit';

// Load env variables
dotenv.config();

import { connectDB, getDbStatus } from './config/db';
import { errorHandler } from './middleware/error.middleware';

// Routes imports
import authRoutes from './routes/auth.routes';
import resumeRoutes from './routes/resume.routes';
import interviewRoutes from './routes/interview.routes';
import codingRoutes from './routes/coding.routes';
import learningRoutes from './routes/learning.routes';
import aptitudeRoutes from './routes/aptitude.routes';
import mcqRoutes from './routes/mcq.routes';
import hrRoutes from './routes/hr.routes';
import companyRoutes from './routes/company.routes';

// ... existing imports ...
// After existing route mounts



const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting (needed behind localtunnel / reverse proxies)
app.set('trust proxy', 1);

// Security and utility Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow frontend to view uploads easily
}));

app.use(cors({
  origin: true, // Allow all for local dev ease, or specific frontend port
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom lightweight inline cookie parser middleware
app.use((req: any, res, next) => {
  const cookieHeader = req.headers.cookie;
  req.cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie: string) => {
      const parts = cookie.split('=');
      const name = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      req.cookies[name] = val;
    });
  }
  next();
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate limiting to secure API endpoints
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api/', limiter);

// Base Check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'Healthy',
    database: getDbStatus(),
    time: new Date().toISOString()
  });
});

// Bind API route modules
// Bind API route modules
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/aptitude', aptitudeRoutes);
app.use('/api/mcq', mcqRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/company', companyRoutes);
// adminRoutes not defined – removed to prevent ReferenceError

// Global exception handling
app.use(errorHandler);

// Connect DB & start listening
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`[AI CareerPrep Pro Server] Running on http://localhost:${PORT}`);
    console.log(`[Database status] Active Mode: ${getDbStatus()}`);
  });
};

startServer();
