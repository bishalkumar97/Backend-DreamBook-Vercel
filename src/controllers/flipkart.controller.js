const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const flipkartService = require('../services/flipkart.service');

const importProducts = catchAsync(async (req, res) => {
  if (!req.file) {
    return res.status(httpStatus.BAD_REQUEST).send({ message: 'Please upload a CSV file' });
  }

  const products = await flipkartService.processProductsCSV(req.file.path);
  res.status(httpStatus.OK).send({
    message: 'Products imported successfully',
    count: products.length,
    products
  });
});

const importOrders = catchAsync(async (req, res) => {
  if (!req.file) {
    return res.status(httpStatus.BAD_REQUEST).send({ message: 'Please upload a CSV file' });
  }

  const orders = await flipkartService.processOrdersCSV(req.file.path);
  res.status(httpStatus.OK).send({
    message: 'Orders imported successfully',
    count: orders.length,
    orders
  });
});

module.exports = {
  importProducts,
  importOrders
};