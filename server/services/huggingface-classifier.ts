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
  private static readonly MODEL_NAME = 'AntiSpamInstitute/spam-detector-bert-MoE-v2.2';
  private readonly DELAY_BETWEEN_REQUESTS = 1000; // 1 second delay (much faster than OpenRouter)

  /**
   * Get or create the classifier pipeline instance (singleton pattern)
   */
  private async getClassifierPipeline() {
    if (HuggingFaceClassifierService.instance === null) {
      console.log(`🤖 [HF] Initializing Hugging Face classifier: ${HuggingFaceClassifierService.MODEL_NAME}`);
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
      
      // Process the result - the model should return an array with classification results
      let isSpam: boolean;
      let confidence: number;
      let reasoning: string;
      
      if (Array.isArray(result) && result.length > 0) {
        // Find the spam prediction
        const spamResult = result.find(r => r.label.toLowerCase().includes('spam') || r.label === '1' || r.label === 'LABEL_1');
        const hamResult = result.find(r => r.label.toLowerCase().includes('ham') || r.label === '0' || r.label === 'LABEL_0');
        
        if (spamResult) {
          isSpam = true;
          confidence = Math.round(spamResult.score * 100);
          reasoning = `BERT classifier detected spam patterns with ${confidence}% confidence (label: ${spamResult.label})`;
        } else if (hamResult) {
          isSpam = false;
          confidence = Math.round(hamResult.score * 100);
          reasoning = `BERT classifier detected legitimate email with ${confidence}% confidence (label: ${hamResult.label})`;
        } else {
          // Fallback - use highest scoring result
          const topResult = result[0];
          const isSpamLabel = topResult.label.toLowerCase().includes('spam') || topResult.label === '1' || topResult.label === 'LABEL_1';
          
          isSpam = isSpamLabel;
          confidence = Math.round(topResult.score * 100);
          reasoning = `BERT classifier result: ${topResult.label} with ${confidence}% confidence`;
        }
      } else {
        throw new Error('Invalid response format from BERT classifier');
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