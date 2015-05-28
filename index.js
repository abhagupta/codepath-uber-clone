let express = require('express')
let morgan = require('morgan')
let cookieParser = require('cookie-parser')
let bodyParser = require('body-parser')
let session = require('express-session')
let MongoStore = require('connect-mongo')(session)
let mongoose = require('mongoose')
let flash = require('connect-flash')
let path = require('path')

let app = new express(),
    port = process.env.PORT || 8000

// set up our express middleware
app.use(morgan('dev')) // log every request to the console
app.use(cookieParser('ilovethenodejs')) // read cookies (needed for auth)
app.use(bodyParser.json()) // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }))

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs') // set up ejs for templating

// required for passport
app.use(session({
  secret: 'ilovethenodejs',
  store: new MongoStore({db: 'places'}),
  resave: true,
  saveUninitialized: true
}))

// Flash messages stored in session
app.use(flash())


app.listen(port, ()=> console.log(`Listening @ http://127.0.0.1:${port}`))

require('./routes')(app)
