import { NavigationActions } from 'react-navigation';
import { firebaseApp } from '../config/firebaseConfig';

export const FETCH_BOOK = 'FETCH_BOOK';
export const FETCH_BOOK_SUCCESS = 'FETCH_BOOK_SUCCESS';
export const FETCH_FAILURE = 'FETCH_FAILURE';
export const SEARCH_BOOK = 'SEARCH_BOOK';
export const CLEAR_SEARCH = 'CLEAR_SEARCH';
export const FETCH_BOOK_ID = 'FETCH_BOOK_ID';

export const fetchBook = () => ({
   type: FETCH_BOOK
});

export const fetchBookSuccess = books => ({
   type: FETCH_BOOK_SUCCESS,
   books
});

export const fetchBookFailure = error => ({
   type: FETCH_FAILURE,
   error
});

export const search = booksSearch => ({
   type: SEARCH_BOOK,
   booksSearch
});

export const clearSearch = () => ({
   type: CLEAR_SEARCH
});

export const fetchBookId = bookInfo => ({
   type: FETCH_BOOK_ID,
   bookInfo
});

export const retrieveCollection = () => (
   async (dispatch, getState) => {
      dispatch(fetchBook());
      try {
         const { uid } = getState().auth.user;
         const books = [];
         const snapshot = await firebaseApp.database().ref('bookcase').child(uid).once('value');
         snapshot.forEach(childSnapshot => {
            books.push({
               _id: childSnapshot.key,
               title: childSnapshot.val().title,
               author: childSnapshot.val().author,
               rating: childSnapshot.val().rating,
               page: childSnapshot.val().page,
               is_finished: childSnapshot.val().is_finished,
               date_finished: childSnapshot.val().date_finished,
               thumbnail: childSnapshot.val().thumbnail,
            });
         });
         dispatch(fetchBookSuccess(books));
      } catch (err) {
         dispatch(fetchBookFailure('Somethings were wrong!'));
      }
   }
);

export const searchBook = text => (
   (dispatch, getState) => {
      const { books } = getState().book;
      const newData = books.filter(book => {
         const bookName = book.title.toUpperCase();
         const textSearchUpperCase = text.toUpperCase();
         return bookName.indexOf(textSearchUpperCase) > -1;
      });
      dispatch(search(newData));
   }
);

export const fetchBookById = bookId => (
   async (dispatch, getState) => {
      const { uid } = getState().auth.user;
      dispatch({ type: 'SHOW_LOADING' });
      const snapshot = await firebaseApp.database().ref('bookcase').child(uid).child(bookId).once('value');
      if (snapshot.val()) {
         dispatch(fetchBookId({
            bookId: snapshot.key,
            book: snapshot.val()
         }));
      } else {
         dispatch(NavigationActions.back());
      }
      dispatch({ type: 'HIDE_LOADING' });
   }
);
