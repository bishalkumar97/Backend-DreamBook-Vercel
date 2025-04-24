const express = require('express');
const { firebaseAuth } = require('../middlewares/firebaseAuth');
const { getNotifications } = require('../controllers/notification.controller');

const router = express.Router();

router.get('/', firebaseAuth(), getNotifications);

module.exports = router;