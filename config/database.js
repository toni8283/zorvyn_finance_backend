const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../finance.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeTables();
  }
});

function initializeTables() {
  db.serialize(() => {
    // Basic user table. Keeping role here is enough for this project.
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT CHECK(role IN ('viewer', 'analyst', 'admin')) DEFAULT 'viewer',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Records stay separate so queries are easier to reason about later.
    db.run(`
      CREATE TABLE IF NOT EXISTS finance_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Small indexes now save pain once the seed data grows.
    db.run(`CREATE INDEX IF NOT EXISTS idx_records_user ON finance_records(user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_records_date ON finance_records(date)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_records_type ON finance_records(type)`);
  });
}

module.exports = db;
