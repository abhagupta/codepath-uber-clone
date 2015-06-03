let $ = require('jquery')
let io = require('socket.io-client')

let socket = io('http://localhost:8000')

socket.on('connect', () => {
    console.log('Driver connected')
})


socket.on('reserve driver', function(data) {
    let myCabId = document.getElementById("cabId").innerText
    if (myCabId.trim() == data.cabId.trim()) {
        //message is for me, hence find the rider that has sent the request
        $.get('/riderFor/' + myCabId, function(data, status) {
        	document.getElementById("alert").style.display="block"
            document.getElementById("decision").style.display="block"
            notify("Request Recieved for Rider : " + data.rider)
        })


    }
});


$('#decision').on('click', function(event){
	let driver = document.getElementById("cabId").innerText
    socket.emit('accept', {driver: driver});

})

var notify = function(message) {
      var $message = $('<p style="display:none;">' + message + '</p>');


      $('#alert').append($message);
      $message.slideDown(300, function() {
        // window.setTimeout(function() {
        //   $message.slideUp(300, function() {
        //     $message.remove();
        //   });
        // }, 2000);
      });
    };
