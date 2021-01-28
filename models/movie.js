const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const MovieSchema = new Schema({
    title: {
        type: String,
        unique: true
    },
    plot: String,
    image: String,
    ratings: Array,
    genre: String,
    dbOwner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ]
})

module.exports = mongoose.model('Movie', MovieSchema)