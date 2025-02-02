import { useEffect, useState } from "react";
import BookModel from "../../models/BookModel";
import { SpinnerLoading } from "../../Utils/SpinnerLoading";
import { StarsReview } from "../../Utils/StarsReview";
import { CheckoutAndReviewBox } from "./CheckoutAndReviewBox";
import ReviewModel from "../../models/ReviewModel";
import { LatestReview } from "./LatestReview";
import { useOktaAuth } from "@okta/okta-react";
import ReviewRequestModel from "../../models/ReviewRequestModel";

export const BookCheckoutPage = () => {

    const { authState } = useOktaAuth();

    const [book, setBook] = useState<BookModel>();
    const [isLoading, setIsLoading] = useState(true);
    const [httpError, setHttpError] = useState(null);

    //review state
    const [reviews, setReviews] = useState<ReviewModel[]>([]);
    const [totalStars, setTotalStars] = useState(0);
    const [isLoadingReview, setIsLoadingReview] = useState(true);

    const [isReviewLeft, setIsReviewLeft] = useState(false);
    const [isLoadingUserReview, setIsLoadingUserReview] = useState(true);

    //Loans Const State
    const [currentLoansCount, setCurrentLoansCount] = useState(0);
    const [isLoadingCurrentLoansCount, setIsLoadingCurrentLoansCount] = useState(true);

    //Is book checked out
    const [isCheckedOut, setIsCheckedOut] = useState(false);
    const [isLoadingBookCheckedOut, setIsLoadingBookCheckedOut] = useState(true);

    const bookId = (window.location.pathname).split('/')[2];

    useEffect(() => {
        const fetchBooks = async () => {
          const baseUrl: string = `${process.env.REACT_APP_API}/books/${bookId}`;
    
          const response = await fetch(baseUrl);
    
          if(!response.ok){
            throw new Error("Something went Wrong!");
          }
    
          const responseJson = await response.json();

          const loadedBook: BookModel = {
            id: responseJson.id,
              title: responseJson.title,
              author: responseJson.author,
              description: responseJson.description,
              copies: responseJson.copies,
              copiesAvailable: responseJson.copiesAvailable,
              category: responseJson.category,
              img: responseJson.img,
          };
    
          setBook(loadedBook);
          setIsLoading(false);
        };
        fetchBooks().catch((error: any) => {
          setIsLoading(false);
          setHttpError(error.message);
        })
      }, [isCheckedOut]);

    useEffect(() => {
        const fetchReviews = async () => {
            const reviewUrl: string = `${process.env.REACT_APP_API}/reviews/search/findByBookId?bookId=${bookId}`;

            const responseReviews = await fetch(reviewUrl);

            if (!responseReviews.ok) {
                throw new Error("Something went wrong!");
            }

            const responseJsonReviews = await responseReviews.json();

            const responseData = responseJsonReviews._embedded.reviews;

            const loadedReviews: ReviewModel[] = [];

            let weightedStarReview: number = 0;

            for (const key in responseData) {
                loadedReviews.push({
                    id: responseData[key].id,
                    book_id: responseData[key].bookId,
                    userEmail: responseData[key].userEmail,
                    rating: responseData[key].rating,
                    reviewDescription: responseData[key].reviewDescription,
                    date: responseData[key].date
                });
                weightedStarReview = weightedStarReview + responseData[key].rating;
            }

            if (loadedReviews) {
                const round = (Math.round((weightedStarReview / loadedReviews.length) * 2) / 2).toFixed(1);
                setTotalStars(Number(round));
            }

            setReviews(loadedReviews);
            setIsLoadingReview(false);
        };

        fetchReviews().catch((error: any) => {
            setIsLoadingReview(false);
            setHttpError(error.message);
        });
    }, [isReviewLeft]);

    useEffect(() => {
        const fetchUserReviewBook = async () => {
            if (authState && authState.isAuthenticated) {
                const url = `${process.env.REACT_APP_API}/reviews/secure/user/book?bookId=${bookId}`;
                const requestOptions = {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${authState.accessToken?.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                };
                const userReview = await fetch(url, requestOptions);
                if (!userReview.ok) {
                    throw new Error('Something went wrong');
                }
                const userReviewResponseJson = await userReview.json();
                setIsReviewLeft(userReviewResponseJson);
            }
            setIsLoadingUserReview(false);
        }
        fetchUserReviewBook().catch((error: any) => {
            setIsLoadingUserReview(false);
            setHttpError(error.message);
        })
    }, [authState]);

    useEffect(() => {
        const fetchUserCurrentLoansCount = async () => {
            if (authState && authState.isAuthenticated) {
                const url = '${process.env.REACT_APP_API}/books/secure/currentloans/count';
                const requestOptions = {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${authState.accessToken?.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                };

                const currentLoansCountResponse = await fetch(url, requestOptions);
                if (!currentLoansCountResponse.ok) {
                    throw new Error('Failed to fetch current loans count');
                }

                const currentLoansCountResponseJson = await currentLoansCountResponse.json();
                setCurrentLoansCount(currentLoansCountResponseJson);
            }
            setIsLoadingCurrentLoansCount(false);
        }
        fetchUserCurrentLoansCount().catch((error: any) => {
            setIsLoadingCurrentLoansCount(false);
            setHttpError(error.message);
        })
    }, [authState, isCheckedOut]);

    useEffect(() => {
        const fetchUserCheckedoutBook = async() => {
            if (authState && authState.isAuthenticated) {
                const url = `${process.env.REACT_APP_API}/books/secure/ischeckedout/byuser?bookId=${bookId}`;
                const requestOptions = {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${authState.accessToken?.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                };
                const bookCheckedOut = await fetch(url, requestOptions);

                if (!bookCheckedOut.ok) {
                    throw new Error('Fetch user checkout book failed!!');
                }

                const bookCheckedOutResponseJson = await bookCheckedOut.json();
                setIsCheckedOut(bookCheckedOutResponseJson);
            }
            setIsLoadingBookCheckedOut(false);
        }
        fetchUserCheckedoutBook().catch((error: any) => {
            setIsLoadingBookCheckedOut(false);
            setHttpError(error.message);
        })
    }, [authState])

      if (isLoading || isLoadingReview || isLoadingCurrentLoansCount || isLoadingBookCheckedOut) {
        return(
        <SpinnerLoading />
        );
      }
    
      if (httpError) {
        return(<div className="container mt-5">
          <p>{httpError}</p>
        </div>)
      }

    async function checkoutBook() {
        const url = `${process.env.REACT_APP_API}/books/secure/checkout?bookId=${book?.id}`;
        const requestOptions = {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${authState?.accessToken?.accessToken}`,
                'Content-Type': 'application/json'
            }
        };
        const checkoutResponse = await fetch(url, requestOptions);
        if (!checkoutResponse.ok) {
            throw new Error('Something went wrong!');
        }
        setIsCheckedOut(true);
    }

    async function submitReview(starInput: number, reviewDescription: string) {
        let bookId: number = 0;
        if (book?.id) {
            bookId = book.id;
        }

        const reviewRequestModel = new ReviewRequestModel(starInput, bookId, reviewDescription);
        const url = `${process.env.REACT_APP_API}/reviews/secure`;
        const requestOptions = {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authState?.accessToken?.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reviewRequestModel)
        };
        const returnResponse = await fetch(url, requestOptions);
        if (!returnResponse.ok) {
            throw new Error('Something went wrong!');
        }
        setIsReviewLeft(true);
    }

    return(
        <div>
            <div className="container d-none d-lg-block">
                <div className="row mt-5">
                    <div className="col-sm-2 col-md-2">
                        {book?.img ?
                        <img src={book?.img} width='226' height='349' alt='Book' />
                        :
                        <img src={require('./../../Images/BooksImages/book-luv2code-1000.png')} width='226' height='349' alt='Book'/>
                        }
                    </div>
                    <div className="col-4 col-md-4 container">
                        <div className="ml-2">
                            <h2>{book?.title}</h2>
                            <h5 className="text-primary">{book?.author}</h5>
                            <p className="lead">{book?.description}</p>
                            <StarsReview rating={totalStars} size={32}/>
                        </div>
                    </div>
                    <CheckoutAndReviewBox 
                        book={book} mobile={false} currentLoansCount={currentLoansCount} 
                        isAuthenticated={authState?.isAuthenticated} isCheckedOut={isCheckedOut} 
                        checkoutBook={checkoutBook} isReviewLeft={isReviewLeft}  submitReview={submitReview}/>
                </div>
                <LatestReview reviews={reviews} bookId={book?.id} mobile={false}/>
                <hr/>
            </div>
            <div className="container d-lg-none mt-5">
                <div className="d-flex justify-content-center align-items-center">
                {book?.img ?
                        <img src={book?.img} width='226' height='349' alt='Book' />
                        :
                        <img src={require('./../../Images/BooksImages/book-luv2code-1000.png')} width='226' height='349' alt='Book'/>
                        }
                </div>
                <div className="mt-4">
                    <div className="ml-2">
                        <h2>{book?.title}</h2>
                        <h5 className="text-primary">{book?.author}</h5>
                        <p className="lead">{book?.description}</p>
                        <StarsReview rating={totalStars} size={32}/>
                    </div>
                </div>
                <CheckoutAndReviewBox 
                    book={book} mobile={true}  currentLoansCount={currentLoansCount}
                    isAuthenticated={authState?.isAuthenticated} isCheckedOut={isCheckedOut} 
                    checkoutBook={checkoutBook} isReviewLeft={isReviewLeft}  submitReview={submitReview} />
                <hr/>
                <LatestReview reviews={reviews} bookId={book?.id} mobile={true}/>
            </div>
        </div>
    );
}