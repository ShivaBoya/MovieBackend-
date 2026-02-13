const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
    const { title } = req.query;

    if (!title) {
        return res.status(400).json({ message: 'Title query parameter is required' });
    }

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
            return res.status(500).json({ message: 'Failed to fetch data from TMDB' });
        }
    }

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

        res.json(response.data);
    } catch (error) {
        console.error('TMDB Popular Fetch Error:', error.message);
        res.status(500).json({ message: 'Failed to fetch popular movies' });
    }
});

module.exports = router;
