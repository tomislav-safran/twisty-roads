# Twisty Roads

https://tomislav-safran.github.io/twisty-roads/

A simple POC app that uses OpenStreetMap data to find twisty roads, and displays them on an interactive map with Leaflet.

Road twistiness is calculated by analyzing the radius of each road segment. Each segment is assigned a weight based on how sharp it is, 
and the final road rating is the sum of all segment lengths multiplied by their respective weights.

## Tech
- Overpass API (OpenStreetMap data)
- Leaflet.js for maps
- Vanilla JS, HTML, and CSS

## Notes
- not very mobile friendly
