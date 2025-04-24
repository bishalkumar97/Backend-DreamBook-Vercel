const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { User } = require('../models');

const getNotifications = catchAsync(async (req, res) => {
    try {
        const { role, userId } = req.query;
        
        // Get user-specific notifications based on role
        let notifications = [];
        
        if (role === 'admin') {
            notifications = [
                {
                    _id: '1',
                    title: 'New Author Registration',
                    message: 'A new author has registered on the platform',
                    createdAt: new Date(),
                    read: false,
                    type: 'registration'
                },
                {
                    _id: '2',
                    title: 'New Book Submission',
                    message: 'A new book has been submitted for review',
                    createdAt: new Date(),
                    read: false,
                    type: 'book'
                }
            ];
        } else if (role === 'author' && userId) {
            notifications = [
                {
                    _id: '3',
                    title: 'Book Approved',
                    message: 'Your book has been approved by the admin',
                    createdAt: new Date(),
                    read: false,
                    type: 'book_status'
                }
            ];
        }

        res.status(httpStatus.OK).json({
            status: true,
            data: notifications
        });

    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
});

module.exports = {
    getNotifications
};