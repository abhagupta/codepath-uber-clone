let mongoose = require('mongoose')
let bcrypt = require('bcrypt')
let nodeify = require('bluebird-nodeify')

require('songbird')

let riderSchema = mongoose.Schema({
  riderName: {type: String, required: true},
  password: {type: String, required: true},
  latitude: {type: Number, required: false},
  longitude: {type: Number, required: false},
})

// driverSchema.methods.generateHash = async function(password) {
//   return await bcrypt.promise.hash(password, 8)
// }

// driverSchema.methods.validatePassword = async function(password) {
//   return await bcrypt.promise.compare(password, this.password)
// }

// driverSchema.pre('save', function(callback) {
//   nodeify(async() => {
//     if (!this.isModified('password')) return callback()
//     this.password = await this.generateHash(this.password)
//   }(), callback)
// })

// driverSchema.path('password').validate((pw) => {
//   return pw.length >= 4 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) &&
//     /[0-9]/.test(pw)
// })

module.exports = mongoose.model('Rider', riderSchema)
  