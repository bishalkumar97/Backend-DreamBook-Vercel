const express = require("express");
const router = express.Router();
const { fetchOrders } = require("../../services/woocommerce"); // Import WooCommerce service
const Order = require("../../models/Order"); // Import Order model

// ✅ API to Manually Fetch and Store WooCommerce Orders
router.get("/sync", async (req, res) => {
  try {
    await fetchOrders();
    res.json({ status: true, message: "WooCommerce orders synced successfully!" });
  } catch (error) {
    console.error("❌ Error syncing WooCommerce orders:", error);
    res.status(500).json({ status: false, message: "Error syncing orders" });
  }
});

// ✅ API to Fetch Stored Orders from MongoDB
router.get("/orders", async (req, res) => {
  try {
    // const orders = await Order.find({ source: "woocommerce" }).sort({ date_created: -1 });
    console.log("📢 Fetching WooCommerce orders from DB...");
    const orders = await Order.find().sort({ date_created: -1 });
    console.log("📦 Orders Retrieved from DB:", JSON.stringify(orders, null, 2)); // ✅ NEW LOG
    if (!orders || orders.length === 0) {
      console.log("⚠️ No orders found in MongoDB.");
      return res.status(404).json({ status: false, message: "No orders found" });
    }
    res.json({ status: true, data: orders });
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({ status: false, message: "Error fetching orders" });
  }
});
// const express = require("express");
// const router = express.Router();
// const Order = require("../../models/Order");
// const wooCommerceService = require("../../services/woocommerce");

// // ✅ Sync WooCommerce Orders
// router.get("/sync", async (req, res) => {
//   try {
//     await wooCommerceService.fetchOrders();
//     res.json({ success: true, message: "WooCommerce orders synced successfully!" });
//   } catch (error) {
//     console.error("❌ Error syncing WooCommerce orders:", error);
//     res.status(500).json({ success: false, message: "Error syncing orders" });
//   }
// });

// // ✅ Fetch WooCommerce Orders from MongoDB
// router.get("/orders", async (req, res) => {
//   try {
//     console.log("📢 Fetching WooCommerce orders from DB...");

//     // Fetch orders from DB
//     const orders = await Order.find({ source: "woocommerce" }).sort({ date_created: -1 });

//     console.log("📌 Orders from MongoDB:", orders); // ✅ Log fetched orders

//     if (!orders || orders.length === 0) {
//       console.log("⚠️ No orders found in MongoDB.");
//       return res.status(404).json({ success: false, message: "No orders found" });
//     }

//     res.json({ success: true, data: orders });
//   } catch (error) {
//     console.error("❌ Error fetching WooCommerce orders:", error);
//     res.status(500).json({ success: false, message: "Error fetching orders" });
//   }
// });

// module.exports = router;


module.exports = router;
