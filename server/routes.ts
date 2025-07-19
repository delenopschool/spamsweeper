import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { microsoftGraphService } from "./services/microsoft-graph";
import { gmailService } from "./services/gmail";
import { yahooMailService } from "./services/yahoo-mail";
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

  // Google OAuth routes
  app.get("/api/auth/google", async (req, res) => {
    try {
      const authUrl = gmailService.getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate auth URL" });
    }
  });

  // Yahoo OAuth routes
  app.get("/api/auth/yahoo", async (req, res) => {
    try {
      const authUrl = yahooMailService.getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate auth URL" });
    }
  });

  // Google OAuth callback route
  app.get("/auth/google/callback", async (req, res) => {
    try {
      const { code } = req.query;
      
      console.log("🔐 [Google] Callback received with code:", !!code);
      
      if (!code) {
        console.log("❌ [Google] No authorization code received");
        return res.redirect("/?error=no_code");
      }

      console.log("🔐 [Google] Exchanging code for tokens...");
      const tokens = await gmailService.exchangeCodeForTokens(code as string);
      console.log("🔐 [Google] Tokens received successfully");
      
      console.log("🔐 [Google] Getting user profile...");
      const userProfile = await gmailService.getUserProfile(tokens.accessToken);
      console.log("🔐 [Google] User profile received:", { 
        id: userProfile.id, 
        email: userProfile.mail 
      });
      
      let user = await storage.getUserByGoogleId(userProfile.id);
      console.log("🔐 [Google] Existing user found:", !!user);
      
      if (!user) {
        // Check if user exists with same email but different provider
        const existingUser = await storage.getUserByEmail(userProfile.mail);
        if (existingUser) {
          console.log("🔐 [Google] Updating existing user to Google provider...");
          user = await storage.updateUser(existingUser.id, {
            googleId: userProfile.id,
            provider: 'google'
          });
        } else {
          console.log("🔐 [Google] Creating new user...");
          user = await storage.createUser({
            email: userProfile.mail,
            googleId: userProfile.id,
            provider: 'google'
          });
        }
        console.log("🔐 [Google] User processed successfully:", user.id);
      }

      const tokenExpiry = new Date(Date.now() + tokens.expiresIn * 1000);
      
      console.log("🔐 [Google] Updating user tokens...");
      await storage.updateUser(user.id, {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiry
      });

      console.log("🔐 [Google] Redirecting to auth callback...");
      // Redirect to auth callback page with user ID
      res.redirect(`/auth-callback?userId=${user.id}&provider=google`);
    } catch (error) {
      console.error("Google OAuth callback error:", error);
      console.error("Error stack:", error.stack);
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        hasCode: !!req.query.code
      });
      res.redirect("/?error=auth_failed");
    }
  });

  app.get("/auth/yahoo/callback", async (req, res) => {
    try {
      const { code, error: authError, state } = req.query;
      
      console.log("🔐 [Yahoo] Callback received:", {
        code: !!code,
        error: authError,
        state: state,
        fullQuery: req.query
      });
      
      if (authError) {
        console.log("❌ [Yahoo] OAuth error:", authError);
        return res.redirect(`/?error=${encodeURIComponent('Yahoo authentication failed: ' + authError)}`);
      }
      
      if (!code) {
        console.log("❌ [Yahoo] No authorization code received");
        return res.redirect("/?error=no_code");
      }

      console.log("🔐 [Yahoo] Exchanging code for tokens...");
      const tokens = await yahooMailService.exchangeCodeForTokens(code as string);
      console.log("🔐 [Yahoo] Tokens received:", tokens ? 'SUCCESS' : 'FAILED');
      
      if (!tokens) {
        console.error("❌ [Yahoo] Failed to exchange code for tokens");
        return res.redirect("/?error=token_exchange_failed");
      }
      
      console.log("🔐 [Yahoo] Getting user profile...");
      const userProfile = await yahooMailService.getUserProfile(tokens.access_token);
      console.log("🔐 [Yahoo] User profile received:", userProfile ? 'SUCCESS' : 'FAILED');
      
      if (!userProfile) {
        console.error("❌ [Yahoo] Failed to get user profile");
        return res.redirect("/?error=profile_failed");
      }
      
      let user = await storage.findUserByYahooId(userProfile.sub);
      console.log("🔐 [Yahoo] Existing user found:", !!user);
      
      if (!user) {
        // Check if user exists with same email but different provider
        const existingUser = await storage.getUserByEmail(userProfile.email);
        if (existingUser) {
          console.log("🔐 [Yahoo] Updating existing user to Yahoo provider...");
          user = await storage.updateUser(existingUser.id, {
            yahooId: userProfile.sub,
            provider: 'yahoo'
          });
        } else {
          console.log("🔐 [Yahoo] Creating new user...");
          user = await storage.createUser({
            email: userProfile.email,
            name: userProfile.name,
            yahooId: userProfile.sub,
            provider: 'yahoo',
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000)
          });
        }
        console.log("🔐 [Yahoo] User processed successfully:", user.id);
      } else {
        // Update existing user's tokens
        console.log("🔐 [Yahoo] Updating user tokens...");
        await storage.updateUser(user.id, {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000)
        });
      }

      console.log("🔐 [Yahoo] Redirecting to auth callback...");
      // Redirect to auth callback page with user ID
      res.redirect(`/auth-callback?userId=${user.id}&provider=yahoo`);
    } catch (error) {
      console.error("❌ [Yahoo] OAuth callback error:", error);
      console.error("Error stack:", error.stack);
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        hasCode: !!req.query.code
      });
      res.redirect(`/?error=${encodeURIComponent('Yahoo authentication failed: ' + error.message)}`);
    }
  });

  // Microsoft OAuth callback route
  app.get("/auth/microsoft/callback", async (req, res) => {
    try {
      const { code, error: authError } = req.query;
      
      console.log("🔐 [Microsoft] Callback received:", { 
        hasCode: !!code, 
        error: authError 
      });
      
      if (authError) {
        console.log("❌ [Microsoft] OAuth error:", authError);
        return res.redirect(`/?error=${encodeURIComponent('Microsoft authentication failed: ' + authError)}`);
      }
      
      if (!code) {
        console.log("❌ [Microsoft] No authorization code received");
        return res.redirect("/?error=no_code");
      }

      console.log("🔐 [Microsoft] Exchanging code for tokens...");
      const tokens = await microsoftGraphService.exchangeCodeForTokens(code as string);
      console.log("🔐 [Microsoft] Tokens received successfully");
      
      console.log("🔐 [Microsoft] Getting user profile...");
      const userProfile = await microsoftGraphService.getUserProfile(tokens.accessToken);
      console.log("🔐 [Microsoft] User profile received:", { 
        id: userProfile.id, 
        email: userProfile.mail || userProfile.userPrincipalName 
      });
      
      let user = await storage.getUserByMicrosoftId(userProfile.id);
      console.log("🔐 [Microsoft] Existing user found:", !!user);
      
      if (!user) {
        // Check if user exists with same email but different provider
        const existingUser = await storage.getUserByEmail(userProfile.mail || userProfile.userPrincipalName);
        if (existingUser) {
          console.log("🔐 [Microsoft] Updating existing user to Microsoft provider...");
          user = await storage.updateUser(existingUser.id, {
            microsoftId: userProfile.id,
            provider: 'microsoft'
          });
        } else {
          console.log("🔐 [Microsoft] Creating new user...");
          user = await storage.createUser({
            email: userProfile.mail || userProfile.userPrincipalName,
            microsoftId: userProfile.id,
            provider: 'microsoft'
          });
        }
        console.log("🔐 [Microsoft] User processed successfully:", user.id);
      }

      const tokenExpiry = new Date(Date.now() + tokens.expiresIn * 1000);
      
      console.log("🔐 [Microsoft] Updating user tokens...");
      await storage.updateUser(user.id, {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiry
      });

      console.log("🔐 [Microsoft] Redirecting to auth callback...");
      // Redirect to auth callback page with user ID
      res.redirect(`/auth-callback?userId=${user.id}&provider=microsoft`);
    } catch (error) {
      console.error("❌ [Microsoft] OAuth callback error:", error);
      console.error("Error stack:", error.stack);
      res.redirect(`/?error=${encodeURIComponent('Microsoft authentication failed: ' + error.message)}`);
    }
  });

  app.post("/api/auth/callback", async (req, res) => {
    try {
      const { code, provider } = req.body;
      
      console.log("🔐 [Auth] Callback received:", { provider, hasCode: !!code });
      
      if (!code) {
        return res.status(400).json({ message: "Authorization code required" });
      }

      if (!provider || !['microsoft', 'google', 'yahoo'].includes(provider)) {
        return res.status(400).json({ message: "Valid provider required (microsoft, google, or yahoo)" });
      }

      let tokens, userProfile, user;

      if (provider === 'microsoft') {
        console.log("🔐 [Auth] Processing Microsoft authentication...");
        tokens = await microsoftGraphService.exchangeCodeForTokens(code);
        console.log("🔐 [Auth] Microsoft tokens received");
        
        userProfile = await microsoftGraphService.getUserProfile(tokens.accessToken);
        console.log("🔐 [Auth] Microsoft profile received:", { 
          id: userProfile.id, 
          email: userProfile.mail || userProfile.userPrincipalName 
        });
        
        user = await storage.getUserByMicrosoftId(userProfile.id);
        console.log("🔐 [Auth] Existing Microsoft user found:", !!user);
        
        if (!user) {
          // Check if user exists with same email but different provider
          const existingUser = await storage.getUserByEmail(userProfile.mail || userProfile.userPrincipalName);
          if (existingUser) {
            console.log("🔐 [Auth] Updating existing user to Microsoft provider...");
            user = await storage.updateUser(existingUser.id, {
              microsoftId: userProfile.id,
              provider: 'microsoft'
            });
          } else {
            console.log("🔐 [Auth] Creating new Microsoft user...");
            user = await storage.createUser({
              email: userProfile.mail || userProfile.userPrincipalName,
              microsoftId: userProfile.id,
              provider: 'microsoft'
            });
          }
          console.log("🔐 [Auth] Microsoft user processed:", user.id);
        }
      } else if (provider === 'google') {
        console.log("🔐 [Auth] Processing Google authentication...");
        tokens = await gmailService.exchangeCodeForTokens(code);
        console.log("🔐 [Auth] Google tokens received");
        
        userProfile = await gmailService.getUserProfile(tokens.accessToken);
        console.log("🔐 [Auth] Google profile received:", { 
          id: userProfile.id, 
          email: userProfile.mail 
        });
        
        user = await storage.getUserByGoogleId(userProfile.id);
        console.log("🔐 [Auth] Existing Google user found:", !!user);
        
        if (!user) {
          // Check if user exists with same email but different provider
          const existingUser = await storage.getUserByEmail(userProfile.mail);
          if (existingUser) {
            console.log("🔐 [Auth] Updating existing user to Google provider...");
            user = await storage.updateUser(existingUser.id, {
              googleId: userProfile.id,
              provider: 'google'
            });
          } else {
            console.log("🔐 [Auth] Creating new Google user...");
            user = await storage.createUser({
              email: userProfile.mail,
              googleId: userProfile.id,
              provider: 'google'
            });
          }
          console.log("🔐 [Auth] Google user processed:", user.id);
        }
      } else if (provider === 'yahoo') {
        console.log("🔐 [Auth] Processing Yahoo authentication...");
        tokens = await yahooMailService.exchangeCodeForTokens(code);
        console.log("🔐 [Auth] Yahoo tokens received");
        
        userProfile = await yahooMailService.getUserProfile(tokens.accessToken);
        console.log("🔐 [Auth] Yahoo profile received:", { 
          id: userProfile.id, 
          email: userProfile.mail 
        });
        
        user = await storage.getUserByYahooId(userProfile.id);
        console.log("🔐 [Auth] Existing Yahoo user found:", !!user);
        
        if (!user) {
          // Check if user exists with same email but different provider
          const existingUser = await storage.getUserByEmail(userProfile.mail);
          if (existingUser) {
            console.log("🔐 [Auth] Updating existing user to Yahoo provider...");
            user = await storage.updateUser(existingUser.id, {
              yahooId: userProfile.id,
              provider: 'yahoo'
            });
          } else {
            console.log("🔐 [Auth] Creating new Yahoo user...");
            user = await storage.createUser({
              email: userProfile.mail,
              yahooId: userProfile.id,
              provider: 'yahoo'
            });
          }
          console.log("🔐 [Auth] Yahoo user processed:", user.id);
        }
      }

      const tokenExpiry = new Date(Date.now() + tokens.expiresIn * 1000);
      
      console.log("🔐 [Auth] Updating user tokens...");
      await storage.updateUser(user.id, {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiry
      });

      console.log("🔐 [Auth] Authentication successful for user:", user.id);
      res.json({ user: { id: user.id, email: user.email, provider: user.provider } });
    } catch (error) {
      console.error("OAuth callback error:", error);
      console.error("Error stack:", error.stack);
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        provider: req.body.provider,
        hasCode: !!req.body.code
      });
      res.status(500).json({ message: "Authentication failed", error: error.message });
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
          microsoftId: "test_id",
          provider: "microsoft"
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

      // Start background processing with selected folders
      const { folders } = req.body;
      processEmailScan(scan.id, user.accessToken, user.provider, folders).catch(console.error);

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
      
      console.log(`📊 [API] Returning scan data - currentProgress: ${scan.currentProgress}, totalScanned: ${scan.totalScanned}, status: ${scan.status}`);

      res.json({
        scan,
        emails: emails.map(email => ({
          id: email.id,
          sender: email.sender,
          subject: email.subject,
          aiConfidence: email.aiConfidence,
          hasUnsubscribeLink: email.hasUnsubscribeLink,
          isSelected: email.isSelected,
          receivedDate: email.receivedDate,
          userFeedback: email.userFeedback
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
          receivedDate: email.receivedDate,
          userFeedback: email.userFeedback
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
      
      // Get all spam emails and find the one with matching ID
      const allScans = await storage.getEmailScansByUser(1); // We'll need to get this from session later
      let email = null;
      
      for (const scan of allScans) {
        const scanEmails = await storage.getSpamEmailsByScan(scan.id);
        email = scanEmails.find(e => e.id === emailId);
        if (email) break;
      }
      
      if (!email) {
        return res.status(404).json({ message: "Email not found" });
      }

      res.json(email);
    } catch (error) {
      console.error("Failed to get email details:", error);
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
      console.error("Failed to update email:", error);
      res.status(500).json({ message: "Failed to update email" });
    }
  });

  // Handle user feedback (thumbs up/down)
  app.post("/api/email/:emailId/feedback", async (req, res) => {
    try {
      const emailId = parseInt(req.params.emailId);
      const { feedback } = req.body; // "spam" or "not_spam"
      
      // Update email with new feedback (overwrites any existing feedback)
      const email = await storage.updateSpamEmail(emailId, { 
        userFeedback: feedback 
      });
      
      // Save learning data (only create new entry, don't duplicate)
      const scan = await storage.getEmailScan(email.scanId);
      if (scan) {
        // Check if learning data already exists for this user and email pattern
        const existingLearningData = await storage.getUserLearningData(scan.userId);
        const existingPattern = existingLearningData.find(data => 
          data.senderPattern === email.sender && data.subjectPattern === email.subject
        );
        
        if (existingPattern) {
          // Update existing learning data instead of creating new
          await storage.updateUserLearningData(existingPattern.id, {
            userDecision: feedback,
            confidence: 75
          });
        } else {
          // Create new learning data
          await storage.createUserLearningData({
            userId: scan.userId,
            senderPattern: email.sender,
            subjectPattern: email.subject,
            bodyKeywords: email.body ? email.body.toLowerCase().split(/\s+/).slice(0, 10) : [],
            userDecision: feedback,
            confidence: 75
          });
        }
      }
      
      res.json({ success: true, feedback });
    } catch (error) {
      console.error("Failed to save feedback:", error);
      res.status(500).json({ message: "Er ging iets mis bij het opslaan van je feedback" });
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

  // Process selected emails (unsubscribe)
  app.post("/api/emails/process", async (req, res) => {
    try {
      const { scanId } = req.body;
      
      // Get all selected emails from the scan
      const emails = await storage.getSpamEmailsByScan(scanId);
      const selectedEmails = emails.filter(email => email.isSelected);
      
      if (selectedEmails.length === 0) {
        return res.json({ message: "No emails selected for processing", processed: 0 });
      }

      // Process unsubscribe links
      const results = await processUnsubscribes(selectedEmails);
      
      // Update the scan with processed count
      await storage.updateEmailScan(scanId, {
        processed: selectedEmails.length
      });
      
      res.json({ 
        message: `Processed ${selectedEmails.length} emails`, 
        processed: selectedEmails.length,
        results 
      });
    } catch (error) {
      console.error("Failed to process emails:", error);
      res.status(500).json({ message: "Failed to process selected emails" });
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
async function processEmailScan(scanId: number, accessToken: string, provider: string, folders?: string[]) {
  const scanStartTime = Date.now();
  try {
    console.log(`🚀 [Scan] Starting email scan for scanId: ${scanId} with provider: ${provider} at ${new Date().toISOString()}`);
    
    const fetchStartTime = Date.now();
    let emails;
    
    if (provider === 'microsoft') {
      emails = await microsoftGraphService.getSpamEmails(accessToken, folders);
    } else if (provider === 'google') {
      emails = await gmailService.getSpamEmails(accessToken, folders);
    } else if (provider === 'yahoo') {
      // Yahoo Mail API access requires special approval
      console.log('⚠️ [Yahoo] Mail API access requires approval, returning empty array');
      emails = [];
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }
    
    const fetchTime = Date.now() - fetchStartTime;
    console.log(`📧 [Scan] Fetched ${emails.length} emails from ${provider} spam folder in ${fetchTime}ms`);
    
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
      
      // Update progress in database
      await storage.updateEmailScan(scanId, {
        currentProgress: i + 1
      });
      console.log(`📊 [Progress] Updated currentProgress to ${i + 1}/${emails.length}`);
      
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
  const results: any[] = [];
  let processed = 0;
  
  console.log(`🔄 Starting unsubscribe processing for ${emails.length} emails`);
  
  for (const email of emails) {
    if (email.unsubscribeUrl) {
      try {
        console.log(`📧 Processing unsubscribe for email ${email.id}: ${email.unsubscribeUrl}`);
        const result = await emailParserService.processUnsubscribeLink(email.unsubscribeUrl);
        
        results.push({
          emailId: email.id,
          sender: email.sender,
          url: email.unsubscribeUrl,
          ...result
        });
        
        if (result.success) {
          processed++;
          console.log(`✅ Successfully processed unsubscribe for ${email.sender} via ${result.method}`);
        } else {
          console.log(`❌ Failed to process unsubscribe for ${email.sender}: ${result.message}`);
        }
        
        await storage.updateSpamEmail(email.id, {
          isProcessed: true
        });
      } catch (error) {
        console.error(`Failed to process unsubscribe for email ${email.id}:`, error);
        results.push({
          emailId: email.id,
          sender: email.sender,
          url: email.unsubscribeUrl,
          success: false,
          message: `Error: ${(error as Error).message}`,
          method: 'ERROR'
        });
      }
    } else {
      console.log(`⚠️ Email ${email.id} from ${email.sender} has no unsubscribe URL`);
      results.push({
        emailId: email.id,
        sender: email.sender,
        url: null,
        success: false,
        message: 'No unsubscribe URL found',
        method: 'NONE'
      });
    }
  }
  
  console.log(`🎯 Unsubscribe processing completed: ${processed}/${emails.length} successful`);
  return results;
}
