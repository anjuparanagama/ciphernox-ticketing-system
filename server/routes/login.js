const express = require('express');
const router = express.Router();
const { db } = require('../index');

// POST /login - Authenticate admin user
router.post('/', (req, res) => {
  const { username, password } = req.body;

  // Basic validation
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  // Query the admin table for matching credentials
  const query = 'SELECT * FROM admin WHERE username = ? AND password = ?';
  const values = [username, password];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Error querying admin table:', err);
      return res.status(500).json({ success: false, message: 'Database query error' });
    }

    if (results.length > 0) {
      // Credentials match
      res.json({ success: true, message: 'Login successful' });
    } else {
      // No matching user
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
});

module.exports = router;
