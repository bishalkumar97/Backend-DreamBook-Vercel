const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { Book } = require('../models');
const User = require('../models/User');

const getAdminDashboard = catchAsync(async (req, res) => {
    try {
        const totalBooks = await Book.countDocuments();
        const totalAuthors = await User.countDocuments({ role: 'author' });
        const totalEmployees = await User.countDocuments({ role: 'employee' });

        res.status(200).json({
            status: true,
            data: {
                totalBooks,
                totalAuthors,
                totalEmployees,
                recentBooks: await Book.find().sort({ createdAt: -1 }).limit(5).populate('author'),
                recentAuthors: await User.find({ role: 'author' }).sort({ createdAt: -1 }).limit(5)
            }
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

const getAuthorDashboard = catchAsync(async (req, res) => {
    try {
        const authorId = req.user._id;
        
        // Get all books by the author
        const books = await Book.find({ author: authorId });
        const totalBooks = books.length;
        
        // Get recent books with sales data
        const recentBooks = await Book.find({ author: authorId })
            .sort({ createdAt: -1 })
            .limit(5);

        // Calculate platform-wise stats
        const platformStats = [];
        const platforms = ['amazon', 'flipkart', 'woocommerce'];
        
        platforms.forEach(platform => {
            const platformBooks = books.filter(book => {
                return book.platforms.some(p => p.platform.toLowerCase() === platform.toLowerCase());
            });
            
            platformStats.push({
                platform: platform.charAt(0).toUpperCase() + platform.slice(1),
                quantity: platformBooks.length,
                total: platformBooks.reduce((sum, book) => {
                    const platformData = book.platforms.find(p => p.platform.toLowerCase() === platform.toLowerCase());
                    return sum + (platformData ? platformData.royalty : 0);
                }, 0)
            });
        });

        // Calculate total royalty
        const totalRoyalty = platformStats.reduce((sum, platform) => sum + platform.total, 0);

        res.status(200).json({
            status: true,
            data: {
                totalBooks,
                totalRoyalty,
                platformStats,
                recentBooks,
                authorStats: {
                    publishedBooks: books.filter(book => book.status === 'published').length,
                    draftBooks: books.filter(book => book.status === 'draft').length,
                    pendingBooks: books.filter(book => book.status === 'pending').length
                }
            }
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

const getEmployeeDashboard = catchAsync(async (req, res) => {
    try {
        const employeeId = req.user._id;
        const assignedBooks = await Book.find({ assignedTo: employeeId })
            .sort({ createdAt: -1 })
            .populate('author');

        res.status(200).json({
            status: true,
            data: {
                totalAssignedBooks: assignedBooks.length,
                recentAssignments: assignedBooks.slice(0, 5),
                taskStats: {
                    completed: assignedBooks.filter(book => book.status === 'completed').length,
                    inProgress: assignedBooks.filter(book => book.status === 'in-progress').length,
                    pending: assignedBooks.filter(book => book.status === 'pending').length
                }
            }
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

module.exports = {
    getAdminDashboard,
    getAuthorDashboard,
    getEmployeeDashboard
};