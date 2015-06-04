let $ = require('jquery')
let io = require('socket.io-client')

let socket = io('http://localhost:8000')

var icon = {
        
        path: "M -53.582954,-415.35856 C -67.309015,-415.84417 -79.137232,-411.40275 -86.431515,-395.45159 L -112.76807,-329.50717 C -131.95714,-324.21675 -140.31066,-310.27864 -140.75323,-298.84302 L -140.75323,-212.49705 L -115.44706,-212.49705 L -115.44706,-183.44029 C -116.67339,-155.74786 -71.290042,-154.67757 -70.275134,-183.7288 L -69.739335,-212.24976 L 94.421043,-212.24976 L 94.956841,-183.7288 C 95.971739,-154.67759 141.39631,-155.74786 140.16998,-183.44029 L 140.16998,-212.49705 L 165.43493,-212.49705 L 165.43493,-298.84302 C 164.99236,-310.27864 156.63886,-324.21677 137.44977,-329.50717 L 111.11322,-395.45159 C 103.81894,-411.40272 91.990714,-415.84414 78.264661,-415.35856 L -53.582954,-415.35856 z M -50.57424,-392.48409 C -49.426163,-392.49037 -48.215854,-392.45144 -46.988512,-392.40166 L 72.082372,-392.03072 C 82.980293,-392.28497 87.602258,-392.03039 92.236634,-381.7269 L 111.19565,-330.61998 L -86.30787,-330.86727 L -67.554927,-380.61409 C -64.630656,-390.57231 -58.610776,-392.44013 -50.57424,-392.48409 z M -92.036791,-305.02531 C -80.233147,-305.02529 -70.646071,-295.47944 -70.646071,-283.6758 C -70.646071,-271.87217 -80.233147,-262.28508 -92.036791,-262.28508 C -103.84043,-262.28508 -113.42751,-271.87216 -113.42751,-283.6758 C -113.42751,-295.47946 -103.84043,-305.02531 -92.036791,-305.02531 z M 117.91374,-305.02531 C 129.71738,-305.02533 139.26324,-295.47944 139.26324,-283.6758 C 139.26324,-271.87216 129.71738,-262.28508 117.91374,-262.28508 C 106.1101,-262.28507 96.523021,-271.87216 96.523021,-283.6758 C 96.523021,-295.47944 106.1101,-305.02531 117.91374,-305.02531 z M 103.2216,-333.14394 L 103.2216,-333.14394 z M 103.2216,-333.14394 C 103.11577,-333.93673 102.96963,-334.55679 102.80176,-335.21316 C 101.69663,-339.53416 100.2179,-342.16153 97.043938,-345.3793 C 93.958208,-348.50762 90.488134,-350.42644 86.42796,-351.28706 C 82.4419,-352.13197 45.472822,-352.13422 41.474993,-351.28706 C 33.885682,-349.67886 27.380491,-343.34759 25.371094,-335.633 C 25.286417,-335.3079 25.200722,-334.40363 25.131185,-333.2339 L 103.2216,-333.14394 z M 64.176391,-389.01277 C 58.091423,-389.00227 52.013792,-385.83757 48.882186,-379.47638 C 47.628229,-376.92924 47.532697,-376.52293 47.532697,-372.24912 C 47.532697,-368.02543 47.619523,-367.53023 48.822209,-364.99187 C 50.995125,-360.40581 54.081354,-357.67937 59.048334,-355.90531 C 60.598733,-355.35157 62.040853,-355.17797 64.86613,-355.27555 C 68.233081,-355.39187 68.925861,-355.58211 71.703539,-356.95492 C 75.281118,-358.72306 77.90719,-361.35074 79.680517,-364.96188 C 80.736152,-367.11156 80.820083,-367.68829 80.820085,-372.0392 C 80.820081,-376.56329 80.765213,-376.87662 79.470596,-379.50637 C 76.3443,-385.85678 70.261355,-389.02327 64.176391,-389.01277 z",
        fillColor: '#000000',
        fillOpacity: .6,
        anchor: new google.maps.Point(12,-290),
        strokeWeight: 0,
        scale: .1,
    };

socket.on('connect', () => {
    console.log('Driver connected')
})


socket.on('reserve driver', function(data) {
    let myCabId = document.getElementById("cabId").innerText
    if (myCabId.trim() == data.cabId.trim()) {
        //message is for me, hence find the rider that has sent the request
        $.get('/riderFor/' + myCabId, function(data, status) {
            document.getElementById("alert").style.display = "block"
            document.getElementById("decision").style.display = "block"
            notify(data.rider)
        })


    }
});


$('#decision').on('click', function(event) {
    let driver = document.getElementById("cabId").innerText
    
    socket.emit('accept', {
        driver: driver
    });
     document.getElementById("alert").style.display = "none"
    document.getElementById("decision").style.display = "none"

})

var notify = function(driver) {
    //console.log("message.riderName :" + message.riderName)
    var $message = $('<p style="display:none;">' + "Request receievd for " + driver.riderName + '</p>');


    $('#alert').append($message);
    $message.slideDown(300, function() {
        // window.setTimeout(function() {
        //   $message.slideUp(300, function() {
        //     $message.remove();
        //   });
        // }, 2000);
    });

    console.log(driver)

    //plotMarker(driver.ridersLatitude, driver.ridersLongitude, false);
    plotRoute(driver.latitude, driver.longitude, driver.ridersLatitude, driver.ridersLongitude);
   
};

var map;
var bounds = new google.maps.LatLngBounds();

function loadDriverMap() {
    var mapOptions = {
        zoom: 8
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);

    var driverString = document.getElementById('driverInfo').value
    var driverJSON = $.parseJSON(driverString)
    console.log(driverJSON)


    //console.log('Lat :' + document.getElementById('driverInfo').val())

    plotMarker(driverJSON.latitude, driverJSON.longitude, true);
    //plotRoute(-33.89192157947345,151.13604068756104, -33.69727974097957,150.29047966003418);
	


}


function plotMarker(lat, long, isDriver) {
    var myLatlng = new google.maps.LatLng(lat, long);

	var markerData = {
        position: myLatlng,
        map: map,
        title: 'You'
        
    };

    if(isDriver){
    	markerData.icon =icon;
    }

    var marker = new google.maps.Marker(markerData);
    bounds.extend(marker.position);

    map.fitBounds(bounds);
}

function plotRoute(sourceLat, sourceLong, destLat, destLong){
	var rendererOptions = { map: map };
	var directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);

	// var point1 = new google.maps.LatLng(-33.8975098545041,151.09962701797485);
	// var point2 = new google.maps.LatLng(-33.8584421519279,151.0693073272705);
	// var point3 = new google.maps.LatLng(-33.87312358690301,151.99952697753906);
	// var point4 = new google.maps.LatLng(-33.84525521656404,151.0421848297119);

	// var wps = [{ location: point1 }, { location: point2 }, {location: point4}];

	var org = new google.maps.LatLng (sourceLat, sourceLong);
	
	var dest = new google.maps.LatLng ( destLat, destLong);

	var request = {
			origin: org,
			destination: dest,
			
			travelMode: google.maps.DirectionsTravelMode.DRIVING
			};

	var directionsService = new google.maps.DirectionsService();
	directionsService.route(request, function(response, status) {
				if (status == google.maps.DirectionsStatus.OK) {
					directionsDisplay.setDirections(response);
				}
				else
					alert ('failed to get directions');
			});
}

google.maps.event.addDomListener(window, 'load', loadDriverMap);


