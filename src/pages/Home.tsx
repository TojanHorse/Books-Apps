import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, api } from '../utils/api';
import BookReader from '../components/BookReader';
import { ArrowRight, BookOpen, Loader, Download, User, Calendar } from 'lucide-react';

const Home: React.FC = () => {
  const [featuredBook, setFeaturedBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedBook = async () => {
      try {
        const book = await api.getAliceInWonderland();
        setFeaturedBook(book);
      } catch (error) {
        console.error('Error loading featured book:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedBook();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-accent-600 mx-auto mb-4" />
          <p className="text-warm-600">Loading your reading experience...</p>
        </div>
      </div>
    );
  }

  if (!featuredBook) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-warm-400 mx-auto mb-4" />
          <p className="text-warm-600">Unable to load the featured book.</p>
          <Link to="/explore" className="text-accent-600 hover:text-accent-700 font-medium">
            Explore our library instead
          </Link>
        </div>
      </div>
    );
  }

  const getCoverImage = (book: Book): string => {
    return book.formats['image/jpeg'] || 
           `https://via.placeholder.com/400x600/E8E3DD/2C1810?text=${encodeURIComponent(book.title)}`;
  };

  return (
    <div className="min-h-screen bg-warm-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-warm-100 to-accent-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-warm-900 mb-6">
              Discover Classic Literature
            </h1>
            <p className="text-xl text-warm-600 max-w-3xl mx-auto leading-relaxed">
              Dive into thousands of free classic books from the world's greatest authors. 
              Start your literary journey today with our carefully curated collection.
            </p>
          </div>

          <div className="flex justify-center space-x-4 animate-slide-up">
            <Link
              to="/explore"
              className="inline-flex items-center px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-lg transition-colors"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Explore Library
            </Link>
            <Link
              to="/library"
              className="inline-flex items-center px-6 py-3 bg-white hover:bg-warm-100 text-warm-900 font-medium rounded-lg border border-warm-300 transition-colors"
            >
              Featured Authors
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Book Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-5 lg:gap-12 items-start">
            {/* Book Cover and Info */}
            <div className="lg:col-span-2 mb-8 lg:mb-0">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 animate-scale-in">
                <div className="aspect-[3/4] mb-6 rounded-lg overflow-hidden bg-warm-100">
                  <img
                    src={getCoverImage(featuredBook)}
                    alt={featuredBook.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://via.placeholder.com/400x600/E8E3DD/2C1810?text=${encodeURIComponent(featuredBook.title)}`;
                    }}
                  />
                </div>

                <h2 className="text-2xl font-serif font-bold text-warm-900 mb-2">
                  {featuredBook.title}
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-warm-600">
                    <User className="h-4 w-4 mr-2" />
                    <span>{featuredBook.authors.map(a => a.name).join(', ')}</span>
                  </div>
                  
                  <div className="flex items-center text-warm-600">
                    <Download className="h-4 w-4 mr-2" />
                    <span>{featuredBook.download_count.toLocaleString()} downloads</span>
                  </div>

                  {featuredBook.authors[0]?.birth_year && (
                    <div className="flex items-center text-warm-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {featuredBook.authors[0].birth_year}
                        {featuredBook.authors[0].death_year && ` - ${featuredBook.authors[0].death_year}`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Link
                    to={`/book/${featuredBook.id}`}
                    className="block w-full text-center px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Continue Reading
                  </Link>
                  
                  <div className="flex flex-wrap gap-2">
                    {featuredBook.subjects.slice(0, 3).map((subject, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-warm-100 text-warm-600 text-sm rounded-full"
                      >
                        {subject.length > 25 ? `${subject.substring(0, 25)}...` : subject}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Book Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-lg p-8 animate-fade-in">
                <div className="mb-6">
                  <h3 className="text-2xl font-serif font-bold text-warm-900 mb-2">
                    Start Reading
                  </h3>
                  <p className="text-warm-600">
                    Immerse yourself in this timeless classic
                  </p>
                </div>

                <BookReader book={featuredBook} maxLength={4000} />

                <div className="mt-8 text-center">
                  <Link
                    to={`/book/${featuredBook.id}`}
                    className="inline-flex items-center px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Continue Reading
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-warm-900 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
            Ready to explore more?
          </h2>
          <p className="text-xl text-warm-200 mb-8 leading-relaxed">
            Browse thousands of classic books from renowned authors, discover new genres, 
            and build your personal digital library.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/explore"
              className="inline-flex items-center justify-center px-8 py-3 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-lg transition-colors"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Browse All Books
            </Link>
            <Link
              to="/library"
              className="inline-flex items-center justify-center px-8 py-3 bg-transparent hover:bg-white/10 text-white font-medium rounded-lg border border-white/30 transition-colors"
            >
              Featured Collections
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;