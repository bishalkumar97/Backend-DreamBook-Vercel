const { Book } = require('../models');
const httpStatus = require('http-status');
const { fileUploadService } = require('../microservices');

const ApiError = require('../utils/ApiError');
const { getAllData } = require("../utils/getAllData");

async function addBook(book) {
    return await Book.create(book);
}

async function getBookById(id) {
    return await Book.findById(id).populate({ path: "author" });
}


// async function updateUserById(id, newDetails, profileImage = null) {
//   const user = await User.findById(id);
//   userValidator(user);
//   let updates = { ...newDetails };
//   return await User.findByIdAndUpdate(id, updates, { new: true });

// }

async function updateBookById(id, newDetails) {
    return await Book.findByIdAndUpdate(id, newDetails, { new: true });
}

async function deleteBook(id, newDetails) {
    return await Book.findByIdAndDelete(id);
}

// async function getAllBooks(query, populateConfig) {
//     const data = await getAllData(Book, query, populateConfig)
//     return data;
// }

async function getAllBooks(query, populateConfig) {
    // Add index hints for faster queries
    const options = {
        lean: true, // Use lean queries for better performance
        hint: { status: 1, createdAt: -1 } // Use indexes
    };

    // Optimize search query
    if (query.search) {
        const searchRegex = new RegExp(query.search, 'i');
        query.$or = [
            { title: searchRegex },
            { description: searchRegex }
        ];
        delete query.search;
    }

    // Add pagination limits
    const limit = parseInt(query.limit) || 50;
    const page = parseInt(query.page) || 1;
    
    return await Book.find(query)
        .populate(populateConfig)
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })
        .setOptions(options);
}

// FIX HERE NEW: New service function to update only the book's status.
async function updateBookStatus(id, newStatus) {
    try {
        const book = await Book.findById(id);
        if (!book) {
            throw new ApiError(httpStatus.NOT_FOUND, "Book not found");
        }

        // Validate status and handle WooCommerce books differently
        if (!["approved", "pending", "rejected"].includes(newStatus)) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Invalid status value");
        }

        // Special handling for WooCommerce books
        if (book.source === "woocommerce" && newStatus === "rejected") {
            logger.warn(`⚠️ Attempting to reject WooCommerce book: ${book.title}`);
        }

        book.status = newStatus;
        await book.save();
        
        logger.info(`✅ Book status updated: ${book.title} -> ${newStatus}`);
        return book;
    } catch (error) {
        logger.error(`❌ Error updating book status: ${error.message}`);
        throw error;
    }
}


async function getTotalBooksCount(query) {
    // Remove pagination parameters from the query
    const countQuery = { ...query };
    delete countQuery.page;
    delete countQuery.limit;
    
    return await Book.countDocuments(countQuery);
}

// Add to module.exports
module.exports = {
    addBook,
    getAllBooks,
    getBookById,
    updateBookById,
    deleteBook,
    //   getUserById,
    //   updateUserById,
    //   getAllUsers,
    //   updateAuthor,
    getTotalBooksCount,
};
