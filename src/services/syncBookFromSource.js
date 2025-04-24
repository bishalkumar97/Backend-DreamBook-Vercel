// services/syncBookFromSource.js

const { Book } = require("../models");

async function syncBookFromExternalSource(incomingBook, source = "unknown") {
  if (!incomingBook?.id) {
    console.warn("⚠️ No book ID provided for sync");
    return;
  }

  const updateFields = {
    title: incomingBook.name || incomingBook.title,
    price: parseFloat(incomingBook.price || 0),
    description: incomingBook.description || "No description available",
    coverImage: {
      url: incomingBook.cover || incomingBook.images?.[0]?.src || incomingBook.image || ""
    },
    updatedAt: new Date(),
    source,
    [`externalIds.${source}`]: incomingBook.id
  };

  try {
    // Find by external ID first
    let book = await Book.findOne({
      [`externalIds.${source}`]: incomingBook.id
    });

    if (!book) {
      // If not found by external ID, try finding by title (fallback)
      book = await Book.findOne({
        title: new RegExp(updateFields.title, 'i')
      });
    }

    if (book) {
      // Update existing book
      Object.assign(book, updateFields);
      await book.save();
      console.log(`✅ Book updated from ${source}: ${book.title}`);
      return book;
    } else {
      // Create new book
      const newBook = await Book.create({
        ...updateFields,
        status: "pending" // New books need approval
      });
      console.log(`✅ New book created from ${source}: ${newBook.title}`);
      return newBook;
    }
  } catch (error) {
    console.error(`❌ Error syncing book from ${source}:`, error);
    throw error;
  }
}

module.exports = { syncBookFromExternalSource };
