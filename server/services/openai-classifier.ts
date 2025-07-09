import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface SpamClassificationResult {
  isSpam: boolean;
  confidence: number; // 0-100
  reasoning: string;
}

export class OpenAIClassifierService {
  async classifyEmail(sender: string, subject: string, body: string): Promise<SpamClassificationResult> {
    try {
      const prompt = `
You are an expert email spam classifier. Analyze the following email and determine if it's spam or legitimate.

Email Details:
- Sender: ${sender}
- Subject: ${subject}
- Body: ${body.substring(0, 2000)} ${body.length > 2000 ? '...(truncated)' : ''}

Analyze this email for spam indicators such as:
- Excessive promotional language
- Suspicious sender domains
- Phishing attempts
- Misleading subject lines
- Poor grammar/spelling
- Urgency tactics
- Too-good-to-be-true offers
- Suspicious links

Respond with JSON in this exact format:
{
  "isSpam": boolean,
  "confidence": number (0-100),
  "reasoning": "Brief explanation of your decision"
}
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert email spam classifier. Analyze emails and provide structured responses in JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1, // Low temperature for consistent results
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        isSpam: Boolean(result.isSpam),
        confidence: Math.max(0, Math.min(100, Number(result.confidence) || 0)),
        reasoning: String(result.reasoning || 'No reasoning provided')
      };
    } catch (error) {
      console.error('Error classifying email with OpenAI:', error);
      throw new Error('Failed to classify email: ' + (error as Error).message);
    }
  }

  async batchClassifyEmails(emails: Array<{ sender: string; subject: string; body: string }>): Promise<SpamClassificationResult[]> {
    const results: SpamClassificationResult[] = [];
    
    // Process emails in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const batchPromises = batch.map(email => 
        this.classifyEmail(email.sender, email.subject, email.body)
      );
      
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      } catch (error) {
        console.error(`Error processing batch ${i / batchSize + 1}:`, error);
        // Add fallback results for failed batch
        const fallbackResults = batch.map(() => ({
          isSpam: false,
          confidence: 0,
          reasoning: 'Classification failed'
        }));
        results.push(...fallbackResults);
      }
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }
}

export const openaiClassifierService = new OpenAIClassifierService();
