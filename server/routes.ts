import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { microsoftGraphService } from "./services/microsoft-graph";
import { openaiClassifierService } from "./services/openai-classifier";
import { emailParserService } from "./services/email-parser";
import { insertUserSchema, insertEmailScanSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Microsoft OAuth routes
  app.get("/api/auth/microsoft", async (req, res) => {
    try {
      const authUrl = microsoftGraphService.getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate auth URL" });
    }
  });

  app.post("/api/auth/callback", async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ message: "Authorization code required" });
      }

      const tokens = await microsoftGraphService.exchangeCodeForTokens(code);
      const userProfile = await microsoftGraphService.getUserProfile(tokens.accessToken);

      let user = await storage.getUserByEmail(userProfile.mail || userProfile.userPrincipalName);
      
      if (!user) {
        user = await storage.createUser({
          email: userProfile.mail || userProfile.userPrincipalName,
          microsoftId: userProfile.id
        });
      }

      const tokenExpiry = new Date(Date.now() + tokens.expiresIn * 1000);
      
      await storage.updateUser(user.id, {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiry
      });

      res.json({ user: { id: user.id, email: user.email } });
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  // Get current user
  app.get("/api/user/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ 
        id: user.id, 
        email: user.email,
        hasValidToken: user.accessToken && user.tokenExpiry && user.tokenExpiry > new Date()
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Start email scan
  app.post("/api/scan/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      let user = await storage.getUser(userId);
      
      // Create a test user if none exists (for development)
      if (!user && process.env.NODE_ENV === "development") {
        console.log("Creating test user for development");
        user = await storage.createUser({
          email: "test@example.com",
          microsoftId: "test_id"
        });
        user = await storage.updateUser(user.id, {
          accessToken: "test_token",
          refreshToken: "test_refresh",
          tokenExpiry: new Date(Date.now() + 3600000) // 1 hour from now
        });
        console.log("Test user created:", user.id);
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.accessToken || !user.tokenExpiry || user.tokenExpiry <= new Date()) {
        return res.status(401).json({ message: "Access token expired" });
      }

      // Create email scan record
      const scan = await storage.createEmailScan({
        userId,
        totalScanned: 0,
        detectedSpam: 0,
        unsubscribeLinks: 0,
        processed: 0,
        status: "pending"
      });

      // Start background processing
      processEmailScan(scan.id, user.accessToken).catch(console.error);

      res.json({ scanId: scan.id });
    } catch (error) {
      console.error("Scan error:", error);
      res.status(500).json({ message: "Failed to start email scan" });
    }
  });

  // Get scan results
  app.get("/api/scan/:scanId", async (req, res) => {
    try {
      const scanId = parseInt(req.params.scanId);
      const scan = await storage.getEmailScan(scanId);
      
      if (!scan) {
        return res.status(404).json({ message: "Scan not found" });
      }

      const emails = await storage.getSpamEmailsByScan(scanId);

      res.json({
        scan,
        emails: emails.map(email => ({
          id: email.id,
          sender: email.sender,
          subject: email.subject,
          aiConfidence: email.aiConfidence,
          hasUnsubscribeLink: email.hasUnsubscribeLink,
          isSelected: email.isSelected,
          receivedDate: email.receivedDate
        }))
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get scan results" });
    }
  });

  // Get latest scan for user
  app.get("/api/user/:userId/latest-scan", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const scan = await storage.getLatestEmailScan(userId);
      
      if (!scan) {
        return res.json({ scan: null, emails: [] });
      }

      const emails = await storage.getSpamEmailsByScan(scan.id);

      res.json({
        scan,
        emails: emails.map(email => ({
          id: email.id,
          sender: email.sender,
          subject: email.subject,
          aiConfidence: email.aiConfidence,
          hasUnsubscribeLink: email.hasUnsubscribeLink,
          isSelected: email.isSelected,
          receivedDate: email.receivedDate
        }))
      });
    } catch (error) {
      console.error("Failed to get latest scan:", error);
      res.status(500).json({ message: "Failed to get latest scan" });
    }
  });

  // Get email details
  app.get("/api/email/:emailId", async (req, res) => {
    try {
      const emailId = parseInt(req.params.emailId);
      const emails = Array.from(storage.spamEmails.values());
      const email = emails.find(e => e.id === emailId);
      
      if (!email) {
        return res.status(404).json({ message: "Email not found" });
      }

      res.json(email);
    } catch (error) {
      res.status(500).json({ message: "Failed to get email details" });
    }
  });

  // Update email selection and handle user feedback for learning
  app.patch("/api/email/:emailId", async (req, res) => {
    try {
      const emailId = parseInt(req.params.emailId);
      const { isSelected, userFeedback } = req.body;
      
      const email = await storage.updateSpamEmail(emailId, { isSelected, userFeedback });
      
      // If user provided feedback, update learning data
      if (userFeedback && userFeedback !== "uncertain") {
        const scan = await storage.getEmailScan(email.scanId);
        if (scan) {
          await storage.createUserLearningData({
            userId: scan.userId,
            senderPattern: email.sender,
            subjectPattern: email.subject,
            bodyKeywords: email.body ? email.body.toLowerCase().split(/\s+/).slice(0, 10) : [],
            userDecision: userFeedback,
            confidence: 75
          });
        }
      }
      
      res.json(email);
    } catch (error) {
      res.status(500).json({ message: "Failed to update email" });
    }
  });

  // Bulk update emails
  app.patch("/api/emails/bulk", async (req, res) => {
    try {
      const { emailIds, updates } = req.body;
      
      await storage.bulkUpdateSpamEmails(emailIds, updates);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to bulk update emails" });
    }
  });

  // Search emails
  app.get("/api/scan/:scanId/search", async (req, res) => {
    try {
      const scanId = parseInt(req.params.scanId);
      const query = req.query.q as string || "";
      
      const emails = await storage.searchSpamEmails(scanId, query);
      
      res.json({
        emails: emails.map(email => ({
          id: email.id,
          sender: email.sender,
          subject: email.subject,
          aiConfidence: email.aiConfidence,
          hasUnsubscribeLink: email.hasUnsubscribeLink,
          isSelected: email.isSelected,
          userFeedback: email.userFeedback,
          receivedDate: email.receivedDate
        }))
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to search emails" });
    }
  });

  // Get user learning data
  app.get("/api/user/:userId/learning", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const learningData = await storage.getUserLearningData(userId);
      
      res.json({ learningData });
    } catch (error) {
      res.status(500).json({ message: "Failed to get learning data" });
    }
  });

  // Process unsubscribes
  app.post("/api/process-unsubscribes/:scanId", async (req, res) => {
    try {
      const scanId = parseInt(req.params.scanId);
      const emails = await storage.getSpamEmailsByScan(scanId);
      const selectedEmails = emails.filter(email => email.isSelected && email.hasUnsubscribeLink);

      // Start background processing
      processUnsubscribes(selectedEmails).catch(console.error);

      res.json({ message: `Processing ${selectedEmails.length} unsubscribe requests` });
    } catch (error) {
      res.status(500).json({ message: "Failed to process unsubscribes" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Background processing functions
async function processEmailScan(scanId: number, accessToken: string) {
  const scanStartTime = Date.now();
  try {
    console.log(`🚀 [Scan] Starting email scan for scanId: ${scanId} at ${new Date().toISOString()}`);
    
    const fetchStartTime = Date.now();
    const emails = await microsoftGraphService.getSpamEmails(accessToken);
    const fetchTime = Date.now() - fetchStartTime;
    console.log(`📧 [Scan] Fetched ${emails.length} emails from spam folder in ${fetchTime}ms`);
    
    await storage.updateEmailScan(scanId, {
      totalScanned: emails.length,
      status: "processing"
    });

    let detectedSpam = 0;
    let unsubscribeLinksFound = 0;

    console.log(`🔄 [Scan] Starting individual email processing...`);
    
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      const emailStartTime = Date.now();
      
      console.log(`📨 [Email ${i + 1}/${emails.length}] Processing: "${email.subject}" from ${email.sender.emailAddress.address}`);
      
      const textBody = emailParserService.extractTextFromHtml(email.body.content);
      const bodyExtractionTime = Date.now() - emailStartTime;
      console.log(`📝 [Email ${i + 1}/${emails.length}] Text extracted in ${bodyExtractionTime}ms`);
      
      const classificationStartTime = Date.now();
      const classification = await openaiClassifierService.classifyEmail(
        email.sender.emailAddress.address,
        email.subject,
        textBody
      );
      const classificationTime = Date.now() - classificationStartTime;

      console.log(`🎯 [Email ${i + 1}/${emails.length}] AI Classification completed in ${classificationTime}ms: isSpam=${classification.isSpam}, confidence=${classification.confidence}%, reason="${classification.reasoning}"`);

      if (classification.isSpam) {
        detectedSpam++;
        
        const linkSearchStartTime = Date.now();
        const unsubscribeLinks = emailParserService.findUnsubscribeLinks(email.body.content);
        const linkSearchTime = Date.now() - linkSearchStartTime;
        
        const hasUnsubscribeLink = unsubscribeLinks.length > 0;
        console.log(`🔗 [Email ${i + 1}/${emails.length}] Found ${unsubscribeLinks.length} unsubscribe links in ${linkSearchTime}ms`);
        
        if (hasUnsubscribeLink) {
          unsubscribeLinksFound++;
        }

        const storageStartTime = Date.now();
        await storage.createSpamEmail({
          scanId,
          messageId: email.id,
          sender: email.sender.emailAddress.address,
          subject: email.subject,
          body: email.body.content,
          aiConfidence: classification.confidence,
          hasUnsubscribeLink,
          unsubscribeUrl: unsubscribeLinks[0]?.url || null,
          receivedDate: new Date(email.receivedDateTime)
        });
        const storageTime = Date.now() - storageStartTime;
        console.log(`💾 [Email ${i + 1}/${emails.length}] Stored in database in ${storageTime}ms`);
      }
      
      const totalEmailTime = Date.now() - emailStartTime;
      console.log(`✅ [Email ${i + 1}/${emails.length}] Completed in ${totalEmailTime}ms total`);
    }

    const totalScanTime = Date.now() - scanStartTime;
    console.log(`🎯 [Scan] Completed: ${detectedSpam}/${emails.length} emails classified as spam in ${totalScanTime}ms (${(totalScanTime / 1000).toFixed(1)}s)`);
    
    await storage.updateEmailScan(scanId, {
      detectedSpam,
      unsubscribeLinks: unsubscribeLinksFound,
      processed: 0, // Will be updated when unsubscribes are processed
      status: "completed"
    });
  } catch (error) {
    const totalScanTime = Date.now() - scanStartTime;
    console.error(`❌ [Scan] Error after ${totalScanTime}ms:`, error);
    await storage.updateEmailScan(scanId, {
      status: "failed"
    });
  }
}

async function processUnsubscribes(emails: any[]) {
  let processed = 0;
  
  for (const email of emails) {
    if (email.unsubscribeUrl) {
      try {
        const result = await emailParserService.processUnsubscribeLink(email.unsubscribeUrl);
        if (result.success) {
          processed++;
        }
        
        await storage.updateSpamEmail(email.id, {
          isProcessed: true
        });
      } catch (error) {
        console.error(`Failed to process unsubscribe for email ${email.id}:`, error);
      }
    }
  }
  
  console.log(`Processed ${processed} unsubscribe requests`);
}
