// Hugging Face BERT MoE spam classifier service
import { pipeline, env } from '@huggingface/transformers';

// Configure cache directory for models
env.cacheDir = './.cache/huggingface';

export interface SpamClassificationResult {
  isSpam: boolean;
  confidence: number; // 0-100
  reasoning: string;
}

export class HuggingFaceClassifierService {
  private static instance: any = null;
  private static readonly MODEL_NAME = 'Xenova/distilbert-base-uncased-finetuned-sst-2-english';
  private readonly DELAY_BETWEEN_REQUESTS = 1000; // 1 second delay (much faster than OpenRouter)

  /**
   * Get or create the classifier pipeline instance (singleton pattern)
   */
  private async getClassifierPipeline() {
    if (HuggingFaceClassifierService.instance === null) {
      console.log(`🤖 [HF] Initializing safe Hugging Face classifier: ${HuggingFaceClassifierService.MODEL_NAME}`);
      try {
        HuggingFaceClassifierService.instance = await pipeline(
          'text-classification', 
          HuggingFaceClassifierService.MODEL_NAME,
          {
            revision: 'main',
            device: 'auto', // Use GPU if available, fallback to CPU
          }
        );
        console.log(`✅ [HF] Classifier initialized successfully`);
      } catch (error) {
        console.error(`❌ [HF] Failed to initialize classifier:`, error);
        throw new Error(`Failed to initialize Hugging Face classifier: ${(error as Error).message}`);
      }
    }
    return HuggingFaceClassifierService.instance;
  }

  /**
   * Classify email as spam or not spam
   */
  async classifyEmail(sender: string, subject: string, body: string): Promise<SpamClassificationResult> {
    const classificationStartTime = Date.now();
    console.log(`🧠 [HF] Starting classification for email: "${subject}" from ${sender}`);

    try {
      const classifier = await this.getClassifierPipeline();
      
      // Combine email parts into a single text for classification
      // Limit the text to prevent memory issues
      const emailText = `From: ${sender}\nSubject: ${subject}\nBody: ${body.substring(0, 1500)}`;
      
      console.log(`📤 [HF] Sending text to BERT classifier...`);
      
      const result = await classifier(emailText);
      const responseTime = Date.now() - classificationStartTime;
      
      console.log(`📡 [HF] Response received in ${responseTime}ms:`, result);
      
      // Process the result - this is a sentiment model, we'll use negative sentiment as spam indicator
      let isSpam: boolean;
      let confidence: number;
      let reasoning: string;
      
      if (Array.isArray(result) && result.length > 0) {
        // Find sentiment predictions - this model returns POSITIVE/NEGATIVE labels
        const negativeResult = result.find(r => r.label === 'NEGATIVE');
        const positiveResult = result.find(r => r.label === 'POSITIVE');
        
        if (negativeResult && negativeResult.score > 0.7) {
          // High negative sentiment often indicates spam (aggressive marketing, scams, etc.)
          isSpam = true;
          confidence = Math.round(negativeResult.score * 100);
          reasoning = `Detected negative sentiment patterns often associated with spam (${confidence}% negative sentiment)`;
        } else if (positiveResult && positiveResult.score > 0.8) {
          // High positive sentiment is usually legitimate
          isSpam = false;
          confidence = Math.round(positiveResult.score * 100);
          reasoning = `Detected positive sentiment indicating legitimate email (${confidence}% positive sentiment)`;
        } else {
          // Neutral/mixed sentiment - conservative approach, lean towards not spam
          const topResult = result[0];
          isSpam = false; // Default to not spam for borderline cases
          confidence = Math.round(topResult.score * 100);
          reasoning = `Mixed sentiment analysis, defaulting to legitimate (${topResult.label}: ${confidence}%)`;
        }
      } else {
        throw new Error('Invalid response format from sentiment classifier');
      }

      const totalTime = Date.now() - classificationStartTime;
      console.log(`✅ [HF] Classification completed in ${totalTime}ms: ${isSpam ? 'SPAM' : 'NOT SPAM'} (${confidence}% confidence)`);
      
      // Short delay to prevent overwhelming the system
      if (this.DELAY_BETWEEN_REQUESTS > 0) {
        console.log(`⏱️ [HF] Waiting ${this.DELAY_BETWEEN_REQUESTS}ms before next request...`);
        await new Promise(resolve => setTimeout(resolve, this.DELAY_BETWEEN_REQUESTS));
      }
      
      return {
        isSpam,
        confidence,
        reasoning
      };

    } catch (error) {
      const totalTime = Date.now() - classificationStartTime;
      console.error(`❌ [HF] Error classifying email after ${totalTime}ms:`, error);
      throw new Error(`Failed to classify email with Hugging Face: ${(error as Error).message}`);
    }
  }

  /**
   * Clean up resources (optional - for graceful shutdown)
   */
  static async cleanup() {
    if (HuggingFaceClassifierService.instance) {
      console.log(`🧹 [HF] Cleaning up classifier instance`);
      HuggingFaceClassifierService.instance = null;
    }
  }
}