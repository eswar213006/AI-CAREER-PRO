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
      hobbies,
      educations,
      experiences
    } = req.body;

    if (!targetRole || !techStack) {
      return res.status(400).json({ message: 'Target role and tech stack are required.' });
    }

    // Safely parse educations and experiences arrays
    let parsedEducations = [];
    if (educations) {
      try {
        parsedEducations = typeof educations === 'string' ? JSON.parse(educations) : educations;
      } catch {
        parsedEducations = [];
      }
    }

    let parsedExperiences = [];
    if (experiences) {
      try {
        parsedExperiences = typeof experiences === 'string' ? JSON.parse(experiences) : experiences;
      } catch {
        parsedExperiences = [];
      }
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

    let educationsSection = '';
    if (Array.isArray(parsedEducations) && parsedEducations.length > 0) {
      educationsSection = parsedEducations.map((edu: any) => {
        const title = edu.degree?.trim() || 'Education';
        const institution = edu.college?.trim() || '';
        const year = edu.gradYear?.trim() || '';
        const cgpa = edu.cgpa?.trim() || '';
        
        const isSchool = /class\s*(x|v?i{1,3})/i.test(title) || /school/i.test(institution);
        
        if (isSchool) {
          // School entry: show name, then degree/title and year
          return `**${institution}**\n${title} | *${year}*`;
        } else {
          // College entry: name on left, year on right, then degree and CGPA
          return `**${institution}** | *${year}*\n${title}${cgpa ? ` | CGPA: ${cgpa}` : ''}`;
        }
      }).join('\n\n');
    } else {
      const singleTitle = candidateDegree?.trim() || 'Bachelor\'s Degree';
      educationsSection = `**${candidateCollege}** | *${candidateGradYear}*\n${singleTitle}${candidateCgpa ? ' | CGPA: ' + candidateCgpa : ''}`;
    }

    let experiencesSection = '';
    if (Array.isArray(parsedExperiences) && parsedExperiences.length > 0) {
      experiencesSection = parsedExperiences.map((exp: any) => {
        const company = exp.company?.trim() || 'Company';
        const role = exp.role?.trim() || 'Role';
        const duration = exp.duration?.trim() || '';
        const achievementsStr = exp.achievements || '';
        const formattedAchievements = achievementsStr
          .split('\n')
          .map((line: string) => line.trim())
          .filter((line: string) => line.length > 0)
          .map((line: string) => line.startsWith('-') ? line : `- ${line}`)
          .join('\n');
        return `**${company}, ${role}** | *${duration}*\n${formattedAchievements}`;
      }).join('\n\n');
    } else {
      experiencesSection = experienceDetails || 'Describe a relevant professional experience or internship placeholder using the Google XYZ formula.';
    }

    const certsInstruction = certifications 
      ? '7. Certifications & Achievements:\n         - Heading: "## CERTIFICATIONS"\n         - Format each certification on a single line: `**Certification Name - Issuer** | *Date*` (e.g. `**Principles of UI/UX - Meta** | *Nov 2024*`)' 
      : '';

    const hobbiesInstruction = hobbies 
      ? '8. Hobbies & Extracurriculars:\n         - Heading: "## HOBBIES & EXTRACURRICULARS"\n         - Format each hobby/activity on a single line: `**Activity/Hobby Name**: brief description | *Date*`' 
      : '';

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
      
      Education History (already pre-formatted using left-right layout):
      ${educationsSection}
      
      Work Experience / Internships (already pre-formatted using left-right layout):
      ${experiencesSection}
      
      Projects:
      ${projectDetails ? projectDetails : 'Incorporate 2 impressive project placeholders tailored to the role using the Google XYZ formula.'}
      
      ${certifications ? `Certifications & Achievements:\n${certifications}` : ''}
      ${hobbies ? `Hobbies & Extracurriculars:\n${hobbies}` : ''}
      
      The resume MUST include the following sections and EXACT layout conventions:
      
      1. Header:
         - Large bold centered name in uppercase: "# ${candidateName.toUpperCase()}"
         - Contact line centered directly below, exactly in this format, separated by pipes: "*${candidatePhone} | ${candidateEmail} | LinkedIn: ${candidateLinkedin} | GitHub: ${candidateGithub}${candidatePortfolio ? ` | Portfolio: ${candidatePortfolio}` : ''}*"
         
      2. Professional Summary:
         - Write in third person, tailored to ${targetRole}. (No heading prefix like "Summary:")
         
      3. Technical Skills:
         - Heading: "## SKILLS"
         - Categorized skills using bold headings and comma-separated lists, for example:
           **Programming Languages:** Python, C, C++, Swift, HTML-CSS
           **Libraries and Frameworks:** Matplotlib, NumPy, Pandas
           **Databases:** MySQL
           **Soft Skills:** Leadership Skills, Confident, Strong Communication
           
      4. Education:
         - Heading: "## EDUCATION"
         - Copy the education entries EXACTLY as formatted in the Education History section above. Each entry already has a left-right layout separated by a pipe. Do NOT add prefix labels like "Degree:" or change the formatting. Use them as-is.
         
      5. Work Experience:
         - Heading: "## EXPERIENCE"
         - Format each entry starting with a line: \`**Company Name, Job Title** | *Duration*\`
         - Followed by bullet points detailing achievements using the Google XYZ formula.
         
      6. Projects & Research:
         - Heading: "## PROJECTS & RESEARCH"
         - Format each project entry starting with a line: \`**Project Name - Subtitle** | *Duration*\` (e.g. \`**Fleetly, Fleet Management App - Infosys internship Project** | *Apr 2025 - May 2025*\`)
         - Followed by bullet points detailing technologies, logic, and descriptions.
         
      ${certsInstruction}
         
      ${hobbiesInstruction}

      IMPORTANT: Use the actual candidate name "${candidateName}" throughout. Do NOT use placeholder names.
      Output ONLY the raw markdown text for the resume. Do not use code blocks around the entire output.
    `;

    // Build dynamic fallback sections — use same pre-formatted approach as the Gemini prompt
    let fallbackEducationList = educationsSection;

    let fallbackExperienceList = experiencesSection;

    let fallbackProjectList = '';
    if (projectDetails) {
      fallbackProjectList = projectDetails
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0)
        .map((line: string) => line.startsWith('-') ? line : `- ${line}`)
        .join('\n');
    } else {
      fallbackProjectList = `**E-Commerce Platform - Full Stack Personal Project** | *Jan 2024 – May 2024*
- Architected a robust full-stack application incorporating React and a scalable NoSQL database, serving 500+ concurrent users.
- Implemented JWT-based authentication and role-based access control, securing all API endpoints against OWASP Top 10 vulnerabilities.`;
    }

    const fallbackResume = `# ${candidateName.toUpperCase()}
*${candidatePhone} | ${candidateEmail} | LinkedIn: ${candidateLinkedin} | GitHub: ${candidateGithub}${candidatePortfolio ? ` | Portfolio: ${candidatePortfolio}` : ''}*

## Professional Summary
Results-driven ${experienceLevel} ${targetRole} with a strong foundation in building scalable applications. Proven ability to leverage modern technologies to optimize performance and deliver exceptional user experiences. Seeking to contribute expertise in ${techStack.split(',')[0]?.trim() || 'software engineering'} to a dynamic engineering team.

## EDUCATION
${fallbackEducationList}

## EXPERIENCE
${fallbackExperienceList}

## SKILLS
**Programming Languages:** ${techStack}
**Tools & Platforms:** Git, Docker, AWS, CI/CD, Agile/Scrum
**Core Concepts:** Data Structures, Algorithms, System Design, REST APIs

## PROJECTS & RESEARCH
${fallbackProjectList}
${certifications ? `\n## CERTIFICATIONS\n${certifications.split('\n').map((line: string) => line.trim()).filter((line: string) => line.length > 0).map((line: string) => {
  if (line.includes('|')) return line;
  return `**${line}**`;
}).join('\n')}` : ''}
${hobbies ? `\n## HOBBIES & EXTRACURRICULARS\n${hobbies.split('\n').map((line: string) => line.trim()).filter((line: string) => line.length > 0).map((line: string) => {
  if (line.includes('|')) return line;
  return `**${line}**`;
}).join('\n')}` : ''}
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

export const extractResume = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized.' });
    if (!req.file) return res.status(400).json({ message: 'Please upload an old resume in PDF format.' });

    const rawText = await extractPdfText(req.file.path);
    if (!rawText.trim()) {
      return res.status(400).json({ message: 'Failed to extract text from the PDF file. Make sure it is not empty or scanned.' });
    }

    const prompt = `
      You are an expert resume parsing AI. Parse the text extracted from the candidate's old resume PDF.
      
      Resume text:
      "${rawText}"

      Extract all structured details and return them strictly in the following JSON format. Output ONLY the raw JSON string. Do not wrap it in markdown code blocks like \`\`\`json.
      {
        "fullName": "extract full name if present",
        "email": "extract email if present",
        "phone": "extract phone if present",
        "github": "extract github if present",
        "linkedin": "extract linkedin if present",
        "portfolio": "extract portfolio/website link if present",
        "techStack": "comma separated skills like React, Node.js, Python",
        "educations": [
          { "college": "name of university/institution", "degree": "degree name, e.g. B.Tech in CS", "gradYear": "graduation year", "cgpa": "cgpa/gpa value" }
        ],
        "experiences": [
          { "company": "name of company", "role": "job title", "duration": "employment duration", "achievements": "bulleted achievements description" }
        ],
        "certifications": "bulleted certifications if present",
        "hobbies": "bulleted hobbies/extracurriculars if present"
      }
    `;

    const defaultJson = {
      fullName: extractNameFromPdf(rawText) || '',
      email: '',
      phone: '',
      github: '',
      linkedin: '',
      portfolio: '',
      techStack: scanResumeKeywords(rawText).join(', '),
      educations: [],
      experiences: [],
      certifications: '',
      hobbies: '',
    };

    const aiTextResponse = await generateAIResponse(prompt, JSON.stringify(defaultJson));
    
    // Safely parse JSON from AI response
    let parsedData = defaultJson;
    try {
      let rawJson = '';
      if (typeof aiTextResponse === 'string') {
        rawJson = aiTextResponse;
      } else if (aiTextResponse && typeof aiTextResponse.content === 'string') {
        rawJson = aiTextResponse.content;
      }

      // Remove markdown wrapping if present
      rawJson = rawJson.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      parsedData = JSON.parse(rawJson);
    } catch (parseError) {
      console.error('Error parsing AI JSON for resume extraction:', parseError);
    }

    res.status(200).json({
      message: 'Resume text extracted and structured successfully.',
      data: parsedData,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
