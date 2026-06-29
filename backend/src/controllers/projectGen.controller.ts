import { Request, Response, Router } from 'express';
import { generateAIResponse } from '../config/ai';

const router = Router();

router.post('/generate', async (req: Request, res: Response) => {
  const { tech = 'React & Node.js', difficulty = 'Intermediate', domain = 'FinTech' } = req.body;

  const fallback = {
    title: `AI-Powered ${domain} Ledger`,
    overview: `A modern, high-performance web system designed for ${domain} operations utilizing a ${tech} stack. Focuses on security, transaction auditing, and responsive components.`,
    architecture: `Client-Server architecture with clean segregation. Node backend coordinates API gateways and background workers while React orchestrates State management.`,
    databaseDesign: `Table "users" { id (PK), name, email }\nTable "transactions" { id (PK), amount, user_id (FK), status, timestamp }\nIndexes configured on (user_id, timestamp) for rapid range query execution.`,
    folderStructure: `├── client/\n│   ├── src/\n│   │   ├── components/\n│   │   └── pages/\n└── server/\n    ├── src/\n    │   ├── controllers/\n    │   ├── models/\n    │   └── routes/\n    └── package.json`,
    apiDesign: `POST /api/auth/register - Register user\nGET /api/transactions - Fetch user ledger\nPOST /api/transactions/create - Create audited transactions`,
    deploymentGuide: `1. Containerize backend & frontend using Docker.\n2. Configure reverse proxy with Nginx.\n3. Deploy database using AWS RDS instance.\n4. Wire environment variables (.env) securely.`,
    resumeBullets: [
      `Architected and deployed a production-ready ${domain} tracking system using ${tech} and containerized deployment workflow.`,
      `Engineered transactional integrity checks reducing operational synchronization bottlenecks by 18% during concurrent testing.`,
      `Mapped RESTful endpoints securely and integrated responsive client state flows.`
    ]
  };

  try {
    const prompt = `Act as a senior software architect. Generate a project blueprint for a ${domain} project using ${tech} at an ${difficulty} level.
Respond in JSON containing exactly:
- title: string
- overview: string
- architecture: string
- databaseDesign: string
- folderStructure: string
- apiDesign: string
- deploymentGuide: string
- resumeBullets: list of strings`;

    const result = await generateAIResponse(prompt, fallback);
    res.json(result);
  } catch {
    res.json(fallback);
  }
});

export default router;
