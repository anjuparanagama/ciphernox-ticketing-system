const express = require('express');
const router = express.Router();
const { db } = require('../index'); // Import db from index.js
const nodemailer = require('nodemailer');
const qrcode = require('qrcode');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

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

// POST /dashboard/send-email/:id - Send email to participant with QR code attached to ticket
router.post('/send-email/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch participant details
    const participantQuery = 'SELECT name, email, qrcode FROM participants WHERE id = ?';
    db.query(participantQuery, [id], async (err, participantResults) => {
      if (err) {
        console.error('Error fetching participant:', err);
        return res.status(500).json({ message: 'Failed to fetch participant' });
      }

      if (participantResults.length === 0) {
        return res.status(404).json({ message: 'Participant not found' });
      }

      const participant = participantResults[0];

      // Fetch the ticket image (assuming only one ticket exists)
      const ticketQuery = 'SELECT image FROM ticket LIMIT 1';
      db.query(ticketQuery, async (ticketErr, ticketResults) => {
        if (ticketErr) {
          console.error('Error fetching ticket:', ticketErr);
          return res.status(500).json({ message: 'Failed to fetch ticket' });
        }

        if (ticketResults.length === 0) {
          return res.status(404).json({ message: 'No ticket design found' });
        }

        const ticketImagePath = ticketResults[0].image;

        // Generate QR code buffer from base64
        const qrCodeBuffer = Buffer.from(participant.qrcode.split(',')[1], 'base64');

        // Load ticket image and QR code
        const ticketImage = sharp(ticketImagePath);
        const qrImage = sharp(qrCodeBuffer);

        // Get ticket image metadata
        const ticketMetadata = await ticketImage.metadata();

        // Resize QR code to fit on ticket (e.g., 200x200 pixels, positioned at bottom right)
        const qrResized = await qrImage.resize(200, 200).png().toBuffer();

        // Composite QR code onto ticket image
        const combinedImageBuffer = await ticketImage
          .composite([{
            input: qrResized,
            top: ticketMetadata.height - 220, // 20px margin from bottom
            left: ticketMetadata.width - 220, // 20px margin from right
          }])
          .png()
          .toBuffer();

        // Convert combined image to base64 for email
        const combinedImageBase64 = combinedImageBuffer.toString('base64');

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
          subject: 'Your Cyphernox Ticket - Annual IT Get Together',
          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Your Cyphernox Ticket</title>
              <style>
                body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 0;
                  color: #333;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  border-radius: 10px;
                  overflow: hidden;
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                .header {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 30px 20px;
                  text-align: center;
                }
                .header h1 {
                  margin: 0;
                  font-size: 28px;
                  font-weight: 700;
                }
                .header p {
                  margin: 10px 0 0 0;
                  font-size: 16px;
                  opacity: 0.9;
                }
                .content {
                  padding: 30px 20px;
                  text-align: center;
                }
                .content h2 {
                  color: #667eea;
                  font-size: 24px;
                  margin-bottom: 20px;
                }
                .content p {
                  font-size: 16px;
                  line-height: 1.6;
                  margin-bottom: 20px;
                }
                .ticket-image {
                  max-width: 100%;
                  height: auto;
                  border-radius: 8px;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  margin: 20px 0;
                }
                .footer {
                  background-color: #f8f9fa;
                  padding: 20px;
                  text-align: center;
                  font-size: 14px;
                  color: #666;
                }
                .highlight {
                  background-color: #e8f4fd;
                  padding: 15px;
                  border-radius: 8px;
                  margin: 20px 0;
                  border-left: 4px solid #667eea;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Cyphernox</h1>
                  <p>Annual IT Get Together</p>
                </div>
                <div class="content">
                  <h2>Hello ${participant.name}!</h2>
                  <p>Welcome to our exciting batch party event! We're thrilled to have you join us for an unforgettable night of celebration and networking.</p>
                  <div class="highlight">
                    <p><strong>Your exclusive batch party ticket is attached below.</strong> This ticket grants you access to all the festivities, including special activities, great food, and amazing company.</p>
                  </div>
                  <img src="cid:ticket-image" alt="Your Cyphernox Ticket" class="ticket-image" />
                  <p>Please bring this ticket to the event for check-in. Simply show the QR code on your ticket at the entrance - our team will scan it quickly and efficiently.</p>
                  <p>We can't wait to see you there! If you have any questions, feel free to reach out.</p>
                  <p>Best regards,<br>The Cyphernox Organizing Team</p>
                </div>
                <div class="footer">
                  <p>This is an automated email. Please do not reply to this message.</p>
                </div>
              </div>
            </body>
            </html>
          `,
          attachments: [
            {
              filename: 'cyphernox-ticket.png',
              content: combinedImageBase64,
              encoding: 'base64',
              cid: 'ticket-image', // Content-ID for embedding in HTML
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
