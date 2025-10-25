const express = require('express');
const router = express.Router();
const { db } = require('../index');
const qrcode = require('qrcode');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/participants'))
  },
  filename: function (req, file, cb) {
    // Get file extension from original file
    const ext = path.extname(file.originalname);
    // Clean the name to make it URL-safe (remove spaces and special characters)
    const safeName = req.body.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    // Add timestamp to ensure uniqueness
    const uniqueSuffix = Date.now();
    cb(null, `${safeName}_${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage: storage });

// POST /addparticipant - Add a new participant
router.post('/', upload.single('profile_image'), async (req, res) => {
  const { name, email, indexNumber, mobile } = req.body;
  const profile_image = req.file ? `/uploads/participants/${req.file.filename}` : null;

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
        INSERT INTO participants (name, student_index, email, mobile, profile_image, qrcode, email_sent, attendance_status)
        VALUES (?, ?, ?, ?, ?, ?, 0, 0)
      `;
      const values = [name, indexNumber, email, mobile, profile_image, qrCode];

      db.query(insertQuery, values, async (err, result) => {
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

        // Send email after successful insertion
        try {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          const mailOptions = {
            from: process.env.SMTP_FROM,
            to: email,
            subject: 'Welcome to IT Batch Party 2025! 🎉',
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #2C3E50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                    .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 5px 5px; }
                    .highlight { color: #2C3E50; font-weight: bold; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
                    .button { background: #3498DB; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
                    .details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>🎓 IT Batch Party 2025 🎉</h1>
                    </div>
                    <div class="content">
                      <h2>Hi ${name}! 👋</h2>
                      <p>Thank you for registering for the <span class="highlight">IT Batch Party 2025</span>! We're excited to have you join us for this memorable celebration.</p>
                      
                      <div class="details">
                        <h3>🎫 Registration Details:</h3>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Index Number:</strong> ${indexNumber}</p>
                        <p><strong>Email:</strong> ${email}</p>
                      </div>

                      <p>Your digital ticket will be sent to you shortly. Keep an eye on your inbox!</p>
                      
                      <p><strong>What's Next?</strong></p>
                      <ul>
                        <li>Save the date in your calendar</li>
                        <li>Watch for your digital ticket</li>
                        <li>Get ready to celebrate with your batch mates!</li>
                      </ul>

                      <p>If you have any questions, feel free to reach out to our team.</p>
                    </div>
                    <div class="footer">
                      <p>This is an automated message, please do not reply.</p>
                      <p>© 2025 IT Batch Party Committee | All Rights Reserved</p>
                    </div>
                  </div>
                </body>
              </html>
            `,
          };

          await transporter.sendMail(mailOptions);
          console.log('Email sent successfully to:', email);
        } catch (emailError) {
          console.error('Error sending email:', emailError);
          // Note: We don't return an error here as the participant was added successfully
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
  