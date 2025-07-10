function getRadiusWeight(radius, radiiWeights = [[30, 2], [60, 1.6], [100, 1.3], [175, 1]]) {
    for (let i = 0; i < radiiWeights.length; i++) {
        const [minRadius, weight] = radiiWeights[i];
        if (radius <= minRadius) return weight;
    }
    return 0;
}

function getRoadGeomRadii(geom) {
    const geomWithRadius = [];

    // The first point is just a part of the triangle, so no radius yet
    geomWithRadius.push({ geom: geom[0], radius: 0 });

    for (let i = 0; i < geom.length - 2; i++) {
        const a = geom[i];
        const b = geom[i + 1];
        const c = geom[i + 2];

        const radius = circumCircleRadius(a, b, c);
        geomWithRadius.push({
            geom: b,
            radius: isFinite(radius) ? radius : 10000
        });
    }

    // The last point is also just a part of the triangle, so use the last available radius
    geomWithRadius.push({ geom: geom[geom.length - 1], radius: geomWithRadius[geomWithRadius.length - 1].radius });
    // set the first point radius to the first available radius
    geomWithRadius[0] = { geom: geom[0], radius: geomWithRadius[1].radius };

    return geomWithRadius;
}

function getRatedRoads(roads, radiiWeights) {
    const ratedRoads = [];

    roads.forEach(road => {
        const geom = road.geometry;
        let twistyLength = 0;
        let totalLength = 0;

        if (geom.length > 3) {
            const geomWithRadius = getRoadGeomRadii(geom);

            // Calculate total twisty length
            for (let i = 0; i < geomWithRadius.length - 1; i++) {
                const segmentLength = haversineDistance(
                    geomWithRadius[i].geom,
                    geomWithRadius[i + 1].geom
                );
                totalLength += segmentLength;

                const avgRadius = (geomWithRadius[i].radius + geomWithRadius[i + 1].radius) / 2;
                twistyLength += segmentLength * getRadiusWeight(avgRadius, radiiWeights);
            }

            const roadRating = twistyLength;

            ratedRoads.push({ road, totalLength, roadRating });
        }
    });

    return ratedRoads;
}