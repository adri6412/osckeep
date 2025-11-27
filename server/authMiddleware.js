const jwt = require('jsonwebtoken');

const SECRET_KEY = 'osckeep_secret_key_change_me'; // In production use env var

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        req.user = decoded;
        next();
    });
};

const verifyAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Require Admin Role' });
    }
    next();
};

module.exports = { verifyToken, verifyAdmin, SECRET_KEY };
