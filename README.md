# AI CareerPrep Pro

AI CareerPrep Pro is a production-ready, enterprise-grade full-stack web application designed to help students and job seekers prepare for placements, technical interviews, coding rounds, HR interviews, and company-specific recruitment processes using AI.

## Key Features

- **SaaS-Style Landing Page:** Modern, interactive showcase with pricing tiers, FAQ, testimonials, and contact system.
- **Interactive Dashboard:** Tracks Interview Readiness, Placement Readiness, ATS Resume Scores, Streak/XP gamification, and recent activity.
- **Resume Analysis Module:** Upload PDF resumes to analyze ATS score, detect missing skills, recommend keywords, and offer targeted optimization feedback.
- **Dynamic AI Mock Interviews:** Generates role-specific, difficulty-based, and company-specific interview sessions. Supports voice mode analysis (words-per-minute, filler word detection, pronunciation confidence).
- **Integrated Coding Platform:** Write, run, and submit solutions for technical coding challenges in a sandboxed runtime environment, with AI-driven Big-O analysis and refactoring suggestions.
- **Placement Preparation Hub:** Comprehensive learning material, cheat sheets, and MCQ banks covering Java, DBMS, OS, Computer Networks, and Aptitude.
- **Personalized Learning Engine:** Generates tailored roadmaps, daily/weekly goals, and recommendations based on user performance.
- **Gamification System:** XP points, streaks, badges/achievements, and leaderboards to keep users motivated.
- **Admin Panel:** Detailed admin views of user roles, system metrics, mock interview logs, coding submissions, and AI usage logs.

---

## Technology Stack

### Frontend
- **Framework:** React with TypeScript
- **State Management:** Redux Toolkit & React Query
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Visualizations:** Recharts / Chart.js
- **Tooling:** Vite

### Backend
- **Runtime:** Node.js with Express.js
- **Languages:** TypeScript
- **Security:** Helmet, CORS, JWT-based auth, rate limiting
- **Storage:** Multer (local disk storage fallback for PDF/Image uploads)
- **AI Integration:** Google Generative AI SDK (Gemini API)

### Database
- **Primary:** MongoDB with Mongoose
- **Fallback Database:** Local JSON File-Based Database system (enables the app to work seamlessly even without MongoDB running locally).

---

## Directory Structure

```text
├── backend/
│   ├── data/                 # JSON file-based database backups/tables
│   ├── src/
│   │   ├── config/           # Database configurations and Gemini AI API wrappers
│   │   ├── controllers/      # Route controllers (Auth, Resume, Interview, Coding, Learning, Admin)
│   │   ├── middleware/       # Auth (RBAC), file upload (Multer), global error handlers
│   │   ├── models/           # Mongoose schemas / TS interfaces for Fallback DB
│   │   ├── routes/           # Router registrations
│   │   └── index.ts          # Main entry point
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable UI components (GlassCard, Button, Toast, Navbar, Sidebar)
│   │   ├── context/          # Theme context
│   │   ├── pages/            # Page layouts (Landing, Dashboard, ResumeAnalyzer, MockInterview, CodingPlatform, PrepHub, AdminPanel)
│   │   ├── store/            # Redux store configurations and auth slices
│   │   ├── utils/            # Axios API client wrappers
│   │   ├── App.tsx           # Router mappings & routes configuration
│   │   ├── index.css         # Styling system
│   │   └── main.tsx          # App mount point
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── package.json
```

---

## Setup and Running Instructions

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/eswar213006/AI-CAREER-PRO.git
   cd AI-CAREER-PRO
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend/` directory with:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/aicareerprep
   JWT_SECRET=your_jwt_secret_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *Note: If MongoDB is not running or the `GEMINI_API_KEY` is not provided, the server automatically boots in Simulation Mode using a JSON file-based database and detailed mock AI logic.*

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

- **Start Backend Developer Server:**
  ```bash
  cd backend
  npm run dev
  ```
- **Start Frontend Developer Server:**
  ```bash
  cd frontend
  npm run dev
  ```
  *(Or build/preview using `npm run build && npm run preview`)*

---

## License

This project is licensed under the MIT License.
