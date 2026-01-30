const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Movie name is required']
    },
    genre: {
        type: String,
        required: [true, 'Genre is required']
    },
    releaseYear: {
        type: Number,
        required: [true, 'Release year is required']
    },
    rating: {
        type: Number,
        min: 0,
        max: 10,
        required: [true, 'Rating is required (0-10)']
    },
    description: {
        type: String,
        required: false
    },
    poster: {
        type: String, // Storing Base64 string or URL
        required: false
    },
    trailer: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Movie', movieSchema);
