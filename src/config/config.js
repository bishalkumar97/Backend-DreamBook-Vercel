require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 3000,
  mongoose: {
    url: process.env.MONGODB_URL,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  email: {
    username: process.env.SMTP_USER,
    password: process.env.SMTP_PASS,
    from: process.env.SMTP_USER,
    smtp_host: process.env.SMTP_HOST,
    smtp_port: process.env.SMTP_PORT
  },
  firebase_secret: process.env.FIREBASE_SECRET,
  aws: {
    s3: {
      name: process.env.AWS_S3_BUCKET,
      region: process.env.AWS_S3_REGION,
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    },
  },
  // Removed duplicate mongoose config since it's already defined above
};
