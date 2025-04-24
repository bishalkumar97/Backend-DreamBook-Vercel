exports.userService = require('./user.service');
exports.authService = require('./auth.service');
exports.bookService = require('./book.service');

// ✅ NEW LINE ADDED - Export missing services
exports.amazonService = require("./amazon");
exports.woocommerceService = require("./woocommerce");
exports.syncBookFromExternalSource = require("./syncBookFromSource");
