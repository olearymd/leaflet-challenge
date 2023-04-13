
// Create a map object.
var myMap = L.map("map", {
    center: [15.5994, -28.6731], // Center on the Atlantic
    //center: [ 37.09, -95.71 ], // Center on the US
    zoom: 3,
});

// Create the base layers.
var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Create legend layer.
var legend = L.control({position:"topright"});

legend.onAdd = function(map) {
    var div = L.DomUtil.create("div", "legend");
    div.innerHTML += "<h4>Earthquake Depth  </h4>";
    div.innerHTML += '<i style="background: #70284a"></i><span>100+</span><br>';
    div.innerHTML += '<i style="background: #9c3f5d"></i><span>75 - 100</span><br>';
    div.innerHTML += '<i style="background: #c8586c"></i><span>50 - 75</span><br>';
    div.innerHTML += '<i style="background: #dc7176"></i><span>0-50</span><br>';
    return div;
};

legend.addTo(myMap);

// Store our API endpoint as queryUrl.
//var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2021-01-01&endtime=2021-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";
//var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson ";
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson";


// Function to calculate the radius of our circles, factoring in the logarithmic nature of earthquake magnitudes
// and the area in a circle
function getRadius(magnitude, minimumRadius) {
    // Define a base area
    const baseArea = 30000; 

    // Calculate the scaling factor using the earthquake's magnitude.  Also, some of the inputs may be negative, 
    // so get the absolute value.  
    const scalingFactor = Math.abs(Math.pow(10, magnitude));

    // Calculate the circle area by multiplying the scaling factor with the base area
    const circleArea = baseArea * scalingFactor;

    // Calculate the circle radius using the circle area (A = πr² => r = √(A/π))
    const circleRadius = Math.sqrt(circleArea / Math.PI);

    // Some of the earthquakes look too small on the map, so return minimum radius if too small
    //return circleRadius;
    return circleRadius < minimumRadius ? minimumRadius : circleRadius;
}

// Function to calculate the color of our circles, based on the depth, with deeper depth having darker circles
function getColor(depth) {
    let myDepth = feature.geometry.coordinates[2];
    console.log("myDepth =", myDepth);
    let color = "black"
    if (myDepth >= 100)  {
        //color = "darkpurple"; 
        color = "#70284a"; 
    } else if (myDepth >= 75) {
        //color = "darkblue"; 
        color = "#9c3f5d"; 
    } else if (myDepth >= 50) {
        //color = "gray"; 
        color = "#c8586c"; 
    } else {
        //color = "cadetblue"; 
        color = "#dc7176"; 
    }
    
    return color
};

// Function to add earthquake features to the map
function addFeatures(features) {
    for (feature of features) {

        console.log("feature =", feature);
        
        const circleColor = getColor(feature.geometry.coordinates[2]);
        console.log("circleColor =", circleColor);

        const circleRadius = getRadius(feature.properties.mag, 5000);
        console.log("circleRadius =", circleRadius);

        L.circle([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
            fillOpacity: 0.75,
            color: circleColor,
            fillColor: circleColor,
            radius: (circleRadius),
        } ).addTo(myMap).bindPopup(
            `<h3>${feature.properties.place}</h3><hr>
            <p>Magnitude: ${feature.properties.mag}
            <br>Depth: ${(feature.geometry.coordinates[2])}
            <br>Coordinates: ${[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]}
            <br>Date: ${new Date(feature.properties.time)}</br></p>`
        ).addTo(myMap);
    };
};

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
        addFeatures(data.features);
});
