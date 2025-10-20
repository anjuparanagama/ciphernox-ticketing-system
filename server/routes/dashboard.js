const express = require('express');
const router = express.Router();
const { db } = require('../index'); // Import db from index.js

// GET /dashboard/participants - Get all participants
router.get('/participants', (req, res) => {
  const query = 'SELECT id, name, student_index as indexNumber, email, mobile, qrcode, attendance_status as attended FROM participants';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching participants:', err);
      return res.status(500).json({ message: 'Failed to fetch participants' });
    }
    res.json({ participants: results });
  });
});

// DELETE /dashboard/participants/:id - Delete a participant
router.delete('/participants/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM participants WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting participant:', err);
      return res.status(500).json({ message: 'Failed to delete participant' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Participant not found' });
    }
    res.json({ message: 'Participant deleted successfully' });
  });
});

// POST /dashboard/send-email/:id - Send email to participant (stub)
router.post('/send-email/:id', (req, res) => {
  const { id } = req.params;
  // TODO: Implement actual email sending
  res.json({ message: 'Email sent successfully (stub)' });
});

// POST /dashboard/mark-attendance - Mark attendance using QR code
router.post('/mark-attendance', (req, res) => {
  const { qrCode } = req.body;

  if (!qrCode) {
    return res.status(400).json({ message: 'QR code is required' });
  }

  // Assuming qrCode is the data encoded in QR, but for simplicity, treat as participant ID or search by qrcode
  // Here, we'll assume qrCode is the participant ID for now
  const query = 'UPDATE participants SET attendance_status = 1 WHERE id = ?';

  db.query(query, [qrCode], (err, result) => {
    if (err) {
      console.error('Error marking attendance:', err);
      return res.status(500).json({ message: 'Failed to mark attendance' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Participant not found' });
    }
    res.json({ message: 'Attendance marked successfully' });
  });
});

// POST /dashboard/upload-pre-designed-ticket - Upload ticket design (stub)
router.post('/upload-pre-designed-ticket', (req, res) => {
  // TODO: Implement file upload
  res.json({ message: 'Ticket uploaded successfully (stub)' });
});

module.exports = router;
