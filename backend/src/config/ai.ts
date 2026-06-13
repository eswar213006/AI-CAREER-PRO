let googleAI: any = null;
let isMockAI = true;

const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey.trim() !== '') {
  try {
    // Handle both SDK export shapes
    const sdk = require('@google/generative-ai');
    const AIClass = sdk.GoogleGenerativeAI || sdk.GoogleGenAI || null;
    if (AIClass) {
      googleAI = new AIClass(apiKey);
      isMockAI = false;
      console.log('✅ Gemini AI Service initialized successfully.');
    } else {
      throw new Error('No known Gemini AI class found in SDK.');
    }
  } catch (err: any) {
    console.warn('⚠️  Failed to initialize Gemini SDK:', err.message);
    isMockAI = true;
  }
} else {
  console.warn('\n================================================================');
  console.warn('⚠️  GEMINI_API_KEY is not set in backend/.env');
  console.warn('   AI services will run in Simulation Mode (rich mock data).');
  console.warn('================================================================\n');
  isMockAI = true;
}

export const isUsingMockAI = () => isMockAI;

export const cleanJsonString = (rawText: string): string => {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  return cleaned.trim();
};

export const generateAIResponse = async (prompt: string, fallbackResponse: any): Promise<any> => {
  if (isMockAI || !googleAI) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return fallbackResponse;
  }

  try {
    const model = googleAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(cleanJsonString(text));
  } catch (error: any) {
    console.error('Gemini generation error:', error.message);
    return fallbackResponse;
  }
};
