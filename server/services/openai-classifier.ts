// Using OpenRouter with free models for spam classification
interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

async function callOpenRouter(messages: Array<{ role: string; content: string }>): Promise<OpenRouterResponse> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://spamsweeper.onrender.com', // Your site URL
      'X-Title': 'Spam Sweeper', // Your app name
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.1-8b-instruct:free', // Free Llama model
      messages: messages,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

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
      let result;
      
      try {
        // Extract JSON from response if it's wrapped in markdown
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : content;
        result = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error('Error parsing OpenRouter response:', parseError);
        // Fallback: try to extract info manually
        const isSpam = content.toLowerCase().includes('"isspam": true') || 
                      content.toLowerCase().includes('spam') && !content.toLowerCase().includes('not spam');
        return {
          isSpam,
          confidence: isSpam ? 75 : 25,
          reasoning: 'AI response parsing failed, fallback classification used'
        };
      }
      
      return {
        isSpam: Boolean(result.isSpam),
        confidence: Math.max(0, Math.min(100, Number(result.confidence) || 0)),
        reasoning: String(result.reasoning || 'No reasoning provided')
      };
    } catch (error) {
      console.error('Error classifying email with OpenRouter:', error);
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
