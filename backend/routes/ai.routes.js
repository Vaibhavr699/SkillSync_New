const express = require('express');
const router = express.Router();
const { askAI } = require('../controllers/ai.controller');
const auth = require('../middleware/auth');

router.post('/ask', auth, askAI);

module.exports = router;