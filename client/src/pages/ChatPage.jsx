import { useState } from 'react';
import { Menu, MessageCircle } from 'lucide-react';
import Sidebar from '../components/sidebar/Sidebar';
import ChatArea from '../components/chat/ChatArea';

const ChatPage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <Sidebar
        selectedConversation={selectedConversation}
        onSelectConversation={(conv) => {
          setSelectedConversation(conv);
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile header — ALWAYS visible on small screens */}
        <div className="lg:hidden flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <Menu size={22} />
          </button>
          
          {selectedConversation ? (
            <>
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                {selectedConversation.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                  {selectedConversation.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedConversation._count?.members} members
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <MessageCircle className="text-blue-600" size={22} />
              <span className="font-semibold text-gray-900 dark:text-white">Chat App</span>
            </div>
          )}
        </div>
        
        <ChatArea
          conversation={selectedConversation}
          onBack={() => setSidebarOpen(true)}
        />
      </div>
    </div>
  );
};

export default ChatPage;