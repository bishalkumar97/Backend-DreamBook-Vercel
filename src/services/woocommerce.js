const axios = require("axios");
const Order = require("../models/Order");
const {Book} = require("../models/book.model");
const Author = require("../models/author.model");
const logger = require("../config/logger");

// WooCommerce Configuration
const WOO_CONFIG = {
  baseURL: process.env.WOOCOMMERCE_API_URL,
  consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
  consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET
};

// Add this function to fetch and sync products/books
// Add this helper function
// Helper function to create default author
async function getOrCreateDefaultAuthor() {
  try {
    const authorData = {
      name: "Unknown Author",
      bio: "Default author for synchronized books",
      status: "active",
      email: "unknown@example.com"
    };

    // First try to find the author
    let author = await Author.findOne({ name: authorData.name });
    
    // If not found, create new
    if (!author) {
      author = new Author(authorData);
      await author.save();
    }

    return author;
  } catch (error) {
    logger.error("❌ Error with default author:", error.message);
    // Return a temporary author instance without saving
    return new Author({
      name: "Unknown Author",
      bio: "Temporary author instance",
      status: "active"
    });
  }
}

async function validateAndSaveImage(bookData) {
  try {
    if (!bookData?.coverImage?.url || bookData.coverImage.url === '/images/default-book.png') {
      return {
        ...bookData,
        coverImage: {
          url: "/images/default-book.png",
          key: `default-${Date.now()}`
        }
      };
    }

    // Validate image URL with better error handling
    try {
      const imageResponse = await axios.head(bookData.coverImage.url, { 
        timeout: 5000,
        validateStatus: (status) => status < 400
      });
      
      if (imageResponse.status === 200) {
        return bookData;
      }
    } catch (error) {
      logger.warn(`⚠️ Image validation failed for ${bookData.title}, using default image`);
    }

    return {
      ...bookData,
      coverImage: {
        url: "/images/default-book.png",
        key: `default-${Date.now()}`
      }
    };
  } catch (error) {
    logger.error(`❌ Error validating image for ${bookData?.title || 'unknown book'}:`, error.message);
    return {
      ...bookData,
      coverImage: {
        url: "/images/default-book.png",
        key: `default-${Date.now()}`
      }
    };
  }
}

// Update the final image sync in fetchOrders
async function fetchOrders() {
  if (!WOO_CONFIG.baseURL || !WOO_CONFIG.consumerKey || !WOO_CONFIG.consumerSecret) {
    logger.error("❌ WooCommerce configuration missing. Skipping WooCommerce sync.");
    return [];
  }

  try {
    // Sync products first
    await syncProducts().catch(error => {
      logger.error("❌ Product sync failed:", error.message);
    });

    const response = await axios.get(`${WOO_CONFIG.baseURL}/wp-json/wc/v3/orders`, {
      headers: {
        Authorization: "Basic " + Buffer.from(`${WOO_CONFIG.consumerKey}:${WOO_CONFIG.consumerSecret}`).toString("base64")
      },
      params: {
        per_page: 100,
        page: 1,
        status: ["completed", "processing"]
      },
      timeout: 15000
    });

    if (!response.data || !Array.isArray(response.data)) {
      logger.warn("⚠️ No WooCommerce orders found or invalid response");
      return [];
    }

    logger.info(`📦 Found ${response.data.length} WooCommerce orders`);

    for (const order of response.data) {
      try {
        await Order.findOneAndUpdate(
          { id: order.id.toString() },
          {
            id: order.id.toString(),
            status: order.status,
            total: order.total,
            currency: order.currency || "INR",
            date_created: order.date_created,
            date_modified: order.date_modified,
            source: "woocommerce",
            line_items: order.line_items?.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              total: item.total,
              bookId: item.product_id.toString()
            })) || [],
            customer_id: order.customer_id,
            billing: order.billing || {},
            shipping: order.shipping || {}
          },
          { upsert: true, new: true }
        );
        logger.info(`✅ WooCommerce Order ID ${order.id} saved/updated in MongoDB.`);
      } catch (orderError) {
        logger.error(`❌ Error saving WooCommerce order ${order.id}:`, orderError.message);
      }
    }

    // Improved image validation
    logger.info('Starting image validation for WooCommerce books...');
    const books = await Book.find({ source: "woocommerce" }).lean();
    
    for (const book of books) {
      try {
        const updatedBookData = await validateAndSaveImage(book);
        if (updatedBookData.coverImage.url !== book.coverImage?.url) {
          await Book.findByIdAndUpdate(
            book._id,
            { $set: { coverImage: updatedBookData.coverImage } },
            { new: true }
          );
          logger.info(`✅ Updated image for book: ${book.title}`);
        }
      } catch (error) {
        logger.error(`❌ Error updating image for book ${book.title}:`, error.message);
        continue;
      }
    }
    logger.info('✅ Image validation completed');

    return response.data;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      logger.error("❌ Could not connect to WooCommerce API. Please check the API URL and your internet connection.");
    } else if (error.response?.status === 401) {
      logger.error("❌ WooCommerce authentication failed. Please check your consumer key and secret.");
    } else {
      logger.error("❌ WooCommerce API Error:", error.message);
    }
    return [];
  }
}

async function syncProducts() {
  try {
    if (!WOO_CONFIG.baseURL) {
      logger.error("❌ WooCommerce URL not configured");
      return;
    }

    const defaultAuthor = await getOrCreateDefaultAuthor();
    
    // Add timeout and error handling for WooCommerce API
    const response = await axios.get(`${WOO_CONFIG.baseURL}/wp-json/wc/v3/products`, {
      headers: {
        Authorization: "Basic " + Buffer.from(`${WOO_CONFIG.consumerKey}:${WOO_CONFIG.consumerSecret}`).toString("base64")
      },
      params: {
        per_page: 100,
        status: "publish"
      },
      timeout: 30000,
      validateStatus: (status) => status < 400
    }).catch(error => {
      if (error.response?.status === 401) {
        throw new Error("Authentication failed");
      }
      throw error;
    });

    if (!response?.data || !Array.isArray(response.data)) {
      logger.warn("⚠️ No products found or invalid response");
      return;
    }

    logger.info(`📚 Found ${response.data.length} products to sync`);

    for (const product of response.data) {
      try {
        if (!product?.name) continue;

        logger.info(`🔄 Syncing product ID: ${product.id} - ${product.name}`);

        const bookData = {
          title: product.name.trim(),
          description: product.description?.replace(/<[^>]*>/g, '').trim() || '',
          price: parseFloat(product.price || 0),
          coverImage: {
            url: product.images?.[0]?.src || "/images/default-book.png",
            key: `wc-${product.id}-${Date.now()}`
          },
          source: "woocommerce",
          externalIds: { woocommerce: product.id.toString() },
          status: "approved",
          author: defaultAuthor._id
        };

        // Remove the Book constructor validation
        // Instead, directly update/insert the document
        const updatedBook = await Book.findOneAndUpdate(
          { "externalIds.woocommerce": product.id.toString() },
          { $set: bookData },
          { 
            upsert: true, 
            new: true, 
            runValidators: true,
            setDefaultsOnInsert: true 
          }
        );

        logger.info(`✅ Book synced: ${updatedBook.title} (Product ID: ${product.id})`);
      } catch (error) {
        logger.error(`❌ Error syncing book ${product?.name || 'unknown'} (Product ID: ${product?.id}): ${error.message}`);
        continue;
      }
    }

    // Add summary logging
    logger.info(`📊 Product sync summary: ${response.data.length} products processed`);

    logger.info('✅ Product sync completed successfully');
  } catch (error) {
    logger.error("❌ Error in product sync:", error.message);
    throw error; // Propagate error to fetchOrders
  }
}

// Remove the duplicate fetchOrders function and merge the functionality
async function fetchOrders() {
  if (!WOO_CONFIG.baseURL || !WOO_CONFIG.consumerKey || !WOO_CONFIG.consumerSecret) {
    logger.error("❌ WooCommerce configuration missing. Skipping WooCommerce sync.");
    return [];
  }

  try {
    // Sync products first
    await syncProducts().catch(error => {
      logger.error("❌ Product sync failed:", error.message);
    });

    const response = await axios.get(`${WOO_CONFIG.baseURL}/wp-json/wc/v3/orders`, {
      headers: {
        Authorization: "Basic " + Buffer.from(`${WOO_CONFIG.consumerKey}:${WOO_CONFIG.consumerSecret}`).toString("base64")
      },
      params: {
        per_page: 100,
        page: 1,
        status: ["completed", "processing"]
      },
      timeout: 15000
    });

    if (!response.data || !Array.isArray(response.data)) {
      logger.warn("⚠️ No WooCommerce orders found or invalid response");
      return [];
    }

    logger.info(`📦 Found ${response.data.length} WooCommerce orders`);

    // Process orders
    for (const order of response.data) {
      try {
        await Order.findOneAndUpdate(
          { id: order.id.toString() },
          {
            id: order.id.toString(),
            status: order.status,
            total: order.total,
            currency: order.currency || "INR",
            date_created: order.date_created,
            date_modified: order.date_modified,
            source: "woocommerce",
            line_items: order.line_items?.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              total: item.total,
              bookId: item.product_id.toString()
            })) || [],
            customer_id: order.customer_id,
            billing: order.billing || {},
            shipping: order.shipping || {}
          },
          { upsert: true, new: true }
        );
        logger.info(`✅ WooCommerce Order ID ${order.id} saved/updated in MongoDB.`);
      } catch (orderError) {
        logger.error(`❌ Error saving WooCommerce order ${order.id}:`, orderError.message);
      }
    }

    // Update image validation
    try {
      logger.info('Starting image validation...');
      const books = await Book.find({ source: "woocommerce" }).lean();
      
      for (const book of books) {
        if (!book?._id) continue;
        
        try {
          const updatedBookData = await validateAndSaveImage(book);
          if (updatedBookData?.coverImage?.url !== book.coverImage?.url) {
            await Book.findByIdAndUpdate(
              book._id,
              { $set: { coverImage: updatedBookData.coverImage } },
              { new: true }
            );
          }
        } catch (error) {
          logger.warn(`⚠️ Image validation skipped for ${book.title}: ${error.message}`);
        }
      }
      logger.info('✅ Image validation completed');
    } catch (error) {
      logger.error("❌ Error during image sync:", error.message);
    }

    return response.data;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      logger.error("❌ Could not connect to WooCommerce API. Please check the API URL and your internet connection.");
    } else if (error.response?.status === 401) {
      logger.error("❌ WooCommerce authentication failed. Please check your consumer key and secret.");
    } else {
      logger.error("❌ WooCommerce API Error:", error.message);
    }
    return [];
  }
}

module.exports = {
  fetchOrders,
  syncProducts  // Add syncProducts to exports
};
