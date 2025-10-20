const express = require('express');
const router = express.Router();
const { db } = require('../index'); // Import db from index.js
const nodemailer = require('nodemailer');
const qrcode = require('qrcode');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// GET /dashboard/participants - Get all participants
router.get('/participants', (req, res) => {
  const query = 'SELECT id, name, student_index as indexNumber, email, mobile, qrcode, attendance_status as attended, email_sent as emailSent FROM participants';

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

// POST /dashboard/send-email/:id - Send email to participant with QR code
router.post('/send-email/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch participant details
    const query = 'SELECT name, email, qrcode FROM participants WHERE id = ?';
    db.query(query, [id], async (err, results) => {
      if (err) {
        console.error('Error fetching participant:', err);
        return res.status(500).json({ message: 'Failed to fetch participant' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Participant not found' });
      }

      const participant = results[0];

      // Create transporter for SMTP
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Email options
      const mailOptions = {
        from: process.env.SMTP_FROM,
        to: participant.email,
        subject: 'Your Event QR Code',
        html: `
          <h1>Hello ${participant.name}!</h1>
          <p>Here is your QR code for the event:</p>
          <img src="${participant.qrcode}" alt="QR Code" />
          <p>Please bring this QR code to the event for check-in.</p>
        `,
        attachments: [
          {
            filename: 'qrcode.png',
            content: participant.qrcode.split(',')[1], // Remove data:image/png;base64, prefix
            encoding: 'base64',
          },
        ],
      };

      // Send email
      await transporter.sendMail(mailOptions);

      // Update email_sent status
      const updateQuery = 'UPDATE participants SET email_sent = 1 WHERE id = ?';
      db.query(updateQuery, [id], (updateErr) => {
        if (updateErr) {
          console.error('Error updating email status:', updateErr);
        }
      });

      res.json({ message: 'Email sent successfully' });
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
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

// POST /dashboard/upload-pre-designed-ticket - Upload ticket design
router.post('/upload-pre-designed-ticket', (req, res, next) => {
  upload.single('image')(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      console.error('Multer error:', err);
      return res.status(400).json({ message: 'File upload error: ' + err.message });
    } else if (err) {
      // An unknown error occurred when uploading.
      console.error('Unknown upload error:', err);
      return res.status(500).json({ message: 'Unknown upload error' });
    }
    // Everything went fine.
    next();
  });
}, (req, res) => {
  console.log('req.file:', req.file);
  console.log('req.body:', req.body);

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const { ticketname } = req.body;
  if (!ticketname) {
    return res.status(400).json({ message: 'Ticket name is required' });
  }

  const imagePath = req.file.path; // Store the file path

  const query = 'INSERT INTO ticket (ticketname, image) VALUES (?, ?)';
  db.query(query, [ticketname, imagePath], (err, result) => {
    if (err) {
      console.error('Error inserting ticket:', err);
      return res.status(500).json({ message: 'Failed to upload ticket' });
    }
    res.json({ message: 'Ticket uploaded successfully', ticketId: result.insertId });
  });
});

module.exports = router;
