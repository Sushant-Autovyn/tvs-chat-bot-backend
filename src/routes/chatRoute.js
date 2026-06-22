const express = require('express');
const router = express.Router();
const { getReply } = require('../controllers/chatController');

router.post('/', (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  const result = getReply(message);

  res.json({
    intent: result.intent,
    reply: result.response,
    quickReplies: result.quickReplies || []
  });
});

module.exports = router;