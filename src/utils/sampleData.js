export const sampleBooks = [
    {
        id: '1',
        type: "Book",
        title: "The Power of Purpose",
        author: {
            id: '',
            name: 'John C. Maxwell',
            bio: '',
            photo: ''
        },
        authorId: 101,
        description: "A motivational book that helps readers discover their life’s purpose and unlock their true potential.",
        thumbnail: "https://example.com/covers/power-of-purpose.jpg",
        publishedAt: "2020-05-10",
        pageCount: 248,
        language: "English",
        genres: ["Motivation", "Self-help"],
        category: "Personal Development",
        categoryId: 12,
        isbn: "9781234567890",
        publisher: "Inspire Press",
        edition: "Second",
        format: "Hardcover",
        status: "Bestseller",
        readLink: "https://example.com/read/power-of-purpose",
        downloadLink: "https://example.com/download/power-of-purpose.pdf",
        audioLink: "https://example.com/audio/power-of-purpose.mp3",
        bookmarked: true,
        inLibrary: true,
        averageRating: 4.7,
        ratingsCount: 157,
        readingProgress: 85,
        tableOfContents: [
            { title: "Introduction", page: 1 },
            { title: "Chapter 1: Finding Meaning", page: 5 },
            { title: "Chapter 2: Taking Action", page: 33 }
        ],
        topic: "Purpose",
        saves: 0
    },
    {
        id: '2',
        type: "Book",
        title: "Grace Over Grind",
        author: "Shae Bynes",
        authorId: 102,
        description: "A refreshing Christian take on business, encouraging faith-based entrepreneurs to trust God in their work.",
        coverImage: "https://example.com/covers/grace-over-grind.jpg",
        publishedDate: "2019-08-21",
        pageCount: 172,
        language: "English",
        genres: ["Christian", "Business", "Faith"],
        category: "Faith and Work",
        categoryId: 18,
        isbn: "9780984567890",
        publisher: "Kingdom Driven",
        edition: "First",
        format: "Digital",
        status: "Featured",
        readLink: "https://example.com/read/grace-over-grind",
        downloadLink: "https://example.com/download/grace-over-grind.pdf",
        audioLink: "",
        bookmarked: false,
        inLibrary: false,
        averageRating: 4.9,
        ratingsCount: 89,
        readingProgress: 0,
        tableOfContents: [
            { title: "Preface", page: 1 },
            { title: "Chapter 1: Rethinking Productivity", page: 8 },
            { title: "Chapter 2: Spirit-Led Business", page: 22 }
        ],
        topic: "Faith and Business"
    },
    {
        id: '3',
        type: "book",
        title: "Intro to React",
        author: "Dan Abramov",
        authorId: 103,
        description: "A beginner-friendly guide to building interactive user interfaces with React.js.",
        coverImage: "https://example.com/covers/intro-to-react.jpg",
        publishedDate: "2021-03-15",
        pageCount: 320,
        language: "English",
        genres: ["Technology", "Programming", "Web Development"],
        category: "Software Development",
        categoryId: 30,
        isbn: "9780987654321",
        publisher: "TechBooks",
        edition: "Third",
        format: "Paperback",
        status: "Popular",
        readLink: "https://example.com/read/intro-to-react",
        downloadLink: "https://example.com/download/intro-to-react.pdf",
        audioLink: "",
        bookmarked: true,
        inLibrary: false,
        averageRating: 4.5,
        ratingsCount: 212,
        readingProgress: 47,
        tableOfContents: [
            { title: "Getting Started", page: 1 },
            { title: "JSX Deep Dive", page: 12 },
            { title: "State and Props", page: 45 }
        ],
        topic: "React"
    }
];
export const sampleAuthors = [
    {
        id: 101,
        name: 'John C. Maxwell',
        bio: 'John Maxwell is an internationally recognized leadership expert and speaker who has sold over 24 million books.',
        photo: 'https://example.com/authors/john-maxwell.jpg',
        birthDate: '1947-02-20',
        nationality: 'American',
        books: [1]
    },
    {
        id: 102,
        name: 'Shae Bynes',
        bio: 'Shae Bynes is a passionate storyteller, entrepreneur, and co-founder of Kingdom Driven Entrepreneur.',
        photo: 'https://example.com/authors/shae-bynes.jpg',
        nationality: 'American',
        books: [2]
    },
    {
        id: 103,
        name: 'Dan Abramov',
        bio: 'Dan Abramov is a software engineer at Meta, co-author of Redux, and core contributor to React.',
        photo: 'https://example.com/authors/dan-abramov.jpg',
        books: [3]
    }
];
export const quietTime = {
    date: "2025-07-18",
    verse: {
        text: "Be still, and know that I am God. - Psalm 46:10",
        reference: "Psalm 46:10"
    },
    reflection: "Take a few moments today to pause and rest in God's presence, letting go of distractions and worries.",
    worshipTrack: {
        title: "Soaking Worship Instrumental",
        link: "https://www.youtube.com/watch?v=example",
        thumbnail: "https://i.ytimg.com/vi/example/hqdefault.jpg"
    },
    prayer: "Lord, help me to find quietness in You today, and remind me of Your constant presence."
};
export const bibleData = {
    Genesis: {
        chapters: {
            1: 31,
            2: 25,
            3: 24
        }
    },
    John: {
        chapters: {
            1: 51,
            2: 25,
            3: 36
        }
    },
    Romans: {
        chapters: {
            1: 32,
            2: 29,
            3: 31
        }
    }
};
