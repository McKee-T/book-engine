import { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Container, Card, Button, Row, Col, Alert } from 'react-bootstrap';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';

const GET_SAVED_BOOKS = gql`
  query getSavedBooks {
    me {
      savedBooks {
        bookId
        authors
        description
        title
        image
        link
      }
    }
  }
`;

const DELETE_BOOK = gql`
  mutation deleteBook($bookId: String!) {
    deleteBook(bookId: $bookId) {
      _id
      savedBooks {
        bookId
        authors
        title
      }
    }
  }
`;

const SavedBooks = () => {
  const { loading, data, refetch } = useQuery(GET_SAVED_BOOKS, {
    fetchPolicy: "network-only"
  });
  const [deleteBook] = useMutation(DELETE_BOOK);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleDeleteBook = async (bookId) => {
    try {
      await deleteBook({
        variables: { bookId },
      });
      removeBookId(bookId);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <h2>LOADING...</h2>;
  }

  const userData = data?.me;

  return (
    <>
      <Container fluid className="text-light bg-dark p-5">
        <h1>Viewing saved books!</h1>
      </Container>
      <Container>
        <h2 className='pt-5'>
          {userData?.savedBooks?.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData?.savedBooks?.map((book) => (
            <Col key={book.bookId} md="4">
              <Card border='dark'>
                {book.image && <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' />}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className='small'>Authors: {book.authors.join(', ')}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
