let then = require('express-then')
let rp = require('request-promise')
let haversine = require('haversine')
let _ = require('lodash')
require('songbird')

// database models
let Driver = require('./model/driver')
let Rider = require('./model/rider')

let googleKey = 'AIzaSyBoQL7KUGLHgnh_Ws9ye-HrfoZYPUuJpFM'

function _2dArraySort(a, b) {
    if (a[0] === b[0]) {
        return 0;
    } else {
        return (a[0] < b[0]) ? -1 : 1;
    }
}

module.exports = (app) => {
    let passport = app.passport

    app.get('/', (req, res) => res.render('index.ejs'))

    app.get('/findCabs', (req, res) => res.render('findCabs.ejs'))

    app.post('/findCabs', (req, res) => {
        // address should be formatted like:
        // 850+Cherry+Ave.+San+Bruno,+CA+94066
        let address = parseAddressForGoogle(req.body.address)
            //to do add the logic to find the nearest cabs 
        res.redirect('/nearestCabs/' + address)
    })



    // TODO: pin the RIDER on the map as well!!
    // Michael + view (nearestCabs)
    app.get('/nearestCabs/:address', then(async(req, res) => {




            // code to fetch from google maps 
            // parse the response
            // do the calculation
            // create the objects of cabs
            // render them on the google maps
            //console.log("********************** Session User Id  ******************************: " +  req.user._id)
            let userAddress = req.params.address
            console.log("User address :" + userAddress);
            try {
                let resp = await rp({
                    uri: `https://maps.googleapis.com/maps/api/geocode/json?address=${userAddress}&key=${googleKey}`,
                    resolveWithFullResponse: true
                })
                let results = JSON.parse(resp.body)
                let userLat = results.results[0].geometry.location.lat
                let userLng = results.results[0].geometry.location.lng

                //save the userLat and userLang in rider collection - to notify driver about rider's location
                let rider = await Rider.promise.findById(req.user._id)
                if (rider) {
                    rider.latitude = userLat
                    rider.longitude = userLng
                    await rider.save();
                }

                let drivers = await Driver.promise.find({
                    status: {
                        $ne: 'busy'
                    }
                })

                console.log("Drivers: " + drivers)

                let start = {
                    latitude: userLat,
                    longitude: userLng
                }

                var availDrivers = []

                _.forEach(drivers, function(record, key) {
                    let end = {
                        latitude: record.latitude,
                        longitude: record.longitude
                    }
                    let distance = haversine(start, end)

                    availDrivers.push([distance.toFixed(2), record.cabid, record.latitude, record.longitude])
                });
                availDrivers = availDrivers.sort(_2dArraySort)

                res.render('nearestCabs.ejs', {
                    drivers: availDrivers,
                    rider: {
                        "lat": userLat,
                        "lng": userLng
                    }
                })

            } catch (e) {
                console.log(e)
            }



        }))
        /*
         *  Driver routes
         */

    app.get('/driver/:cabid?', then(async(req, res) => {

        let cabid = req.params.cabid;
        if (cabid) {
            let driver = await Driver.promise.findOne({
                cabid: cabid
            })
			res.render("driver.ejs", {
				cabId : cabid,
                driver:driver,
                message: req.flash('error')
            })
		}else{
			res.render("driver.ejs")
		}
    }))

    app.post('/driver', then(async(req, res) => {
        let cab_id = req.body.cabId
        let lat = req.body.lat
        let long = req.body.long

        if (lat === undefined) {
            //flash error
        }

        if (long === undefined) {
            //flash error
        }

        let driver = await Driver.promise.findOne({
            cabid: req.params.cabId
        })


        if (!driver) {
            let driver = new Driver()
            driver.cabid = cab_id
            driver.latitude = lat
            driver.longitude = long
            await driver.save()
            res.redirect('/driver/' + cab_id)
            return
        } else {
            driver.latitude = lat
            driver.longitude = long
            await driver.save()
            res.redirect('/driver/' + cab_id)
        }
    }))

    /*
     * Rider routes
     */

    app.get('/rider', (req, res) => {
        res.render("rider.ejs")
    })

    app.get('/riderFor/:cabId', then(async(req, res) => {
        let record = await Driver.promise.findOne({
            cabid: req.params.cabId
        })
        
        //console.log("################### Rider recieved : " + rider)

        res.send({
                rider: record // this is driver record, this is all we need because we are saving requested rider's information with driver record
            })
            //res.json(rider);

    }))

    app.get('/riderDashboard', (req, res) => {
        res.render("riderDashboard.ejs", {
            rider: req.user.riderName
        })
    })


    app.post('/rider', passport.authenticate('local-signup', {
        successRedirect: '/riderDashboard',
        failureRedirect: '/riderDashboard',
        failureFlash: true
    }), function(err, req, res, next) {
        console.log("Error: " + err)
        res.redirect('http://google.com')
    })



    /*
     *  Reserve driver api
     */

    app.get('/reserveDriver/:cabId', then(async(req, res) => {
        let driver = await Driver.promise.findOne({
            cabid: req.params.cabId
        })

        if (driver) {
            driver.status = 'busy'
            driver.riderName = req.user.riderName
            driver.ridersLatitude = req.user.latitude
            driver.ridersLongitude = req.user.longitude
            await driver.save()
        } else {
            console.log("Driver not found :" + req.params.cabId)
        }

        //send the emit message to driversver

        let ioClient = require('socket.io-client')

        let socket = ioClient('http://127.0.0.1:8000')

        socket.on('connect', () => {
            console.log('connected')
        })

        socket.emit('reserve driver', req.params.cabId)

        res.render('riderDashboard.ejs', {
            selectedDriver: driver,
            rider: req.user.riderName

        })

    }))

    app.get('/reachedDestination/:cabId', then(async(req, res) => {
        let driver = await Driver.promise.findOne({
            cabid: req.params.cabId
        })
        if (driver) {
            driver.status = 'available'
            driver.riderid = req.user._id
            await driver.save()
        }

        res.render('riderDashboard.ejs', {
            rider: req.user.riderName
        })

    }))

}


function parseAddressForGoogle(address) {
    return address.replace(/[\n\s]/g, "+");

}
