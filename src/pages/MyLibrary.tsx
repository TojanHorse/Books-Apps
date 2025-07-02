import React, { useState, useEffect } from 'react';
import { Book, api } from '../utils/api';
import BookCard from '../components/BookCard';
import { User, Loader, BookOpen } from 'lucide-react';

interface AuthorCollection {
  name: string;
  searchTerm: string;
  description: string;
  books: Book[];
  loading: boolean;
}

const MyLibrary: React.FC = () => {
  const [collections, setCollections] = useState<AuthorCollection[]>([
    {
      name: 'William Shakespeare',
      searchTerm: 'Shakespeare',
      description: 'The greatest playwright in the English language, master of tragedy and comedy.',
      books: [],
      loading: true,
    },
    {
      name: 'Jane Austen',
      searchTerm: 'Jane Austen',
      description: 'Beloved author of romantic fiction, known for wit and social commentary.',
      books: [],
      loading: true,
    },
    {
      name: 'Mark Twain',
      searchTerm: 'Mark Twain',
      description: 'American humorist and satirist, chronicler of American life.',
      books: [],
      loading: true,
    },
    {
      name: 'Charles Dickens',
      searchTerm: 'Charles Dickens',
      description: 'Victorian novelist renowned for his vivid characters and social criticism.',
      books: [],
      loading: true,
    },
  ]);

  useEffect(() => {
    const loadAuthorBooks = async () => {
      const updatedCollections = await Promise.all(
        collections.map(async (collection) => {
          try {
            const response = await api.getBooks({ author: collection.searchTerm });
            return {
              ...collection,
              books: response.results.slice(0, 6), // Show top 6 books
              loading: false,
            };
          } catch (error) {
            console.error(`Error loading books for ${collection.name}:`, error);
            return {
              ...collection,
              books: [],
              loading: false,
            };
          }
        })
      );
      
      setCollections(updatedCollections);
    };

    loadAuthorBooks();
  }, []);

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12 text-center animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-warm-900 mb-4">
            My Library
          </h1>
          <p className="text-warm-600 text-lg max-w-3xl mx-auto leading-relaxed">
            Discover masterworks from history's most celebrated authors. Each collection features 
            carefully curated books that showcase the unique voice and enduring legacy of these literary giants.
          </p>
        </div>

        {/* Author Collections */}
        <div className="space-y-16">
          {collections.map((collection, index) => (
            <section key={collection.name} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="bg-white rounded-2xl shadow-sm border border-warm-200 overflow-hidden">
                {/* Collection Header */}
                <div className="bg-gradient-to-r from-warm-100 to-accent-50 p-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-accent-600 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl md:text-3xl font-serif font-bold text-warm-900 mb-2">
                        {collection.name}
                      </h2>
                      <p className="text-warm-600 text-lg leading-relaxed">
                        {collection.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Books Grid */}
                <div className="p-8">
                  {collection.loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader className="h-6 w-6 animate-spin text-accent-600" />
                      <span className="ml-2 text-warm-600">Loading books...</span>
                    </div>
                  ) : collection.books.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {collection.books.map((book) => (
                        <BookCard key={book.id} book={book} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-warm-400 mx-auto mb-4" />
                      <p className="text-warm-600">No books found for this author.</p>
                    </div>
                  )}

                  {/* View More Button */}
                  {collection.books.length > 0 && (
                    <div className="mt-8 text-center">
                      <a
                        href={`/explore?author=${encodeURIComponent(collection.searchTerm)}`}
                        className="inline-flex items-center px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-lg transition-colors"
                      >
                        View All Books by {collection.name}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Call to Action */}
        <section className="mt-16 bg-warm-900 text-white rounded-2xl p-12 text-center animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
            Discover More Authors
          </h2>
          <p className="text-warm-200 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            Explore our complete collection of classic literature from authors around the world. 
            From ancient philosophers to modern novelists, find your next great read.
          </p>
          <a
            href="/explore"
            className="inline-flex items-center px-8 py-3 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-lg transition-colors"
          >
            <BookOpen className="h-5 w-5 mr-2" />
            Browse All Books
          </a>
        </section>
      </div>
    </div>
  );
};

export default MyLibrary;