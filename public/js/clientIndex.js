let $ = require('jquery')
let io = require('socket.io-client')
let socket = io('http://localhost:8000')

socket.on('connect', () => {
    console.log('Rider connected')
})

socket.on('accept', function(info) {
    let driver = info.driver
    let rider = info.rider
    document.getElementById("status").innerText = 'accepted'
    document.getElementById("reachedDestination").style.display="block"
    document.getElementById("driverstatus").innerText = driver.cabid + " is " + info.distance + " miles away, and will arrive in approximately " + info.duration
});



