const BASE_URL = 'https://gutendex.com/books';

export interface Book {
  id: number;
  title: string;
  authors: Author[];
  subjects: string[];
  languages: string[];
  download_count: number;
  formats: Record<string, string>;
  bookshelves: string[];
}

export interface Author {
  name: string;
  birth_year?: number;
  death_year?: number;
}

export interface BooksResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Book[];
}

export const api = {
  // Get books with optional parameters
  async getBooks(params: {
    page?: number;
    search?: string;
    author?: string;
    subject?: string;
    languages?: string;
  } = {}): Promise<BooksResponse> {
    const url = new URL(BASE_URL);
    
    if (params.page) url.searchParams.set('page', params.page.toString());
    if (params.search) url.searchParams.set('search', params.search);
    if (params.author) url.searchParams.set('author', params.author);
    if (params.subject) url.searchParams.set('topic', params.subject);
    if (params.languages) url.searchParams.set('languages', params.languages);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    return response.json();
  },

  // Get a single book by ID
  async getBook(id: number): Promise<Book> {
    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch book: ${response.status}`);
    }
    return response.json();
  },

  // Get Alice in Wonderland (default book)
  async getAliceInWonderland(): Promise<Book> {
    const response = await this.getBooks({ search: "Alice's Adventures in Wonderland" });
    return response.results.find(book => 
      book.title.toLowerCase().includes("alice") && 
      book.authors.some(author => author.name.toLowerCase().includes("carroll"))
    ) || response.results[0];
  },

  // Get book content (plain text)
  async getBookContent(book: Book): Promise<string> {
    const textUrl = book.formats['text/plain; charset=utf-8'] || 
                   book.formats['text/plain'] ||
                   book.formats['text/html'];
    
    if (!textUrl) {
      throw new Error('No readable format available');
    }

    const response = await fetch(textUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch book content');
    }
    
    const content = await response.text();
    
    // Clean up the content - remove Project Gutenberg headers/footers
    const lines = content.split('\n');
    const startIndex = lines.findIndex(line => 
      line.includes('START OF') || 
      line.includes('***') ||
      (lines.indexOf(line) > 50 && line.trim().length > 0 && !line.includes('Project Gutenberg'))
    );
    const endIndex = lines.findIndex((line, index) => 
      index > startIndex + 100 && (
        line.includes('END OF') || 
        line.includes('***END***') ||
        line.includes('Project Gutenberg')
      )
    );

    const cleanContent = lines
      .slice(Math.max(0, startIndex), endIndex > 0 ? endIndex : lines.length)
      .join('\n')
      .replace(/_{5,}/g, '') // Remove long underscores
      .replace(/\*{3,}/g, '') // Remove asterisk separators
      .replace(/^\s*CHAPTER.*$/gm, '\n$&\n') // Add spacing around chapters
      .trim();

    return cleanContent;
  }
};