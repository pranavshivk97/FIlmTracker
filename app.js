const express = require('express');
const path = require('path')
const mongoose = require('mongoose')
const request = require('request')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const methodOverride = require('method-override')
const passport = require('passport')
const localStrategy = require('passport-local')

const Movie = require('./models/movie')
const Comment = require('./models/comment')
const User = require('./models/user');
const { isLoggedIn } = require('./middleware');

mongoose.connect('mongodb://localhost:27017/moviedb', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
    console.log("Database connected");
});

const app = express();

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate)

const sessionConfig = {
    secret: "You will never guess this secret!",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}

app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})  

app.get('/', (req, res) => {
    res.render('home')
})

// MOVIE ROUTES

app.get('/search', (req, res) => {
    title = req.query.searchName
    requestUrl = `http://www.omdbapi.com/?t=${title}&apikey=1303fcca&plot=full`
    request(requestUrl, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            const result = JSON.parse(body)
            if (result.Response === 'False') {
                req.flash('error', result.Error)
                res.redirect('back')
            } else {
                res.render('display', { result })
            }
        }
    })
})

app.post('/watched', isLoggedIn, (req, res) => {
    const movie = new Movie()
    requestUrl = `http://www.omdbapi.com/?t=${title}&apikey=1303fcca&plot=full`
    request(requestUrl, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            const result = JSON.parse(body)
            movie.title = result.Title;
            movie.plot = result.plot
            movie.image = result.Poster
            movie.ratings = result.Ratings
            movie.genre = result.Genre
            movie.dbOwner = req.user._id
            Movie.count({ title: movie.title }, (err, count) => {
                if (count > 0) {
                    req.flash('error', 'This movie already exists.')
                    res.redirect('/')
                } else {
                    movie.save()
                    console.log(movie)
                    req.flash('success', 'Movie successfully added')
                    res.redirect('/watchlist')
                }
            })
        } 
    })
})

app.get('/watchlist', isLoggedIn, (req, res) => {
    Movie.find({}, (error, movies) => {
        if (error) {
            req.flash('error', error.message)
        } else {
            res.render('watchlist', { movies })
        }
    })
})

app.delete('/watchlist/:id', isLoggedIn, async (req, res) => {
    console.log(req.params.id)
    await Movie.findByIdAndDelete(req.params.id);
    req.flash(`Removed movie from watchlist`)
    res.redirect('/watchlist')
})

// REVIEW ROUTES

app.get('/watchlist/:id/reviews', isLoggedIn, async (req, res) => {
    const movie = await Movie.findById(req.params.id).populate({
        path: 'comments',
        populate: {
            path: 'author'  
        }
    }).populate('dbOwner')
    console.log(movie)
    res.render('comments', { movie })
})

app.post('/watchlist/:id/reviews', isLoggedIn, async (req, res) => {
    const movie = await Movie.findById(req.params.id);
    const comment = new Comment(req.body.comment);
    comment.author = req.user._id
    console.log(comment)
    await comment.save()
    movie.comments.push(comment)
    await movie.save()
    console.log(movie)
    req.flash('success', 'Comment added successfully')
    res.redirect(`/watchlist/${movie._id}/reviews`)
})

app.delete('/watchlist/:id/reviews/:reviewId', async (req, res) => {
    const { id, reviewId } = req.params;
    await Movie.findByIdAndUpdate(id, {$pull: { comments: reviewId }})
    await Comment.findByIdAndDelete(reviewId)
    req.flash('success', 'Review deleted successfully')
    res.redirect(`/watchlist/${id}/reviews`)
})

// USER ROUTES

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    try {
        console.log(req.body)
        const { email, username, password } = req.body
        const user = new User({ email, username, password })
        const newUser = await User.register(user, password)
        console.log(newUser)
        req.login(newUser, err => {
            if (err) return next(err)
            req.flash("success", `Welcome ${username}!`)
            res.redirect('/')
        })
    } catch(e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', passport.authenticate('local', { successRedirect: '/watchlist', successFlash: true, failureRedirect: '/login', failureFlash: true }), (req, res) => {
    req.flash("success", "You're logged in!")
    console.log(req.user.username)
    const redirectedUrl = req.session.returnTo || '/'
    console.log(req.session)
    delete req.session.returnTo
    // res.redirect('/watchlist')
})

app.get('/logout', isLoggedIn, (req, res) => {
    req.logout()
    req.flash('success', "You're logged out")
    res.redirect('/')
})

app.use((err, req, res, next) => {
    const { statusCode=500 } = err;
    if (!err.message) err.message = 'Oh no, something went wrong!'
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log('Server has started...')
})