import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Book as BookType, api } from '../utils/api';
import BookReader from '../components/BookReader';
import RelatedBooks from '../components/RelatedBooks';
import { ArrowLeft, Download, User, Calendar, Globe, BookOpen, Loader, ExternalLink } from 'lucide-react';

const Book: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<BookType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBook = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const bookData = await api.getBook(parseInt(id));
        setBook(bookData);
      } catch (err) {
        setError('Failed to load book details');
        console.error('Error loading book:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-accent-600 mx-auto mb-4" />
          <p className="text-warm-600">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-warm-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-warm-900 mb-2">Book Not Found</h2>
          <p className="text-warm-600 mb-4">{error || 'The requested book could not be found.'}</p>
          <Link to="/explore" className="text-accent-600 hover:text-accent-700 font-medium">
            Browse other books
          </Link>
        </div>
      </div>
    );
  }

  const getCoverImage = (book: BookType): string => {
    return book.formats['image/jpeg'] || 
           `https://via.placeholder.com/400x600/E8E3DD/2C1810?text=${encodeURIComponent(book.title)}`;
  };

  const getDownloadFormats = (formats: Record<string, string>) => {
    const availableFormats = [
      { key: 'text/plain; charset=utf-8', label: 'Plain Text (UTF-8)', icon: '📄' },
      { key: 'text/plain', label: 'Plain Text', icon: '📄' },
      { key: 'text/html', label: 'HTML', icon: '🌐' },
      { key: 'application/epub+zip', label: 'EPUB', icon: '📖' },
      { key: 'application/x-mobipocket-ebook', label: 'Kindle', icon: '📱' },
      { key: 'application/pdf', label: 'PDF', icon: '📕' },
    ];

    return availableFormats.filter(format => formats[format.key]);
  };

  const getLanguageText = (languages: string[]): string => {
    const langMap: Record<string, string> = {
      'en': 'English',
      'fr': 'French',
      'de': 'German',
      'es': 'Spanish',
      'it': 'Italian',
      'pt': 'Portuguese',
    };
    return languages.map(lang => langMap[lang] || lang.toUpperCase()).join(', ');
  };

  const downloadFormats = getDownloadFormats(book.formats);

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/explore"
          className="inline-flex items-center text-warm-600 hover:text-warm-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Explore
        </Link>

        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 mb-8 lg:mb-0">
            <div className="bg-white rounded-xl shadow-sm border border-warm-200 p-6 sticky top-24 animate-scale-in">
              {/* Book Cover */}
              <div className="aspect-[3/4] mb-6 rounded-lg overflow-hidden bg-warm-100">
                <img
                  src={getCoverImage(book)}
                  alt={book.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://via.placeholder.com/400x600/E8E3DD/2C1810?text=${encodeURIComponent(book.title)}`;
                  }}
                />
              </div>

              {/* Book Info */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <User className="h-4 w-4 mr-2 mt-1 text-warm-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-warm-600">Author(s)</p>
                    <p className="font-medium text-warm-900">
                      {book.authors.map(author => author.name).join(', ')}
                    </p>
                  </div>
                </div>

                {book.authors[0]?.birth_year && (
                  <div className="flex items-start">
                    <Calendar className="h-4 w-4 mr-2 mt-1 text-warm-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-warm-600">Lifespan</p>
                      <p className="font-medium text-warm-900">
                        {book.authors[0].birth_year}
                        {book.authors[0].death_year && ` - ${book.authors[0].death_year}`}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start">
                  <Globe className="h-4 w-4 mr-2 mt-1 text-warm-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-warm-600">Language</p>
                    <p className="font-medium text-warm-900">{getLanguageText(book.languages)}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Download className="h-4 w-4 mr-2 mt-1 text-warm-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-warm-600">Downloads</p>
                    <p className="font-medium text-warm-900">{book.download_count.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Subjects */}
              {book.subjects.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-warm-600 mb-2">Subjects</p>
                  <div className="flex flex-wrap gap-2">
                    {book.subjects.slice(0, 5).map((subject, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-warm-100 text-warm-600 text-xs rounded-full"
                      >
                        {subject.length > 20 ? `${subject.substring(0, 20)}...` : subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Download Formats */}
              {downloadFormats.length > 0 && (
                <div>
                  <p className="text-sm text-warm-600 mb-3">Download Formats</p>
                  <div className="space-y-2">
                    {downloadFormats.map((format) => (
                      <a
                        key={format.key}
                        href={book.formats[format.key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 bg-warm-50 hover:bg-warm-100 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center">
                          <span className="mr-2">{format.icon}</span>
                          <span className="text-sm font-medium text-warm-900">{format.label}</span>
                        </div>
                        <ExternalLink className="h-3 w-3 text-warm-400 group-hover:text-warm-600" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-warm-200 p-8 mb-8 animate-fade-in">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-warm-900 mb-6">
                {book.title}
              </h1>
              
              <BookReader book={book} showFullContent={true} />
            </div>

            {/* Related Books */}
            <div className="bg-white rounded-xl shadow-sm border border-warm-200 p-8">
              <RelatedBooks currentBook={book} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Book;