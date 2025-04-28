const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { decentroService } = require('../services');

const createPayment = catchAsync(async (req, res) => {
  const orderData = {
    amount: req.body.amount,
    orderId: req.body.orderId,
    customerName: req.body.customerName,
    customerEmail: req.body.customerEmail,
    customerPhone: req.body.customerPhone,
    upiId: req.body.upiId
  };

  const payment = await decentroService.createPaymentOrder(orderData);
  res.status(httpStatus.CREATED).send(payment);
});

const verifyPayment = catchAsync(async (req, res) => {
  const { paymentId } = req.params;
  const paymentStatus = await decentroService.verifyPayment(paymentId);
  res.send(paymentStatus);
});

module.exports = {
  createPayment,
  verifyPayment
};