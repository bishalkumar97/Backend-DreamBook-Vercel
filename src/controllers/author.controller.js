const catchAsync = require('../utils/catchAsync');
const { Book } = require('../models');
const Order = require('../models/Order');
const mongoose = require('mongoose');

const getAuthorDashboard = async (req, res) => {
    try {
        const authorId = req.user._id;

        // Get all books by the author
        const books = await Book.find({ author: authorId });

        // Calculate statistics
        const publishedBooks = books.filter(book => book.status === 'published').length;
        const draftBooks = books.filter(book => book.status === 'draft').length;
        const pendingBooks = books.filter(book => book.status === 'pending').length;

        // Get recent books (last 5)
        const recentBooks = await Book.find({ author: authorId })
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            status: true,
            data: {
                totalBooks: books.length,
                recentBooks,
                authorStats: {
                    publishedBooks,
                    draftBooks,
                    pendingBooks
                }
            }
        });
    } catch (error) {
        console.error('Error in getAuthorDashboard:', error);
        res.status(500).json({
            status: false,
            message: 'Failed to fetch dashboard data'
        });
    }
};

module.exports = {
    getAuthorDashboard
};