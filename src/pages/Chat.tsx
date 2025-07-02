import React, { useState } from 'react';
import ChatList from '../components/ChatList';
import ChatThread from '../components/ChatThread';
import { MessageCircle } from 'lucide-react';

const Chat: React.FC = () => {
  const [selectedThread, setSelectedThread] = useState<{
    threadId: string;
    contactId: string;
  } | null>(null);

  const handleSelectChat = (threadId: string, contactId: string) => {
    setSelectedThread({ threadId, contactId });
  };

  const handleBack = () => {
    setSelectedThread(null);
  };

  return (
    <div className="h-screen bg-warm-50 flex">
      {/* Mobile: Show either list or thread */}
      <div className="md:hidden w-full">
        {selectedThread ? (
          <ChatThread
            threadId={selectedThread.threadId}
            contactId={selectedThread.contactId}
            onBack={handleBack}
          />
        ) : (
          <ChatList
            onSelectChat={handleSelectChat}
            selectedThreadId={selectedThread?.threadId}
          />
        )}
      </div>

      {/* Desktop: Show both */}
      <div className="hidden md:flex w-full">
        <ChatList
          onSelectChat={handleSelectChat}
          selectedThreadId={selectedThread?.threadId}
        />
        
        {selectedThread ? (
          <ChatThread
            threadId={selectedThread.threadId}
            contactId={selectedThread.contactId}
            onBack={handleBack}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-warm-100">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-warm-400 mx-auto mb-4" />
              <h3 className="text-xl font-serif font-semibold text-warm-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-warm-600">
                Choose a chat from the sidebar or search for a user ID to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;