import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/sidebar/Sidebar';
import ChatArea from '../components/chat/ChatArea';

const ChatPage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const { logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
      />
      <ChatArea conversation={selectedConversation} />
    </div>
  );
};

export default ChatPage;