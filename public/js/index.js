let $ = require('jquery')
let io = require('socket.io-client')

let socket = io('http://localhost:8000')

socket.on('connect', () => {
    console.log('Driver connected')
})

socket.on('event', function(data) {
    let myCabId = document.getElementById("cabId").innerText
    if (myCabId.trim() == data.cabId.trim()) {
        //message is for me, hence find the rider that has sent the request
        $.get('/riderFor/' + myCabId, function(data, status) {
            document.getElementById("riderInfomation").innerText = data.rider
            $('#riderInfomation').notify("hello")

        })


    }
});