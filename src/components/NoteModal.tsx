import React, { useState } from 'react';
import { X, Mail, Send } from 'lucide-react';
import axios from 'axios';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
}

const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, recipientId }) => {
  const [noteText, setNoteText] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/note', {
        recipientID: recipientId,
        noteText: noteText.trim()
      });
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setNoteText('');
        setSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error sending note:', error);
      alert('Failed to send note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setNoteText('');
    setSuccess(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Mail className="h-6 w-6 text-accent-600" />
              <h2 className="text-xl font-serif font-bold text-warm-900">
                Send Private Note
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-warm-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-warm-600" />
            </button>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-warm-900 mb-2">Note Sent!</h3>
              <p className="text-warm-600">
                Your note has been sent to Anonymous ID {recipientId}'s email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-warm-700 mb-2">
                  To: Anonymous ID {recipientId}
                </label>
                <p className="text-sm text-warm-600 mb-4">
                  This note will be sent to their registered email address.
                </p>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Write your private note here..."
                  className="w-full h-32 px-4 py-3 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3 border border-warm-300 text-warm-700 font-medium rounded-lg hover:bg-warm-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !noteText.trim()}
                  className="flex-1 py-3 bg-accent-600 hover:bg-accent-700 disabled:bg-accent-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Note
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteModal;