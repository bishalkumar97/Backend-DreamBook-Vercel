// Dashboard/backend/helpers/computeAuthors.js
const Order = require("../models/Order");
const Product = require("../models/Product");  // Ensure you have a Product model with an author_name field

async function computeTopRatedAuthors() {
  // 1) Fetch all orders
  const orders = await Order.find();

  // 2) Accumulate stats per author
  const authorStats = {};

  for (const order of orders) {
    for (const item of order.line_items || []) {
      let product;
      // If you have a productId in line_items, try to fetch the product; otherwise, match by name.
      if (item.productId) {
        product = await Product.findOne({ id: item.productId });
      } else {
        product = await Product.findOne({ name: item.name });
      }
      if (!product) continue;  // Skip if product not found

      const author = product.author_name || "Unknown";
      if (!authorStats[author]) {
        authorStats[author] = {
          authorName: author,
          totalSales: 0,
          totalEarnings: 0,
          totalReturned: 0,
          returnRoyalty: 0,
          totalToPay: 0
        };
      }

      // Add quantity to totalSales
      authorStats[author].totalSales += item.quantity || 0;
      // Multiply price by quantity to add to totalEarnings
      const itemPrice = parseFloat(item.price || "0");
      authorStats[author].totalEarnings += itemPrice * (item.quantity || 0);
    }
  }

  let topRatedAuthors = Object.values(authorStats);
  topRatedAuthors.sort((a, b) => b.totalEarnings - a.totalEarnings);

  // For demonstration, assume some return logic
  for (const authorObj of topRatedAuthors) {
    authorObj.totalReturned = 10; // Example placeholder
    authorObj.returnRoyalty = -500; // Example placeholder
    authorObj.totalToPay = authorObj.totalEarnings + authorObj.returnRoyalty;

    // Format as currency strings
    const earnings = authorObj.totalEarnings.toFixed(2);
    const penalty = authorObj.returnRoyalty.toFixed(2);
    const toPay = authorObj.totalToPay.toFixed(2);

    authorObj.totalEarnings = `₹${earnings}`;
    authorObj.returnRoyalty = penalty.startsWith("-") ? `-₹${penalty.slice(1)}` : `₹${penalty}`;
    authorObj.totalToPay = `₹${toPay}`;
  }

  // Return the top 5 authors
  return topRatedAuthors.slice(0, 5);
}

module.exports = { computeTopRatedAuthors };
