const express = require('express');
const router = express.Router();
const User = require('../models/usermodel');

// POST /api/support/login  — verify email + tempPassword, return user info
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  try {
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      tempPassword: password.trim()
    });
    if (!user)
      return res.status(401).json({ error: 'Invalid email or password' });

    res.json({
      userId:   user._id,
      username: user.username,
      email:    user.email,
      issue:    user.issue,
      status:   user.status
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/support/:userId/messages  — fetch all messages for a ticket
router.get('/:userId/messages', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('messages username issue status');
    if (!user) return res.status(404).json({ error: 'Ticket not found' });
    res.json({ messages: user.messages, username: user.username, issue: user.issue, status: user.status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/support/:userId/messages  — send a message (user or admin)
router.post('/:userId/messages', async (req, res) => {
  const { text, sender } = req.body;
  if (!text || !sender)
    return res.status(400).json({ error: 'text and sender are required' });
  if (!['user', 'admin'].includes(sender))
    return res.status(400).json({ error: 'sender must be user or admin' });

  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $push: { messages: { text, sender, timestamp: new Date() } } },
      { new: true }
    ).select('messages');

    if (!user) return res.status(404).json({ error: 'Ticket not found' });
    res.json({ messages: user.messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
