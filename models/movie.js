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
    genre: String,
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ]
})

module.exports = mongoose.model('Movie', MonvieSchema)