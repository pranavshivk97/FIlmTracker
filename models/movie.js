const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const MonvieSchema = new Schema({
    title: String,
    plot: String,
    image: String,
    rating: Number
})

module.exports = mongoose.model('Movie', MonvieSchema)