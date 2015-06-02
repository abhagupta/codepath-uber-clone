let LocalStrategy = require('passport-local').Strategy
let nodeifyit = require('nodeifyit')
let Rider = require('../model/rider')

module.exports = (app) => {
    let passport = app.passport

    passport.serializeUser(nodeifyit(async(rider) => rider._id))
    passport.deserializeUser(nodeifyit(async(id) => {
        return await Rider.promise.findById(id)
    }))

    passport.use(new LocalStrategy({
        usernameField: 'ridername',
        failureFlash: true

    }, nodeifyit(async(username, password) => {
        return ridername
    }, {
        spread: true
    })))


    passport.use('local-signup', new LocalStrategy({
        usernameField: 'ridername',
        failureFlash: true
    }, nodeifyit(async(username, password) => {

       
        try {
            let rider = new Rider()

            rider.riderName = username
            rider.password = password

            return await rider.save()
        }catch(e)
        {
        	console.log(e)
        }

    }, {
        spread: true
    })))


}
