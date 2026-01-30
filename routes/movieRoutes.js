const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const { protect } = require('../middleware/authMiddleware');

// GET all movies (Public)
router.get('/', async (req, res) => {
    try {
        // Sort by createdAt: 1 to show oldest first (new movies at bottom)
        const movies = await Movie.find().sort({ createdAt: 1 });
        res.json(movies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ...

// POST create movie (Protected)
router.post('/', protect, async (req, res) => {
    const { name, genre, releaseYear, rating, description, poster } = req.body;
    const movie = new Movie({ name, genre, releaseYear, rating, description, poster });

    try {
        const newMovie = await movie.save();
        res.status(201).json(newMovie);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update movie (Protected)
router.put('/:id', protect, async (req, res) => {
    try {
        const { name, genre, releaseYear, rating, description, poster } = req.body;
        const updatedMovie = await Movie.findByIdAndUpdate(
            req.params.id,
            { name, genre, releaseYear, rating, description, poster },
            { new: true, runValidators: true }
        );
        if (!updatedMovie) return res.status(404).json({ message: 'Movie not found' });
        res.json(updatedMovie);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE delete movie (Protected)
router.delete('/:id', protect, async (req, res) => {
    try {
        const movie = await Movie.findByIdAndDelete(req.params.id);
        if (!movie) return res.status(404).json({ message: 'Movie not found' });
        res.json({ message: 'Movie deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
