function initMap() {
    try {
        if (!map) {
            map = L.map('map').setView([lat, lon], 12);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            addGeocoder();
            displaySearchRadius();
        }
    } catch (err) {
        console.error(err);
    }
}

function addGeocoder() {
    L.Control.geocoder({
        defaultMarkGeocode: false
    }).on('markgeocode', function (e) {
        const center = e.geocode.center;
        map.setView(center, 12);

        lat = center.lat;
        lon = center.lng;

        refreshSearchRadius();
        fetchRoads().then(
            () => {
                refreshRoads();
            }
        );
    }).addTo(map);
}

function displaySearchRadius() {
    // Display search radius area
    searchRadiusCircle = L.circle([lat, lon], {
        radius: radius,
        color: 'red',
        fillColor: '#d6e1ff',
        fillOpacity: 0.1
    }).addTo(map);
}

function refreshSearchRadius() {
    // Update circle position & size
    searchRadiusCircle.setLatLng([lat, lon]);
    searchRadiusCircle.setRadius(radius);
}

function refreshRoads() {

    const joinedRoads = joinConnectedWays(allRoads);
    const ratedRoads = getRatedRoads(joinedRoads, radiiWeights);

    const maxRating = ratedRoads.reduce((max, item) => Math.max(max, item.roadRating), 0);
    const minRating = ratedRoads.reduce((min, item) => Math.min(min, item.roadRating), maxRating);
    console.log(maxRating, minRating);

    // Remove previous polylines
    drawnRoads.forEach(polyline => {
        map.removeLayer(polyline);
    });
    drawnRoads = [];

    // Draw new roads
    ratedRoads
        .filter(item => item.roadRating >= twistinessFilter)
        .forEach((item) => {
            const latlngs = item.road.geometry.map(p => [p.lat, p.lon]);

            const polyline = L.polyline(latlngs, {
                color: getRoadColor(item.roadRating),
                weight: 4,
                opacity: 0.8
            }).addTo(map).bindPopup(`
            <strong>Road ${item.road.tags.name || 'unnamed'}</strong><br>
            Score: ${item.roadRating.toFixed(3)}<br>
            Length: ${(item.totalLength / 1000).toFixed(2)} km<br>
            <a href="https://www.openstreetmap.org/way/${item.road.id}" target="_blank">View on OSM</a>
        `);

            drawnRoads.push(polyline); // Keep track of this polyline
        });
}

function joinConnectedWays(roads) {
    const grouped = {};

    // Group roads by name (or "__unnamed__" for roads without names)
    roads.forEach(road => {
        const name = road.tags.name || "__unnamed__";
        if (!grouped[name]) grouped[name] = [];
        grouped[name].push(road);
    });

    const joinedRoads = [];

    Object.values(grouped).forEach(group => {
        const processed = new Set();

        // Try to join all ways in the group
        group.forEach((road) => {
            if (processed.has(road.id)) return;

            let combinedGeom = [...road.geometry];
            processed.add(road.id);

            let added;
            do {
                added = false;

                for (let j = 0; j < group.length; j++) {
                    const nextRoad = group[j];
                    if (processed.has(nextRoad.id)) continue;

                    const nextGeom = [...nextRoad.geometry];

                    // Check if connected at ends
                    if (pointsEqual(combinedGeom[combinedGeom.length - 1], nextGeom[0])) {
                        combinedGeom = combinedGeom.concat(nextGeom.slice(1));
                        processed.add(nextRoad.id);
                        added = true;
                        break;
                    } else if (pointsEqual(combinedGeom[combinedGeom.length - 1], nextGeom[nextGeom.length - 1])) {
                        combinedGeom = combinedGeom.concat(nextGeom.reverse().slice(1));
                        processed.add(nextRoad.id);
                        added = true;
                        break;
                    } else if (pointsEqual(combinedGeom[0], nextGeom[nextGeom.length - 1])) {
                        combinedGeom = nextGeom.slice(0, -1).concat(combinedGeom);
                        processed.add(nextRoad.id);
                        added = true;
                        break;
                    } else if (pointsEqual(combinedGeom[0], nextGeom[0])) {
                        combinedGeom = nextGeom.reverse().slice(0, -1).concat(combinedGeom);
                        processed.add(nextRoad.id);
                        added = true;
                        break;
                    }
                }
            } while (added);

            joinedRoads.push({
                id: road.id,          // Keep first road ID
                tags: road.tags,      // Keep tags from the first road
                geometry: combinedGeom
            });
        });
    });

    return joinedRoads;
}

function pointsEqual(p1, p2) {
    return p1.lat === p2.lat && p1.lon === p2.lon;
}

function getRoadColor(roadRating) {
    for (let i = 0; i < colorBands.length; i++) {
        const [twistiness, color] = colorBands[i];
        if (roadRating >= twistiness) return color;
    }
}

async function fetchRoads() {
    // Show loader
    document.getElementById("loader").style.display = "flex";

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

    // Remove previous polylines
    drawnRoads.forEach(polyline => {
        map.removeLayer(polyline);
    });
    drawnRoads = [];

    const response = await fetch(overpassUrl, {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: "data=" + encodeURIComponent(query)
    });

    // Hide loader
    document.getElementById("loader").style.display = "none";

    if (!response.ok) throw new Error("Overpass request failed");

    const data = await response.json();

    allRoads = [];
    allRoads = data.elements;
}
