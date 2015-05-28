let then = require('express-then')
let rp = require('request-promise')
let haversine = require('haversine')
let _ = require('lodash')
require('songbird')

// database models
let Driver = require('./model/driver')

let googleKey = 'AIzaSyBoQL7KUGLHgnh_Ws9ye-HrfoZYPUuJpFM'

module.exports = (app) => {
	app.get('/', (req, res) => res.render('index.ejs'))

	app.post('/', (req, res) => {
		// address should be formatted like:
		// 850+Cherry+Ave.+San+Bruno,+CA+94066
		let address = req.body.address
		//to do add the logic to find the nearest cabs 
		console.log("Parsed address :" + parseAddressForGoogle(address))
		res.redirect('/nearestCabs/'+ parseAddressForGoogle(address))


	})

	// Michael + view (nearestCabs)
	app.get('/nearestCabs/:address', then(async(req, res) => {
		// code to fetch from google maps 
		// parse the response
		// do the calculation
		// create the objects of cabs
		// render them on the google maps
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

			let drivers = await Driver.promise.find({})

			let start = {
				latitude: userLat,
				longitude: userLng
			}

			_.forEach(drivers, function(record, key) {
				let end = {
					latitude: record.latitude,
					longitude: record.longitude
				}
				console.log(haversine(start, end))
			});


		} catch (e) {
			console.log(e)
		}
		res.render('nearestCabs.ejs', {})

	}))

	/*
	 *  Driver routes
	 */


	 app.get('/driver', (req, res) => {
	 	res.render("driver.ejs")
	 })

	 app.post('/driver/:driverId', (req, res) => {
	 	let driver_id = req.body.driverId
	 	let cab_id = req.body.cabId
	 	let lat = req.body.lat
	 	let long = req.body.long
	 	let driver 

	 	if(lat === undefined){
	 		//flash error
	 	}

	 	if(long === undefined){
	 		//flash error
	 	}



	 	if(driver_id){
	 		//old driver updating location
	 	}else{
	 		//new driver registering
	 		let driver = new Driver()


	 	}
	 	
	 })

}


function parseAddressForGoogle(address){
	return address.replace(/[\n\s]/g, "+");
	
}

