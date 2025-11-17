/**
 * Chat synchronization routes for Kazilink
 * Handles webhook integration with Supabase for real-time chat messages
 * Syncs Supabase chat messages to MongoDB for persistence and history
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const ChatMessage = require('../models/ChatMessage');

// Initialize Supabase client for webhook processing
// Uses environment variables for secure configuration
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://vblmjxagxeangahqjspv.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * POST /api/chatsync/webhook
 * Webhook endpoint for Supabase database changes
 * Triggered when new chat messages are inserted into Supabase
 * Syncs messages to MongoDB for persistence and search capabilities
 */
router.post('/webhook', async (req, res) => {
  try {
    // Supabase sends payload in different formats depending on configuration
    // Handle both 'body.request.payload' and 'body.record' formats
    const body = req.body;
    const newRow = body.new || body.record || (body?.payload?.new);

    if (!newRow) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    // Extract message data from Supabase row
    // Fields: id, room_id, sender_id, message, created_at
    const { id: supabaseMessageId, room_id, sender_id, message, created_at } = newRow;

    // Resolve task ID from chat room
    // Query Supabase chat_rooms table to find the associated task
    const { data: rooms, error: roomErr } = await supabase
      .from('chat_rooms')
      .select('task_id')
      .eq('id', room_id)
      .limit(1);

    if (roomErr) {
      console.error('Supabase room lookup error:', roomErr);
    }
    const taskId = rooms && rooms[0] ? rooms[0].task_id : null;

    // Resolve MongoDB user ID from Supabase chat_users table
    // Links Supabase auth users to MongoDB user profiles
    const { data: users, error: userErr } = await supabase
      .from('chat_users')
      .select('mongo_id')
      .eq('id', sender_id)
      .limit(1);

    if (userErr) {
      console.error('Supabase user lookup error:', userErr);
    }
    const senderMongoId = users && users[0] ? users[0].mongo_id : null;

    // Save message to MongoDB for persistence and history
    // Includes additional fields like sender name/avatar if available
    const msgDoc = new ChatMessage({
      supabaseMessageId: String(supabaseMessageId),
      taskId: String(taskId || ''),
      senderMongoId: String(senderMongoId || ''),
      message: String(message || ''),
      senderName: String(newRow.sender_name || ''),
      senderAvatar: String(newRow.sender_avatar || ''),
      createdAt: created_at ? new Date(created_at) : new Date()
    });

    await msgDoc.save();
    console.log(`Chat message synced: ${supabaseMessageId} for task ${taskId}`);

    res.json({ ok: true });
  } catch (e) {
    console.error('chatSync webhook error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
