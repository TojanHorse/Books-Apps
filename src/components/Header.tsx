import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, BookOpen, Menu, X, MessageCircle, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/explore', label: 'Explore' },
    { to: '/library', label: 'My Library' },
  ];

  if (isAuthenticated) {
    navLinks.push({ to: '/chat', label: 'Messages' });
  }

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-warm-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <BookOpen className="h-8 w-8 text-accent-600 group-hover:text-accent-700 transition-colors" />
            <span className="text-xl font-semibold text-warm-900 font-serif">Digital Library</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-warm-700 hover:text-warm-900 transition-colors font-medium flex items-center"
              >
                {link.label === 'Messages' && <MessageCircle className="h-4 w-4 mr-1" />}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-warm-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search books, authors, subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 lg:w-80 border border-warm-300 rounded-lg bg-warm-50 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
              />
            </div>
          </form>

          {/* User Info & Logout */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-sm text-warm-600">ID: {user?.anonymousID}</span>
              <button
                onClick={handleLogout}
                className="p-2 text-warm-600 hover:text-warm-900 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-warm-600 hover:text-warm-900 transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-warm-200 animate-slide-up">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-warm-700 hover:text-warm-900 transition-colors font-medium px-2 flex items-center"
                >
                  {link.label === 'Messages' && <MessageCircle className="h-4 w-4 mr-1" />}
                  {link.label}
                </Link>
              ))}
              
              {isAuthenticated && (
                <div className="px-2 pt-2 border-t border-warm-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-warm-600">ID: {user?.anonymousID}</span>
                    <button
                      onClick={handleLogout}
                      className="text-warm-600 hover:text-warm-900 transition-colors text-sm"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </nav>
            
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mt-4 px-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-warm-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-warm-300 rounded-lg bg-warm-50 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                />
              </div>
            </form>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;