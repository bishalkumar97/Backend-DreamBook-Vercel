const express = require('express');
const multer = require('multer');
const { flipkartController } = require('../../controllers');
const { firebaseAuth } = require('../../middlewares/firebaseAuth');

const router = express.Router();

// Configure multer for file upload
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Import Flipkart products from CSV
router.post(
  '/products/import',
  firebaseAuth('Admin'),
  upload.single('file'),
  flipkartController.importProducts
);

// Import Flipkart orders from CSV
router.post(
  '/orders/import',
  firebaseAuth('Admin'),
  upload.single('file'),
  flipkartController.importOrders
);

module.exports = router;