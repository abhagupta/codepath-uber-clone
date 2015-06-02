let express = require('express')
let morgan = require('morgan')
let cookieParser = require('cookie-parser')
let bodyParser = require('body-parser')
let session = require('express-session')
let MongoStore = require('connect-mongo')(session)
let mongoose = require('mongoose')
let flash = require('connect-flash')
let path = require('path')
let passport = require('passport')
let browserify = require('browserify-middleware')
let passportMiddleware = require('./middleware/passport')
let LocalStrategy = require('passport-local').Strategy
let Server = require('http').Server
let io = require('socket.io')


let app = new express(),
    port = process.env.PORT || 8000

app.passport = passport

// set up our express middleware
app.use(morgan('dev')) // log every request to the console
app.use(cookieParser('ilovethenodejs')) // read cookies (needed for auth)
app.use(bodyParser.json()) // get information from html forms
app.use(bodyParser.urlencoded({
    extended: true
}))

// required for passport
app.use(session({
    secret: 'ilovethenodejs',
    store: new MongoStore({
        db: 'uber'
    }),
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())

// Enable passport persistent sessions
app.use(passport.session())

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs') // set up ejs for templating


// Flash messages stored in session
app.use(flash())

mongoose.connect('mongodb://127.0.0.1:27017/uber')

//**** browserify  ******/
browserify.settings({
            transform: ['babelify']
        })
app.use('/js/index.js', browserify('./public/js/index.js'))

//*****  //

// *********** io socket ***********



let server = Server(app)
io= io(server)



server.listen(port, () => console.log(`Http server listening at :${port}`))
io.on('connection', function(socket) {
	//let username = socket.request.session.username
    socket.on('disconnect', function() {
        console.log('user disconnected');
    });

    socket.on('reserve driver', function(cabId) {
        console.log('message: ' + cabId);
        // let driverToBeReserved =  await Driver.promise.findOne({cabid:cabId})
        // console.log("Driver to be reserved :" + driverToBeReserved)
       io.emit('event', {cabId:cabId})
    })

});
/******************/

passportMiddleware(app)
require('./routes')(app, io)
