const express = require('express');

const validate = require('../../middlewares/validate');
const { firebaseAuth, generateToken } = require('../../middlewares/firebaseAuth');
const { authValidation } = require('../../validations');
const { fileUploadService } = require('../../microservices');

const { authController } = require('../../controllers');

const router = express.Router();

// // Example: GET /api/authors?search=Faiq
// router.get('/', authController.getAllAuthors);

router.post('/login', 
  firebaseAuth('All'), 
  authController.loginUser);

router.post(
  '/register',
  firebaseAuth('User'),
  authController.registerUser
);

router.post(
  '/register-admin',
  firebaseAuth('Admin'),
  authController.registerUser
);

router.post(
  '/add-author',
  firebaseAuth('Admin,Employee'),
  authController.addAuthor
);

router.post(
  '/add-employee',
  firebaseAuth('Admin'),
  authController.addEmployee
);

router.post("/generate-token/:uid", generateToken);

// // At the bottom of your file, after mounting other routes
// const authorRoutes = require('./routes/v1/auth.route'); // Check this path!
// app.use('/api/authors', authorRoutes);


module.exports = router;
