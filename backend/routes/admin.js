const express = require('express');
const User = require('../models/User');
const Task = require('../models/Task');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all users
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (e) {
    res.status(500).send(e);
  }
});

// Get all tasks
router.get('/tasks', auth, adminAuth, async (req, res) => {
  try {
    const tasks = await Task.find().populate('client', 'name').populate('youth', 'name');
    res.send(tasks);
  } catch (e) {
    res.status(500).send(e);
  }
});

// Verify user
router.patch('/users/:id/verify', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.verified = true;
    await user.save();
    res.send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
