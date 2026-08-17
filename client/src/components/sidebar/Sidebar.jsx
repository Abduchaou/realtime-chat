import { useState, useEffect } from 'react';
import { getConversations, discoverRooms, joinConversation, createConversation } from '../../api/conversations';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Plus, Hash, Lock, Users, LogOut, MessageCircle, Menu, X, Globe } from 'lucide-react';

const Sidebar = ({ selectedConversation, onSelectConversation, isOpen, onToggle }) => {
  const [conversations, setConversations] = useState([]);
  const [publicRooms, setPublicRooms] = useState([]);
  const [activeTab, setActiveTab] = useState('my');
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
    setLoading(true);
    try {
      const [myRes, discoverRes] = await Promise.all([
        getConversations(),
        discoverRooms()
      ]);
      setConversations(myRes.data.data.conversations);
      setPublicRooms(discoverRes.data.data.rooms);
    } catch (err) {
      console.error('Failed to load:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (roomId) => {
    try {
      await joinConversation(roomId);
      await loadConversations();
      const joined = publicRooms.find(r => r.id === roomId);
      if (joined) onSelectConversation(joined);
    } catch (err) {
      console.error('Failed to join:', err);
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
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-[85vw] max-w-[320px] lg:w-80 bg-white dark:bg-gray-900 
        border-r border-gray-200 dark:border-gray-800 flex flex-col
        transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="text-blue-600" size={24} />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Chat Rooms</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-sm active:scale-95"
                title="Create room"
              >
                <Plus size={20} />
              </button>
              <button onClick={onToggle} className="lg:hidden p-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 active:bg-gray-100 dark:active:bg-gray-700 rounded-xl transition">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-200 dark:bg-gray-700 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('my')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition active:scale-95 ${
                activeTab === 'my'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              My Rooms
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition active:scale-95 ${
                activeTab === 'discover'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Discover
            </button>
          </div>
        </div>

        {/* Room List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : activeTab === 'my' ? (
            conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-3">🏠</div>
                <p className="text-sm font-medium">No rooms yet</p>
                <button
                  onClick={() => setActiveTab('discover')}
                  className="mt-3 text-blue-500 hover:text-blue-400 text-sm font-medium active:scale-95 transition"
                >
                  Discover public rooms →
                </button>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv);
                    onToggle();
                  }}
                  className={`w-full p-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-left border-l-4 active:bg-gray-200 dark:active:bg-gray-700 ${
                    selectedConversation?.id === conv.id 
                      ? 'bg-blue-50 dark:bg-gray-800 border-blue-500' 
                      : 'border-transparent'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${conv.isPrivate ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'}`}>
                    {conv.isPrivate ? <Lock size={16} /> : <Hash size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate text-sm">{conv.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {getLastMessage(conv)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full shrink-0">
                    <Users size={12} />
                    {conv._count?.members || 0}
                  </div>
                </button>
              ))
            )
          ) : (
            publicRooms.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-3">🌍</div>
                <p className="text-sm font-medium">No public rooms found</p>
                <p className="text-xs mt-1">Create the first one!</p>
              </div>
            ) : (
              publicRooms.map((room) => (
                <div
                  key={room.id}
                  className="w-full p-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition border-b border-gray-100 dark:border-gray-800 active:bg-gray-200 dark:active:bg-gray-700"
                >
                  <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 shrink-0">
                    <Globe size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate text-sm">{room.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {room.description || 'Public room'} • by {room.createdBy?.username}
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoin(room.id)}
                    className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 active:scale-95 active:bg-blue-800 transition shrink-0"
                  >
                    Join
                  </button>
                </div>
              ))
            )
          )}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
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
              className="p-2.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition active:scale-95"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Create Room Modal - Mobile optimized */}
        {showCreateModal && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-white dark:bg-gray-800 w-full sm:w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700 animate-slide-up sm:animate-none">
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Create New Room</h3>
              <form onSubmit={handleCreateRoom} className="space-y-3">
                <input
                  type="text"
                  placeholder="Room name"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newRoom.description}
                  onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
                <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={newRoom.isPrivate}
                    onChange={(e) => setNewRoom({ ...newRoom, isPrivate: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Private room (invite only)
                </label>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-blue-600 py-3 rounded-xl hover:bg-blue-700 active:bg-blue-800 text-white font-semibold transition active:scale-[0.98]">
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 py-3 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold transition active:scale-[0.98]"
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