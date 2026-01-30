const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    city: { type: String, required: true }, // For location filtering
    location: { type: String }, // Address
    seatMap: {
        rows: { type: Number, default: 10 },
        columns: { type: Number, default: 12 },
        // Simplified map. Real apps might store complex grids with gaps.
    }
}, { timestamps: true });

module.exports = mongoose.model('Theater', theaterSchema);
