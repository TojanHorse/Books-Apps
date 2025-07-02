import React, { useState, useEffect } from 'react';
import { Book, api } from '../utils/api';
import { BookOpen, Loader } from 'lucide-react';

interface BookReaderProps {
  book: Book;
  showFullContent?: boolean;
  maxLength?: number;
}

const BookReader: React.FC<BookReaderProps> = ({ 
  book, 
  showFullContent = false, 
  maxLength = 3000 
}) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);
        const bookContent = await api.getBookContent(book);
        setContent(bookContent);
      } catch (err) {
        setError('Failed to load book content. This book may not have a readable format available.');
        console.error('Error loading book content:', err);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [book.id]);

  const formatContent = (text: string): string => {
    if (!showFullContent && text.length > maxLength) {
      text = text.substring(0, maxLength) + '...';
    }

    // Split into paragraphs
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    return paragraphs.map(paragraph => {
      const trimmed = paragraph.trim();
      
      // Check if it's a chapter heading
      if (trimmed.match(/^(CHAPTER|Chapter|BOOK|Book|PART|Part)\s+[IVXLCDM\d]/i)) {
        return `<h2 class="text-2xl font-serif font-semibold text-warm-900 mt-8 mb-4 first:mt-0">${trimmed}</h2>`;
      }
      
      // Regular paragraph
      return `<p class="mb-4 leading-relaxed text-warm-800">${trimmed}</p>`;
    }).join('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-6 w-6 animate-spin text-accent-600" />
        <span className="ml-2 text-warm-600">Loading book content...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-warm-50 border border-warm-200 rounded-lg p-6 text-center">
        <BookOpen className="h-12 w-12 text-warm-400 mx-auto mb-3" />
        <p className="text-warm-600 mb-2">{error}</p>
        <p className="text-sm text-warm-500">
          You can still explore other available formats for this book.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div 
        className={`prose prose-lg max-w-none font-serif text-warm-900 ${
          showFullContent ? 'prose-headings:font-serif' : ''
        }`}
        dangerouslySetInnerHTML={{ __html: formatContent(content) }}
      />
      
      {!showFullContent && content.length > maxLength && (
        <div className="mt-6 text-center">
          <div className="inline-block bg-gradient-to-t from-white to-transparent h-8 w-full"></div>
          <p className="text-warm-500 text-sm italic">Continue reading to discover more...</p>
        </div>
      )}
    </div>
  );
};

export default BookReader;