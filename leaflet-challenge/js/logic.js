// Initialize the map
var map = L.map('map').setView([0, 0], 2);

// Create a basemap layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Fetch earthquake data from USGS
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson')
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        // Process earthquake data and create markers here

        // Define a function to set marker size based on magnitude
        function getSize(magnitude) {
            return magnitude * 5; // Adjust the multiplier for marker size
        }

        // Define a function to set marker color based on depth
        function getColor(depth) {
            // Define color range based on depth values
            var colors = ['#fef0d9', '#fdcc8a', '#fc8d59', '#e34a33', '#b30000', '#7f0000'];
            var depthValues = [0, 50, 100, 200, 300, 500];

            for (var i = 0; i < depthValues.length; i++) {
                if (depth <= depthValues[i]) {
                    return colors[i];
                }
            }

            return colors[colors.length - 1];
        }

        // Loop through the earthquake data and create markers
        data.features.forEach(function (quake) {
            var magnitude = quake.properties.mag;
            var depth = quake.geometry.coordinates[2];
            var color = getColor(depth);

            // Create a marker
            var marker = L.circleMarker([quake.geometry.coordinates[1], quake.geometry.coordinates[0]], {
                radius: getSize(magnitude),
                fillColor: color,
                color: '#000',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(map);

            // Add a popup with earthquake information
            marker.bindPopup(`
                Magnitude: ${magnitude}<br>
                Depth: ${depth} km
            `);
        });

        // Create a legend
        var legend = L.control({ position: 'bottomright' });

        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            var depthValues = [0, 50, 100, 200, 300, 500]; // Adjust depth intervals as needed

            div.innerHTML += '<strong>Depth (km)</strong><br>';

            for (var i = 0; i < depthValues.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + getColor(depthValues[i] + 1) + '"></i> ' +
                    depthValues[i] + (depthValues[i + 1] ? '&ndash;' + depthValues[i + 1] + '<br>' : '+');
            }

            return div;
        };

        legend.addTo(map);
    })
    .catch(function (error) {
        console.error('Error fetching earthquake data:', error);
    });
