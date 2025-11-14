const express = require('express');
const { verifySupabaseUser } = require('../middleware/verifySupabaseUser');
const Task = require('../models/Task');
const User = require('../models/User');
const supabase = require('../supabaseClient');

const router = express.Router();

// POST - Create a new task (clients only)
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

// GET - Get all tasks (with optional filters)
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

// GET - Get task by ID
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('client', 'name email location skills phone')
      .populate('assignedTo', 'name email location skills phone')
      .populate('applicants', 'name email location skills phone');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (err) {
    console.error('Error fetching task:', err);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// PATCH - Update task (client only)
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

    const { title, description, price, location, skills, status } = req.body;
    
    if (title) task.title = title;
    if (description) task.description = description;
    if (price) task.price = price;
    if (location) task.location = location;
    if (skills) task.skills = skills;
    if (status) task.status = status;
    
    task.updatedAt = new Date();
    await task.save();

    console.log(`Task updated: ${task._id}`);
    res.json(task);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// PATCH - Accept/Apply for a task (youth only)
router.patch('/:id/accept', verifySupabaseUser, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify user is youth
    if (req.user.role !== 'youth') {
      return res.status(403).json({ error: 'Only youth can apply for tasks' });
    }

    // Check if already applied
    if (task.applicants.includes(req.user.id)) {
      return res.status(400).json({ error: 'You have already applied for this task' });
    }

    // Add to applicants list
    task.applicants.push(req.user.id);
    await task.save();

    console.log(`User ${req.user.email} applied for task ${task._id}`);
    // Notify task owner (client) that someone applied
    (async () => {
      try {
        await supabase.from('realtime_events').insert([{
          type: 'task:applied',
          payload: { message: `${req.user.name} applied to your task`, applicantId: req.user.id, applicantName: req.user.name },
          task_id: String(task._id),
          target_user_id: String(task.client)
        }]);
      } catch (e) {
        console.warn('Failed to publish task:applied event to Supabase', e.message || e);
      }
    })();
    res.json({ message: 'Application submitted successfully', task });
  } catch (err) {
    console.error('Error applying for task:', err);
    res.status(500).json({ error: 'Failed to apply for task' });
  }
});

// PATCH - Accept applicant for task (client only) - new endpoint for frontend modal
router.patch('/:id/accept-applicant', verifySupabaseUser, async (req, res) => {
  try {
    const { applicantId } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Only the client who created the task can accept applicants
    if (task.client.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Not authorized to accept applicants for this task' });
    }

    // Check if user is in applicants
    if (!task.applicants.includes(applicantId)) {
      return res.status(400).json({ error: 'User has not applied for this task' });
    }

    // Assign the task to this applicant and clear other applicants
    task.assignedTo = applicantId;
    task.status = 'assigned';
    task.applicants = []; // Clear all applicants since task is now assigned
    task.updatedAt = new Date();
    await task.save();

    console.log(`Task ${task._id} assigned to applicant ${applicantId}`);
    // Notify the assigned user that they were assigned
    (async () => {
      try {
        // try to get assigned user's name
        const assignedUser = await User.findById(applicantId).select('name');
        await supabase.from('realtime_events').insert([{
          type: 'task:assigned',
          payload: { message: `You were assigned to task ${task.title}`, assignedTo: applicantId, assignedName: assignedUser?.name || null },
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

// PATCH - Assign task to a youth (client only) - kept for backward compatibility
router.patch('/:id/assign/:userId', verifySupabaseUser, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Only the client who created the task can assign it
    if (task.client.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Not authorized to assign this task' });
    }

    // Check if user is in applicants
    if (!task.applicants.includes(req.params.userId)) {
      return res.status(400).json({ error: 'User has not applied for this task' });
    }

    task.assignedTo = req.params.userId;
    task.status = 'assigned';
    task.updatedAt = new Date();
    await task.save();

    console.log(`Task ${task._id} assigned to user ${req.params.userId}`);
    // Notify the assigned user that they were assigned
    (async () => {
      try {
        // try to get assigned user's name
        const assignedUser = await User.findById(req.params.userId).select('name');
        await supabase.from('realtime_events').insert([{
          type: 'task:assigned',
          payload: { message: `You were assigned to task ${task.title}`, assignedTo: req.params.userId, assignedName: assignedUser?.name || null },
          task_id: String(task._id),
          target_user_id: String(req.params.userId)
        }]);
      } catch (e) {
        console.warn('Failed to publish task:assigned event to Supabase', e.message || e);
      }
    })();
    res.json({ message: 'Task assigned successfully', task });
  } catch (err) {
    console.error('Error assigning task:', err);
    res.status(500).json({ error: 'Failed to assign task' });
  }
});

// PATCH - Mark task as complete (assigned user only)
router.patch('/:id/complete', verifySupabaseUser, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Only the assigned user can mark it complete
    if (!task.assignedTo || task.assignedTo.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Not authorized to complete this task' });
    }

    task.status = 'completed';
    task.completedAt = new Date();
    task.updatedAt = new Date();
    await task.save();

    console.log(`Task ${task._id} marked as complete`);
    // Notify task owner that task was completed
    (async () => {
      try {
        await supabase.from('realtime_events').insert([{
          type: 'task:completed',
          payload: { message: `Task ${task.title} was completed`, completedBy: req.user.id },
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

// PATCH - Mark task as complete (client only - for MyTasks page)
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

// DELETE - Delete task (client only)
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
