const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
const config = require('../config/config');
const mongoose = require('mongoose');

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    const firebaseConfig = JSON.parse(config.firebase_secret);
    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig)
    });
    console.log("✅ Firebase initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing Firebase:", error);
  }
}

// Setup Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: config.email.smtp_host,
  port: config.email.smtp_port,
  secure: false,
  auth: {
    user: config.email.username,
    pass: config.email.password
  }
});

// Generate Reset Password Link
async function generateResetPasswordLink(userEmail) {
  try {
    const resetLink = await admin.auth().generatePasswordResetLink(userEmail);
    return resetLink;
  } catch (error) {
    console.error("❌ Error generating reset password link:", error);
    return null;
  }
}

// Send Welcome Email
const sendWelcomeEmail = async (user) => {
  try {
    const resetPasswordLink = await generateResetPasswordLink(user.email);

    const mailOptions = {
      from: config.email.from,
      to: user.email,
      subject: "Welcome to DreamBookPublishing – Set Up Your Account",
      html: `
        <h1>Dear ${user.name},</h1>
        <p>We're thrilled to welcome you to <strong>DreamBookPublishing</strong>!</p>
        
        <p>To get started, please set up your password:</p>
        ${resetPasswordLink ? `
        <p><a href="${resetPasswordLink}" style="background-color:#007bff;color:#ffffff;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;">🔗 Set Your Password</a></p>
        ` : ''}
        
        <p>Best Regards,</p>
        <p><strong>Team DreamBookPublishing</strong></p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully to:', user.email);
    
    // Update user's welcomeEmailSent status if needed
    if (user._id && user.collection) {
      await user.collection.updateOne(
        { _id: user._id },
        { $set: { welcomeEmailSent: true } }
      );
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return false;
  }
};

// Process new users (can be called by a cron job if needed)
async function processNewUsers() {
  try {
    const User = mongoose.model('User');
    const users = await User.find({
      role: { $in: ["author", "employee"] },
      $or: [
        { welcomeEmailSent: false },
        { welcomeEmailSent: { $exists: false } }
      ]
    });

    for (const user of users) {
      await sendWelcomeEmail(user);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error processing new users:', error);
    return false;
  }
}

module.exports = {
  sendWelcomeEmail,
  processNewUsers,
  generateResetPasswordLink
};