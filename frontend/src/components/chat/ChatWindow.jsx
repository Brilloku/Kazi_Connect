import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

// Props: taskId, currentUserMongoId, currentUserName, currentUserAvatar
const ChatWindow = ({ taskId, currentUserMongoId, currentUserName, currentUserAvatar, onClose }) => {
  const [room, setRoom] = useState(null);
  const [chatUser, setChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef();
  const subscriptionRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const setup = async () => {
      try {
        // 1) Ensure chat_user exists (by mongo_id)
        let { data: existingUser } = await supabase
          .from('chat_users')
          .select('*')
          .eq('mongo_id', currentUserMongoId)
          .limit(1);

        let userRow;
        if (!existingUser || existingUser.length === 0) {
          const { data, error } = await supabase.from('chat_users').insert([
            { mongo_id: currentUserMongoId, name: currentUserName, avatar_url: currentUserAvatar }
          ]).select().single();
          if (error) throw error;
          userRow = data;
        } else {
          userRow = existingUser[0];
        }
        if (!mounted) return;
        setChatUser(userRow);

        // 2) Ensure chat_room exists (task_id unique)
        let { data: existingRoom } = await supabase
          .from('chat_rooms')
          .select('*')
          .eq('task_id', taskId)
          .limit(1);

        let roomRow;
        if (!existingRoom || existingRoom.length === 0) {
          const { data, error } = await supabase.from('chat_rooms').insert([
            { task_id: taskId }
          ]).select().single();
          if (error) throw error;
          roomRow = data;
        } else {
          roomRow = existingRoom[0];
        }
        if (!mounted) return;
        setRoom(roomRow);

        // 3) Load messages for this room
        const { data: msgs, error: msgErr } = await supabase
          .from('chat_messages')
          .select(`id, message, created_at, sender_id, sender_name, sender_avatar`)
          .eq('room_id', roomRow.id)
          .order('created_at', { ascending: true });

        if (msgErr) throw msgErr;
        if (!mounted) return;
        setMessages(msgs || []);

        // 4) Subscribe to new messages for this room using channel/postgres_changes
        const channel = supabase.channel(`room:${roomRow.id}`);
        channel.on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomRow.id}` },
          (payload) => {
            const newMsg = payload.new;
            setMessages(prev => [...prev, newMsg]);
            // show notification if sender is not current user
            if (newMsg.sender_id !== userRow.id) {
              toast.info(`New message from ${newMsg.sender_name || 'Unknown'}`);
            }
            setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
          }
        );

        // subscribe and keep reference for cleanup
        await channel.subscribe();
        subscriptionRef.current = channel;

      } catch (e) {
        console.error('Chat setup error:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    setup();

    return () => {
      mounted = false;
      // unsubscribe
      try {
        if (subscriptionRef.current) {
          // supabase v2: remove channel
          supabase.removeChannel(subscriptionRef.current);
        }
      } catch (e) {
        // ignore
      }
    };
  }, [taskId, currentUserMongoId, currentUserName, currentUserAvatar]);

  const sendMessage = async () => {
    if (!input || !room || !chatUser) return;
    const text = input.trim();
    if (!text) return;
    setInput('');

    // Insert message into Supabase (will trigger realtime)
    const { error } = await supabase.from('chat_messages').insert([
      { room_id: room.id, sender_id: chatUser.id, message: text, sender_name: currentUserName, sender_avatar: currentUserAvatar }
    ]);

    if (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
    } else {
      // Send notification to the other party (client or youth)
      try {
        // Determine the target user: if current user is client, notify assigned youth; if youth, notify client
        // We need to get the task details to find the other party
        // For now, we'll send a general notification - the backend can handle targeting
        await supabase.from('realtime_events').insert([{
          type: 'chat:new-message',
          payload: { message: `New message in chat for task`, senderName: currentUserName, taskId },
          task_id: taskId,
          target_user_id: null // Let the frontend filter based on user role/task ownership
        }]);
      } catch (e) {
        console.warn('Failed to send chat notification', e);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
            {currentUserName?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="text-sm font-semibold">Chat for task</div>
            <div className="text-xs text-gray-500">Task: {taskId}</div>
          </div>
        </div>
        <div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">Close</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center text-gray-500">Loading chat…</div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_id === (chatUser?.id);
            const senderName = m.sender_name || currentUserName;
            const senderAvatar = m.sender_avatar || currentUserAvatar;
            return (
              <div key={m.id || Math.random()} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] p-3 rounded-xl ${isMe ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'} flex gap-3 items-start`}>
                  {!isMe && (
                    <img src={senderAvatar || '/favicon.ico'} alt={senderName} className="w-8 h-8 rounded-full object-cover" />
                  )}
                  <div>
                    {!isMe && <div className="text-xs font-medium text-gray-700 mb-1">{senderName}</div>}
                    <div className="text-sm">{m.message}</div>
                    <div className="text-xs text-gray-400 mt-1 text-right">{new Date(m.created_at).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef}></div>
      </div>

      <div className="px-4 py-3 border-t">
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 p-2 border rounded-lg" placeholder="Write a message..." />
          <button onClick={sendMessage} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
