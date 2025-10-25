require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const http = require('http');
const WebSocket = require('ws');

const app = express();
const port = 5000;

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads/participants'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Create connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// Export db early to avoid undefined issues in routes
module.exports = { db };

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    return;
  }
  console.log("✅ Connected to MySQL Database!");
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes
const addParticipantRoute = require('./routes/addparticipant');
const loginRoute = require('./routes/login');
const dashboardRoute = require('./routes/dashboard');
app.use('/add-participant', addParticipantRoute);
app.use('/login', loginRoute);
app.use('/dashboard', dashboardRoute);



app.get("/", (req, res) => {
  res.send("Node.js + MySQL connected successfully!");
});


const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Broadcast attendance updates to all connected clients
global.broadcastAttendance = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

server.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
