import { users, emailScans, spamEmails, userLearningData, type User, type InsertUser, type EmailScan, type InsertEmailScan, type SpamEmail, type InsertSpamEmail, type UserLearningData, type InsertUserLearningData } from "@shared/schema";
import { db } from "./db";
import { eq, inArray, desc, like, or, ilike } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByMicrosoftId(microsoftId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;

  // Email scan management
  createEmailScan(scan: InsertEmailScan): Promise<EmailScan>;
  getEmailScan(id: number): Promise<EmailScan | undefined>;
  getEmailScansByUser(userId: number): Promise<EmailScan[]>;
  getLatestEmailScan(userId: number): Promise<EmailScan | undefined>;
  updateEmailScan(id: number, updates: Partial<EmailScan>): Promise<EmailScan>;

  // Spam email management
  createSpamEmail(email: InsertSpamEmail): Promise<SpamEmail>;
  getSpamEmailsByScan(scanId: number): Promise<SpamEmail[]>;
  updateSpamEmail(id: number, updates: Partial<SpamEmail>): Promise<SpamEmail>;
  bulkUpdateSpamEmails(ids: number[], updates: Partial<SpamEmail>): Promise<void>;
  searchSpamEmails(scanId: number, query: string): Promise<SpamEmail[]>;
  
  // User learning data management
  createUserLearningData(data: InsertUserLearningData): Promise<UserLearningData>;
  getUserLearningData(userId: number): Promise<UserLearningData[]>;
  updateUserLearningData(id: number, updates: Partial<UserLearningData>): Promise<UserLearningData>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private emailScans: Map<number, EmailScan>;
  private spamEmails: Map<number, SpamEmail>;
  private currentUserId: number;
  private currentScanId: number;
  private currentEmailId: number;

  constructor() {
    this.users = new Map();
    this.emailScans = new Map();
    this.spamEmails = new Map();
    this.currentUserId = 1;
    this.currentScanId = 1;
    this.currentEmailId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByMicrosoftId(microsoftId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.microsoftId === microsoftId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      accessToken: null,
      refreshToken: null,
      tokenExpiry: null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createEmailScan(insertScan: InsertEmailScan): Promise<EmailScan> {
    const id = this.currentScanId++;
    const scan: EmailScan = {
      userId: insertScan.userId,
      totalScanned: insertScan.totalScanned ?? 0,
      detectedSpam: insertScan.detectedSpam ?? 0,
      unsubscribeLinks: insertScan.unsubscribeLinks ?? 0,
      processed: insertScan.processed ?? 0,
      status: insertScan.status ?? "pending",
      id,
      createdAt: new Date(),
    };
    this.emailScans.set(id, scan);
    return scan;
  }

  async getEmailScan(id: number): Promise<EmailScan | undefined> {
    return this.emailScans.get(id);
  }

  async getEmailScansByUser(userId: number): Promise<EmailScan[]> {
    return Array.from(this.emailScans.values()).filter(scan => scan.userId === userId);
  }

  async getLatestEmailScan(userId: number): Promise<EmailScan | undefined> {
    const userScans = Array.from(this.emailScans.values())
      .filter(scan => scan.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return userScans[0];
  }

  async updateEmailScan(id: number, updates: Partial<EmailScan>): Promise<EmailScan> {
    const scan = this.emailScans.get(id);
    if (!scan) {
      throw new Error('Email scan not found');
    }
    const updatedScan = { ...scan, ...updates };
    this.emailScans.set(id, updatedScan);
    return updatedScan;
  }

  async createSpamEmail(insertEmail: InsertSpamEmail): Promise<SpamEmail> {
    const id = this.currentEmailId++;
    const email: SpamEmail = {
      id,
      scanId: insertEmail.scanId,
      messageId: insertEmail.messageId,
      sender: insertEmail.sender,
      subject: insertEmail.subject,
      body: insertEmail.body || null,
      aiConfidence: insertEmail.aiConfidence || null,
      hasUnsubscribeLink: insertEmail.hasUnsubscribeLink || false,
      unsubscribeUrl: insertEmail.unsubscribeUrl || null,
      isSelected: insertEmail.isSelected || true,
      isProcessed: false,
      receivedDate: insertEmail.receivedDate || null,
      createdAt: new Date()
    };
    this.spamEmails.set(id, email);
    return email;
  }

  async getSpamEmailsByScan(scanId: number): Promise<SpamEmail[]> {
    return Array.from(this.spamEmails.values()).filter(email => email.scanId === scanId);
  }

  async updateSpamEmail(id: number, updates: Partial<SpamEmail>): Promise<SpamEmail> {
    const email = this.spamEmails.get(id);
    if (!email) {
      throw new Error('Spam email not found');
    }
    const updatedEmail = { ...email, ...updates };
    this.spamEmails.set(id, updatedEmail);
    return updatedEmail;
  }

  async bulkUpdateSpamEmails(ids: number[], updates: Partial<SpamEmail>): Promise<void> {
    for (const id of ids) {
      const email = this.spamEmails.get(id);
      if (email) {
        const updatedEmail = { ...email, ...updates };
        this.spamEmails.set(id, updatedEmail);
      }
    }
  }

  async searchSpamEmails(scanId: number, query: string): Promise<SpamEmail[]> {
    const scanEmails = Array.from(this.spamEmails.values()).filter(email => email.scanId === scanId);
    if (!query.trim()) return scanEmails;
    
    const lowerQuery = query.toLowerCase();
    return scanEmails.filter(email => 
      email.sender.toLowerCase().includes(lowerQuery) ||
      email.subject.toLowerCase().includes(lowerQuery) ||
      (email.body && email.body.toLowerCase().includes(lowerQuery))
    );
  }

  async createUserLearningData(data: InsertUserLearningData): Promise<UserLearningData> {
    // In-memory implementation - simplified for demo
    const learningData: UserLearningData = {
      id: Date.now(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return learningData;
  }

  async getUserLearningData(userId: number): Promise<UserLearningData[]> {
    // In-memory implementation - simplified for demo
    return [];
  }

  async updateUserLearningData(id: number, updates: Partial<UserLearningData>): Promise<UserLearningData> {
    // In-memory implementation - simplified for demo
    throw new Error('Not implemented in memory storage');
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByMicrosoftId(microsoftId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.microsoftId, microsoftId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async createEmailScan(insertScan: InsertEmailScan): Promise<EmailScan> {
    const [scan] = await db
      .insert(emailScans)
      .values(insertScan)
      .returning();
    return scan;
  }

  async getEmailScan(id: number): Promise<EmailScan | undefined> {
    const [scan] = await db.select().from(emailScans).where(eq(emailScans.id, id));
    return scan || undefined;
  }

  async getEmailScansByUser(userId: number): Promise<EmailScan[]> {
    return await db.select().from(emailScans).where(eq(emailScans.userId, userId));
  }

  async getLatestEmailScan(userId: number): Promise<EmailScan | undefined> {
    const [latestScan] = await db
      .select()
      .from(emailScans)
      .where(eq(emailScans.userId, userId))
      .orderBy(desc(emailScans.createdAt))
      .limit(1);
    return latestScan;
  }

  async updateEmailScan(id: number, updates: Partial<EmailScan>): Promise<EmailScan> {
    const [scan] = await db
      .update(emailScans)
      .set(updates)
      .where(eq(emailScans.id, id))
      .returning();
    return scan;
  }

  async createSpamEmail(insertEmail: InsertSpamEmail): Promise<SpamEmail> {
    const [email] = await db
      .insert(spamEmails)
      .values(insertEmail)
      .returning();
    return email;
  }

  async getSpamEmailsByScan(scanId: number): Promise<SpamEmail[]> {
    return await db.select().from(spamEmails).where(eq(spamEmails.scanId, scanId));
  }

  async updateSpamEmail(id: number, updates: Partial<SpamEmail>): Promise<SpamEmail> {
    const [email] = await db
      .update(spamEmails)
      .set(updates)
      .where(eq(spamEmails.id, id))
      .returning();
    return email;
  }

  async bulkUpdateSpamEmails(ids: number[], updates: Partial<SpamEmail>): Promise<void> {
    await db
      .update(spamEmails)
      .set(updates)
      .where(inArray(spamEmails.id, ids));
  }

  async searchSpamEmails(scanId: number, query: string): Promise<SpamEmail[]> {
    if (!query.trim()) {
      return await db.select().from(spamEmails).where(eq(spamEmails.scanId, scanId));
    }
    
    const lowerQuery = `%${query.toLowerCase()}%`;
    return await db
      .select()
      .from(spamEmails)
      .where(
        or(
          ilike(spamEmails.sender, lowerQuery),
          ilike(spamEmails.subject, lowerQuery),
          ilike(spamEmails.body, lowerQuery)
        )
      );
  }

  async createUserLearningData(data: InsertUserLearningData): Promise<UserLearningData> {
    const [learningData] = await db
      .insert(userLearningData)
      .values(data)
      .returning();
    return learningData;
  }

  async getUserLearningData(userId: number): Promise<UserLearningData[]> {
    return await db
      .select()
      .from(userLearningData)
      .where(eq(userLearningData.userId, userId))
      .orderBy(desc(userLearningData.updatedAt));
  }

  async updateUserLearningData(id: number, updates: Partial<UserLearningData>): Promise<UserLearningData> {
    const [updated] = await db
      .update(userLearningData)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userLearningData.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
