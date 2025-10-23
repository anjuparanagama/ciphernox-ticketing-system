const express = require('express');
const router = express.Router();
const { db } = require('../index'); // Import db from index.js
const qrcode = require('qrcode');

// POST /addparticipant - Add a new participant
router.post('/', async (req, res) => {
  const { name, email, indexNumber, mobile } = req.body;

  // Basic validation
  if (!name || !email || !indexNumber) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    // Generate QR code data (e.g., participant ID or unique string)
    const qrData = `Participant: ${name}, Index: ${indexNumber}, Email: ${email}`;
    qrcode.toDataURL(qrData).then(qrCode => {
      // Insert into database
      const insertQuery = `
        INSERT INTO participants (name, student_index, email, mobile, qrcode, email_sent, attendance_status)
        VALUES (?, ?, ?, ?, ?, 0, 0)
      `;
      const values = [name, indexNumber, email, mobile, qrCode];

      db.query(insertQuery, values, (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            if (err.sqlMessage.includes('student_index')) {
              return res.status(409).json({ message: 'Participant with this student index already exists' });
            } else if (err.sqlMessage.includes('email')) {
              return res.status(409).json({ message: 'Participant with this email already exists' });
            } else {
              return res.status(409).json({ message: 'Duplicate entry detected' });
            }
          }
          console.error('Error inserting participant:', err);
          return res.status(500).json({ message: 'Failed to add participant' });
        }
        res.status(201).json({ message: 'Participant added successfully', id: result.insertId, qrCode });
      });
    }).catch(error => {
      console.error('Error generating QR code:', error);
      res.status(500).json({ message: 'Failed to generate QR code' });
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
});

module.exports = router;
  