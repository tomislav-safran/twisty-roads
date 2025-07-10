let radius = 10000;
let highways = [];
let lat = 45.815;
let lon = 15.981;

let map; // Global map reference
let searchRadiusCircle;

let allRoads = [];
let drawnRoads = [];
let twistinessFilter = 0;
let radiiWeights = [];

async function fetchRoads() {
    const overpassUrl = "https://overpass-api.de/api/interpreter";

    const highwayString = highways.join("|");

    const query = `
      [out:json][timeout:25];
      (
        way["highway"~"^(${highwayString})$"]
          (around:${radius},${lat},${lon});
      );
      out geom tags;
    `;

    const response = await fetch(overpassUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "data=" + encodeURIComponent(query)
    });

    if (!response.ok) throw new Error("Overpass request failed");

    const data = await response.json();
    allRoads = [];
    allRoads = data.elements;
}

function refreshRoads() {
    const ratedRoads = getRatedRoads(allRoads, radiiWeights);

    // Remove previous polylines
    drawnRoads.forEach(polyline => {
        map.removeLayer(polyline);
    });
    drawnRoads = []; // Clear the array

    // Draw new roads
    ratedRoads
        .filter(item => item.roadRating >= twistinessFilter)
        .forEach((item, idx) => {
        const latlngs = item.road.geometry.map(p => [p.lat, p.lon]);

        const polyline = L.polyline(latlngs, {
            color: 'blue',
            weight: 4,
            opacity: 0.7
        }).addTo(map).bindPopup(`
            <strong>Road #${idx + 1}</strong><br>
            Score: ${item.roadRating.toFixed(3)}<br>
            Length: ${(item.road.totalLength / 1000).toFixed(2)} km<br>
            <a href="https://www.openstreetmap.org/way/${item.road.id}" target="_blank">View on OSM</a>
        `);

        drawnRoads.push(polyline); // Keep track of this polyline
    });
}

function refreshCircle() {
    // Update circle position & size
    searchRadiusCircle.setLatLng([lat, lon]);
    searchRadiusCircle.setRadius(radius);
}

function initMap() {
    try {
        if (!map) {
            map = L.map('map').setView([lat, lon], 12);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            // Add geocoder control
            L.Control.geocoder({
                defaultMarkGeocode: false
            }).on('markgeocode', function (e) {
                const center = e.geocode.center;
                map.setView(center, 12);

                lat = center.lat;
                lon = center.lng;

                refreshCircle();
                fetchRoads().then(
                    () => {
                        refreshRoads();
                    }
                );
            }).addTo(map);

            // Display search radius area
            searchRadiusCircle = L.circle([lat, lon], {
                radius: radius,
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.1
            }).addTo(map);

        }
    } catch (err) {
        console.error(err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initSettings();
    initInteractions();
    initMap();
    fetchRoads().then(
        () => {
            refreshRoads();
        }
    );
});