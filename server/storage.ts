import { users, emailScans, spamEmails, type User, type InsertUser, type EmailScan, type InsertEmailScan, type SpamEmail, type InsertSpamEmail } from "@shared/schema";

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
  updateEmailScan(id: number, updates: Partial<EmailScan>): Promise<EmailScan>;

  // Spam email management
  createSpamEmail(email: InsertSpamEmail): Promise<SpamEmail>;
  getSpamEmailsByScan(scanId: number): Promise<SpamEmail[]>;
  updateSpamEmail(id: number, updates: Partial<SpamEmail>): Promise<SpamEmail>;
  bulkUpdateSpamEmails(ids: number[], updates: Partial<SpamEmail>): Promise<void>;
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
      ...insertEmail,
      id,
      isProcessed: false,
      createdAt: new Date(),
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
}

export const storage = new MemStorage();
