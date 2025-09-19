// Scan recovery service to resume interrupted scans
import { storage } from "../storage.js";
import { HuggingFaceClassifierService } from "./huggingface-classifier.js";
import { microsoftGraphService } from "./microsoft-graph.js";
import { gmailService } from "./gmail.js";
import { yahooMailService } from "./yahoo-mail.js";
import { emailParserService } from "./email-parser.js";

export class ScanRecoveryService {
  private static instance: ScanRecoveryService;
  private recoveryInProgress = false;

  static getInstance(): ScanRecoveryService {
    if (!ScanRecoveryService.instance) {
      ScanRecoveryService.instance = new ScanRecoveryService();
    }
    return ScanRecoveryService.instance;
  }

  async checkAndRecoverScans(): Promise<void> {
    if (this.recoveryInProgress) {
      console.log("🔄 [Recovery] Recovery already in progress, skipping");
      return;
    }

    try {
      this.recoveryInProgress = true;
      console.log("🔍 [Recovery] Checking for interrupted scans...");

      // Find all scans that are stuck in "processing" state
      const stuckScans = await storage.getStuckScans();
      
      if (stuckScans.length === 0) {
        console.log("✅ [Recovery] No interrupted scans found");
        return;
      }

      console.log(`🚨 [Recovery] Found ${stuckScans.length} interrupted scan(s), resuming...`);

      for (const scan of stuckScans) {
        try {
          await this.resumeScan(scan);
        } catch (error) {
          console.error(`❌ [Recovery] Failed to resume scan ${scan.id}:`, error);
          // Mark scan as failed if recovery fails
          await storage.updateEmailScan(scan.id, { status: "failed" });
        }
      }
    } catch (error) {
      console.error("❌ [Recovery] Error during scan recovery:", error);
    } finally {
      this.recoveryInProgress = false;
    }
  }

  private async resumeScan(scan: any): Promise<void> {
    console.log(`🔄 [Recovery] Resuming scan ${scan.id} for user ${scan.userId}`);

    // Get user details
    const user = await storage.getUser(scan.userId);
    if (!user) {
      throw new Error(`User ${scan.userId} not found`);
    }

    // Check if tokens are still valid
    if (user.tokenExpiry && new Date(user.tokenExpiry) <= new Date()) {
      console.log(`⚠️ [Recovery] Token expired for scan ${scan.id}, marking as failed`);
      await storage.updateEmailScan(scan.id, { status: "failed" });
      return;
    }

    // Resume the scan processing
    this.processEmailScanResume(scan.id, user.accessToken, user.provider).catch(error => {
      console.error(`❌ [Recovery] Background resume failed for scan ${scan.id}:`, error);
      storage.updateEmailScan(scan.id, { status: "failed" });
    });
  }

  private async processEmailScanResume(scanId: number, accessToken: string, provider: string): Promise<void> {
    const scanStartTime = Date.now();
    const maxProcessingTime = 10 * 60 * 1000; // 10 minutes maximum
    let processTimeout: NodeJS.Timeout;

    try {
      console.log(`🔄 [Recovery] Resuming email scan for scanId: ${scanId} with provider: ${provider}`);

      // Set a timeout for the entire process
      processTimeout = setTimeout(async () => {
        console.error(`⏰ [Recovery] Process timeout after ${maxProcessingTime / 1000}s, marking as failed`);
        await storage.updateEmailScan(scanId, { status: "failed" });
      }, maxProcessingTime);

      // Get current scan progress
      const currentScan = await storage.getEmailScan(scanId);
      if (!currentScan) {
        throw new Error(`Scan ${scanId} not found`);
      }

      // If scan was never started, fetch emails first
      if (currentScan.totalScanned === 0) {
        console.log(`📧 [Recovery] Fetching emails for scan ${scanId}`);
        
        let emails: any[] = [];
        if (provider === 'microsoft') {
          emails = await microsoftGraphService.getSpamEmails(accessToken, ['INBOX', 'SPAM']);
        } else if (provider === 'google') {
          emails = await gmailService.getSpamEmails(accessToken, ['INBOX', 'SPAM']);
        } else if (provider === 'yahoo') {
          console.log('⚠️ [Yahoo] Mail API access requires approval, returning empty array');
          emails = [];
        } else {
          throw new Error(`Unsupported provider: ${provider}`);
        }

        // Update scan with total count
        await storage.updateEmailScan(scanId, {
          totalScanned: emails.length,
          currentProgress: 0,
          status: "processing"
        });

        console.log(`📊 [Recovery] Updated scan ${scanId} with ${emails.length} total emails`);
      }

      // Get all emails for this scan (from previous attempt or just fetched)
      let emails: any[] = [];
      if (provider === 'microsoft') {
        emails = await microsoftGraphService.getSpamEmails(accessToken, ['INBOX', 'SPAM']);
      } else if (provider === 'google') {
        emails = await gmailService.getSpamEmails(accessToken, ['INBOX', 'SPAM']);
      }

      // Get already processed emails to skip them
      const processedEmails = await storage.getSpamEmailsByScan(scanId);
      const processedMessageIds = new Set(processedEmails.map(e => e.messageId));

      // Filter out already processed emails
      const remainingEmails = emails.filter(email => !processedMessageIds.has(email.id));
      const startIndex = emails.length - remainingEmails.length;

      console.log(`🔄 [Recovery] Resuming from email ${startIndex + 1}/${emails.length} (${remainingEmails.length} remaining)`);

      const aiClassifier = new HuggingFaceClassifierService();
      let detectedSpam = processedEmails.filter(e => e.aiStatus === "classified" && e.aiConfidence > 0).length;
      let unsubscribeLinksFound = processedEmails.filter(e => e.hasUnsubscribeLink).length;

      // Process remaining emails
      for (let i = 0; i < remainingEmails.length; i++) {
        const email = remainingEmails[i];
        const currentEmailIndex = startIndex + i;
        const emailStartTime = Date.now();

        console.log(`📨 [Recovery] [Email ${currentEmailIndex + 1}/${emails.length}] Processing: "${email.subject}" from ${email.sender.emailAddress.address}`);

        // Update progress
        await storage.updateEmailScan(scanId, {
          currentProgress: currentEmailIndex + 1
        });

        const textBody = emailParserService.extractTextFromHtml(email.body.content);
        
        let classification;
        try {
          classification = await aiClassifier.classifyEmail(
            email.sender.emailAddress.address,
            email.subject,
            textBody
          );
          console.log(`🎯 [Recovery] [Email ${currentEmailIndex + 1}/${emails.length}] AI Classification: isSpam=${classification.isSpam}, confidence=${classification.confidence}%`);
        } catch (error) {
          console.error(`❌ [Recovery] [Email ${currentEmailIndex + 1}/${emails.length}] AI Classification failed:`, error);
          classification = {
            isSpam: false,
            confidence: 0,
            reasoning: `AI classification failed: ${(error as Error).message}`
          };
        }

        // Save email if it's spam or has AI error
        const shouldSaveEmail = classification.isSpam || classification.confidence === 0;
        
        if (shouldSaveEmail) {
          if (classification.isSpam) {
            detectedSpam++;
          }

          const unsubscribeLinks = emailParserService.findUnsubscribeLinks(email.body.content);
          const hasUnsubscribeLink = unsubscribeLinks.length > 0;
          
          if (hasUnsubscribeLink) {
            unsubscribeLinksFound++;
          }

          const aiStatus = classification.confidence === 0 ? "error" : "classified";
          
          await storage.createSpamEmail({
            scanId,
            messageId: email.id,
            sender: email.sender.emailAddress.address,
            subject: email.subject,
            body: email.body.content,
            aiConfidence: classification.confidence,
            hasUnsubscribeLink,
            unsubscribeUrl: unsubscribeLinks[0]?.url || null,
            aiStatus,
            receivedDate: new Date(email.receivedDateTime)
          });
        }

        const emailTime = Date.now() - emailStartTime;
        console.log(`✅ [Recovery] [Email ${currentEmailIndex + 1}/${emails.length}] Completed in ${emailTime}ms`);
      }

      // Clear timeout and mark as completed
      clearTimeout(processTimeout);
      
      const totalTime = Date.now() - scanStartTime;
      console.log(`🎯 [Recovery] Scan ${scanId} completed: ${detectedSpam}/${emails.length} emails classified as spam in ${totalTime}ms`);

      await storage.updateEmailScan(scanId, {
        detectedSpam,
        unsubscribeLinks: unsubscribeLinksFound,
        processed: 0,
        status: "completed"
      });

    } catch (error) {
      const totalTime = Date.now() - scanStartTime;
      console.error(`❌ [Recovery] Error resuming scan ${scanId} after ${totalTime}ms:`, error);
      
      if (processTimeout) clearTimeout(processTimeout);
      
      await storage.updateEmailScan(scanId, {
        status: "failed"
      });
    }
  }
}

// Export singleton instance
export const scanRecoveryService = ScanRecoveryService.getInstance();