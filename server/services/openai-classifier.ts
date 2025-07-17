// Using OpenRouter with free models for spam classification
interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// Rate limiting for OpenRouter free tier
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 15; // Conservative limit for free tier
  private readonly timeWindow = 60000; // 1 minute in milliseconds

  async waitForSlot(): Promise<void> {
    const now = Date.now();
    
    // Remove old requests outside the time window
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      // Calculate wait time until oldest request expires
      const waitTime = this.timeWindow - (now - this.requests[0]) + 1000; // Add 1 second buffer
      console.log(`⏱️ [OpenRouter] Rate limit reached, waiting ${Math.ceil(waitTime / 1000)}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.waitForSlot(); // Recursively check again
    }
    
    this.requests.push(now);
  }
}

const rateLimiter = new RateLimiter();

async function callOpenRouter(messages: Array<{ role: string; content: string }>, retryCount = 0): Promise<OpenRouterResponse> {
  const maxRetries = 3;
  const startTime = Date.now();
  
  try {
    // Wait for rate limit slot
    await rateLimiter.waitForSlot();
    
    console.log(`🔄 [OpenRouter] Starting API call at ${new Date().toISOString()}`);
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://spamsweeper.onrender.com', // Your site URL
        'X-Title': 'Spam Sweeper', // Your app name
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3-0324:free', // Free Deepseek model
        messages: messages,
        temperature: 0.1,
      }),
    });

    const responseTime = Date.now() - startTime;
    console.log(`📡 [OpenRouter] API response received in ${responseTime}ms`);

    if (!response.ok) {
      if (response.status === 429 && retryCount < maxRetries) {
        const waitTime = Math.pow(2, retryCount) * 5000; // Exponential backoff: 5s, 10s, 20s
        console.log(`⏳ [OpenRouter] Rate limited, retrying in ${waitTime/1000}s (attempt ${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return callOpenRouter(messages, retryCount + 1);
      }
      
      console.error(`❌ [OpenRouter] API error: ${response.status} ${response.statusText}`);
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const jsonResponse = await response.json();
    console.log(`✅ [OpenRouter] JSON parsed successfully in ${Date.now() - startTime}ms total`);
    
    return jsonResponse;
  } catch (error) {
    if (retryCount < maxRetries && (error as Error).message.includes('429')) {
      const waitTime = Math.pow(2, retryCount) * 5000;
      console.log(`⏳ [OpenRouter] Retrying after error in ${waitTime/1000}s (attempt ${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return callOpenRouter(messages, retryCount + 1);
    }
    throw error;
  }
}

export interface SpamClassificationResult {
  isSpam: boolean;
  confidence: number; // 0-100
  reasoning: string;
}

export class OpenAIClassifierService {
  async classifyEmail(sender: string, subject: string, body: string): Promise<SpamClassificationResult> {
    const classificationStartTime = Date.now();
    console.log(`🧠 [AI] Starting classification for email: "${subject}" from ${sender}`);
    
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

      console.log(`📤 [AI] Sending request to OpenRouter...`);
      const response = await callOpenRouter([
        {
          role: "system",
          content: "You are an expert email spam classifier. Analyze emails and provide structured responses in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ]);

      const content = response.choices[0].message.content || '{}';
      console.log(`📥 [AI] Received response: ${content.substring(0, 200)}...`);
      
      let result;
      
      try {
        // Extract JSON from response if it's wrapped in markdown
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : content;
        result = JSON.parse(jsonStr);
        console.log(`✅ [AI] Successfully parsed JSON response`);
      } catch (parseError) {
        console.error('❌ [AI] Error parsing OpenRouter response:', parseError);
        console.error('❌ [AI] Raw response content:', content);
        // Fallback: try to extract info manually
        const isSpam = content.toLowerCase().includes('"isspam": true') || 
                      content.toLowerCase().includes('spam') && !content.toLowerCase().includes('not spam');
        console.log(`🔄 [AI] Using fallback classification: isSpam=${isSpam}`);
        return {
          isSpam,
          confidence: isSpam ? 75 : 25,
          reasoning: 'AI response parsing failed, fallback classification used'
        };
      }
      
      const finalResult = {
        isSpam: Boolean(result.isSpam),
        confidence: Math.max(0, Math.min(100, Number(result.confidence) || 0)),
        reasoning: String(result.reasoning || 'No reasoning provided')
      };
      
      const totalTime = Date.now() - classificationStartTime;
      console.log(`🎯 [AI] Classification completed in ${totalTime}ms: isSpam=${finalResult.isSpam}, confidence=${finalResult.confidence}%`);
      
      return finalResult;
    } catch (error) {
      const totalTime = Date.now() - classificationStartTime;
      console.error(`❌ [AI] Error classifying email after ${totalTime}ms:`, error);
      throw new Error('Failed to classify email: ' + (error as Error).message);
    }
  }

  async batchClassifyEmails(emails: Array<{ sender: string; subject: string; body: string }>): Promise<SpamClassificationResult[]> {
    const batchStartTime = Date.now();
    console.log(`🔄 [Batch] Starting batch classification of ${emails.length} emails`);
    
    const results: SpamClassificationResult[] = [];
    
    // Process emails one by one to avoid rate limits with free tier
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      const emailNumber = i + 1;
      
      console.log(`📧 [${emailNumber}/${emails.length}] Processing email from ${email.sender}: "${email.subject}"`);
      
      try {
        const result = await this.classifyEmail(email.sender, email.subject, email.body);
        results.push(result);
        console.log(`✅ [${emailNumber}/${emails.length}] Classification completed: ${result.isSpam ? 'SPAM' : 'NOT SPAM'} (${result.confidence}%)`);
      } catch (error) {
        console.error(`❌ [${emailNumber}/${emails.length}] Error classifying email:`, error);
        // Add fallback result for failed email
        const fallbackResult = {
          isSpam: false,
          confidence: 0,
          reasoning: 'Classification failed: ' + (error as Error).message
        };
        results.push(fallbackResult);
      }
      
      // Add small delay between individual emails for safety
      if (i < emails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    const totalTime = Date.now() - batchStartTime;
    console.log(`🎯 [Batch] All batches completed in ${totalTime}ms (${(totalTime / 1000).toFixed(1)}s)`);
    
    return results;
  }
}

export const openaiClassifierService = new OpenAIClassifierService();
