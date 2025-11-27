const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database
// Store the database file in a volume or local file
const dbPath = path.resolve(__dirname, 'notes.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
        db.run(`CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            content TEXT,
            color TEXT DEFAULT '#ffffff',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating table', err);
            }
        });
    }
});

module.exports = db;
