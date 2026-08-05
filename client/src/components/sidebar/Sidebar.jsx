import { useState, useEffect } from 'react';
import { getConversations, createConversation } from '../../api/conversations';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Plus, Hash, Lock, Users } from 'lucide-react';

const Sidebar = ({ selectedConversation, onSelectConversation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', description: '', isPrivate: false });
  const { user } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    loadConversations();
  }, []);

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
      setConversations([res.data.data.conversation, ...conversations]);
      setShowCreateModal(false);
      setNewRoom({ name: '', description: '', isPrivate: false });
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };

  return (
    <div className="w-80 bg-gray-900 text-white h-screen flex flex-col border-r border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-lg font-bold">Chat Rooms</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-gray-400 text-center">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-gray-400 text-center">No rooms yet. Create one!</div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv)}
              className={`w-full p-3 flex items-center gap-3 hover:bg-gray-800 transition text-left ${
                selectedConversation?.id === conv.id ? 'bg-gray-800 border-l-4 border-blue-500' : ''
              }`}
            >
              {conv.isPrivate ? <Lock size={18} className="text-yellow-500" /> : <Hash size={18} className="text-gray-400" />}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{conv.name}</div>
                <div className="text-xs text-gray-400 truncate">
                  {conv.messages[0]?.content || 'No messages yet'}
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Users size={14} />
                {conv._count.members}
              </div>
            </button>
          ))
        )}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-800 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">
          {user?.username?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{user?.username}</div>
          <div className="text-xs text-green-400">● Online</div>
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl w-96">
            <h3 className="text-lg font-bold mb-4">Create New Room</h3>
            <form onSubmit={handleCreateRoom} className="space-y-3">
              <input
                type="text"
                placeholder="Room name"
                value={newRoom.name}
                onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                required
                className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newRoom.description}
                onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={newRoom.isPrivate}
                  onChange={(e) => setNewRoom({ ...newRoom, isPrivate: e.target.checked })}
                  className="rounded"
                />
                Private room
              </label>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 py-2 rounded-lg hover:bg-blue-700">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-600 py-2 rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;