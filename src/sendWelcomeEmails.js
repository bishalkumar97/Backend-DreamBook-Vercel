require("dotenv").config({ path: require('path').resolve(__dirname, '../../.env') });
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");
const { User } = require('./models/user.model'); // Import User model instead of redefining

// Remove the mongoose connection and schema definition since it's already handled in server.js

// ✅ Initialize Firebase Admin SDK
if (!admin.apps.length) {
    try {
        const firebaseConfig = JSON.parse(process.env.FIREBASE_SECRET);
        admin.initializeApp({
            credential: admin.credential.cert(firebaseConfig)
        });
        console.log("✅ Firebase initialized successfully");
    } catch (error) {
        console.error("❌ Error initializing Firebase:", error);
    }
}

// ✅ Function to Generate Reset Password Link
async function generateResetPasswordLink(userEmail) {
    try {
        const resetLink = await admin.auth().generatePasswordResetLink(userEmail);
        return resetLink;
    } catch (error) {
        console.error("❌ Error generating reset password link:", error);
        return null;
    }
}

// ✅ Function to Send Welcome Email with Reset Password Link
const sendWelcomeEmail = async (user) => {
    const resetPasswordLink = await generateResetPasswordLink(user.email);

    if (!resetPasswordLink) {
        console.error(`❌ Could not generate reset password link for ${user.email}`);
        return;
    }

    const mailOptions = {
        from: process.env.SMTP_USER,
        to: user.email,
        subject: "Welcome to DreamBookPublishing – Set Up Your Account",
        html: `
            <h1>Dear ${user.name},</h1>
            <p>We’re thrilled to welcome you to <strong>DreamBookPublishing</strong>! As a valued author, you now have access to our platform, where you can manage your books, track sales, and connect with our publishing team.</p>
            
            <p>To get started, please set up your password and activate your account by clicking the link below:</p>
            
            <p><a href="${resetPasswordLink}" style="background-color:#007bff;color:#ffffff;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;">🔗 Set Your Password</a></p>
            
            <p>Once your password is set, you can log in and explore your dashboard:</p>

            <p><a href="https://www.dreambookpublishing.com/login" style="background-color:#28a745;color:#ffffff;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;">🌐 Login to DreamBookPublishing</a></p>

            <p>If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:support@dreambookpublishing.com">support@dreambookpublishing.com</a>.</p>

            <p>Welcome aboard! We’re excited to be part of your publishing journey.</p>

            <p>Best Regards,</p>
            <p><strong>Faiq Ansari</strong><br>CEO, DreamBookPublishing<br>
            <a href="https://www.dreambookpublishing.com">www.dreambookpublishing.com</a></p>
        `,
        text: `Dear ${user.name},

We’re thrilled to welcome you to DreamBookPublishing! As a valued author, you now have access to our platform, where you can manage your books, track sales, and connect with our publishing team.

To get started, please set up your password and activate your account by clicking the link below:

🔗 Set Your Password: ${resetPasswordLink}

Once your password is set, you can log in and explore your dashboard:

🌐 Login to DreamBookPublishing: https://www.dreambookpublishing.com/login

If you have any questions or need assistance, feel free to reach out to our support team at support@dreambookpublishing.com.

Welcome aboard! We’re excited to be part of your publishing journey.

Best Regards,
Team Dreambook Publishing
www.dreambookpublishing.com`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Welcome email sent to ${user.email}`);
        await User.updateOne({ _id: user._id }, { $set: { welcomeEmailSent: true } });
    } catch (error) {
        console.error(`❌ Error sending email to ${user.email}:`, error);
    }
}

// ✅ Function to Check for New Users and Send Emails
async function processNewUsers() {
    console.log("🔍 Checking for new users...");
    const users = await User.find({ 
        // role: "author", 
        role: { $in: ["author", "employee"] }, 
        $or: [{ welcomeEmailSent: false }, { welcomeEmailSent: { $exists: false } }] 
    });

    if (users.length === 0) {
        console.log("ℹ️ No new users found.");
        return;
    }

    for (const user of users) {
        await sendWelcomeEmail(user);
    }
}

// ✅ Run the Script
// processNewUsers().then(() => mongoose.connection.close());

// ✅ Run Automatically Every 30 Seconds
setInterval(() => {
    processNewUsers();
}, 30000);

console.log("🚀 Auto-fetching users every 60 seconds...");

module.exports = {
    sendWelcomeEmail
};