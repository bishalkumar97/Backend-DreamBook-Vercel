const express = require("express");
const router = express.Router();
const Order = require("../../models/Order");

router.get("/", async (req, res) => {
  try {
    const { source } = req.query;
    let filter = source ? { source } : {};

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();

    if (orders.length === 0) {
      return res.status(404).json({ status: false, message: "No orders found" });
    }

    res.json({ status: true, data: orders });
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({ status: false, message: "Error fetching orders" });
  }
});

module.exports = router;
