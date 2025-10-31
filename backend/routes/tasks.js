const express = require('express');
const Task = require('../models/Task');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create task (clients only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'client') {
    return res.status(403).send({ error: 'Only clients can post tasks.' });
  }
  try {
    const task = new Task({ ...req.body, client: req.user._id });
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Get all tasks
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find().populate('client', 'name').populate('youth', 'name');
    res.send(tasks);
  } catch (e) {
    res.status(500).send(e);
  }
});

// Accept task (youths only)
router.patch('/:id/accept', auth, async (req, res) => {
  if (req.user.role !== 'youth') {
    return res.status(403).send({ error: 'Only youths can accept tasks.' });
  }
  try {
    const task = await Task.findById(req.params.id);
    if (!task || task.status !== 'open') {
      return res.status(400).send({ error: 'Task not available.' });
    }
    task.youth = req.user._id;
    task.status = 'accepted';
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Complete task
router.patch('/:id/complete', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task || task.youth.toString() !== req.user._id.toString()) {
      return res.status(403).send({ error: 'Not authorized.' });
    }
    task.status = 'completed';
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
