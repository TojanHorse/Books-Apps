import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, Mail, ArrowLeft, Image, Video, X, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NoteModal from './NoteModal';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

interface Message {
  sender: string;
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  type: 'text' | 'image' | 'video';
  time: string;
}

interface ChatThreadProps {
  threadId: string;
  contactId: string;
  onBack: () => void;
}

const ChatThread: React.FC<ChatThreadProps> = ({ threadId, contactId, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { user, token } = useAuth();

  useEffect(() => {
    if (token) {
      const newSocket = io('http://localhost:5000', {
        auth: { token }
      });

      newSocket.on('receive_message', (message: Message) => {
        if (message.sender === contactId) {
          setMessages(prev => [...prev, message]);
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [token, contactId]);

  useEffect(() => {
    if (threadId !== 'new') {
      loadMessages();
    } else {
      setMessages([]);
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/chat');
      const thread = response.data.find((t: any) => t._id === threadId);
      if (thread) {
        setMessages(thread.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = type === 'image' ? 5 * 1024 * 1024 : 50 * 1024 * 1024; // 5MB for images, 50MB for videos
      if (file.size > maxSize) {
        alert(`${type === 'image' ? 'Image' : 'Video'} size must be less than ${type === 'image' ? '5MB' : '50MB'}`);
        return;
      }
      
      setSelectedFile(file);
      setFileType(type);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFileSelection = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileType(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const sendFile = async () => {
    if (!selectedFile || !fileType) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append(fileType, selectedFile);

      const endpoint = fileType === 'image' ? 'image' : 'video';
      const response = await axios.post(
        `http://localhost:5000/api/chat/${contactId}/${endpoint}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const message = {
        sender: user?.anonymousID || '',
        text: selectedFile.name,
        [fileType === 'image' ? 'imageUrl' : 'videoUrl']: response.data[fileType === 'image' ? 'imageUrl' : 'videoUrl'],
        type: fileType,
        time: new Date().toISOString()
      };

      // Add message to UI immediately
      setMessages(prev => [...prev, message]);
      
      // Send via socket
      if (socket) {
        socket.emit(fileType === 'image' ? 'send_image' : 'send_video', {
          recipientID: contactId,
          [fileType === 'image' ? 'imageUrl' : 'videoUrl']: response.data[fileType === 'image' ? 'imageUrl' : 'videoUrl'],
          fileName: selectedFile.name
        });
      }

      clearFileSelection();
    } catch (error) {
      console.error(`Error sending ${fileType}:`, error);
      alert(`Failed to send ${fileType}. Please try again.`);
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    if (selectedFile) {
      await sendFile();
      return;
    }

    try {
      const message = {
        sender: user?.anonymousID || '',
        text: newMessage,
        type: 'text' as const,
        time: new Date().toISOString()
      };

      // Add message to UI immediately
      setMessages(prev => [...prev, message]);
      
      // Send via socket
      if (socket) {
        socket.emit('send_message', {
          recipientID: contactId,
          text: newMessage
        });
      }

      // Send via API
      await axios.post(`http://localhost:5000/api/chat/${contactId}`, {
        text: newMessage
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove message from UI if failed
      setMessages(prev => prev.slice(0, -1));
    }
  };

  const clearChat = async () => {
    if (threadId === 'new') return;
    
    if (confirm('Are you sure you want to clear this chat?')) {
      try {
        await axios.post(`http://localhost:5000/api/chat/${threadId}/clear`);
        setMessages([]);
        onBack();
      } catch (error) {
        console.error('Error clearing chat:', error);
      }
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-warm-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="md:hidden p-2 hover:bg-warm-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-warm-600" />
            </button>
            <div>
              <h3 className="font-semibold text-warm-900">Anonymous ID: {contactId}</h3>
              <p className="text-sm text-warm-600">Private conversation</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowNoteModal(true)}
              className="p-2 hover:bg-warm-100 rounded-lg transition-colors"
              title="Send Note"
            >
              <Mail className="h-5 w-5 text-warm-600" />
            </button>
            {threadId !== 'new' && (
              <button
                onClick={clearChat}
                className="p-2 hover:bg-warm-100 rounded-lg transition-colors"
                title="Clear Chat"
              >
                <Trash2 className="h-5 w-5 text-warm-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center text-warm-600">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-warm-600">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === user?.anonymousID ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md rounded-lg ${
                  message.sender === user?.anonymousID
                    ? 'bg-accent-600 text-white'
                    : 'bg-warm-100 text-warm-900'
                }`}
              >
                {message.type === 'image' ? (
                  <div className="p-2">
                    <img
                      src={message.imageUrl}
                      alt={message.text}
                      className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(message.imageUrl, '_blank')}
                    />
                    <p className={`text-xs mt-2 ${
                      message.sender === user?.anonymousID ? 'text-accent-200' : 'text-warm-500'
                    }`}>
                      {formatTime(message.time)}
                    </p>
                  </div>
                ) : message.type === 'video' ? (
                  <div className="p-2">
                    <div className="relative">
                      <video
                        src={message.videoUrl}
                        className="max-w-full h-auto rounded-lg"
                        controls
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Play className="h-12 w-12 text-white opacity-80" />
                      </div>
                    </div>
                    <p className={`text-xs mt-2 ${
                      message.sender === user?.anonymousID ? 'text-accent-200' : 'text-warm-500'
                    }`}>
                      {formatTime(message.time)}
                    </p>
                  </div>
                ) : (
                  <div className="px-4 py-2">
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === user?.anonymousID ? 'text-accent-200' : 'text-warm-500'
                    }`}>
                      {formatTime(message.time)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* File Preview */}
      {filePreview && (
        <div className="p-4 border-t border-warm-200 bg-warm-50">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {fileType === 'image' ? (
                <img
                  src={filePreview}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-lg"
                />
              ) : (
                <div className="w-16 h-16 bg-warm-200 rounded-lg flex items-center justify-center">
                  <Video className="h-8 w-8 text-warm-600" />
                </div>
              )}
              <button
                onClick={clearFileSelection}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-warm-900">{selectedFile?.name}</p>
              <p className="text-xs text-warm-600">
                {selectedFile && formatFileSize(selectedFile.size)}
              </p>
            </div>
            <button
              onClick={sendFile}
              disabled={uploading}
              className="px-4 py-2 bg-accent-600 hover:bg-accent-700 disabled:bg-accent-400 text-white rounded-lg transition-colors"
            >
              {uploading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-warm-200 bg-white">
        <div className="flex space-x-2">
          <input
            type="file"
            ref={imageInputRef}
            onChange={(e) => handleFileSelect(e, 'image')}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={videoInputRef}
            onChange={(e) => handleFileSelect(e, 'video')}
            accept="video/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="p-2 text-warm-600 hover:text-warm-900 hover:bg-warm-100 rounded-lg transition-colors"
            title="Send Image"
          >
            <Image className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="p-2 text-warm-600 hover:text-warm-900 hover:bg-warm-100 rounded-lg transition-colors"
            title="Send Video"
          >
            <Video className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
            disabled={!!selectedFile}
          />
          <button
            type="submit"
            disabled={(!newMessage.trim() && !selectedFile) || uploading}
            className="px-4 py-2 bg-accent-600 hover:bg-accent-700 disabled:bg-accent-400 text-white rounded-lg transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>

      <NoteModal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        recipientId={contactId}
      />
    </div>
  );
};

export default ChatThread;