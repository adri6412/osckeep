const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');
const { verifyToken, verifyAdmin, SECRET_KEY } = require('./authMiddleware');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// --- AUTHENTICATION ---

// Login
app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: 'Invalid password' });

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    });
});

// Seed Admin (Internal use or check on startup)
const seedAdmin = async () => {
    const adminPassword = await bcrypt.hash('admin123', 10);
    db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES ('admin', ?, 'admin')`, [adminPassword], (err) => {
        if (err) console.error("Error seeding admin:", err);
    });
};
seedAdmin();

// --- USER MANAGEMENT (Admin Only) ---

app.get('/users', verifyToken, verifyAdmin, (req, res) => {
    db.all('SELECT id, username, role, created_at FROM users', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.post('/users', verifyToken, verifyAdmin, async (req, res) => {
    const { username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role || 'user'], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "User created", id: this.lastID });
    });
});

app.delete('/users/:id', verifyToken, verifyAdmin, (req, res) => {
    db.run('DELETE FROM users WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "User deleted", changes: this.changes });
    });
});

// Change user password (Admin can change anyone's, User can change their own)
app.put('/users/:id/password', verifyToken, async (req, res) => {
    const targetUserId = parseInt(req.params.id);
    const { password } = req.body;

    // Check authorization: Admin can change anyone's password, User can only change their own
    if (req.user.role !== 'admin' && req.user.id !== targetUserId) {
        return res.status(403).json({ error: 'Forbidden: You can only change your own password' });
    }

    if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, targetUserId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ message: "Password updated successfully" });
    });
});

// --- NOTES (Protected) ---

// Get all notes (User sees only their own)
app.get('/notes', verifyToken, (req, res) => {
    // Admin sees all? Or just their own? Let's say Admin sees all for management, User sees own.
    // Actually, standard Keep behavior: you see your own notes.
    // If Admin wants to see all, maybe a specific endpoint. For now, strict isolation.
    const sql = "SELECT * FROM notes WHERE user_id = ? ORDER BY id DESC";
    db.all(sql, [req.user.id], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        })
    });
});

// Create a new note
app.post('/notes', verifyToken, (req, res) => {
    const { title, content, color } = req.body;
    const sql = 'INSERT INTO notes (user_id, title, content, color) VALUES (?,?,?,?)';
    const params = [req.user.id, title, content, color || '#ffffff'];
    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ "error": err.message })
            return;
        }
        res.json({
            "message": "success",
            "data": { id: this.lastID, user_id: req.user.id, title, content, color }
        })
    });
});

// Update a note (Ensure ownership)
app.put('/notes/:id', verifyToken, (req, res) => {
    const { title, content, color } = req.body;
    const sql = `UPDATE notes SET 
                 title = COALESCE(?,title), 
                 content = COALESCE(?,content), 
                 color = COALESCE(?,color) 
                 WHERE id = ? AND user_id = ?`;
    const params = [title, content, color, req.params.id, req.user.id];
    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ "error": res.message })
            return;
        }
        if (this.changes === 0) return res.status(404).json({ error: "Note not found or unauthorized" });
        res.json({
            message: "success",
            changes: this.changes
        })
    });
});

// Delete a note (Ensure ownership)
app.delete('/notes/:id', verifyToken, (req, res) => {
    const sql = 'DELETE FROM notes WHERE id = ? AND user_id = ?';
    db.run(sql, [req.params.id, req.user.id], function (err, result) {
        if (err) {
            res.status(400).json({ "error": res.message })
            return;
        }
        if (this.changes === 0) return res.status(404).json({ error: "Note not found or unauthorized" });
        res.json({ "message": "deleted", changes: this.changes })
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
