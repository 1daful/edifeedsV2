export interface AuthorForm {
  name: string
  slug: string
  bio: string
  image_url: string
  denomination?: string
  country?: string
  website?: string
  tags: string[]
  social_links: {
    youtube?: string
    facebook?: string
    instagram?: string
    twitter?: string
  }
}

export interface AuthorProfile {
  id: string
  name: string
  bio: string
  slug: string
  image: string
  tags?: string[]
}

export interface HistoryEntry {
  id: string
  title: string
  slug: string
  date: string
  summary: string
  image_url?: string
  content: string
  tags?: string[]
}

export interface HistoryForm {
  title: string
  slug: string
  date: string
  summary: string
  content: string
  image_url?: string
  tags: string[]
}

export interface Chapter {
  title: string
  page: number
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

export type ApiFormat = {
  title: string
  author: Author
  publisher: {
    name: string
    logo: string
    description: string
  }
  topic: string
  isbn: string
  lccl: string
  oclc: string
  format: string
  printType: string
  orderBy: string
  content: string
  date: string
  thumbnail: string
  genre: string
  tags: string[]
  region: string
  length: string | number
  parent: string
  description: string
  keyword: string
}

export type MediaType = 'Video' | 'Audio' | 'Book' | 'Quote' | 'Article';

export interface BaseMedia {
  id: string;
  type: MediaType;
  title: string;
  description: string;
  author: Author;
  thumbnail?: string;
  publishedAt: string
  tags?: string[];
  rating?: number; // e.g., 4.3
  reviewCount?: number;
  views?: number;
  likes?: number;
  comments?: Record<string,any>;
  commentCount?: number;
  genres: string[]
  downloadable?: boolean;
  category: string
  categoryId: number | null
  language: string;
  saves: number;
  shares?: number
}
export interface Quote extends BaseMedia {
  type: 'Quote';
  // Quotes may be short so duration is not needed
}
export interface Book extends BaseMedia {
  type: 'Book';
  duration?: number; // Optional reading time
  publisher: string
  id: string
  authorId: number | null
  description: string
  pageCount: number
  isbn: string
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
export interface Video extends BaseMedia {
  type: 'Video';
  duration: number; // in seconds
  producer: string
}
export interface Audio extends BaseMedia {
  type: 'Audio';
  duration: number; // in seconds
  producer: string
}
export interface Article extends BaseMedia {
  type: 'Article';
  // Optionally add extra fields later (e.g., source)
}
