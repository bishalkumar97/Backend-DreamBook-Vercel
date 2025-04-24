// Prevent port conflict with main server
process.env.PORT = process.env.EMAIL_SERVICE_PORT || 3001;

// Initialize email service
require('../email/sendWelcomeEmails');

console.log('✅ Email service started successfully');
console.log(`📧 Checking for new users every 30 seconds...`);

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('📤 Shutting down email service...');
    process.exit(0);
});