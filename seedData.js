const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Movie = require('./models/Movie');
const mockMovies = require('../frontend/src/data/movies.json');

dotenv.config();

const processedMovies = mockMovies.map(movie => ({
    name: movie.title,
    genre: movie.genre,
    releaseYear: movie.year,
    rating: movie.rating,
    description: `A generic description for ${movie.title}`,
    poster: movie.poster,
    trailer: movie.trailer
}));

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        await Movie.deleteMany({});
        console.log('Cleared existing movies');

        await Movie.insertMany(processedMovies);
        console.log('Seeded 50 movies successfully');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
