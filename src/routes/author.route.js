const express = require('express');
const { authorController } = require('../controllers');
const auth = require('../middlewares/auth');

const router = express.Router();

router.get('/dashboard', auth(), authorController.getAuthorDashboard);

module.exports = router;