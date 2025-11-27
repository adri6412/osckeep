const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Get all notes
app.get('/notes', (req, res) => {
    const sql = "SELECT * FROM notes ORDER BY id DESC";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({"error":err.message});
            return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
    });
});

// Create a new note
app.post('/notes', (req, res) => {
    const { title, content, color } = req.body;
    const sql ='INSERT INTO notes (title, content, color) VALUES (?,?,?)';
    const params =[title, content, color || '#ffffff'];
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": { id: this.lastID, title, content, color }
        })
    });
});

// Update a note
app.put('/notes/:id', (req, res) => {
    const { title, content, color } = req.body;
    const sql = `UPDATE notes SET 
                 title = COALESCE(?,title), 
                 content = COALESCE(?,content), 
                 color = COALESCE(?,color) 
                 WHERE id = ?`;
    const params = [title, content, color, req.params.id];
    db.run(sql, params, function(err, result) {
        if (err) {
            res.status(400).json({"error": res.message})
            return;
        }
        res.json({
            message: "success",
            changes: this.changes
        })
    });
});

// Delete a note
app.delete('/notes/:id', (req, res) => {
    const sql = 'DELETE FROM notes WHERE id = ?';
    db.run(sql, req.params.id, function (err, result) {
        if (err){
            res.status(400).json({"error": res.message})
            return;
        }
        res.json({"message":"deleted", changes: this.changes})
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
