// Mistral AI spam classifier service
// Using FREE open-mistral-7b model for spam classification
import axios from 'axios';

export interface SpamClassificationResult {
  isSpam: boolean;
  confidence: number; // 0-100
  reasoning: string;
}

export class MistralClassifierService {
  private readonly DELAY_BETWEEN_REQUESTS = 2000; // 2 seconds delay for rate limiting
  private readonly API_BASE_URL = 'https://api.mistral.ai/v1';

  constructor() {
    if (!process.env.AI_KEY) {
      throw new Error('AI_KEY environment variable is required for Mistral AI');
    }
  }

  async classifyEmail(sender: string, subject: string, body: string): Promise<SpamClassificationResult> {
    const classificationStartTime = Date.now();
    console.log(`🧠 [Mistral] Starting classification for email: "${subject}" from ${sender}`);

    try {
      console.log(`📤 [Mistral] Sending request to Mistral AI...`);
      
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

Analyze the complete context and content carefully. Respond only with the JSON object, no additional text.`;

      const emailContent = `Analyze this email for spam classification:

From: ${sender}
Subject: ${subject}
Body: ${body.substring(0, 2000)}`; // Limit body to 2000 chars

      const response = await axios.post(
        `${this.API_BASE_URL}/chat/completions`,
        {
          model: 'open-mistral-7b', // Using the free Mistral model
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: emailContent
            }
          ],
          response_format: { type: 'json_object' },
          max_tokens: 1000,
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.AI_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      const responseTime = Date.now() - classificationStartTime;
      console.log(`📡 [Mistral] Response received in ${responseTime}ms`);

      const rawJson = response.data.choices[0]?.message?.content;
      
      if (!rawJson) {
        throw new Error('Empty response from Mistral AI');
      }

      try {
        const result: SpamClassificationResult = JSON.parse(rawJson);
        
        // Validate the response structure
        if (typeof result.isSpam !== 'boolean' || 
            typeof result.confidence !== 'number' || 
            typeof result.reasoning !== 'string') {
          throw new Error('Invalid response format from Mistral AI');
        }

        // Ensure confidence is within valid range
        result.confidence = Math.max(0, Math.min(100, Math.round(result.confidence)));

        const totalTime = Date.now() - classificationStartTime;
        console.log(`✅ [Mistral] Classification completed in ${totalTime}ms: ${result.isSpam ? 'SPAM' : 'NOT SPAM'} (${result.confidence}% confidence)`);
        console.log(`🔍 [Mistral] Reasoning: ${result.reasoning}`);
        
        // Wait before allowing next request (rate limit protection)
        if (this.DELAY_BETWEEN_REQUESTS > 0) {
          console.log(`⏱️ [Mistral] Waiting ${this.DELAY_BETWEEN_REQUESTS}ms before next request...`);
          await new Promise(resolve => setTimeout(resolve, this.DELAY_BETWEEN_REQUESTS));
        }
        
        return result;
      } catch (parseError) {
        console.error('❌ [Mistral] Failed to parse AI response:', rawJson);
        throw new Error('Failed to parse Mistral AI response as JSON');
      }

    } catch (error) {
      const totalTime = Date.now() - classificationStartTime;
      
      if (axios.isAxiosError(error)) {
        console.error(`❌ [Mistral] HTTP Error after ${totalTime}ms:`, {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        throw new Error(`Mistral AI API error: ${error.response?.status || 'Unknown'} - ${error.response?.statusText || error.message}`);
      } else {
        console.error(`❌ [Mistral] Error classifying email after ${totalTime}ms:`, error);
        throw new Error(`Failed to classify email with Mistral AI: ${(error as Error).message}`);
      }
    }
  }
}