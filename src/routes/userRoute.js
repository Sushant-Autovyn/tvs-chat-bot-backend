const express = require('express');
const router = express.Router();
const { saveUser, getAllUsers, updateUserStatus } = require('../data/userData');

// save user details
router.post('/', async (req, res) => {
  console.log('[ROUTE] 🎯 POST /api/users HIT — body:', JSON.stringify(req.body));
  const { username, email, phone, issue, userId } = req.body;

  if (!username || !email || !phone || !issue) {
    console.log('[ROUTE] ❌ Validation failed - missing fields');
    return res.status(400).json({ error: 'Username, email, phone, and issue are required' });
  }

  try {
    const user = await saveUser({ username, email, phone, issue, userId });
    console.log('[ROUTE] ✅ User saved with ID:', user._id);
    res.status(201).json({ success: true, user });
  } catch (error) {
    console.error('[ROUTE] ❌ saveUser failed:', error.message);
    res.status(500).json({ error: 'Failed to save user details' });
  }
});

// get all users for dashboard
router.get('/', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({ total: users.length, users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load users' });
  }
});

// update user status
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    const user = await updateUserStatus(id, status);
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

module.exports = router;