// Hugging Face BERT MoE spam classifier service
import { pipeline, env } from '@huggingface/transformers';

// Configure cache directory for models
env.cacheDir = './.cache/huggingface';

// Force CPU-only execution (no CUDA on Render)
env.backends.onnx.wasm.numThreads = 1;
env.onnxProxyExecutionProviders = ['CPUExecutionProvider'];

export interface SpamClassificationResult {
  isSpam: boolean;
  confidence: number; // 0-100
  reasoning: string;
}

export class HuggingFaceClassifierService {
  private static instance: any = null;
  private static readonly MODEL_NAME = 'Xenova/toxic-bert';
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
            device: 'cpu', // Force CPU execution (Render doesn't support CUDA)
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
      
      // Process the result - this is a toxicity model, we'll use toxic content as spam indicator
      let isSpam: boolean;
      let confidence: number;
      let reasoning: string;
      
      if (Array.isArray(result) && result.length > 0) {
        // Find toxicity predictions - this model returns TOXIC/NOT_TOXIC labels
        const toxicResult = result.find(r => r.label === 'TOXIC');
        const notToxicResult = result.find(r => r.label === 'NOT_TOXIC');
        
        if (toxicResult && toxicResult.score > 0.6) {
          // High toxicity often indicates spam (aggressive marketing, scams, phishing, etc.)
          isSpam = true;
          confidence = Math.round(toxicResult.score * 100);
          reasoning = `Detected toxic language patterns commonly found in spam emails (${confidence}% toxic content)`;
        } else if (notToxicResult && notToxicResult.score > 0.7) {
          // Low toxicity is usually legitimate
          isSpam = false;
          confidence = Math.round(notToxicResult.score * 100);
          reasoning = `Clean language detected, indicating legitimate email (${confidence}% non-toxic content)`;
        } else {
          // Borderline toxicity - conservative approach, lean towards not spam
          const topResult = result[0];
          isSpam = false; // Default to not spam for borderline cases
          confidence = Math.round(topResult.score * 100);
          reasoning = `Borderline toxicity analysis, defaulting to legitimate (${topResult.label}: ${confidence}%)`;
        }
      } else {
        throw new Error('Invalid response format from toxicity classifier');
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