import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'lib', 'power_generation.db');

// Validate if the database file exists
if (!fs.existsSync(dbPath)) {
  console.error('SQLite database file not found at:', dbPath);
}

// Create SQLite connection
const sqlite = new Database(dbPath);

// Initialize Drizzle
export const db = drizzle(sqlite);
