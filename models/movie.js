const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const MonvieSchema = new Schema({
    title: String,
    plot: String,
    image: String,
    ratings: Array,
    genre: String
})

module.exports = mongoose.model('Movie', MonvieSchema)