import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, '../platform.db'));

// Initialize Vuka Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    msisdn TEXT PRIMARY KEY,
    name TEXT,
    bio TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS friends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_msisdn TEXT,
    friend_msisdn TEXT,
    status TEXT DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_msisdn, friend_msisdn)
  );

  CREATE TABLE IF NOT EXISTS groups (
    group_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    owner_msisdn TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS group_members (
    group_id INTEGER,
    msisdn TEXT,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, msisdn)
  );

  CREATE TABLE IF NOT EXISTS knowledge_base (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT,
    keywords TEXT,
    answer_text TEXT
  );
`);

// Seed some knowledge base data if empty
const count = db.prepare('SELECT COUNT(*) as count FROM knowledge_base').get().count;
if (count === 0) {
  const insert = db.prepare('INSERT INTO knowledge_base (category, keywords, answer_text) VALUES (?, ?, ?)');
  insert.run('Health', 'pregnancy tips, health, prenatal', 'Eat a balanced diet, stay hydrated, and attend regular prenatal checkups. Avoid raw fish and excessive caffeine.');
  insert.run('Legal', 'land rights, legal, property', 'To claim land rights, you must have a title deed or a certificate of occupancy from the local land board.');
  insert.run('Education', 'scholarships, school, studies', 'Check the Ministry of Education website for list of available scholarships in the agricultural sector.');
  insert.run('Jobs', 'farming jobs, employment, work', 'Registered farmers can apply for seasonal worker programs through the National Agricultural Support Scheme.');
}

export default db;
