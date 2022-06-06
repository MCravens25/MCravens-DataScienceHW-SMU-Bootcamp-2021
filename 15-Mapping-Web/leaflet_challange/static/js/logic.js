$(document).ready(function() {
    doWork();
});

function doWork() {
    var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

    requestD3(url);
}

function requestD3(url) {

    // Perform a GET request to the query URL.
    d3.json(url).then(function(data) {
        console.log(data);
        createMap(data);
    });

}

function onEachFeature(feature, layer) {
    // COllect the title and time of the earthquake and apply it as a pop up.
    if (feature.properties) {
        layer.bindPopup(`<h3>${ feature.properties.title }</h3><hr><p>${new Date(feature.properties.time)}</p >`);
    }
}


// 3.
// createMap() takes the earthquake data and incorporates it into the visualization:

function createMap(data) {

    // earthquakes equals all earthquakes
    var earthquakes = data.features  

    // Map Base Layers
    var dark_layer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/dark-v10',
        accessToken: API_KEY
    });

    var light_layer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/light-v10',
        accessToken: API_KEY
    });

    var street_layer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/streets-v11',
        accessToken: API_KEY
    });

    var outdoors_layer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/outdoors-v11',
        accessToken: API_KEY
    });


    // Create an  Markers overlays object.
    var earthquakeLayer = L.geoJSON(earthquakes, {
        onEachFeature: onEachFeature
    });


    // Create an Circle Overlay object.
    var circles = []

    for (let i = 0; i < earthquakes.length; i++) {
        let earthquake = earthquakes[i];
        let circle_color = "green";

        let location = [earthquake.geometry.coordinates[1], earthquake.geometry.coordinates[0]]

        let circle = L.circle(location, {
            color: getColor(earthquake.geometry.coordinates[2]),
            fillColor: getColor(earthquake.geometry.coordinates[2]),
            fillOpacity: 0.8,
            radius: getRadius(earthquake.properties.mag)
        }).bindPopup(`<h3>${ earthquake.properties.title } at depth: ${earthquake.geometry.coordinates[2].toFixed(0)}m</h3><hr><p>${new Date(earthquake.properties.time)}</p >`);
        circles.push(circle);
    }

    var circleLayer = L.layerGroup(circles);

    // Create a baseMaps object.
    var baseMaps = {
        "Dark": dark_layer,
        "Light": light_layer,
        "Street": street_layer,
        "Outdoors": outdoors_layer
    };


    // Overlays that can be toggled on or off
    var overlayMaps = {
        Markers: earthquakeLayer,
        Circles: circleLayer,
        // Plates: plateLayer
    };

    // Create a new map.
    // Edit the code to add the earthquake data to the layers.
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [dark_layer, circleLayer]
    });

    // Create a layer control that contains our baseMaps.
    // Be sure to add an overlay Layer that contains the earthquake GeoJSON.
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);

    // add legend
    // https://gis.stackexchange.com/questions/133630/adding-leaflet-legend
    var legend = L.control({
        position: "bottomright"
    });

    legend.onAdd = function() {
        var div = L.DomUtil.create('div', 'info legend');
        var labels = ["<10", "10-30", "30-70", "70+"];
        var colors = ["green", "yellow", "orange", "red"];

        for (let i = 0; i < labels.length; i++) {
            let label = labels[i];
            let color = colors[i];

            let html = `<i style='background:${color}'></i>${label}<br>`;
            div.innerHTML += html;
        }
        return div;
    }

    legend.addTo(myMap);

}


function getRadius(mag) {
return mag * 10000
}

function getColor(depth) {
let color = 'red';

if (depth >= 70) {  
    color = "red";
} else if (depth >= 30) {
    color = "orange";
} else if (depth >= 10) {
    color = "yellow";
} else {
    color = 'green';
}

return (color);
}
