const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import database connection
const db = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const homeRoutes = require('./routes/homes');
const taskRoutes = require('./routes/tasks');
const leaderboardRoutes = require('./routes/leaderboard');
const notificationRoutes = require('./routes/notifications');
const uploadRoutes = require('./routes/uploads');
const templateRoutes = require('./routes/templates');
const chatRoutes = require('./routes/chat');
const breakModeRoutes = require('./routes/break-mode');
const homeRequestsRoutes = require('./routes/homeRequests');

// ✅ Initialize Express App
const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json()); // Middleware to parse JSON

// ✅ Test database connection
db.testConnection();

// ✅ Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/homes', homeRoutes);
app.use('/tasks', taskRoutes);
app.use('/leaderboard', leaderboardRoutes);
app.use('/notifications', notificationRoutes);
app.use('/uploads', uploadRoutes);
app.use('/templates', templateRoutes);
app.use('/chat', chatRoutes);
app.use('/break-mode', breakModeRoutes);
app.use('/home-requests', homeRequestsRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Test API Route
app.get("/", (req, res) => {
    res.send("Chorely Backend is Running! 🚀");
});

// ✅ Serve React Frontend Static Files
app.use(express.static(path.join(__dirname, '../frontend/build')));

// ✅ Handle React Routing - catch all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// ✅ Error handling middleware
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ 
        error: "Something went wrong on the server.", 
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ✅ Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
