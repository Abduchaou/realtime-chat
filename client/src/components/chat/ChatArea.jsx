import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { getMessages, sendMessage as sendMessageApi } from '../../api/messages';
import { Send, Paperclip, Smile, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';

const ChatArea = ({ conversation, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { socket } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (!conversation) return;

    loadMessages();
    socket?.emit('join_conversation', { conversationId: conversation.id });
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
      setMessages(res.data.data.messages.reverse());
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
    if (data.conversationId !== conversation?.id) return;
    if (data.isTyping) {
      setTypingUsers((prev) => [...new Set([...prev, data.username])]);
      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u !== data.username));
      }, 3000);
    } else {
      setTypingUsers((prev) => prev.filter((u) => u !== data.username));
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    socket?.emit('send_message', {
      conversationId: conversation.id,
      content: newMessage,
      type: 'text'
    });

    try {
      await sendMessageApi(conversation.id, { content: newMessage, type: 'text' });
    } catch (err) {
      console.error('Failed to send:', err);
    }

    setNewMessage('');
    setShowEmoji(false);
    socket?.emit('typing_stop', { conversationId: conversation.id });
  };

  const handleTyping = () => {
    socket?.emit('typing_start', { conversationId: conversation.id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('typing_stop', { conversationId: conversation.id });
    }, 2000);
  };

  const onEmojiClick = (emojiData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const isOwnMessage = (msg) => msg.senderId === user?.id;

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-400">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-lg">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 h-screen relative">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-3 shadow-sm">
        {onBack && (
          <button onClick={onBack} className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-blue-600">
            <ArrowLeft size={24} />
          </button>
        )}
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {conversation.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{conversation.name}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {conversation._count?.members} members • {conversation.isPrivate ? 'Private' : 'Public'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">👋</div>
              <p>No messages yet. Say hello!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const own = isOwnMessage(msg);
              const showAvatar = !own && (index === 0 || messages[index - 1].senderId !== msg.senderId);
              return (
                <div key={msg.id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-end gap-2 max-w-[75%] ${own ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!own && (
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold ${showAvatar ? 'bg-gradient-to-br from-green-500 to-teal-600' : 'opacity-0'}`}>
                        {msg.sender?.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className={`px-4 py-2 rounded-2xl ${
                      own 
                        ? 'bg-blue-600 text-white rounded-br-md' 
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md shadow-sm border border-gray-100 dark:border-gray-600'
                    }`}>
                      {!own && showAvatar && (
                        <div className="text-xs font-medium text-blue-500 dark:text-blue-400 mb-1">{msg.sender?.username}</div>
                      )}
                      <div className="text-sm leading-relaxed">{msg.content}</div>
                      <div className={`text-[10px] mt-1 ${own ? 'text-blue-200' : 'text-gray-400'}`}>
                        {format(new Date(msg.createdAt), 'h:mm a')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span className="italic">{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker */}
      {showEmoji && (
        <div className="absolute bottom-20 right-4 z-50">
          <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" />
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSend} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
        <button type="button" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
          <Paperclip size={20} />
        </button>
        <button
          type="button"
          onClick={() => setShowEmoji(!showEmoji)}
          className={`p-2 transition ${showEmoji ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
        >
          <Smile size={20} />
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleTyping}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-md"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatArea;