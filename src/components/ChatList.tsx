import React, { useState, useEffect } from 'react';
import { Search, MessageCircle, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Thread {
  _id: string;
  participants: string[];
  contactName: string;
  lastMessage?: {
    sender: string;
    text: string;
    time: string;
  };
  lastUpdated: string;
}

interface ChatListProps {
  onSelectChat: (threadId: string, contactId: string) => void;
  selectedThreadId?: string;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat, selectedThreadId }) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/chat');
      setThreads(response.data);
    } catch (error) {
      console.error('Error loading threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim() || searchId.length !== 6) return;

    try {
      // Check if user exists
      const response = await axios.get(`http://localhost:5000/api/chat/user/${searchId}`);
      if (response.data.exists) {
        // Start new conversation
        onSelectChat('new', searchId);
        setSearchId('');
      }
    } catch (error) {
      alert('User not found');
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="w-80 bg-white border-r border-warm-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-warm-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif font-semibold text-warm-900">Messages</h2>
          <div className="text-sm text-warm-600">ID: {user?.anonymousID}</div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-warm-400" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter 6-digit ID..."
              className="w-full pl-10 pr-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm"
              maxLength={6}
            />
          </div>
        </form>
      </div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-warm-600">Loading chats...</div>
        ) : threads.length === 0 ? (
          <div className="p-4 text-center">
            <MessageCircle className="h-12 w-12 text-warm-400 mx-auto mb-2" />
            <p className="text-warm-600 text-sm">No conversations yet</p>
            <p className="text-warm-500 text-xs mt-1">Search for a user ID to start chatting</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {threads.map((thread) => (
              <button
                key={thread._id}
                onClick={() => onSelectChat(thread._id, thread.contactName)}
                className={`w-full p-3 rounded-lg text-left hover:bg-warm-50 transition-colors ${
                  selectedThreadId === thread._id ? 'bg-accent-50 border border-accent-200' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-warm-900">ID: {thread.contactName}</span>
                  {thread.lastMessage && (
                    <span className="text-xs text-warm-500">
                      {formatTime(thread.lastMessage.time)}
                    </span>
                  )}
                </div>
                {thread.lastMessage && (
                  <p className="text-sm text-warm-600 truncate">
                    {thread.lastMessage.sender === user?.anonymousID ? 'You: ' : ''}
                    {thread.lastMessage.text}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;