const express = require('express');
const router = express.Router();
const Showtime = require('../models/Showtime');
const Theater = require('../models/Theater');

// GET /api/showtimes/:id
router.get('/:id', async (req, res) => {
    try {
        const showtime = await Showtime.findById(req.params.id)
            .populate('theater')
            .populate('movie');

        if (!showtime) {
            return res.status(404).json({ message: 'Showtime not found' });
        }
        res.json(showtime);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
