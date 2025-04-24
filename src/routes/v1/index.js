const express = require('express');
const router = express.Router();

const userRoute = require('./user.route');
const authRoute = require('./auth.route');
const bookRoute = require('./book.route');
// const wooCommerceRoutes = require('../../services/woocommerce');
const woocommerceRoutes = require("./woocommerce.route"); // ✅ NEW LINE ADDED
// const amazonRoutes = require('../../services/amazon');
const amazonRoutes = require("./amazon.route"); // ✅ Correct Path
const orderRoutes = require("./orders.route"); // ✅ Add this line



router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/books', bookRoute);
router.use("/woocommerce", woocommerceRoutes);
router.use("/amazon", amazonRoutes);
router.use("/orders", orderRoutes); // ✅ Register orders route

module.exports = router;
