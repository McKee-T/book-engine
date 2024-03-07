require('dotenv').config(); // Ensure this is at the top to load environment variables

// Access the Google Books API key from environment variables
const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

let fetch; // Declare fetch variable

// Use dynamic import for node-fetch
import('node-fetch').then(({ default: fetched }) => {
    fetch = fetched;
}).catch(err => console.error('Failed to load node-fetch', err));

const searchBooksApi = async (query) => {
    // Ensure fetch is defined
    if (!fetch) {
        console.error('Fetch is not defined');
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}?q=${encodeURIComponent(query)}&key=${API_KEY}`);
        const data = await response.json();

        // Transform the API response to match the Book type in your GraphQL schema
        const books = data.items.map((item) => ({
            bookId: item.id,
            title: item.volumeInfo.title,
            authors: item.volumeInfo.authors || [],
            description: item.volumeInfo.description || '',
            image: item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : '',
            link: item.volumeInfo.infoLink
        }));

        return books;
    } catch (error) {
        console.error('Error fetching data from Google Books API:', error);
        throw new Error('Failed to fetch books');
    }
};

module.exports = { searchBooksApi };
