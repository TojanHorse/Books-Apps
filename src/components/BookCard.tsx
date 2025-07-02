import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Download, User } from 'lucide-react';
import { Book } from '../utils/api';

interface BookCardProps {
  book: Book;
  showReadButton?: boolean;
}

const BookCard: React.FC<BookCardProps> = ({ book, showReadButton = true }) => {
  const getCoverImage = (book: Book): string => {
    return book.formats['image/jpeg'] || 
           `https://via.placeholder.com/300x400/E8E3DD/2C1810?text=${encodeURIComponent(book.title.substring(0, 20))}`;
  };

  const getAuthorsText = (authors: typeof book.authors): string => {
    return authors.map(author => author.name).join(', ');
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

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-warm-200 hover:border-accent-300 animate-scale-in">
      <Link to={`/book/${book.id}`} className="block">
        <div className="aspect-[3/4] relative overflow-hidden bg-warm-100">
          <img
            src={getCoverImage(book)}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://via.placeholder.com/300x400/E8E3DD/2C1810?text=${encodeURIComponent(book.title.substring(0, 20))}`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center text-white text-sm">
              <Download className="h-4 w-4 mr-1" />
              <span>{book.download_count.toLocaleString()} downloads</span>
            </div>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/book/${book.id}`} className="block mb-3">
          <h3 className="font-serif text-lg font-semibold text-warm-900 line-clamp-2 group-hover:text-accent-700 transition-colors">
            {book.title}
          </h3>
        </Link>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-warm-600 text-sm">
            <User className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">{getAuthorsText(book.authors)}</span>
          </div>
          
          <div className="text-warm-500 text-xs">
            {getLanguageText(book.languages)}
          </div>

          {book.subjects.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {book.subjects.slice(0, 2).map((subject, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-warm-100 text-warm-600 text-xs rounded-full"
                >
                  {subject.length > 20 ? `${subject.substring(0, 20)}...` : subject}
                </span>
              ))}
            </div>
          )}
        </div>

        {showReadButton && (
          <Link
            to={`/book/${book.id}`}
            className="inline-flex items-center justify-center w-full px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Read Book
          </Link>
        )}
      </div>
    </div>
  );
};

export default BookCard;