import { Response } from 'express';
import fs from 'fs';
import { PDFParse } from 'pdf-parse';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { dbService } from '../utils/dbService';
import { generateAIResponse } from '../config/ai';

// ─── Helper: Extract raw text from PDF ────────────────────────────────────────
const extractPdfText = async (filePath: string): Promise<string> => {
  let parser: PDFParse | null = null;
  try {
    const fileBuffer = fs.readFileSync(filePath);
    parser = new PDFParse({ data: fileBuffer });
    const pdfData = await parser.getText();
    return pdfData.text || '';
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return '';
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
};

// ─── Helper: Extract candidate name from PDF raw text ─────────────────────────
// Looks at the first ~10 non-empty lines for something that looks like a name
const extractNameFromPdf = (rawText: string): string | null => {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Common resume headers to skip
  const skipPatterns = [
    /^(resume|curriculum vitae|cv|objective|summary|profile|contact|email|phone|address|linkedin|github|portfolio|website)/i,
    /^[\d\s\W]+$/,                    // pure digits / symbols
    /[@]/,                             // email addresses
    /\d{10}/,                         // phone numbers
    /http/i,                           // URLs
  ];

  for (const line of lines.slice(0, 10)) {
    if (skipPatterns.some((p) => p.test(line))) continue;

    // A name is typically 2-4 words, each word starts with a capital letter
    const words = line.split(/\s+/);
    const isProbablyName =
      words.length >= 2 &&
      words.length <= 4 &&
      words.every((w) => /^[A-Z][a-z]+$/.test(w));

    if (isProbablyName) return line;
  }
  return null;
};

// ─── Helper: Keyword scanner ──────────────────────────────────────────────────
const scanResumeKeywords = (rawText: string): string[] => {
  const content = rawText.toLowerCase();
  const keywordsList = [
    'javascript', 'typescript', 'python', 'java', 'kotlin', 'c++', 'c#', 'golang', 'rust',
    'react', 'angular', 'vue', 'next.js', 'node.js', 'express', 'nest.js', 'spring boot', 'django', 'flask',
    'mongodb', 'postgresql', 'mysql', 'redis', 'sqlite', 'cassandra', 'oracle',
    'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'jenkins', 'git', 'ci/cd', 'terraform', 'ansible',
    'html', 'css', 'tailwind', 'sass', 'redux', 'graphql', 'rest api',
    'machine learning', 'deep learning', 'pytorch', 'tensorflow', 'nlp', 'computer vision', 'pandas', 'numpy',
    'agile', 'scrum', 'jira', 'system design', 'data structures', 'algorithms',
  ];
  return keywordsList.filter((kw) => content.includes(kw));
};

// ─── Controller: Analyze Resume ───────────────────────────────────────────────
export const analyzeResume = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized.' });
    if (!req.file) return res.status(400).json({ message: 'Please upload a resume in PDF format.' });

    const targetRole = req.body.targetRole || 'Software Engineer';
    const filePath = req.file.path;

    // Extract full text + keywords
    const rawText = await extractPdfText(filePath);
    const scannedKeywords = scanResumeKeywords(rawText);
    const parsedResumeText = `Scanned resume keywords: ${scannedKeywords.join(', ')}. Target position: ${targetRole}.`;

    const prompt = `
      You are an expert ATS (Applicant Tracking System) parser and senior technical recruiter.
      Analyze this extracted resume content:
      "${parsedResumeText}"
      
      Compare it against the standard industry requirements for a "${targetRole}".
      Provide your analysis in JSON format containing:
      {
        "atsScore": (number from 0 to 100),
        "skillCoverage": (number from 0 to 100),
        "strengths": [array of strings detailing resume strengths],
        "weaknesses": [array of strings detailing resume weaknesses],
        "missingSkills": [array of key skills missing for a ${targetRole}],
        "suggestions": [array of specific feedback bullets],
        "keywordsToInclude": [array of important keywords that should be added to beat the ATS]
      }
    `;

    const matchCount = scannedKeywords.length;
    let baseScore = 40 + Math.min(matchCount * 4, 45);
    if (scannedKeywords.includes('react') && targetRole.toLowerCase().includes('front')) baseScore += 10;
    if (scannedKeywords.includes('spring') && targetRole.toLowerCase().includes('java')) baseScore += 10;

    const finalAtsScore = Math.min(baseScore, 100);
    const finalSkillCoverage = Math.max(Math.min(baseScore - 5, 95), 35);

    const defaultMissingSkills = targetRole.toLowerCase().includes('front')
      ? ['Tailwind CSS', 'TypeScript', 'Jest / Unit Testing', 'Next.js']
      : targetRole.toLowerCase().includes('backend') || targetRole.toLowerCase().includes('java')
      ? ['System Design', 'Redis Caching', 'Docker Containerization', 'CI/CD Pipelines']
      : ['Data Structures & Algorithms', 'System Design', 'Git Workflow', 'Cloud Deployments (AWS/Vercel)'];

    const fallbackResponse = {
      atsScore: finalAtsScore,
      skillCoverage: finalSkillCoverage,
      strengths: [
        scannedKeywords.length > 3
          ? `Demonstrates technical familiarity with: ${scannedKeywords.slice(0, 4).join(', ')}.`
          : 'Has entry-level developer structure.',
        'Clear section headings and logical structure.',
        'Professional contact information and basic developer footprint.',
      ],
      weaknesses: [
        'Lack of impact metrics (e.g., failed to state % improvements or numerical output).',
        'Underrepresented project scope descriptions.',
        'Missing core certifications or target keywords for the selected role.',
      ],
      missingSkills: defaultMissingSkills,
      suggestions: [
        'Rewrite project bullets using the Google XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]".',
        `Add a dedicated section for core skills, specifically listing target technologies: ${defaultMissingSkills.slice(0, 2).join(', ')}.`,
        'Include links to active GitHub repositories and live deployments for key projects.',
      ],
      keywordsToInclude: defaultMissingSkills
        .map((s) => s.toLowerCase())
        .concat(['docker', 'rest api', 'kubernetes', 'unit testing']),
    };

    const aiReport = await generateAIResponse(prompt, fallbackResponse);

    await dbService.user.findByIdAndUpdate(userId, {
      $set: {
        'stats.atsScore': aiReport.atsScore,
        'profile.resumeUrl': `/uploads/${req.file.filename}`,
      },
      $inc: { 'stats.xp': 50 },
    });

    res.status(200).json({
      message: 'Resume analyzed successfully.',
      report: aiReport,
      resumeUrl: `/uploads/${req.file.filename}`,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const generateResume = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized.' });

    const {
      targetRole,
      experienceLevel,
      techStack,
      fullName,
      email,
      phone,
      github,
      linkedin,
      portfolio,
      college,
      degree,
      gradYear,
      cgpa,
      experienceDetails,
      projectDetails,
      certifications,
      hobbies
    } = req.body;

    if (!targetRole || !techStack) {
      return res.status(400).json({ message: 'Target role and tech stack are required.' });
    }

    // ── 1. Determine baseline details with fallbacks ────────────────────────────
    let candidateName = fullName?.trim() || '';
    let candidateEmail = email?.trim() || '';
    let candidatePhone = phone?.trim() || '123-456-7890';
    let candidateGithub = github?.trim() || 'github.com/yourusername';
    let candidateLinkedin = linkedin?.trim() || '';
    let candidatePortfolio = portfolio?.trim() || '';

    // If a PDF file was uploaded, read it
    let pdfExtractedInfo = '';
    if (req.file) {
      const rawPdfText = await extractPdfText(req.file.path);
      const detectedName = extractNameFromPdf(rawPdfText);
      if (!candidateName && detectedName) candidateName = detectedName;
      const keywords = scanResumeKeywords(rawPdfText);
      pdfExtractedInfo = rawPdfText
        ? `\n      The candidate's uploaded PDF resume references these keywords: ${keywords.join(', ')}.`
        : '';
    }

    // Try fallback database lookup if name, email, or linkedin are missing
    if (!candidateName || !candidateEmail || !candidateLinkedin) {
      try {
        const userRecord = await dbService.user.findById(userId);
        if (!candidateName && userRecord?.profile?.name) {
          candidateName = userRecord.profile.name;
        }
        if (!candidateEmail && userRecord?.email) {
          candidateEmail = userRecord.email;
        }
        if (!candidateLinkedin && userRecord?.profile?.name) {
          const lHandle = userRecord.profile.name.toLowerCase().replace(/\s+/g, '-');
          candidateLinkedin = `linkedin.com/in/${lHandle}`;
        }
      } catch {
        // Ignore fallback db errors
      }
    }

    // Ensure we have something
    if (!candidateName) candidateName = 'Your Name';
    if (!candidateEmail) candidateEmail = 'your.email@example.com';
    if (!candidateLinkedin) candidateLinkedin = `linkedin.com/in/${candidateName.toLowerCase().replace(/\s+/g, '-')}`;

    const candidateCollege = college?.trim() || 'XYZ Institute of Technology';
    const candidateDegree = degree?.trim() || 'B.E. / B.Tech in Computer Science & Engineering';
    const candidateGradYear = gradYear?.trim() || 'Expected May 2025';
    const candidateCgpa = cgpa?.trim() || '8.5 / 10';

    const prompt = `
      You are an expert technical recruiter and resume writer.
      Generate a professional, highly ATS-optimized markdown resume for ${candidateName}, a ${experienceLevel} ${targetRole}.
      
      Candidate Details:
      - Name: ${candidateName}
      - Email: ${candidateEmail}
      - Phone: ${candidatePhone}
      - GitHub: ${candidateGithub}
      - LinkedIn: ${candidateLinkedin}
      ${candidatePortfolio ? `- Portfolio/Website: ${candidatePortfolio}` : ''}
      - Tech Stack: ${techStack}
      - Experience Level: ${experienceLevel}
      - Target Role: ${targetRole}
      ${pdfExtractedInfo}
      
      Education:
      - Institution: ${candidateCollege}
      - Degree: ${candidateDegree}
      - Graduation Year: ${candidateGradYear}
      - CGPA/GPA: ${candidateCgpa}
      
      Work Experience / Internships:
      ${experienceDetails ? experienceDetails : 'Describe a relevant professional experience or internship placeholder using the Google XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]".'}
      
      Projects:
      ${projectDetails ? projectDetails : 'Incorporate 2 impressive project placeholders tailored to the role using the Google XYZ formula.'}
      
      ${certifications ? `Certifications & Achievements:\n${certifications}` : ''}
      ${hobbies ? `Hobbies & Extracurriculars:\n${hobbies}` : ''}
      
      The resume MUST include the following sections:
      1. Header (Name, Email, Phone, LinkedIn, GitHub, Portfolio if available)
      2. Professional Summary (2-3 sentences. Write in third person and tailor to ${targetRole}.)
      3. Technical Skills (categorized, using these provided skills: ${techStack})
      4. Work Experience (using the experience details provided, formatted using the Google XYZ formula)
      5. Projects (using the project details provided, formatted using the Google XYZ formula)
      6. Education (showing the degree, college, year, CGPA)
      ${certifications ? '7. Certifications & Achievements' : ''}
      ${hobbies ? '8. Hobbies & Extracurriculars' : ''}

      IMPORTANT: Use the actual candidate name "${candidateName}" throughout. Do NOT use placeholder names like "John Doe" or "Your Name".
      Output ONLY the raw markdown text for the resume. Do not use code blocks around the entire output.
    `;

    const fallbackResume = `# ${candidateName}
*${candidateEmail} | ${candidatePhone} | [LinkedIn](${candidateLinkedin}) | [GitHub](${candidateGithub})${candidatePortfolio ? ` | [Portfolio](${candidatePortfolio})` : ''}*

## Professional Summary
Results-driven ${experienceLevel} ${targetRole} with a strong foundation in building scalable applications. Proven ability to leverage modern technologies to optimize performance and deliver exceptional user experiences. Seeking to contribute expertise in ${techStack.split(',')[0]?.trim() || 'software engineering'} to a dynamic engineering team.

## Technical Skills
- **Languages & Frameworks:** ${techStack}
- **Tools & Platforms:** Git, Docker, AWS, CI/CD, Agile/Scrum
- **Core Concepts:** Data Structures, Algorithms, System Design, REST APIs

## Experience & Projects

### ${targetRole} Intern | Tech Innovators Pvt. Ltd.
*June 2024 – Present*
${experienceDetails ? experienceDetails.split('\n').map((line: string) => line.startsWith('-') ? line : `- ${line}`).join('\n') : `- Engineered a scalable REST API using Node.js and Express, improving data retrieval speeds by 40% as measured by load testing benchmarks.\n- Migrated legacy frontend components to React, reducing bundle size by 15% and improving Lighthouse performance score to 95+.`}

### Technical Projects
${projectDetails ? projectDetails.split('\n').map((line: string) => line.startsWith('-') ? line : `- ${line}`).join('\n') : `### ${targetRole} Personal Project: E-Commerce Platform
*Jan 2024 – May 2024*
- Architected a robust full-stack application incorporating React and a scalable NoSQL database, serving 500+ concurrent users.
- Implemented JWT-based authentication and role-based access control, securing all API endpoints against OWASP Top 10 vulnerabilities.`}

## Education
**${candidateDegree}**
*${candidateCollege} | ${candidateGradYear}*
- CGPA/GPA: ${candidateCgpa}
${certifications ? `\n## Certifications & Achievements\n${certifications.split('\n').map((line: string) => line.startsWith('-') ? line : `- ${line}`).join('\n')}` : ''}
${hobbies ? `\n## Hobbies & Extracurriculars\n${hobbies.split('\n').map((line: string) => line.startsWith('-') ? line : `- ${line}`).join('\n')}` : ''}
`;
    const aiResumeMarkdown = await generateAIResponse(prompt, fallbackResume);

    await dbService.user.findByIdAndUpdate(userId, {
      $inc: { 'stats.xp': 30 },
    });

    res.status(200).json({
      message: 'Resume generated successfully.',
      markdown: typeof aiResumeMarkdown === 'string' ? aiResumeMarkdown : aiResumeMarkdown.content || fallbackResume,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
