const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const reviewSchema = Schema({
    rating: Number,
    content: String
})

module.exports = mongoose.model('Review', reviewSchema)