import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { getMessages, sendMessage as sendMessageApi } from '../../api/messages';
import { Send, Paperclip, Smile } from 'lucide-react';

const ChatArea = ({ conversation }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const { socket } = useSocket();

  // Load messages when conversation changes
  useEffect(() => {
    if (!conversation) return;
    
    loadMessages();
    
    // Join room via socket
    socket?.emit('join_conversation', { conversationId: conversation.id });

    // Listen for new messages
    socket?.on('message_new', handleNewMessage);
    socket?.on('user_typing', handleUserTyping);

    return () => {
      socket?.off('message_new', handleNewMessage);
      socket?.off('user_typing', handleUserTyping);
      socket?.emit('leave_conversation', { conversationId: conversation.id });
    };
  }, [conversation, socket]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await getMessages(conversation.id);
      setMessages(res.data.data.messages.reverse()); // Oldest first
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (data) => {
    if (data.conversationId === conversation?.id) {
      setMessages((prev) => [...prev, data.message]);
    }
  };

  const handleUserTyping = (data) => {
    if (data.conversationId === conversation?.id && data.isTyping) {
      setTypingUsers((prev) => [...new Set([...prev, data.username])]);
      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u !== data.username));
      }, 3000);
    } else if (!data.isTyping) {
      setTypingUsers((prev) => prev.filter((u) => u !== data.username));
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Send via socket for real-time
    socket?.emit('send_message', {
      conversationId: conversation.id,
      content: newMessage,
      type: 'text'
    });

    // Also send via API for persistence (backup)
    try {
      await sendMessageApi(conversation.id, { content: newMessage, type: 'text' });
    } catch (err) {
      console.error('Failed to send:', err);
    }

    setNewMessage('');
    socket?.emit('typing_stop', { conversationId: conversation.id });
  };

  const handleTyping = () => {
    socket?.emit('typing_start', { conversationId: conversation.id });
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-800 text-gray-400">
        Select a conversation to start chatting
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-800 h-screen">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">{conversation.name}</h2>
          <p className="text-xs text-gray-400">{conversation.description}</p>
        </div>
        <div className="text-xs text-gray-400">
          {conversation._count?.members} members
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center text-gray-400">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400">No messages yet. Say hello!</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === conversation.members?.[0]?.userId ? 'justify-start' : 'justify-start'}`}
            >
              <div className="flex items-start gap-3 max-w-[70%]">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                  {msg.sender?.username?.[0]?.toUpperCase()}
                </div>
                <div className="bg-gray-700 rounded-lg px-4 py-2">
                  <div className="text-xs text-blue-400 font-medium mb-1">
                    {msg.sender?.username}
                  </div>
                  <div className="text-white">{msg.content}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="text-sm text-gray-400 italic">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-700 flex items-center gap-3">
        <button type="button" className="text-gray-400 hover:text-white transition">
          <Paperclip size={20} />
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleTyping}
          placeholder="Type a message..."
          className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="button" className="text-gray-400 hover:text-white transition">
          <Smile size={20} />
        </button>
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatArea;