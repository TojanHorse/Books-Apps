import React, { useState, useEffect } from 'react';
import { Book, api } from '../utils/api';
import BookCard from './BookCard';
import { Loader } from 'lucide-react';

interface RelatedBooksProps {
  currentBook: Book;
}

const RelatedBooks: React.FC<RelatedBooksProps> = ({ currentBook }) => {
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRelatedBooks = async () => {
      try {
        setLoading(true);
        const books: Book[] = [];

        // Get books by the same author
        if (currentBook.authors.length > 0) {
          const authorName = currentBook.authors[0].name;
          const authorResponse = await api.getBooks({ author: authorName });
          const authorBooks = authorResponse.results
            .filter(book => book.id !== currentBook.id)
            .slice(0, 3);
          books.push(...authorBooks);
        }

        // If we need more books, get some from the same subject
        if (books.length < 6 && currentBook.subjects.length > 0) {
          const subject = currentBook.subjects[0];
          const subjectResponse = await api.getBooks({ subject });
          const subjectBooks = subjectResponse.results
            .filter(book => 
              book.id !== currentBook.id && 
              !books.some(b => b.id === book.id)
            )
            .slice(0, 6 - books.length);
          books.push(...subjectBooks);
        }

        setRelatedBooks(books.slice(0, 6));
      } catch (error) {
        console.error('Error loading related books:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRelatedBooks();
  }, [currentBook.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="h-5 w-5 animate-spin text-accent-600" />
        <span className="ml-2 text-warm-600">Loading related books...</span>
      </div>
    );
  }

  if (relatedBooks.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-xl font-serif font-semibold text-warm-900 mb-6">
        You might also like
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
};

export default RelatedBooks;