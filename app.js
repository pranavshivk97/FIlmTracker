const express = require('express');
const path = require('path')
const mongoose = require('mongoose')
const request = require('request')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')

const Movie = require('./models/movie')

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
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
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

app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/search', (req, res) => {
    title = req.query.searchName
    requestUrl = `http://www.omdbapi.com/?t=${title}&apikey=1303fcca&plot=full`
    request(requestUrl, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            const result = JSON.parse(body)
            if (result !== undefined || result !== null) {
                res.render('display', { result })
            } else {
                req.flash("error", "Movie not found. Please try again")
                res.redirect('/')
            }
        }
    })
})

app.post('/watched', (req, res) => {
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
            movie.save()
            console.log(movie)
            req.flash('success', 'Movie successfully added')
            res.redirect('/watchlist')
        } 
    })
})

app.get('/watchlist', (req, res) => {
    Movie.find({}, (error, movies) => {
        if (error) {
            req.flash('error', error.message)
        } else {
            res.render('watchlist', { movies })
        }
    })
})

app.use((err, req, res, next) => {
    const { statusCode=500 } = err;
    if (!err.message) err.message = 'Oh no, something went wrong!'
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log('Server has started...')
})