require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();
const port = 5000;

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


app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
