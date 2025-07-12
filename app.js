let radius = 10000;
let highways = [];
let lat = 45.815;
let lon = 15.981;

let map;
let searchRadiusCircle;

let allRoads = [];
let drawnRoads = [];
let twistinessFilter = 0;
let radiiWeights = [];
let colorBands = [];

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
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: "data=" + encodeURIComponent(query)
    });

    if (!response.ok) throw new Error("Overpass request failed");

    const data = await response.json();
    allRoads = [];
    allRoads = data.elements;
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