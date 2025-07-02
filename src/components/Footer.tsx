import React, { useState } from 'react';
import { BookOpen, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

const Footer: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleHeartClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <footer className="bg-warm-900 text-warm-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-8 w-8 text-accent-400" />
                <span className="text-xl font-semibold font-serif">Digital Library</span>
              </div>
              <p className="text-warm-300 mb-4 leading-relaxed">
                Discover and read thousands of classic books from the public domain. 
                All books are free and available in multiple formats.
              </p>
              <div className="flex items-center text-sm text-warm-400">
                <span>Made with</span>
                <button
                  onClick={handleHeartClick}
                  className="mx-1 hover:scale-110 transition-transform cursor-pointer"
                  title={isAuthenticated ? "You're logged in!" : "Click to unlock chat features"}
                >
                  <Heart className={`h-4 w-4 ${isAuthenticated ? 'text-red-400 fill-current' : 'text-red-400'}`} />
                </button>
                <span>for book lovers everywhere</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 font-serif">Explore</h3>
              <ul className="space-y-2 text-warm-300">
                <li><a href="/explore" className="hover:text-accent-400 transition-colors">All Books</a></li>
                <li><a href="/library" className="hover:text-accent-400 transition-colors">Featured Authors</a></li>
                <li><a href="/explore?search=adventure" className="hover:text-accent-400 transition-colors">Adventure</a></li>
                <li><a href="/explore?search=romance" className="hover:text-accent-400 transition-colors">Romance</a></li>
              </ul>
            </div>

            {/* Authors */}
            <div>
              <h3 className="text-lg font-semibold mb-4 font-serif">Popular Authors</h3>
              <ul className="space-y-2 text-warm-300">
                <li><a href="/explore?author=Shakespeare" className="hover:text-accent-400 transition-colors">Shakespeare</a></li>
                <li><a href="/explore?author=Jane Austen" className="hover:text-accent-400 transition-colors">Jane Austen</a></li>
                <li><a href="/explore?author=Mark Twain" className="hover:text-accent-400 transition-colors">Mark Twain</a></li>
                <li><a href="/explore?author=Charles Dickens" className="hover:text-accent-400 transition-colors">Charles Dickens</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-warm-800 mt-8 pt-8 text-center text-warm-400">
            <p>&copy; 2025 Digital Library. All books are in the public domain. Powered by Project Gutenberg.</p>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default Footer;