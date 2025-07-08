const express = require('express');
const router = express.Router();
const { getNotifications, markNotificationAsRead, markAllAsRead } = require('../controllers/notification.controller');
const auth = require('../middleware/auth');

router.get('/', auth, getNotifications);
router.put('/:notificationId/read', auth, markNotificationAsRead);
router.put('/read-all', auth, markAllAsRead);

module.exports = router;