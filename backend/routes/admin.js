/**
 * Admin routes for Kazilink
 * Provides administrative functions for managing users and tasks
 * Requires admin role authentication
 */

const express = require('express');
const { verifySupabaseUser, adminAuth } = require('../middleware/verifySupabaseUser');
const User = require('../models/User');
const Task = require('../models/Task');

const router = express.Router();

// Apply admin authentication to all routes
router.use(verifySupabaseUser);
router.use(adminAuth);

/**
 * GET /api/admin/users
 * Get all users for admin management
 * Returns user list with sensitive information redacted
 */
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password -supabaseId') // Exclude sensitive fields
      .sort({ createdAt: -1 });

    console.log(`Admin fetched ${users.length} users`);
    res.json(users);
  } catch (err) {
    console.error('Error fetching users for admin:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * GET /api/admin/tasks
 * Get all tasks for admin oversight
 * Returns complete task information including all statuses
 */
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({})
      .populate('client', 'name email')
      .populate('assignedTo', 'name email')
      .populate('applicants', 'name email')
      .sort({ createdAt: -1 });

    console.log(`Admin fetched ${tasks.length} tasks`);
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks for admin:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

/**
 * PATCH /api/admin/users/:id/verify
 * Verify a user's identity (admin only)
 * Sets the user's verified status to true
 */
router.patch('/users/:id/verify', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update verification status
    user.isVerified = true; // Note: Using isVerified instead of verified for consistency
    await user.save();

    console.log(`Admin verified user: ${user.email}`);
    res.json({ message: 'User verified successfully', user });
  } catch (err) {
    console.error('Error verifying user:', err);
    res.status(500).json({ error: 'Failed to verify user' });
  }
});

/**
 * PATCH /api/admin/users/:id/deactivate
 * Deactivate a user account (admin only)
 * Sets the user's active status to false
 */
router.patch('/users/:id/deactivate', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Deactivate user account
    user.isActive = false;
    await user.save();

    console.log(`Admin deactivated user: ${user.email}`);
    res.json({ message: 'User deactivated successfully' });
  } catch (err) {
    console.error('Error deactivating user:', err);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

/**
 * DELETE /api/admin/tasks/:id
 * Delete any task (admin override)
 * Bypasses normal client-only deletion restrictions
 */
router.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);
    console.log(`Admin deleted task: ${task._id}`);
    res.json({ message: 'Task deleted successfully by admin' });
  } catch (err) {
    console.error('Error deleting task by admin:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

/**
 * GET /api/admin/stats
 * Get platform statistics for admin dashboard
 * Returns counts and metrics for monitoring
 */
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTasks = await Task.countDocuments();
    const openTasks = await Task.countDocuments({ status: 'open' });
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const activeUsers = await User.countDocuments({ isActive: true });

    const stats = {
      totalUsers,
      totalTasks,
      openTasks,
      completedTasks,
      activeUsers,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0
    };

    console.log('Admin fetched platform stats');
    res.json(stats);
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
