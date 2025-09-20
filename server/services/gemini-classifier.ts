// Gemini AI spam classifier service - Free alternative to OpenRouter
// Using Google Gemini 2.5 Flash for fast and accurate spam classification
import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Note that the newest Gemini model series is "gemini-2.5-flash" or "gemini-2.5-pro"

export interface SpamClassificationResult {
  isSpam: boolean;
  confidence: number; // 0-100
  reasoning: string;
}

export class GeminiClassifierService {
  private ai: GoogleGenAI;
  private readonly DELAY_BETWEEN_REQUESTS = 2000; // 2 seconds delay for rate limiting

  constructor() {
    // This API key is from Gemini Developer API Key, not vertex AI API Key
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  }

  async classifyEmail(sender: string, subject: string, body: string): Promise<SpamClassificationResult> {
    const classificationStartTime = Date.now();
    console.log(`🧠 [Gemini] Starting classification for email: "${subject}" from ${sender}`);

    try {
      console.log(`📤 [Gemini] Sending request to Google Gemini...`);
      
      const systemPrompt = `You are an expert spam email classifier. Analyze emails and respond with a JSON object containing:
- "isSpam": boolean (true if spam, false if legitimate)
- "confidence": number 0-100 (how confident you are in this classification)
- "reasoning": string (brief explanation of your decision)

Consider these spam indicators:
- Suspicious sender domains or email addresses
- Promotional language and urgent calls to action
- Poor grammar, spelling mistakes, or unusual formatting
- Suspicious links or attachments mentioned
- Financial scams, phishing attempts, or fraudulent offers
- Unsolicited marketing or sales pitches
- Generic greetings like "Dear Customer" instead of personal names

Consider these legitimate indicators:
- Personal emails from known contacts
- Transactional emails from legitimate services
- Professional communications
- Account notifications from legitimate companies
- Personal correspondence with specific context

Analyze the complete context and content carefully.`;

      const emailContent = `Analyze this email for spam classification:

From: ${sender}
Subject: ${subject}
Body: ${body.substring(0, 2000)}`; // Limit body to 2000 chars

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash", // Fast and efficient model for classification
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              isSpam: { type: "boolean" },
              confidence: { type: "number" },
              reasoning: { type: "string" },
            },
            required: ["isSpam", "confidence", "reasoning"],
          },
        },
        contents: emailContent,
      });

      const responseTime = Date.now() - classificationStartTime;
      console.log(`📡 [Gemini] Response received in ${responseTime}ms`);

      const rawJson = response.text;
      
      if (!rawJson) {
        throw new Error('Empty response from Gemini');
      }

      try {
        const result: SpamClassificationResult = JSON.parse(rawJson);
        
        // Validate the response structure
        if (typeof result.isSpam !== 'boolean' || 
            typeof result.confidence !== 'number' || 
            typeof result.reasoning !== 'string') {
          throw new Error('Invalid response format from Gemini');
        }

        // Ensure confidence is within valid range
        result.confidence = Math.max(0, Math.min(100, Math.round(result.confidence)));

        const totalTime = Date.now() - classificationStartTime;
        console.log(`✅ [Gemini] Classification completed in ${totalTime}ms: ${result.isSpam ? 'SPAM' : 'NOT SPAM'} (${result.confidence}% confidence)`);
        console.log(`🔍 [Gemini] Reasoning: ${result.reasoning}`);
        
        // Wait before allowing next request (rate limit protection)
        if (this.DELAY_BETWEEN_REQUESTS > 0) {
          console.log(`⏱️ [Gemini] Waiting ${this.DELAY_BETWEEN_REQUESTS}ms before next request...`);
          await new Promise(resolve => setTimeout(resolve, this.DELAY_BETWEEN_REQUESTS));
        }
        
        return result;
      } catch (parseError) {
        console.error('❌ [Gemini] Failed to parse AI response:', rawJson);
        throw new Error('Failed to parse Gemini response as JSON');
      }

    } catch (error) {
      const totalTime = Date.now() - classificationStartTime;
      console.error(`❌ [Gemini] Error classifying email after ${totalTime}ms:`, error);
      throw new Error(`Failed to classify email with Gemini: ${(error as Error).message}`);
    }
  }
}