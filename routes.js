module.exports = (app) => {
	app.get('/', (req, res) => res.render('index.ejs'))

	app.post('/' , (req, res) => {
		let address = req.body.address
		console.log("address: " + address);
		//to do add the logic to find the nearest cabs 

		res.redirect('/nearestCabs/'+address)

	})

	app.get('/nearestCabs/:address' , (req, res) => {
		
		// code to fetch from google maps 
		// parse the response
		// do the calculation
		// create the objects of cabs
		// render them on the google maps
		console.log("Paramter address :" + req.params.address);

		res.render('nearestCabs.ejs', {
			address: address
		})
	})


}