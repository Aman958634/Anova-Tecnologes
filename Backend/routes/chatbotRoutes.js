const express = require('express');
const authRequired = require('../middleware/auth');
const { createChatReply, createLead, listLeads, deleteLead, getChatHistory } = require('../controllers/chatbotController');
const { contactRateLimit } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/reply', createChatReply);
router.get('/history', getChatHistory);
router.get('/history/:sessionId', getChatHistory);
router.post('/lead', contactRateLimit, createLead);
router.get('/leads', authRequired, listLeads);
router.delete('/leads/:id', authRequired, deleteLead);

module.exports = router;
