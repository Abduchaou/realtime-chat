import { useState, useEffect } from 'react';
import { getConversations, createConversation } from '../../api/conversations';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Plus, Hash, Lock, Users, LogOut, MessageCircle, Menu, X } from 'lucide-react';

const Sidebar = ({ selectedConversation, onSelectConversation, isOpen, onToggle }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', description: '', isPrivate: false });
  const { user, logout } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('message_new', () => loadConversations());
    return () => socket.off('message_new');
  }, [socket]);

  const loadConversations = async () => {
    try {
      const res = await getConversations();
      setConversations(res.data.data.conversations);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await createConversation({
        ...newRoom,
        type: 'channel'
      });
      const conv = res.data.data.conversation;
      setConversations([conv, ...conversations]);
      setShowCreateModal(false);
      setNewRoom({ name: '', description: '', isPrivate: false });
      onSelectConversation(conv);
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };

  const getLastMessage = (conv) => {
    if (conv.messages && conv.messages.length > 0) {
      return conv.messages[0].content;
    }
    return 'No messages yet';
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-900 
        border-r border-gray-200 dark:border-gray-800 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <MessageCircle className="text-blue-600" size={24} />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Chat Rooms</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
              title="Create room"
            >
              <Plus size={18} />
            </button>
            <button onClick={onToggle} className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-2">🏠</div>
              <p className="text-sm">No rooms yet. Create one!</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => {
                  onSelectConversation(conv);
                  onToggle();
                }}
                className={`w-full p-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-left border-l-4 ${
                  selectedConversation?.id === conv.id 
                    ? 'bg-blue-50 dark:bg-gray-800 border-blue-500' 
                    : 'border-transparent'
                }`}
              >
                <div className={`p-2 rounded-lg ${conv.isPrivate ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'}`}>
                  {conv.isPrivate ? <Lock size={16} /> : <Hash size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white truncate text-sm">{conv.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {getLastMessage(conv)}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                  <Users size={12} />
                  {conv._count?.members || 0}
                </div>
              </button>
            ))
          )}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 dark:text-white truncate text-sm">{user?.username}</div>
              <div className="text-xs text-green-500 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                Online
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Create Room Modal */}
        {showCreateModal && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Create New Room</h3>
              <form onSubmit={handleCreateRoom} className="space-y-3">
                <input
                  type="text"
                  placeholder="Room name"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newRoom.description}
                  onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRoom.isPrivate}
                    onChange={(e) => setNewRoom({ ...newRoom, isPrivate: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Private room (invite only)
                </label>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-blue-600 py-2.5 rounded-xl hover:bg-blue-700 text-white font-medium transition">
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 py-2.5 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;