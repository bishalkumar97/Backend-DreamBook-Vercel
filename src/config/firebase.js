const admin = require('firebase-admin');
const config = require('./config');

if (!admin.apps.length) {
  try {
    const firebaseConfig = JSON.parse(config.firebase_secret);
    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig)
    });
    console.log("✅ Firebase initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing Firebase:", error);
    throw error;
  }
}

module.exports = admin;