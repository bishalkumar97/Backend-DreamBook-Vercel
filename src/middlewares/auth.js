const jwt = require('jsonwebtoken');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const config = require('../config/config');

const auth = (requiredRights) => async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
        }

        const decoded = jwt.verify(token, config.jwt.secret);
        const user = await User.findById(decoded.sub);

        if (!user) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found');
        }

        if (requiredRights && !requiredRights.includes(req.user.role.toLowerCase())) {
            return res.status(403).json({
                status: false,
                message: 'Unauthorized access'
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            status: false,
            message: 'Please authenticate'
        });
    }
};

module.exports = auth;