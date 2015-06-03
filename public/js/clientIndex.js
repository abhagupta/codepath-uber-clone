let $ = require('jquery')
let io = require('socket.io-client')
let socket = io('http://localhost:8000')

socket.on('connect', () => {
    console.log('Rider connected')
})

socket.on('accept', function(driverInfo) {
    document.getElementById("status").innerText = 'accepted'
    document.getElementById("reachedDestination").style.display="block"
});



