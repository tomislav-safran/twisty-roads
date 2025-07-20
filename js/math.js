// Distance between two coordinates
function haversineDistance(p1, p2) {
    const earthRadius = 6371000; // meters

    const lat1 = p1.lat * Math.PI / 180;
    const lon1 = p1.lon * Math.PI / 180;
    const lat2 = p2.lat * Math.PI / 180;
    const lon2 = p2.lon * Math.PI / 180;

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c; // distance in meters
}

// Radius of a circle passing through 3 points
function circumCircleRadius(a, b, c) {
    // Calculate side lengths
    const sideA = haversineDistance(b, c); // length opposite to point a
    const sideB = haversineDistance(a, c); // length opposite to point b
    const sideC = haversineDistance(a, b); // length opposite to point c

    if (sideA > 0 && sideB > 0 && sideC > 0) {
        const term = (sideA + sideB + sideC) *
            (sideB + sideC - sideA) *
            (sideC + sideA - sideB) *
            (sideA + sideB - sideC);
        const divider = Math.sqrt(Math.abs(term));

        if (divider !== 0) {
            return (sideA * sideB * sideC) / divider;
        } else {
            return 10000; // Degenerate triangle
        }
    } else {
        return 10000; // Invalid triangle
    }
}