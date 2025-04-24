const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const bookRoute = require('./book.route');
const dashboardRoute = require('./dashboard.route');
const authorRoute = require('./author.route');
const notificationRoute = require('./notification.route');

const router = express.Router();

// API routes
router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/books', bookRoute);
router.use('/dashboard', dashboardRoute);
router.use('/author', authorRoute); // Update this line to match Frontend URL
// Add this line where you define your routes
router.use('/notifications', notificationRoute);

module.exports = router;