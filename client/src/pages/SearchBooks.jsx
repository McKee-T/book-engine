import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Container, Col, Form, Button, Card, Row } from 'react-bootstrap';
import Auth from '../utils/auth';
import { saveBookIds, getSavedBookIds } from '../utils/localStorage';

const SEARCH_BOOKS = gql`
  query searchBooks($query: String!) {
    searchBooks(query: $query) {
      bookId
      authors
      title
      description
      image
    }
  }
`;

const SAVE_BOOK = gql`
  mutation saveBook($bookData: BookInput!) {
    saveBook(bookData: $bookData) {
      _id
      savedBooks {
        bookId
        title
        authors
        description
        image
        link
      }
    }
  }
`;

const SearchBooks = () => {
  const [searchInput, setSearchInput] = useState('');
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());
  const { loading, data } = useQuery(SEARCH_BOOKS, {
    variables: { query: searchInput },
    skip: !searchInput,
  });
  const [saveBook] = useMutation(SAVE_BOOK, {
    onCompleted: (data) => {
      const savedBookId = data.saveBook.savedBooks.slice(-1)[0].bookId;
      setSavedBookIds([...savedBookIds, savedBookId]);
      saveBookIds([...savedBookIds, savedBookId]);
    }
  });

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setSearchInput('');
  };

  const handleSaveBook = async (bookData) => {
    try {
      await saveBook({
        variables: { bookData },
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Container className="text-light bg-dark p-5">
        <h1>Search for Books!</h1>
        <Form onSubmit={handleFormSubmit}>
          <Row>
            <Col xs={12} md={8}>
              <Form.Control
                name='searchInput'
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                type='text'
                size='lg'
                placeholder='Search for a book'
              />
            </Col>
            <Col xs={12} md={4}>
              <Button type='submit' variant='success' size='lg'>
                Submit Search
              </Button>
            </Col>
          </Row>
        </Form>
      </Container>
      <Container>
        <h2 className='pt-5'>
          {loading
            ? 'Searching...'
            : data?.searchBooks?.length
            ? `Viewing ${data.searchBooks.length} results:`
            : 'Search for a book to begin'}
        </h2>
        <Row>
          {data?.searchBooks?.map((book) => (
            <Col key={book.bookId} md="4">
              <Card border='dark'>
                {book.image && (
                  <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' />
                )}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className='small'>Authors: {book.authors.join(', ')}</p>
                  <Card.Text>{book.description}</Card.Text>
                  {Auth.loggedIn() && (
                    <Button
                      disabled={savedBookIds.includes(book.bookId)}
                      className='btn-block btn-info'
                      onClick={() => handleSaveBook({ ...book })}>
                      {savedBookIds.includes(book.bookId) ? 'This book has already been saved!' : 'Save this Book!'}
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;
