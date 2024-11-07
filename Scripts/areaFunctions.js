function crossProduct(a, b, c) {
    // Calculate the cross product AB x BC
    // Positive if ABC makes a left turn, negative for right turn, and zero for linear
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function isIntersecting(p1, p2, q1, q2) {
    // Check if line segment p1p2 intersects with line segment q1q2
    return (crossProduct(p1, q1, q2) * crossProduct(p2, q1, q2) < 0) &&
           (crossProduct(q1, p1, p2) * crossProduct(q2, p1, p2) < 0);
}

function lineIntersection(p1, p2, q1, q2) {
    // Calculate intersection point of lines p1p2 and q1q2
    let det = (p1.x - p2.x) * (q1.y - q2.y) - (p1.y - p2.y) * (q1.x - q2.x);
    let x = ((p1.x*p2.y - p1.y*p2.x) * (q1.x - q2.x) - (p1.x - p2.x) * (q1.x*q2.y - q1.y*q2.x)) / det;
    let y = ((p1.x*p2.y - p1.y*p2.x) * (q1.y - q2.y) - (p1.y - p2.y) * (q1.x*q2.y - q1.y*q2.x)) / det;
    return {x, y};
}

function findAndSplitPolygon(points, line) {
    let intersections = [];
    let above = [];
    let below = [];

    for (let i = 0; i < points.length; i++) {
        let j = (i + 1) % points.length;
        let p1 = points[i], p2 = points[j];
        if (isIntersecting(p1, p2, line[0], line[1])) {
            let intersect = lineIntersection(p1, p2, line[0], line[1]);
            intersections.push(intersect);
            above.push(intersect);
            below.push(intersect);
        }   
        // Arbitrary condition to decide if a point is 'above' or 'below' the line
        let position = crossProduct(line[0], line[1], p1);
        if (position > 0) {
            above.push(p1);
        } else if (position < 0) {
            below.push(p1);
        }
    }


    // Assuming the line intersects the polygon in exactly two places
    // This simplifies the logic and is not generally valid for all polygons or lines
    if (intersections.length === 2) {
        // Split the polygon into two parts: above and below the line
        // This approach assumes a simple polygon and may not work for complex shapes
        return [above, below, intersections];
    }

    return [[], []]; // In case of no intersections or an invalid input
}

function polygonArea(polygon) {
    let area = 0;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        area += (polygon[j].x + polygon[i].x) * (polygon[j].y - polygon[i].y);
    }
    return Math.abs(area / 2);
}

function splitPolygonArea(points, line) {
    let intersections;
    let splitPolygons = findAndSplitPolygon(points, line);
    if(splitPolygons.length == 3) {
        intersections = splitPolygons[2];
        splitPolygons.splice(2, 1);
        let obj = {
            x: (intersections[0].x + intersections[1].x) / 2,
            y: (intersections[0].y + intersections[1].y) / 2
        };
        intersections = obj;
    }
    for(let i = 0; i < splitPolygons.length; i++) {
        splitPolygons[i] = sortPointsClockwise(splitPolygons[i]);
    }
    let areas = splitPolygons.map(polygon => polygonArea(polygon));

    // Assume the first polygon is above the line by design of findAndSplitPolygon
    return [...areas, intersections];
}

function calculateRadius(n, s) {
    if(n < 3) {
        console.error("The number of sides should be at least 3 for a polygon.");
        return undefined;
    }
    
    const pi = Math.PI;
    const diameter = s / Math.sin(pi / n);
    return diameter / 2;
}

function sortPointsClockwise(points) {
    // Calculate the centroid of the points
    const centroid = points.reduce((acc, point) => {
        acc.x += point.x / points.length;
        acc.y += point.y / points.length;
        return acc;
    }, {x: 0, y: 0});

    // Calculate angle of each point relative to the centroid and sort
    points.sort((a, b) => {
        const angleA = Math.atan2(a.y - centroid.y, a.x - centroid.x);
        const angleB = Math.atan2(b.y - centroid.y, b.x - centroid.x);
        return angleA - angleB;
    });

    return points;
}
