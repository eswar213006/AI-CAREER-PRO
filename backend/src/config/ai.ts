let googleAI: any = null;
let isMockAI = true;

const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey.trim() !== '') {
  try {
    const sdk = require('@google/generative-ai');
    const AIClass = sdk.GoogleGenerativeAI || sdk.GoogleGenAI || null;
    if (AIClass) {
      googleAI = new AIClass(apiKey);
      isMockAI = false;
      console.log('✅ Gemini AI Service initialized (gemini-2.0-flash).');
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
  console.warn('   Add your key from: https://aistudio.google.com/app/apikey');
  console.warn('================================================================\n');
  isMockAI = true;
}

export const isUsingMockAI = () => isMockAI;

/**
 * Strips markdown code fences from AI response text to extract clean JSON.
 */
export const cleanJsonString = (rawText: string): string => {
  let cleaned = rawText.trim();
  // Remove ```json or ``` opening fence
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '');
  // Remove closing fence
  cleaned = cleaned.replace(/\s*```\s*$/i, '');
  return cleaned.trim();
};

/**
 * Calls Gemini AI for a structured JSON response.
 * Falls back gracefully to `fallbackResponse` on any error or if no key is set.
 *
 * @param prompt - The instruction prompt to send to Gemini
 * @param fallbackResponse - Rich mock data returned when AI is unavailable
 * @param expectString - If true, returns raw text instead of parsed JSON
 */
export const generateAIResponse = async (
  prompt: string,
  fallbackResponse: any,
  expectString = false
): Promise<any> => {
  if (isMockAI || !googleAI) {
    // Simulate realistic AI latency so the UI spinner shows
    await new Promise((resolve) => setTimeout(resolve, 1400));
    return fallbackResponse;
  }

  try {
    const model = googleAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const text: string = result.response.text();

    if (expectString) {
      return text;
    }

    // Try to parse JSON; fall back on parse error
    try {
      return JSON.parse(cleanJsonString(text));
    } catch {
      console.warn('⚠️  Gemini returned non-JSON; attempting substring extraction...');
      // Try to find first JSON array or object in response
      const jsonMatch = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      // Return as string if nothing parseable found
      return text;
    }
  } catch (error: any) {
    console.error('❌ Gemini generation error:', error.message);
    return fallbackResponse;
  }
};
