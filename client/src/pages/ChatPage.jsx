import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '../components/sidebar/Sidebar';
import ChatArea from '../components/chat/ChatArea';

const ChatPage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <Sidebar
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header when chat is active */}
        {selectedConversation && (
          <div className="lg:hidden p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <span className="ml-2 font-medium text-gray-900 dark:text-white truncate">
              {selectedConversation.name}
            </span>
          </div>
        )}
        <ChatArea
          conversation={selectedConversation}
          onBack={() => setSidebarOpen(true)}
        />
      </div>
    </div>
  );
};

export default ChatPage;