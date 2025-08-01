// Simple AI classifier with fixed 5-second delays between requests
export interface SpamClassificationResult {
  isSpam: boolean;
  confidence: number; // 0-100
  reasoning: string;
}

export class SimpleAIClassifierService {
  private lastRequestTime = 0;
  private readonly DELAY_BETWEEN_REQUESTS = 5000; // 5 seconds

  async classifyEmail(sender: string, subject: string, body: string): Promise<SpamClassificationResult> {
    const classificationStartTime = Date.now();
    console.log(`🧠 [AI] Starting classification for email: "${subject}" from ${sender}`);
    
    // Ensure 5-second delay between requests
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.DELAY_BETWEEN_REQUESTS && this.lastRequestTime > 0) {
      const waitTime = this.DELAY_BETWEEN_REQUESTS - timeSinceLastRequest;
      console.log(`⏱️ [AI] Waiting ${Math.ceil(waitTime/1000)}s before next request...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    try {
      console.log(`📤 [AI] Sending request to OpenRouter...`);
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://spamsweeper.onrender.com',
          'X-Title': 'Spam Sweeper',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat-v3-0324:free',
          messages: [
            {
              role: 'system',
              content: `You are a spam email classifier. Analyze emails and respond with a JSON object containing:
- "isSpam": boolean (true if spam, false if legitimate)
- "confidence": number 0-100 (how confident you are)
- "reasoning": string (brief explanation)

Consider spam indicators: suspicious senders, promotional language, urgent calls to action, suspicious links, poor grammar, etc.`
            },
            {
              role: 'user',
              content: `Analyze this email:

From: ${sender}
Subject: ${subject}
Body: ${body.substring(0, 2000)}` // Limit body to 2000 chars
            }
          ],
          temperature: 0.1,
        }),
      });

      this.lastRequestTime = Date.now();
      const responseTime = Date.now() - classificationStartTime;
      
      if (!response.ok) {
        console.error(`❌ [AI] API error: ${response.status} ${response.statusText}`);
        throw new Error(`AI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`📡 [AI] Response received in ${responseTime}ms`);

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid API response structure');
      }

      const content = data.choices[0].message.content;
      
      try {
        const result = JSON.parse(content);
        
        // Validate the response structure
        if (typeof result.isSpam !== 'boolean' || 
            typeof result.confidence !== 'number' || 
            typeof result.reasoning !== 'string') {
          throw new Error('Invalid response format from AI');
        }

        // Ensure confidence is within valid range
        result.confidence = Math.max(0, Math.min(100, result.confidence));

        const totalTime = Date.now() - classificationStartTime;
        console.log(`✅ [AI] Classification completed in ${totalTime}ms: ${result.isSpam ? 'SPAM' : 'NOT SPAM'} (${result.confidence}% confidence)`);
        
        return result;
      } catch (parseError) {
        console.error('❌ [AI] Failed to parse AI response:', content);
        throw new Error('Failed to parse AI response as JSON');
      }

    } catch (error) {
      const totalTime = Date.now() - classificationStartTime;
      console.error(`❌ [AI] Error classifying email after ${totalTime}ms:`, error);
      throw new Error(`Failed to classify email: ${(error as Error).message}`);
    }
  }
}