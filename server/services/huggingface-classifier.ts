// Lightweight spam classifier service - memory-optimized for Render hosting
// Note: HuggingFace models disabled due to memory constraints on Render platform

export interface SpamClassificationResult {
  isSpam: boolean;
  confidence: number; // 0-100
  reasoning: string;
}

export class HuggingFaceClassifierService {
  private readonly DELAY_BETWEEN_REQUESTS = 1000; // 1 second delay to maintain timing compatibility

  /**
   * Lightweight pattern-based spam classification (memory-optimized for Render)
   * Uses rule-based patterns instead of large ML models to avoid memory issues
   */
  private classifyWithPatterns(sender: string, subject: string, body: string): SpamClassificationResult {
    const text = `${sender} ${subject} ${body}`.toLowerCase();
    
    // Common spam indicators
    const spamPatterns = [
      // Money/financial spam
      /\b(lottery|winner|prize|million|billion|inheritance|beneficiary|fund transfer)\b/i,
      /\b(urgent.{0,10}payment|claim.{0,10}prize|financial.{0,10}assistance)\b/i,
      /\b(wire transfer|bank account|routing number|swift code)\b/i,
      
      // Pharmaceutical/health spam
      /\b(viagra|cialis|pharmacy|medication|prescription|weight.{0,10}loss)\b/i,
      /\b(male enhancement|penis enlargement|sexual enhancement)\b/i,
      
      // Suspicious urgent language
      /\b(act now|limited time|urgent|immediate|expire|deadline)\b/i,
      /\b(click here|download now|free trial|no obligation)\b/i,
      
      // Suspicious sender patterns
      /noreply.*@.*\.(tk|ml|ga|cf)$/i, // Free TLD domains
      /\b(admin|support|noreply)@[a-z0-9-]+\.(tk|ml|ga|cf|biz|info)$/i,
      
      // Investment/crypto spam
      /\b(investment|forex|bitcoin|cryptocurrency|trading|roi)\b/i,
      /\b(profit|guaranteed|returns|double your money)\b/i,
    ];
    
    let spamScore = 0;
    const matchedPatterns: string[] = [];
    
    for (const pattern of spamPatterns) {
      if (pattern.test(text)) {
        spamScore += 15; // Each pattern adds to spam score
        matchedPatterns.push(pattern.source);
      }
    }
    
    // Additional scoring factors
    if (subject.includes('RE:') && !text.includes('previous conversation')) {
      spamScore += 10; // Fake reply subjects
    }
    
    if (text.includes('!!!') || text.match(/[!]{3,}/)) {
      spamScore += 5; // Excessive exclamation marks
    }
    
    if (text.match(/[A-Z]{10,}/)) {
      spamScore += 10; // Excessive caps
    }
    
    // Determine classification
    const isSpam = spamScore >= 30; // Threshold for spam classification
    const confidence = Math.min(spamScore, 95); // Cap at 95% confidence
    
    let reasoning: string;
    if (isSpam) {
      reasoning = `Pattern-based spam detection (${matchedPatterns.length} spam indicators found, score: ${spamScore})`;
    } else if (spamScore > 0) {
      reasoning = `Some suspicious patterns detected but below spam threshold (score: ${spamScore})`;
    } else {
      reasoning = `No spam patterns detected in content analysis`;
    }
    
    return {
      isSpam,
      confidence,
      reasoning
    };
  }

  /**
   * Classify email as spam or not spam using lightweight pattern matching
   * (Memory-optimized alternative to HuggingFace models for Render hosting)
   */
  async classifyEmail(sender: string, subject: string, body: string): Promise<SpamClassificationResult> {
    const classificationStartTime = Date.now();
    console.log(`🧠 [HF] Starting lightweight pattern-based classification for email: "${subject}" from ${sender}`);

    try {
      // Use pattern-based classification instead of downloading large models
      const result = this.classifyWithPatterns(sender, subject, body);
      
      const totalTime = Date.now() - classificationStartTime;
      console.log(`✅ [HF] Pattern-based classification completed in ${totalTime}ms: ${result.isSpam ? 'SPAM' : 'NOT SPAM'} (${result.confidence}% confidence)`);
      console.log(`🔍 [HF] Reasoning: ${result.reasoning}`);
      
      // Short delay to maintain timing compatibility with previous implementation
      if (this.DELAY_BETWEEN_REQUESTS > 0) {
        console.log(`⏱️ [HF] Waiting ${this.DELAY_BETWEEN_REQUESTS}ms before next request...`);
        await new Promise(resolve => setTimeout(resolve, this.DELAY_BETWEEN_REQUESTS));
      }
      
      return result;

    } catch (error) {
      const totalTime = Date.now() - classificationStartTime;
      console.error(`❌ [HF] Error in pattern-based classification after ${totalTime}ms:`, error);
      
      // Fallback to safe default
      return {
        isSpam: false,
        confidence: 0,
        reasoning: `Pattern classification failed: ${(error as Error).message}`
      };
    }
  }

  /**
   * Clean up resources (optional - for graceful shutdown)
   * Note: No cleanup needed for pattern-based classification
   */
  static async cleanup() {
    console.log(`🧹 [HF] Lightweight classifier - no cleanup needed`);
  }
}