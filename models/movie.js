const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const MonvieSchema = new Schema({
    title: {
        type: String,
        unique: true
    },
    plot: String,
    image: String,
    ratings: Array,
    genre: String
})

module.exports = mongoose.model('Movie', MonvieSchema)