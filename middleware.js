const Movie = require('./models/movie')
const Comment = require('./models/comment')
const commentSchema = require('./schemas')
const ExpressError = require('./utils/expressError')

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You need to log in first!')
        return res.redirect('/login')
    } else {
        next();
    }
}

module.exports.isMovieAuthor = async (req, res, next) => {
    const { id } = req.params;
    const movie = await Movie.findById(id)
    console.log(movie, req.user._id)
    if (!movie.dbOwner.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to access this')
        return res.redirect('/watchlist')
    }
    next();
}

module.exports.isCommentAuthor = async (req, res, next) => {
    const { id, commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment.author.equals(req.user._id)) {
        req.flash("error", 'You do not have permission to edit this')
        return res.redirect(`/watchlist/${id}/comments`)
    }
    next();
}

module.exports.validateComment = (req, res, next) => {
    const { error } = commentSchema.validate(eq.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        // req.flash('error', msg)
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}