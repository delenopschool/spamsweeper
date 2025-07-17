import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema-sqlite";

// Create or connect to SQLite database
const sqlite = new Database('database.sqlite');

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

// Create tables if they don't exist
export async function initDatabase() {
  try {
    // Create users table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        microsoft_id TEXT UNIQUE,
        google_id TEXT UNIQUE,
        yahoo_id TEXT UNIQUE,
        provider TEXT NOT NULL,
        access_token TEXT,
        refresh_token TEXT,
        token_expiry INTEGER,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
      )
    `);

    // Create email_scans table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS email_scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total_scanned INTEGER DEFAULT 0,
        detected_spam INTEGER DEFAULT 0,
        unsubscribe_links INTEGER DEFAULT 0,
        processed INTEGER DEFAULT 0,
        current_progress INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
      )
    `);

    // Create spam_emails table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS spam_emails (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scan_id INTEGER NOT NULL,
        message_id TEXT NOT NULL,
        sender TEXT NOT NULL,
        subject TEXT NOT NULL,
        body TEXT,
        ai_confidence INTEGER,
        has_unsubscribe_link INTEGER DEFAULT 0,
        unsubscribe_url TEXT,
        is_selected INTEGER DEFAULT 1,
        is_processed INTEGER DEFAULT 0,
        user_feedback TEXT,
        received_date INTEGER,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
      )
    `);

    // Create user_learning_data table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS user_learning_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        sender_pattern TEXT NOT NULL,
        subject_pattern TEXT,
        body_keywords TEXT,
        user_decision TEXT NOT NULL,
        confidence INTEGER DEFAULT 50,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}