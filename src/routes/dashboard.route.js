const express = require('express');
const auth = require('../middlewares/auth');
const { getAdminDashboard, getAuthorDashboard, getEmployeeDashboard } = require('../controllers/dashboard.controller');

const router = express.Router();

// Update these routes to use proper middleware and controllers
router.get('/admin', auth(['admin']), getAdminDashboard);
router.get('/author', auth(['author']), getAuthorDashboard);
router.get('/employee', auth(['employee']), getEmployeeDashboard);

module.exports = router;