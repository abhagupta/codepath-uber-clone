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
                console.log('lat = ', results.results[0].geometry.location.lat)
                console.log('lng = ', results.results[0].geometry.location.lng)
                let userLat = results.results[0].geometry.location.lat
                let userLng = results.results[0].geometry.location.lng

                //save the userLat and userLang in rider collection - to notify driver about rider's location

                let rider = await Rider.promise.findById(req.user._id)
                if(rider){
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

                    console.log('Driver :: ', record.cabid + ', Distance :: ' + distance)
                    availDrivers.push([distance.toFixed(2), record.cabid, record.latitude, record.longitude])
                });
                availDrivers = availDrivers.sort(_2dArraySort)
                    // console.log(availDrivers)
                let sortedDrivers = []
                for (let i = 0; i < availDrivers.length; i++) {
                    sortedDrivers.push({
                        "cabid": availDrivers[i][1],
                        "distance": availDrivers[i][0],
                        "lat": availDrivers[i][2],
                        "lng": availDrivers[i][3]
                    })
                }


                // var sortedDriversJson = multiDimensionArray2JSON(availDrivers)
                console.log(sortedDrivers)
                res.render('nearestCabs.ejs', {
                    drivers: sortedDrivers,
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




    app.get('/driver/:cabid?', (req, res) => {
        res.render("driver.ejs", {
            cabId: req.params.cabid
        })
    })

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

    app.get('/riderDashboard', (req, res) => {
        res.render("riderDashboard.ejs")
    })


    app.post('/rider', passport.authenticate('local-signup', {
        successRedirect: '/riderDashboard',
        failureRedirect: 'http://google.com',
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

        driver.status = 'busy'
        driver.riderid = req.user._id

        await driver.save()

        res.render('riderDashboard.ejs', {
            selectedDriver: driver

        })

    }))
    
    app.get('/reachedDestination/:cabId', then(async(req, res) => {
        let driver = await Driver.promise.findOne({
            cabid: req.params.cabId
        })
        driver.status = 'available'
        driver.riderid = req.user._id

        await driver.save()

        res.render('riderDashboard.ejs')

    }))

}


function parseAddressForGoogle(address) {
    return address.replace(/[\n\s]/g, "+");

}
