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
let Driver = require('./model/driver')
let Rider = require('./model/rider')
let haversine = require('haversine')
let request = require('request')

let googleKey = 'AIzaSyBoQL7KUGLHgnh_Ws9ye-HrfoZYPUuJpFM'

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
app.use('/js/clientIndex.js', browserify('./public/js/clientIndex.js'))

//*****  //

// *********** io socket ***********

let server = Server(app)
io = io(server)

server.listen(port, () => console.log(`Http server listening at :${port}`))
io.on('connection', function(socket) {
    //let username = socket.request.session.username
    socket.on('disconnect', function() {
        console.log('user disconnected');
    });

    // receive message when rider sends a message to reserve a driver
    socket.on('reserve driver', function(driver) {
        io.emit('reserve driver', driver)
    })

    // message when driver accepts a rider's request
    socket.on('accept', function(driverInfo) {
        Driver.findOne({
            cabid: driverInfo.driver.trim()
        }, function(err, driver) {
            Rider.findOne({
                riderName: driver.riderName
            }, function(err, rider) {
                let startPos = driver.latitude + ',' + driver.longitude
                let endPos = rider.latitude + ',' + rider.longitude
                request('https://maps.googleapis.com/maps/api/distancematrix/json?origins=' + startPos + '&destinations=' + endPos + '&key=' + googleKey, function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        let parsed = JSON.parse(body)
                        // meters to miles
                        let distance = (parsed.rows[0].elements[0].distance.value * 0.00062137).toFixed(2)
                        let duration = parsed.rows[0].elements[0].duration.text
                        io.emit('accept', {
                            driver, distance, duration
                        })
                    }
                })
            })
        })
    })
})
/******************/

passportMiddleware(app)
require('./routes')(app, io)