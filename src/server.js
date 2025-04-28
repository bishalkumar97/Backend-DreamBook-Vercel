// require("dotenv").config({ path: "../.env" }); // Force load from root
// const mongoose = require("mongoose");
// const cron = require("node-cron");
// const logger = require("./config/logger");
// const config = require("./config/config");
// const amazonService = require("./services/amazon");
// const wooCommerceService = require("./services/woocommerce");
// const app = require("./app");
// const cors = require('cors');
// const admin = require('./config/firebase');
// const Order = require("./models/Order");
// const routes = require("./routes/v1");
// const { computeTopRatedAuthors } = require("./helpers/computeAuthors");
// const { syncAllBookImages } = require("./services/imageSync.service");
// const { Book } = require("./models");
// const Author = require("./models/author.model");
// const { sendWelcomeEmail } = require("./sendWelcomeEmails");
// const User = require("./models/user.model");

// // Add CORS middleware BEFORE any routes
// app.use(cors({
//   origin: [
//     'http://localhost:3001', 
//     'https://dreambookpublishing.com',
//     'https://frontend-dreambook-vercel.vercel.app'
//   ],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// }));

// // Add the processNewUsers function
// async function processNewUsers() {
//   try {
//     const users = await User.find({ welcomeEmailSent: false });
//     for (const user of users) {
//       await sendWelcomeEmail(user);
//       user.welcomeEmailSent = true;
//       await user.save();
//       logger.info(`✅ Welcome email sent to ${user.email}`);
//     }
//   } catch (error) {
//     logger.error("❌ Error processing new users:", error);
//   }
// }

// // Remove Firebase initialization as it's now handled in the config module
// // getFirebaseAdmin();

// let server;

// // Connect to MongoDB
// mongoose
//   .connect(config.mongoose.url, config.mongoose.options)
//   .then(() => {
//     logger.info("✅ Connected to MongoDB");
//     // Start your services after successful connection
//     startServices();
//   })
//   .catch((err) => {
//     logger.error("❌ MongoDB Connection Error:", err);
//   });

// async function startServices() {
//   // Move your service initialization here
//   const amazonOrders = await amazonService.fetchAmazonOrders();
//   await amazonService.saveAmazonOrders(amazonOrders);
//   await wooCommerceService.fetchOrders();
//   await syncAllBookImages();
  
//   // Add welcome email service
//   setInterval(() => {
//     processNewUsers();
//   }, 30000);
//   console.log("🚀 Welcome email service started - checking for new users every 30 seconds");
// }

// // Define the API route for the dashboard
// app.get("/api/dashboard", async (req, res) => {
//   try {
//     const orders = await Order.find().sort({ createdAt: -1 });

//     // Calculate platform earnings
//     let platformEarnings = orders.reduce((sum, o) => sum + parseFloat(o.total || "0"), 0);
//     const totalRoyalty = platformEarnings * 0.1;

//     // Get actual counts from DB
//     const totalBooks = await Book.countDocuments();
//     const totalAuthors = await Author.countDocuments();

//     // Calculate total sales
//     const totalSale = orders.reduce(
//       (sum, o) => sum + (o.line_items?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0),
//       0
//     );

//     // Group sales by month and book
//     const bookSales = {};
//     orders.forEach(order => {
//       const date = new Date(order.date_created);
//       const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      
//       order.line_items?.forEach(item => {
//         if (!bookSales[monthYear]) {
//           bookSales[monthYear] = {};
//         }
//         if (!bookSales[monthYear][item.bookId]) {
//           bookSales[monthYear][item.bookId] = {
//             name: item.name,
//             quantity: 0,
//             total: 0
//           };
//         }
//         bookSales[monthYear][item.bookId].quantity += item.quantity;
//         bookSales[monthYear][item.bookId].total += parseFloat(item.total);
//       });
//     });

//     const salesReport = orders.map((o) => ({
//       platformName: o.source === "amazon" ? "Amazon" : "WooCommerce",
//       quantity: (o.line_items || []).reduce((acc, item) => acc + (item.quantity || 0), 0),
//       profitsEarned: `₹${o.total}`,
//       date: new Date(o.date_created).toLocaleDateString("en-GB", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//       }),
//     }));

//     const topRatedAuthors = await computeTopRatedAuthors();

//     return res.json({
//       status: true,
//       data: {
//         platformEarnings: `₹${platformEarnings.toFixed(2)}`,
//         totalRoyalty: `₹${totalRoyalty.toFixed(2)}`,
//         totalBooks,
//         totalSale,
//         totalAuthors,
//         salesReport,
//         bookSales,
//         topRatedAuthors,
//       }
//     });
//   } catch (error) {
//     logger.error("❌ Error building dashboard data:", error);
//     res.status(500).json({ status: false, message: "Error building dashboard data" });
//   }
// });

// // API endpoint to fetch orders
// app.get("/api/orders", async (req, res) => {
//   try {
//     // const orders = await Order.find().sort({ date_created: -1 });
//     // res.json({ status: true, data: orders });
//     const { source } = req.query; // Accept 'source' from query params

//     // let filter = {};
//     let filter = source ? { source } : {};
//     // if (source) filter.source = source; // Apply filter only if 'source' is provided
//     console.log("Fetching orders with filter:", filter); // Debugging log
//     const orders = await Order.find(filter).sort({ date_created: -1 });

//     if (orders.length === 0) {
//       return res.status(404).json({ status: false, message: "No orders found" });
//     }

//     res.json({ status: true, data: orders });
//   } catch (error) {
//     logger.error("❌ Error fetching orders:", error);
//     res.status(500).json({ status: false, message: "Error fetching orders" });
//   }
// });

// // Cron job to sync orders every hour
// cron.schedule("0 * * * *", async () => {
//   logger.info("🕒 Running order sync...");
//   const amazonOrders = await amazonService.fetchAmazonOrders();
//   await amazonService.saveAmazonOrders(amazonOrders);
//   await wooCommerceService.fetchOrders();
//   logger.info("✅ Orders synced.");
// });

// // Start the server
// server = app.listen(config.port, async () => {
//   logger.info(`🚀 Server running on port ${config.port}`);
//   const amazonOrders = await amazonService.fetchAmazonOrders();
//   await amazonService.saveAmazonOrders(amazonOrders);
//   await wooCommerceService.fetchOrders();
//   await syncAllBookImages();
// });

// // Graceful exit handlers
// function handleExit() {
//   if (server) {
//     server.close(() => {
//       logger.info("Server closed");
//       process.exit(1);
//     });
//   } else {
//     process.exit(1);
//   }
// };

// // Remove duplicate declaration since unexpectedErrorHandler is already defined later
// // Remove this duplicate error logging since unexpectedErrorHandler is defined later
//   // exitHandler();

// process.on("uncaughtException", unexpectedErrorHandler);
// process.on("unhandledRejection", unexpectedErrorHandler);
// process.on("SIGTERM", () => {
//   logger.info("SIGTERM received");
//   if (server) {
//     server.close();
//   }
// });

// // Sync orders every 30 minutes
// cron.schedule("*/30 * * * *", async () => {
//   try {
//     logger.info("🔄 Starting scheduled order sync...");
    
//     // Check WooCommerce configuration
//     if (!process.env.WOOCOMMERCE_API_URL) {
//       logger.error("❌ WooCommerce API URL not configured");
//       return;
//     }
    
//     // Sync WooCommerce orders
//     await wooCommerceService.fetchOrders().catch(error => {
//       logger.error("❌ WooCommerce sync failed:", error.message);
//     });
    
//     // Sync Amazon orders
//     const amazonOrders = await amazonService.fetchAmazonOrders().catch(error => {
//       logger.error("❌ Amazon sync failed:", error.message);
//     });
    
//     if (amazonOrders?.length) {
//       await amazonService.saveAmazonOrders(amazonOrders);
//     }
    
//     logger.info("✅ Scheduled order sync completed");
//   } catch (error) {
//     logger.error("❌ Error during scheduled sync:", error);
//   }
// });

// // Add this to your existing cron jobs
// cron.schedule("0 */6 * * *", async () => {
//   logger.info("🔄 Starting scheduled image sync...");
//   await syncAllBookImages();
// });

// // Cron job to sync orders every hour
// cron.schedule("0 * * * *", async () => {
//   logger.info("🕒 Running order sync...");
//   const amazonOrders = await amazonService.fetchAmazonOrders();
//   await amazonService.saveAmazonOrders(amazonOrders);
//   await wooCommerceService.fetchOrders();
//   logger.info("✅ Orders synced.");
// });

// // Start the server
// server = app.listen(config.port, async () => {
//   logger.info(`🚀 Server running on port ${config.port}`);
//   const amazonOrders = await amazonService.fetchAmazonOrders();
//   await amazonService.saveAmazonOrders(amazonOrders);
//   await wooCommerceService.fetchOrders();
//   await syncAllBookImages();
// });

// // Graceful exit handlers
// const exitHandler = () => {
//   if (server) {
//     server.close(() => {
//       logger.info("Server closed");
//       process.exit(1);
//     });
//   } else {
//     process.exit(1);
//   }
// };

// const unexpectedErrorHandler = (error) => {
//   logger.error(error);
//   exitHandler();
// };

// process.on("uncaughtException", unexpectedErrorHandler);
// process.on("unhandledRejection", unexpectedErrorHandler);
// process.on("SIGTERM", () => {
//   logger.info("SIGTERM received");
//   if (server) {
//     server.close();
//   }
// });

// // Sync orders every 30 minutes
// cron.schedule("*/30 * * * *", async () => {
//   try {
//     logger.info("🔄 Starting scheduled order sync...");
    
//     // Check WooCommerce configuration
//     if (!process.env.WOOCOMMERCE_API_URL) {
//       logger.error("❌ WooCommerce API URL not configured");
//       return;
//     }
    
//     // Sync WooCommerce orders
//     await wooCommerceService.fetchOrders().catch(error => {
//       logger.error("❌ WooCommerce sync failed:", error.message);
//     });
    
//     // Sync Amazon orders
//     const amazonOrders = await amazonService.fetchAmazonOrders().catch(error => {
//       logger.error("❌ Amazon sync failed:", error.message);
//     });
    
//     if (amazonOrders?.length) {
//       await amazonService.saveAmazonOrders(amazonOrders);
//     }
    
//     logger.info("✅ Scheduled order sync completed");
//   } catch (error) {
//     logger.error("❌ Error during scheduled sync:", error);
//   }
// });

// // Add this to your existing cron jobs
// cron.schedule("0 */6 * * *", async () => {
//   logger.info("🔄 Starting scheduled image sync...");
//   await syncAllBookImages();
// });

// require("dotenv").config({ path: "../.env" });

// const mongoose = require("mongoose");
// const cron = require("node-cron");
// const cors = require('cors');
// const app = require("./app");
// const logger = require("./config/logger");
// const config = require("./config/config");
// const admin = require('./config/firebase');

// const amazonService = require("./services/amazon");
// const wooCommerceService = require("./services/woocommerce");
// const { syncAllBookImages } = require("./services/imageSync.service");
// const { computeTopRatedAuthors } = require("./helpers/computeAuthors");

// const Order = require("./models/Order");
// const { Book } = require("./models");
// const Author = require("./models/author.model");
// const User = require("./models/user.model");
// const { sendWelcomeEmail } = require("./sendWelcomeEmails");

// let server;

// // Setup Middleware
// app.use(cors({
//   origin: [
//     'http://localhost:3001',
//     'https://dreambookpublishing.com',
//     'https://frontend-dreambook-vercel.vercel.app',
//     'https://backend-dream-book-vercel.vercel.app'
//   ],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// }));

// // Helper functions
// async function syncOrders() {
//   try {
//     logger.info("🔄 Syncing Orders...");
//     const amazonOrders = await amazonService.fetchAmazonOrders();
//     if (amazonOrders?.length) {
//       await amazonService.saveAmazonOrders(amazonOrders);
//     }
//     await wooCommerceService.fetchOrders();
//     logger.info("✅ Order sync completed.");
//   } catch (error) {
//     logger.error("❌ Error during order sync:", error);
//   }
// }

// async function syncImages() {
//   try {
//     logger.info("🔄 Syncing Book Images...");
//     await syncAllBookImages();
//     logger.info("✅ Book images sync completed.");
//   } catch (error) {
//     logger.error("❌ Error syncing images:", error);
//   }
// }

// async function processNewUsers() {
//   try {
//     const users = await User.find({ welcomeEmailSent: false });
//     for (const user of users) {
//       await sendWelcomeEmail(user);
//       user.welcomeEmailSent = true;
//       await user.save();
//       logger.info(`✅ Welcome email sent to ${user.email}`);
//     }
//   } catch (error) {
//     logger.error("❌ Error sending welcome emails:", error);
//   }
// }

// // Routes
// app.get("/api/dashboard", async (req, res) => {
//   try {
//     const orders = await Order.find().sort({ createdAt: -1 });

//     const platformEarnings = orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
//     const totalRoyalty = platformEarnings * 0.1;
//     const totalBooks = await Book.countDocuments();
//     const totalAuthors = await Author.countDocuments();
//     const totalSale = orders.reduce((sum, o) => sum + (o.line_items?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0), 0);

//     const bookSales = {};
//     orders.forEach(order => {
//       const date = new Date(order.date_created);
//       const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
//       order.line_items?.forEach(item => {
//         if (!bookSales[monthYear]) bookSales[monthYear] = {};
//         if (!bookSales[monthYear][item.bookId]) {
//           bookSales[monthYear][item.bookId] = { name: item.name, quantity: 0, total: 0 };
//         }
//         bookSales[monthYear][item.bookId].quantity += item.quantity;
//         bookSales[monthYear][item.bookId].total += parseFloat(item.total);
//       });
//     });

//     const salesReport = orders.map(o => ({
//       platformName: o.source === "amazon" ? "Amazon" : "WooCommerce",
//       quantity: (o.line_items || []).reduce((acc, item) => acc + (item.quantity || 0), 0),
//       profitsEarned: `₹${o.total}`,
//       date: new Date(o.date_created).toLocaleDateString("en-GB", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric"
//       }),
//     }));

//     const topRatedAuthors = await computeTopRatedAuthors();

//     res.json({
//       status: true,
//       data: {
//         platformEarnings: `₹${platformEarnings.toFixed(2)}`,
//         totalRoyalty: `₹${totalRoyalty.toFixed(2)}`,
//         totalBooks,
//         totalSale,
//         totalAuthors,
//         salesReport,
//         bookSales,
//         topRatedAuthors,
//       }
//     });
//   } catch (error) {
//     logger.error("❌ Error building dashboard data:", error);
//     res.status(500).json({ status: false, message: "Error building dashboard data" });
//   }
// });

// app.get("/api/orders", async (req, res) => {
//   try {
//     const { source } = req.query;
//     const filter = source ? { source } : {};
//     const orders = await Order.find(filter).sort({ date_created: -1 });

//     if (!orders.length) {
//       return res.status(404).json({ status: false, message: "No orders found" });
//     }

//     res.json({ status: true, data: orders });
//   } catch (error) {
//     logger.error("❌ Error fetching orders:", error);
//     res.status(500).json({ status: false, message: "Error fetching orders" });
//   }
// });

// // Start Application
// mongoose.connect(config.mongoose.url, config.mongoose.options)
//   .then(() => {
//     logger.info("✅ Connected to MongoDB");

//     server = app.listen(config.port, async () => {
//       logger.info(`🚀 Server running on port ${config.port}`);
      
//       // Start services once the server is ready
//       await syncOrders();
//       await syncImages();
//       setInterval(processNewUsers, 30000); // Process new users every 30 seconds
//     });

//     // Setup CRON jobs
//     cron.schedule("0 * * * *", syncOrders);           // every hour
//     cron.schedule("*/30 * * * *", syncOrders);         // every 30 min
//     cron.schedule("0 */6 * * *", syncImages);          // every 6 hours
//   })
//   .catch((err) => {
//     logger.error("❌ MongoDB Connection Error:", err);
//   });

// // Handle unexpected errors
// const exitHandler = () => {
//   if (server) {
//     server.close(() => {
//       logger.info("Server closed");
//       process.exit(1);
//     });
//   } else {
//     process.exit(1);
//   }
// };

// const unexpectedErrorHandler = (error) => {
//   logger.error(error);
//   exitHandler();
// };

// process.on('uncaughtException', unexpectedErrorHandler);
// process.on('unhandledRejection', unexpectedErrorHandler);
// process.on('SIGTERM', () => {
//   logger.info("SIGTERM received");
//   if (server) {
//     server.close();
//   }
// });


// require("dotenv").config({ path: "../.env" });

// const mongoose = require("mongoose");
// const cron = require("node-cron");
// const cors = require('cors');
// const app = require("./app");
// const logger = require("./config/logger");
// const config = require("./config/config");
// const admin = require('./config/firebase');

// const amazonService = require("./services/amazon");
// const wooCommerceService = require("./services/woocommerce");
// const { syncAllBookImages } = require("./services/imageSync.service");
// const { computeTopRatedAuthors } = require("./helpers/computeAuthors");

// const Order = require("./models/Order");
// const { Book } = require("./models");
// const Author = require("./models/author.model");
// const User = require("./models/user.model");
// const { sendWelcomeEmail } = require("./sendWelcomeEmails");

// let server;

// // ===== Setup CORS Middleware (Updated) =====
// const allowedOrigins = [
//   'http://localhost:3001',
//   'https://dreambookpublishing.com',
//   'https://frontend-dreambook-vercel.vercel.app',
//   'https://backend-dream-book-vercel.vercel.app'
// ];

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true); // Allow Postman or server-to-server
//     if (allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// };

// app.use(cors(corsOptions));
// app.options('*', cors(corsOptions)); // Handle preflight OPTIONS requests

// // ===== Helper Functions =====
// async function syncOrders() {
//   try {
//     logger.info("🔄 Syncing Orders...");
//     const amazonOrders = await amazonService.fetchAmazonOrders();
//     if (amazonOrders?.length) {
//       await amazonService.saveAmazonOrders(amazonOrders);
//     }
//     await wooCommerceService.fetchOrders();
//     logger.info("✅ Order sync completed.");
//   } catch (error) {
//     logger.error("❌ Error during order sync:", error);
//   }
// }

// async function syncImages() {
//   try {
//     logger.info("🔄 Syncing Book Images...");
//     await syncAllBookImages();
//     logger.info("✅ Book images sync completed.");
//   } catch (error) {
//     logger.error("❌ Error syncing images:", error);
//   }
// }

// async function processNewUsers() {
//   try {
//     const users = await User.find({ welcomeEmailSent: false });
//     for (const user of users) {
//       await sendWelcomeEmail(user);
//       user.welcomeEmailSent = true;
//       await user.save();
//       logger.info(`✅ Welcome email sent to ${user.email}`);
//     }
//   } catch (error) {
//     logger.error("❌ Error sending welcome emails:", error);
//   }
// }

// // ===== Routes =====
// app.get("/api/dashboard", async (req, res) => {
//   try {
//     const orders = await Order.find().sort({ createdAt: -1 });

//     const platformEarnings = orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
//     const totalRoyalty = platformEarnings * 0.1;
//     const totalBooks = await Book.countDocuments();
//     const totalAuthors = await Author.countDocuments();
//     const totalSale = orders.reduce((sum, o) => sum + (o.line_items?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0), 0);

//     const bookSales = {};
//     orders.forEach(order => {
//       const date = new Date(order.date_created);
//       const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
//       order.line_items?.forEach(item => {
//         if (!bookSales[monthYear]) bookSales[monthYear] = {};
//         if (!bookSales[monthYear][item.bookId]) {
//           bookSales[monthYear][item.bookId] = { name: item.name, quantity: 0, total: 0 };
//         }
//         bookSales[monthYear][item.bookId].quantity += item.quantity;
//         bookSales[monthYear][item.bookId].total += parseFloat(item.total);
//       });
//     });

//     const salesReport = orders.map(o => ({
//       platformName: o.source === "amazon" ? "Amazon" : "WooCommerce",
//       quantity: (o.line_items || []).reduce((acc, item) => acc + (item.quantity || 0), 0),
//       profitsEarned: `₹${o.total}`,
//       date: new Date(o.date_created).toLocaleDateString("en-GB", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric"
//       }),
//     }));

//     const topRatedAuthors = await computeTopRatedAuthors();

//     res.json({
//       status: true,
//       data: {
//         platformEarnings: `₹${platformEarnings.toFixed(2)}`,
//         totalRoyalty: `₹${totalRoyalty.toFixed(2)}`,
//         totalBooks,
//         totalSale,
//         totalAuthors,
//         salesReport,
//         bookSales,
//         topRatedAuthors,
//       }
//     });
//   } catch (error) {
//     logger.error("❌ Error building dashboard data:", error);
//     res.status(500).json({ status: false, message: "Error building dashboard data" });
//   }
// });

// app.get("/api/orders", async (req, res) => {
//   try {
//     const { source } = req.query;
//     const filter = source ? { source } : {};
//     const orders = await Order.find(filter).sort({ date_created: -1 });

//     if (!orders.length) {
//       return res.status(404).json({ status: false, message: "No orders found" });
//     }

//     res.json({ status: true, data: orders });
//   } catch (error) {
//     logger.error("❌ Error fetching orders:", error);
//     res.status(500).json({ status: false, message: "Error fetching orders" });
//   }
// });

// // ===== Start Application =====
// mongoose.connect(config.mongoose.url, config.mongoose.options)
//   .then(() => {
//     logger.info("✅ Connected to MongoDB");

//     server = app.listen(config.port, async () => {
//       logger.info(`🚀 Server running on port ${config.port}`);
      
//       // Start services once the server is ready
//       await syncOrders();
//       await syncImages();
//       setInterval(processNewUsers, 30000); // Process new users every 30 seconds
//     });

//     // Setup CRON jobs
//     cron.schedule("0 * * * *", syncOrders);          // every hour
//     cron.schedule("*/30 * * * *", syncOrders);        // every 30 min
//     cron.schedule("0 */6 * * *", syncImages);         // every 6 hours
//   })
//   .catch((err) => {
//     logger.error("❌ MongoDB Connection Error:", err);
//   });

// // ===== Error Handling =====
// const exitHandler = () => {
//   if (server) {
//     server.close(() => {
//       logger.info("Server closed");
//       process.exit(1);
//     });
//   } else {
//     process.exit(1);
//   }
// };

// const unexpectedErrorHandler = (error) => {
//   logger.error(error);
//   exitHandler();
// };

// process.on('uncaughtException', unexpectedErrorHandler);
// process.on('unhandledRejection', unexpectedErrorHandler);
// process.on('SIGTERM', () => {
//   logger.info("SIGTERM received");
//   if (server) {
//     server.close();
//   }
// });

require("dotenv").config({ path: "../.env" });

const mongoose = require("mongoose");
const cron = require("node-cron");
const cors = require('cors');
const app = require("./app");
const logger = require("./config/logger");
const config = require("./config/config");
const admin = require('./config/firebase');

const amazonService = require("./services/amazon");
const wooCommerceService = require("./services/woocommerce");
const { syncAllBookImages } = require("./services/imageSync.service");
const { computeTopRatedAuthors } = require("./helpers/computeAuthors");

const Order = require("./models/Order");
const { Book } = require("./models");
const Author = require("./models/author.model");
const User = require("./models/user.model");
const { sendWelcomeEmail } = require("./sendWelcomeEmails");

let server;

// ===== Setup CORS Middleware (Updated) =====
const corsOptions = {
  origin: '*', // Allow all origins
  credentials: false, // No credentials when using '*'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight OPTIONS requests

// ===== Helper Functions =====
async function syncOrders() {
  try {
    logger.info("🔄 Syncing Orders...");
    const amazonOrders = await amazonService.fetchAmazonOrders();
    if (amazonOrders?.length) {
      await amazonService.saveAmazonOrders(amazonOrders);
    }
    await wooCommerceService.fetchOrders();
    logger.info("✅ Order sync completed.");
  } catch (error) {
    logger.error("❌ Error during order sync:", error);
  }
}

async function syncImages() {
  try {
    logger.info("🔄 Syncing Book Images...");
    await syncAllBookImages();
    logger.info("✅ Book images sync completed.");
  } catch (error) {
    logger.error("❌ Error syncing images:", error);
  }
}

async function processNewUsers() {
  try {
    const users = await User.find({ welcomeEmailSent: false });
    for (const user of users) {
      await sendWelcomeEmail(user);
      user.welcomeEmailSent = true;
      await user.save();
      logger.info(`✅ Welcome email sent to ${user.email}`);
    }
  } catch (error) {
    logger.error("❌ Error sending welcome emails:", error);
  }
}

// ===== Routes =====
app.get("/api/dashboard", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    const platformEarnings = orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
    const totalRoyalty = platformEarnings * 0.1;
    const totalBooks = await Book.countDocuments();
    const totalAuthors = await Author.countDocuments();
    const totalSale = orders.reduce((sum, o) => sum + (o.line_items?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0), 0);

    const bookSales = {};
    orders.forEach(order => {
      const date = new Date(order.date_created);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      order.line_items?.forEach(item => {
        if (!bookSales[monthYear]) bookSales[monthYear] = {};
        if (!bookSales[monthYear][item.bookId]) {
          bookSales[monthYear][item.bookId] = { name: item.name, quantity: 0, total: 0 };
        }
        bookSales[monthYear][item.bookId].quantity += item.quantity;
        bookSales[monthYear][item.bookId].total += parseFloat(item.total);
      });
    });

    const salesReport = orders.map(o => ({
      platformName: o.source === "amazon" ? "Amazon" : "WooCommerce",
      quantity: (o.line_items || []).reduce((acc, item) => acc + (item.quantity || 0), 0),
      profitsEarned: `₹${o.total}`,
      date: new Date(o.date_created).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }),
    }));

    const topRatedAuthors = await computeTopRatedAuthors();

    res.json({
      status: true,
      data: {
        platformEarnings: `₹${platformEarnings.toFixed(2)}`,
        totalRoyalty: `₹${totalRoyalty.toFixed(2)}`,
        totalBooks,
        totalSale,
        totalAuthors,
        salesReport,
        bookSales,
        topRatedAuthors,
      }
    });
  } catch (error) {
    logger.error("❌ Error building dashboard data:", error);
    res.status(500).json({ status: false, message: "Error building dashboard data" });
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    const { source } = req.query;
    const filter = source ? { source } : {};
    const orders = await Order.find(filter).sort({ date_created: -1 });

    if (!orders.length) {
      return res.status(404).json({ status: false, message: "No orders found" });
    }

    res.json({ status: true, data: orders });
  } catch (error) {
    logger.error("❌ Error fetching orders:", error);
    res.status(500).json({ status: false, message: "Error fetching orders" });
  }
});

// ===== Start Application =====
mongoose.connect(config.mongoose.url, config.mongoose.options)
  .then(() => {
    logger.info("✅ Connected to MongoDB");

    server = app.listen(config.port, async () => {
      logger.info(`🚀 Server running on port ${config.port}`);
      
      // Start services once the server is ready
      await syncOrders();
      await syncImages();
      setInterval(processNewUsers, 30000); // Process new users every 30 seconds
    });

    // Setup CRON jobs
    cron.schedule("0 * * * *", syncOrders);          // every hour
    cron.schedule("*/30 * * * *", syncOrders);        // every 30 min
    cron.schedule("0 */6 * * *", syncImages);         // every 6 hours
  })
  .catch((err) => {
    logger.error("❌ MongoDB Connection Error:", err);
  });

// ===== Error Handling =====
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);
process.on('SIGTERM', () => {
  logger.info("SIGTERM received");
  if (server) {
    server.close();
  }
});
