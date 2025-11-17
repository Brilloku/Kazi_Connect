/**
 * Task management routes for Kazilink
 * Handles CRUD operations for tasks, applications, and assignments
 * Includes real-time notifications via Supabase
 */

const express = require('express');
const { verifySupabaseUser } = require('../middleware/verifySupabaseUser');
const Task = require('../models/Task');
const User = require('../models/User');
const supabase = require('../supabaseClient');

const router = express.Router();

/**
 * POST /api/tasks
 * Create a new task (clients only)
 * Publishes real-time event for task creation
 */
router.post('/', verifySupabaseUser, async (req, res) => {
  try {
    const { title, description, price, location, skills } = req.body;

    // Verify user is a client
    if (req.user.role !== 'client') {
      return res.status(403).json({ error: 'Only clients can post tasks' });
    }

    const task = new Task({
      title,
      description,
      price,
      location,
      skills: skills || [],
      client: req.user.id,
      status: 'open'
    });

    await task.save();
    console.log(`Task created: ${task._id} by client ${req.user.email}`);

    // Publish realtime event (non-blocking)
    (async () => {
      try {
        await supabase.from('realtime_events').insert([{
          type: 'task:created',
          payload: { message: `${req.user.name} created a new task`, title: task.title, clientId: req.user.id },
          task_id: String(task._id),
          target_user_id: null
        }]);
      } catch (e) {
        console.warn('Failed to publish task:created event to Supabase', e.message || e);
      }
    })();

    res.status(201).json({
      id: task._id,
      title: task.title,
      description: task.description,
      price: task.price,
      location: task.location,
      skills: task.skills,
      status: task.status,
      createdAt: task.createdAt
    });
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

/**
 * GET /api/tasks
 * Get all tasks (with optional filters)
 * Populates client and assigned user information
 */
router.get('/', async (req, res) => {
  try {
    const { status, clientId } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }
    if (clientId) {
      query.client = clientId;
    }

    const tasks = await Task.find(query)
      .populate('client', 'name email location skills phone')
      .populate('assignedTo', 'name email location skills phone')
      .sort({ createdAt: -1 });

    console.log(`Fetched ${tasks.length} tasks`);
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

/**
 * GET /api/tasks/:id
 * Get a specific task by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('client', 'name email location skills phone')
      .populate('assignedTo', 'name email location skills phone')
      .populate('applicants', 'name email skills location phone');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (err) {
    console.error('Error fetching task:', err);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

/**
 * PATCH /api/tasks/:id
 * Update task details (client only)
 */
router.patch('/:id', verifySupabaseUser, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Only the client who created the task can update it
    if (task.client.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }

    // Can only update if not assigned
    if (task.status !== 'open') {
      return res.status(400).json({ error: 'Cannot update a task that is already assigned or completed' });
    }

    const updates = req.body;
    const allowedUpdates = ['title', 'description', 'price', 'location', 'skills'];

    // Filter allowed updates
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    Object.assign(task, filteredUpdates);
    task.updatedAt = new Date();
    await task.save();

    console.log(`Task ${task._id} updated`);
    res.json(task);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

/**
 * PATCH /api/tasks/:id/accept
 * Apply for a task (youth only)
 * Adds user to task applicants array
 */
router.patch('/:id/accept', verifySupabaseUser, async (req, res) => {
  try {
    // Verify user is youth
    if (req.user.role !== 'youth') {
      return res.status(403).json({ error: 'Only youth can apply for tasks' });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if task is still open
    if (task.status !== 'open') {
      return res.status(400).json({ error: 'Task is no longer available' });
    }

    // Check if user already applied
    if (task.applicants.includes(req.user.id)) {
      return res.status(400).json({ error: 'You have already applied for this task' });
    }

    // Add user to applicants
    task.applicants.push(req.user.id);
    await task.save();

    console.log(`User ${req.user.email} applied for task ${task._id}`);

    // Publish realtime event
    (async () => {
      try {
        await supabase.from('realtime_events').insert([{
          type: 'task:applied',
          payload: { message: `${req.user.name} applied for your task`, taskTitle: task.title },
          task_id: String(task._id),
          target_user_id: String(task.client)
        }]);
      } catch (e) {
        console.warn('Failed to publish task:applied event to Supabase', e.message || e);
      }
    })();

    res.json({ message: 'Successfully applied for task' });
  } catch (err) {
    console.error('Error applying for task:', err);
    res.status(500).json({ error: 'Failed to apply for task' });
  }
});

/**
 * PATCH /api/tasks/:id/accept-applicant
 * Accept an applicant for the task (client only)
 * Assigns the task to the selected youth
 */
router.patch('/:id/accept-applicant', verifySupabaseUser, async (req, res) => {
  try {
    const { applicantId } = req.body;

    if (!applicantId) {
      return res.status(400).json({ error: 'Applicant ID required' });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Only the client who created the task can accept applicants
    if (task.client.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Not authorized to accept applicants for this task' });
    }

    // Check if task is still open
    if (task.status !== 'open') {
      return res.status(400).json({ error: 'Task is no longer available' });
    }

    // Check if applicant is in the applicants list
    if (!task.applicants.includes(applicantId)) {
      return res.status(400).json({ error: 'Applicant not found for this task' });
    }

    // Assign the task
    task.assignedTo = applicantId;
    task.status = 'assigned';
    task.updatedAt = new Date();
    await task.save();

    console.log(`Task ${task._id} assigned to user ${applicantId}`);

    // Publish realtime event
    (async () => {
      try {
        await supabase.from('realtime_events').insert([{
          type: 'task:assigned',
          payload: { message: `You were assigned to task: ${task.title}`, clientName: req.user.name },
          task_id: String(task._id),
          target_user_id: String(applicantId)
        }]);
      } catch (e) {
        console.warn('Failed to publish task:assigned event to Supabase', e.message || e);
      }
    })();

    res.json({ message: 'Applicant accepted successfully', task });
  } catch (err) {
    console.error('Error accepting applicant:', err);
    res.status(500).json({ error: 'Failed to accept applicant' });
  }
});

/**
 * PATCH /api/tasks/:id/assign/:userId
 * Directly assign task to a user (admin function)
 */
router.patch('/:id/assign/:userId', verifySupabaseUser, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    const userToAssign = await User.findById(req.params.userId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (!userToAssign) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only admin or task client can assign
    if (req.user.role !== 'admin' && task.client.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Not authorized to assign this task' });
    }

    task.assignedTo = req.params.userId;
    task.status = 'assigned';
    task.updatedAt = new Date();
    await task.save();

    console.log(`Task ${task._id} assigned to user ${req.params.userId}`);
    res.json({ message: 'Task assigned successfully', task });
  } catch (err) {
    console.error('Error assigning task:', err);
    res.status(500).json({ error: 'Failed to assign task' });
  }
});

/**
 * PATCH /api/tasks/:id/complete
 * Mark task as completed (youth only)
 */
router.patch('/:id/complete', verifySupabaseUser, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Only the assigned youth can mark as complete
    if (task.assignedTo.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Not authorized to complete this task' });
    }

    // Only allow completion if task is assigned
    if (task.status !== 'assigned') {
      return res.status(400).json({ error: 'Task must be assigned before it can be marked complete' });
    }

    task.status = 'completed';
    task.completedAt = new Date();
    task.updatedAt = new Date();
    await task.save();

    console.log(`Task ${task._id} marked as complete by youth`);

    // Update user's completed tasks count
    await User.findByIdAndUpdate(req.user.id, { $inc: { completedTasks: 1 } });

    // Notify the client that task was completed
    (async () => {
      try {
        await supabase.from('realtime_events').insert([{
          type: 'task:completed',
          payload: { message: `Task ${task.title} was marked as completed by ${req.user.name}`, completedBy: req.user.id },
          task_id: String(task._id),
          target_user_id: String(task.client)
        }]);
      } catch (e) {
        console.warn('Failed to publish task:completed event to Supabase', e.message || e);
      }
    })();

    res.json({ message: 'Task marked as complete', task });
  } catch (err) {
    console.error('Error completing task:', err);
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

/**
 * PATCH /api/tasks/:id/complete-client
 * Mark task as completed by client
 */
router.patch('/:id/complete-client', verifySupabaseUser, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Only the client who created the task can mark it complete
    if (task.client.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Not authorized to complete this task' });
    }

    // Only allow completion if task is assigned
    if (task.status !== 'assigned') {
      return res.status(400).json({ error: 'Task must be assigned before it can be marked complete' });
    }

    task.status = 'completed';
    task.completedAt = new Date();
    task.updatedAt = new Date();
    await task.save();

    console.log(`Task ${task._id} marked as complete by client`);
    // Notify the assigned user that task was completed
    (async () => {
      try {
        await supabase.from('realtime_events').insert([{
          type: 'task:completed',
          payload: { message: `Task ${task.title} was marked as completed by the client`, completedBy: req.user.id },
          task_id: String(task._id),
          target_user_id: String(task.assignedTo)
        }]);
      } catch (e) {
        console.warn('Failed to publish task:completed event to Supabase', e.message || e);
      }
    })();
    res.json({ message: 'Task marked as complete', task });
  } catch (err) {
    console.error('Error completing task:', err);
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

/**
 * DELETE /api/tasks/:id
 * Delete task (client only)
 * Can only delete if task is not assigned
 */
router.delete('/:id', verifySupabaseUser, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Only the client who created the task can delete it
    if (task.client.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this task' });
    }

    // Can only delete if not assigned
    if (task.status !== 'open') {
      return res.status(400).json({ error: 'Cannot delete a task that is already assigned or completed' });
    }

    await Task.findByIdAndDelete(req.params.id);
    console.log(`Task ${task._id} deleted`);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
