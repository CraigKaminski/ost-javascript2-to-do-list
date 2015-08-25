// This function is called by todo.js to kickoff the asynchronous
// task of obtaining the users position and displaying it on a map
function getLocation() {
    navigator.geolocation.getCurrentPosition(displayLocation, locationError);
}

// This function is called once a location is obtained. It will cause a map
// to be display and place a marker at the users current position.
function displayLocation(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    var item = todos[todos.length - 1];
    updateLocation(item.id, latitude, longitude);
    if (!map) {
        showMap(latitude, longitude);
    }
    addMarker(latitude, longitude, item.task);
}

// This function adds a map to the page
function showMap(lat, long) {
    // Create a Google LatLng object from users current position
    var googleLatLong = new google.maps.LatLng(lat, long);
    // Create an object literal to define map properties
    var mapOptions = {
        zoom: 12,
        center: googleLatLong,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    // Retrieve map element from DOM
    var mapDiv = document.getElementById("map");
    // Make map div visible
    mapDiv.style.display = "block";
    // Add map to page and center it on current position
    map = new google.maps.Map(mapDiv, mapOptions);
    map.panTo(googleLatLong);
}

// This function adds a marker to the map
function addMarker(lat, long, title) {
    // Create a Google LatLng object from users current position
    var googleLatLong = new google.maps.LatLng(lat, long);
    // Create an object literal to define marker properties
    var markerOptions = {
        position: googleLatLong,
        map: map,
        title: title
    };
    // Add marker to map
    var marker = new google.maps.Marker(markerOptions);
}

// This function handles errors generated while obtaining
// the users current position
function locationError(error) {
  // Create object literal mapping error codes to text
  // explinations
  var errorTypes = {
    0: "Unknown error when acquiring position",
    1: "Permission denied by user when acquiring position",
    2: "Position not available",
    3: "Request timed out when acquiring position"
  };
  // Convert error code to text description
  var errorMessage = errorTypes[error.code];
  // Append additional information to error
  // string if error code is 0 or 2
  if (error.code == 0 || error.code == 2) {
    errorMessage += " " + error.message;
  }
  // alert user of error
  console.log(errorMessage);
  alert(errorMessage);
}