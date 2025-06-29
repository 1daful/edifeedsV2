export interface Chapter {
  title: string
  page: number
}

export interface Book {
  id: string
  type: string // e.g., "book", "audiobook", "ebook"
  title: string
  author: string
  authorId: number | null
  description: string
  coverImage: string
  publishedDate: string
  pageCount: number
  language: string
  genres: string[]
  category: string
  categoryId: number | null
  isbn: string
  publisher: string
  edition: string
  format: string
  status: string
  readLink: string
  downloadLink: string
  audioLink: string
  bookmarked: boolean
  inLibrary: boolean
  averageRating: number
  ratingsCount: number
  readingProgress: number
  tableOfContents: Chapter[]
  topic: string
}

export interface Author {
  id: string
  name: string
  bio: string
  photo: string
  birthDate?: string
  nationality?: string
  books?: string[] // Array of book IDs
}

export interface EnhancedAuthor extends Author {
  featured?: boolean
  deathDate?: string
  genres?: string[]
  awards?: string[]
  socialLinks?: Record<string, string>
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  location: string;
  category: string;
  link?: string;
  featured?: boolean;
  attendees?: number;
  tags?: string[];
  organizer?: string;
  isPaid?: boolean;
  price?: string;
}
