const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /api/search?title=...
// GET /api/search?title=...
router.get('/', async (req, res) => {
    const { title } = req.query;

    if (!title) {
        return res.status(400).json({ message: 'Title query parameter is required' });
    }

    // Prefer TMDB if available, otherwise fallback to OMDb (or handle error)
    const tmdbKey = process.env.TMDB_API_KEY;

    if (tmdbKey) {
        try {
            const response = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
                params: {
                    api_key: tmdbKey,
                    query: title
                }
            });

            const results = response.data.results || [];

            // Map TMDB format to OMDb format for frontend compatibility
            const mappedResults = results.map(movie => ({
                Title: movie.title,
                Year: movie.release_date ? movie.release_date.substring(0, 4) : 'N/A',
                imdbID: movie.id.toString(),
                Type: 'movie',
                Poster: movie.poster_path
                    ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                    : 'N/A'
            }));

            return res.json({ Search: mappedResults });

        } catch (error) {
            console.error('TMDB Fetch Error:', error.message);
            // Fallback to OMDb logic below if preferred, or just return error
            return res.status(500).json({ message: 'Failed to fetch data from TMDB' });
        }
    }

    // Fallback to OMDb logic (Deprecated/Backup)
    const omdbKey = process.env.OMDB_API_KEY;
    if (!omdbKey) {
        return res.status(500).json({ message: 'API key not configured' });
    }

    try {
        const response = await axios.get(`http://www.omdbapi.com/?s=${encodeURIComponent(title)}&apikey=${omdbKey}`);

        if (response.data.Error) {
            return res.status(404).json({ message: response.data.Error });
        }

        res.json(response.data);
    } catch (error) {
        console.error('OMDb Fetch Error:', error.message);
        res.status(500).json({ message: 'Failed to fetch data from OMDb' });
    }
});

// GET /api/search/popular
router.get('/popular', async (req, res) => {
    const tmdbKey = process.env.TMDB_API_KEY;
    if (!tmdbKey) {
        return res.status(500).json({ message: 'TMDB API key not configured' });
    }

    try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/popular`, {
            params: {
                api_key: tmdbKey,
                language: 'en-US',
                page: 1
            }
        });

        // Pass through the TMDB results directly (or map if we want strict consistency)
        // User's snippet expects 'results' array with TMDB structure
        res.json(response.data);
    } catch (error) {
        console.error('TMDB Popular Fetch Error:', error.message);
        res.status(500).json({ message: 'Failed to fetch popular movies' });
    }
});

module.exports = router;
