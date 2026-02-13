const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    city: { type: String, required: true },
    location: { type: String },
    seatMap: {
        rows: { type: Number, default: 10 },
        columns: { type: Number, default: 12 },
    }
}, { timestamps: true });

module.exports = mongoose.model('Theater', theaterSchema);
