const Book = require("../models/book.model");
const Author = require("../models/author.model");
const logger = require("../config/logger");
const axios = require("axios");

async function validateAndUpdateImageUrl(book) {
  try {
    if (!book.coverImage?.url) {
      book.coverImage = {
        url: "/images/default-book.png",
        key: `default-${book._id}`
      };
      await book.save();
      return;
    }

    try {
      await axios.head(book.coverImage.url, { timeout: 5000 });
    } catch (error) {
      book.coverImage = {
        url: "/images/default-book.png",
        key: `default-${book._id}`
      };
      await book.save();
    }
  } catch (error) {
    logger.error(`❌ Error processing image for ${book.title}:`, error.message);
  }
}

async function syncAllBookImages() {
  try {
    const books = await Book.find({});
    logger.info(`🔄 Starting image sync for ${books.length} books...`);

    for (const book of books) {
      await validateAndUpdateImageUrl(book);
    }

    logger.info("✅ Book image sync completed");
  } catch (error) {
    logger.error("❌ Error during image sync:", error.message);
  }
}

module.exports = {
  validateAndUpdateImageUrl,
  syncAllBookImages
};