// Team Task Manager - Main Server File
// A simple Express.js server for the Team Task Manager application

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const memberRoutes = require('./routes/members');
const notificationRoutes = require('./routes/notifications');
const activityRoutes = require('./routes/activities');
const reviewRoutes = require('./routes/reviews');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/reviews', reviewRoutes);

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/signup.html'));
});

app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/admin-dashboard.html'));
});

app.get('/member-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/member-dashboard.html'));
});

app.get('/projects', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/projects.html'));
});

app.get('/create-project', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/create-project.html'));
});

app.get('/tasks', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/tasks.html'));
});

app.get('/create-task', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/create-task.html'));
});

app.get('/task-review', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/task-review.html'));
});

app.get('/members', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/members.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/profile.html'));
});

app.get('/notifications', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/notifications.html'));
});

app.get('/reports', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/reports.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});
