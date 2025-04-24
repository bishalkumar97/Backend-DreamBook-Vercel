const express = require("express");
const router = express.Router();
const { fetchAmazonOrders } = require("../../services/amazon");

// ✅ API to Fetch Amazon Orders
router.get("/orders", async (req, res) => {
  try {
    const orders = await fetchAmazonOrders();
    res.json({ status: true, data: orders });
  } catch (error) {
    console.error("❌ Error fetching Amazon orders:", error);
    res.status(500).json({ status: false, message: "Error fetching orders" });
  }
});

module.exports = router;
