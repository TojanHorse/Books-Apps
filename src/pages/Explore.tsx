import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Book, api } from '../utils/api';
import BookCard from '../components/BookCard';
import { Search, Loader, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const Explore: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedAuthor, setSelectedAuthor] = useState(searchParams.get('author') || '');

  const booksPerPage = 20;
  const totalPages = Math.ceil(totalCount / booksPerPage);

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const author = searchParams.get('author') || '';
    
    setCurrentPage(page);
    setSearchQuery(search);
    setSelectedAuthor(author);
    
    loadBooks(page, search, author, selectedLanguage);
  }, [searchParams, selectedLanguage]);

  const loadBooks = async (page: number, search: string, author: string, language: string) => {
    try {
      setLoading(true);
      const params: any = { page };
      
      if (search) params.search = search;
      if (author) params.author = author;
      if (language !== 'all') params.languages = language;

      const response = await api.getBooks(params);
      setBooks(response.results);
      setTotalCount(response.count);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchQuery, page: '1' });
  };

  const updateFilters = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedAuthor('');
    setSelectedLanguage('all');
    setSearchParams(new URLSearchParams());
  };

  const hasFilters = searchQuery || selectedAuthor || selectedLanguage !== 'all';

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-warm-900 mb-4">
            Explore Classic Books
          </h1>
          <p className="text-warm-600 text-lg">
            Discover thousands of classic books from the public domain
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-warm-200 p-6 mb-8 animate-slide-up">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-warm-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by title, author, or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-warm-300 rounded-lg bg-warm-50 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent text-lg"
              />
            </div>
          </form>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-warm-500" />
              <span className="text-sm font-medium text-warm-700">Filters:</span>
            </div>

            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 border border-warm-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <option value="all">All Languages</option>
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="es">Spanish</option>
              <option value="it">Italian</option>
            </select>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-accent-600 hover:text-accent-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>

          {hasFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchQuery && (
                <span className="px-3 py-1 bg-accent-100 text-accent-800 text-sm rounded-full">
                  Search: "{searchQuery}"
                </span>
              )}
              {selectedAuthor && (
                <span className="px-3 py-1 bg-accent-100 text-accent-800 text-sm rounded-full">
                  Author: {selectedAuthor}
                </span>
              )}
              {selectedLanguage !== 'all' && (
                <span className="px-3 py-1 bg-accent-100 text-accent-800 text-sm rounded-full">
                  Language: {selectedLanguage.toUpperCase()}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Summary */}
        {!loading && (
          <div className="mb-6 text-warm-600">
            Showing {books.length} of {totalCount.toLocaleString()} books
            {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader className="h-6 w-6 animate-spin text-accent-600" />
            <span className="ml-2 text-warm-600">Loading books...</span>
          </div>
        )}

        {/* Books Grid */}
        {!loading && books.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && books.length === 0 && (
          <div className="text-center py-16">
            <Search className="h-12 w-12 text-warm-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-warm-900 mb-2">No books found</h3>
            <p className="text-warm-600 mb-4">
              Try adjusting your search terms or filters to find more books.
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-2 border border-warm-300 rounded-lg hover:bg-warm-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>

            <div className="flex space-x-1">
              {/* Show first page */}
              {currentPage > 3 && (
                <>
                  <button
                    onClick={() => handlePageChange(1)}
                    className="px-3 py-2 border border-warm-300 rounded-lg hover:bg-warm-100 transition-colors"
                  >
                    1
                  </button>
                  {currentPage > 4 && (
                    <span className="px-3 py-2 text-warm-500">...</span>
                  )}
                </>
              )}

              {/* Show current page and neighbors */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNum > totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 border rounded-lg transition-colors ${
                      pageNum === currentPage
                        ? 'bg-accent-600 text-white border-accent-600'
                        : 'border-warm-300 hover:bg-warm-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Show last page */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && (
                    <span className="px-3 py-2 text-warm-500">...</span>
                  )}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className="px-3 py-2 border border-warm-300 rounded-lg hover:bg-warm-100 transition-colors"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center px-3 py-2 border border-warm-300 rounded-lg hover:bg-warm-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;