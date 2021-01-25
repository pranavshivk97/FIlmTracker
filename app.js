const express = require('express');
const path = require('path')
const mongoose = require('mongoose')
const request = require('request')
const ejsMate = require('ejs-mate')

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

app.engine('ejs', ejsMate)

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/search', (req, res) => {
    title = req.query.searchName
    requestUrl = `http://www.omdbapi.com/?t=${title}&apikey=1303fcca&plot=full`
    request(requestUrl, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            // res.send(body)
            const result = JSON.parse(body)
            res.render('display', { result })
        }
    })
})

app.get('/movies', (req, res) => {
    
})

app.listen(3000, () => {
    console.log('Server has started...')
})