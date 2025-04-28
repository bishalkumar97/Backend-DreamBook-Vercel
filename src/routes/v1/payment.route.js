const express = require('express');
const { paymentController } = require('../../controllers');
const router = express.Router();

router.post('/create', paymentController.createPayment);
router.get('/verify/:paymentId', paymentController.verifyPayment);

module.exports = router;