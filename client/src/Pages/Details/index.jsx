import {useEffect, useState} from 'react';
import './styles.css';
import ReactStars from 'react-stars'
import {useParams} from 'react-router-dom';
import {apiKey} from '../../../env.js';
import ShareButtons from '../../Components/Sharebutton';
import {useAuthContext} from "../../Hooks/useAuthContext";
import {useRating} from "../../Hooks/useRating";

const MovieDetailsPage = () => {
    const [movieData, setMovieData] = useState(null);
    const [showShareButtons, setShowShareButtons] = useState(false);
    const {id} = useParams();
    const urlParts = id.split('/');
    const movieId = urlParts[urlParts.length - 1];
    const {user} = useAuthContext()
    const {rating} = useRating()
    const [userRating, setUserRating] = useState(null);

    useEffect(() => {
        // Fetch the movie rating for the logged-in user
        fetch(`/api/rating/movie/${encodeURIComponent(movieId)}`)
            .then(response => response.json())
            .then(data => {
                setUserRating(data.rating);
            })
            .catch(error => {
                console.error('Error fetching movie rating:', error);
            });
    }, [movieId]);



    useEffect(() => {
        fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US`)
            .then(response => response.json())
            .then(data => {
                setMovieData(data);
                const timer = setTimeout(() => {
                    setShowShareButtons(true);
                }, 500);
                return () => clearTimeout(timer);
            })
            .catch(error => {
                console.error('Error fetching movie data:', error);
            });
    }, []);

    if (!movieData) {
        return <div>Loading...</div>;
    }

    const backdropUrl = `https://image.tmdb.org/t/p/original${movieData.backdrop_path}`;

    const ratingChanged = async (newRating) => {
        await rating(user.username, newRating, movieData.title)
    }

    return (
        <div className="home-container-details">
            <div className="background-image-details" style={{
                backgroundImage: `url(${backdropUrl})`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat"
            }}></div>
            <div className="overlay"></div>
            <div className="page-container">

                <div className="movie-details-container-details">
                    <div className="movie-image-details">
                        <img
                            src={`https://image.tmdb.org/t/p/w500${movieData.poster_path}`}
                            alt={movieData.title}
                        />
                    </div>
                    <div className="movie-details-details">
                        <div className="content">
                            <div className="movie-name">{movieData.title}</div>
                            <div className="details-section">
                                <h2>Description</h2>
                                <div className="movie-description">{movieData.overview}</div>
                            </div>
                            <div className="details-section">
                                <h2>Ratings</h2>
                                <div className="movie-ratings">
                                    IMDb: {movieData.vote_average}/10, Popularity: {movieData.popularity}
                                </div>
                            </div>
                            {showShareButtons && <ShareButtons/>}
                            <div>
                                <h2>Your rating</h2>
                                <ReactStars
                                    count={5}
                                    onChange={ratingChanged}
                                    size={24}
                                    color2={'#ffd700'}
                                    value={userRating}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieDetailsPage;