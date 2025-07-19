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