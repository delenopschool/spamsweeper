import { users, emailScans, spamEmails, userLearningData, type User, type InsertUser, type EmailScan, type InsertEmailScan, type SpamEmail, type InsertSpamEmail, type UserLearningData, type InsertUserLearningData } from "@shared/schema-sqlite";
import { db } from "./db-sqlite";
import { eq, desc, like, or, and } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByMicrosoftId(microsoftId: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByYahooId(yahooId: string): Promise<User | undefined>;
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

export class SQLiteStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0] || undefined;
  }

  async getUserByMicrosoftId(microsoftId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.microsoftId, microsoftId));
    return result[0] || undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.googleId, googleId));
    return result[0] || undefined;
  }

  async getUserByYahooId(yahooId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.yahooId, yahooId));
    return result[0] || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async createEmailScan(insertScan: InsertEmailScan): Promise<EmailScan> {
    const result = await db.insert(emailScans).values(insertScan).returning();
    return result[0];
  }

  async getEmailScan(id: number): Promise<EmailScan | undefined> {
    const result = await db.select().from(emailScans).where(eq(emailScans.id, id));
    return result[0] || undefined;
  }

  async getEmailScansByUser(userId: number): Promise<EmailScan[]> {
    return await db.select().from(emailScans).where(eq(emailScans.userId, userId));
  }

  async getLatestEmailScan(userId: number): Promise<EmailScan | undefined> {
    const result = await db
      .select()
      .from(emailScans)
      .where(eq(emailScans.userId, userId))
      .orderBy(desc(emailScans.createdAt))
      .limit(1);
    return result[0] || undefined;
  }

  async updateEmailScan(id: number, updates: Partial<EmailScan>): Promise<EmailScan> {
    const result = await db
      .update(emailScans)
      .set(updates)
      .where(eq(emailScans.id, id))
      .returning();
    return result[0];
  }

  async createSpamEmail(insertEmail: InsertSpamEmail): Promise<SpamEmail> {
    const result = await db.insert(spamEmails).values(insertEmail).returning();
    return result[0];
  }

  async getSpamEmailsByScan(scanId: number): Promise<SpamEmail[]> {
    return await db
      .select()
      .from(spamEmails)
      .where(eq(spamEmails.scanId, scanId))
      .orderBy(desc(spamEmails.aiConfidence));
  }

  async updateSpamEmail(id: number, updates: Partial<SpamEmail>): Promise<SpamEmail> {
    const result = await db
      .update(spamEmails)
      .set(updates)
      .where(eq(spamEmails.id, id))
      .returning();
    return result[0];
  }

  async bulkUpdateSpamEmails(ids: number[], updates: Partial<SpamEmail>): Promise<void> {
    // SQLite doesn't support bulk update with IN clause in drizzle easily
    // So we'll update each one individually
    for (const id of ids) {
      await db.update(spamEmails).set(updates).where(eq(spamEmails.id, id));
    }
  }

  async searchSpamEmails(scanId: number, query: string): Promise<SpamEmail[]> {
    if (!query.trim()) {
      return await db
        .select()
        .from(spamEmails)
        .where(eq(spamEmails.scanId, scanId))
        .orderBy(desc(spamEmails.aiConfidence))
        .limit(100);
    }
    
    const lowerQuery = `%${query.toLowerCase()}%`;
    return await db
      .select()
      .from(spamEmails)
      .where(
        and(
          eq(spamEmails.scanId, scanId),
          or(
            like(spamEmails.sender, lowerQuery),
            like(spamEmails.subject, lowerQuery),
            like(spamEmails.body, lowerQuery)
          )
        )
      )
      .orderBy(desc(spamEmails.aiConfidence))
      .limit(100);
  }

  async createUserLearningData(data: InsertUserLearningData): Promise<UserLearningData> {
    // Convert bodyKeywords array to JSON string for SQLite
    const insertData = {
      ...data,
      bodyKeywords: data.bodyKeywords ? JSON.stringify(data.bodyKeywords) : null
    };
    
    const result = await db.insert(userLearningData).values(insertData).returning();
    const returnData = result[0];
    
    // Convert JSON string back to array
    return {
      ...returnData,
      bodyKeywords: returnData.bodyKeywords ? JSON.parse(returnData.bodyKeywords) : null
    };
  }

  async getUserLearningData(userId: number): Promise<UserLearningData[]> {
    const results = await db
      .select()
      .from(userLearningData)
      .where(eq(userLearningData.userId, userId))
      .orderBy(desc(userLearningData.updatedAt));
    
    // Convert JSON strings back to arrays
    return results.map(item => ({
      ...item,
      bodyKeywords: item.bodyKeywords ? JSON.parse(item.bodyKeywords) : null
    }));
  }

  async updateUserLearningData(id: number, updates: Partial<UserLearningData>): Promise<UserLearningData> {
    // Convert bodyKeywords array to JSON string for SQLite
    const updateData = {
      ...updates,
      bodyKeywords: updates.bodyKeywords ? JSON.stringify(updates.bodyKeywords) : updates.bodyKeywords,
      updatedAt: new Date()
    };
    
    const result = await db
      .update(userLearningData)
      .set(updateData)
      .where(eq(userLearningData.id, id))
      .returning();
    
    const returnData = result[0];
    
    // Convert JSON string back to array
    return {
      ...returnData,
      bodyKeywords: returnData.bodyKeywords ? JSON.parse(returnData.bodyKeywords) : null
    };
  }
}

export const storage = new SQLiteStorage();