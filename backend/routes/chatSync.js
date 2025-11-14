const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const ChatMessage = require('../models/ChatMessage');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://vblmjxagxeangahqjspv.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Endpoint for Supabase webhook to POST new messages
router.post('/webhook', async (req, res) => {
  try {
    // Supabase sends payload in body.request.payload or body.record depending on config
    const body = req.body;
    const newRow = body.new || body.record || (body?.payload?.new);
    if (!newRow) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    // newRow contains: id, room_id, sender_id, message, created_at
    const { id: supabaseMessageId, room_id, sender_id, message, created_at } = newRow;

    // Resolve taskId and senderMongoId from Supabase
    // 1) get room to find task_id
    const { data: rooms, error: roomErr } = await supabase.from('chat_rooms').select('task_id').eq('id', room_id).limit(1);
    if (roomErr) {
      console.error('Supabase room lookup error:', roomErr);
    }
    const taskId = rooms && rooms[0] ? rooms[0].task_id : null;

    // 2) get chat_user record to read mongo_id
    const { data: users, error: userErr } = await supabase.from('chat_users').select('mongo_id').eq('id', sender_id).limit(1);
    if (userErr) {
      console.error('Supabase user lookup error:', userErr);
    }
    const senderMongoId = users && users[0] ? users[0].mongo_id : null;

    // Save to MongoDB for logs/history (include sender name/avatar if present)
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

    res.json({ ok: true });
  } catch (e) {
    console.error('chatSync webhook error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
