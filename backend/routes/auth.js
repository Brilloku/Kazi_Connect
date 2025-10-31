const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, location, skills, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = new User({ name, email, password: hashedPassword, role, location, skills, phone });
    await user.save();
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'secretkey');
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).send({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'secretkey');
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Get profile
router.get('/me', auth, async (req, res) => {
  res.send(req.user);
});

module.exports = router;
