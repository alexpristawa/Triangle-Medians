const root = document.querySelector(':root');
const body = document.querySelector('body');
const startButton = document.querySelector('#startButton');
let points = [];
let canvasOffset;
let canvas = document.querySelector('#canvas');
let canvasDimensions = {};
let midPoints = [];
let ctx = canvas.getContext('2d');
let goAgain = false;
let makeOwnShape = false;

document.addEventListener('keydown', (event) => {
    if(event.key == 'o') {
        makeOwnShape = true;
    }
});

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function adjustCanvasQuality() {
    // Get the device pixel ratio, falling back to 1.
    const dpr = window.devicePixelRatio || 1;
  
    // Get the size of the canvas in CSS pixels.
    const rect = canvas.getBoundingClientRect();
  
    // Give the canvas pixel dimensions of their CSS
    // size * the device pixel ratio.
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    canvasDimensions.width = rect.width;
    canvasDimensions.height = rect.height;
  
    // Scale all drawing operations by the dpr, so everything is drawn at the correct size.
    ctx.scale(dpr, dpr);
  
    // Now, you can continue drawing on the canvas with ctx and it will be high quality.
    // Note: You might need to adjust coordinates/sizes of drawings by dividing them by the dpr.

    canvasOffset = window.innerHeight/10;
}
  
// Call this function to adjust canvas quality.
adjustCanvasQuality();
  
// Optionally, call adjustCanvasQuality on window resize to maintain quality
window.addEventListener('resize', adjustCanvasQuality);  

async function start() {
    if(startButton.innerHTML == "Start") {
        if(goAgain) {
            drawPolygon(points);
            return;
        }
        startButton.innerHTML = "Map Midpoints";
        let startX = undefined;
        let startY = undefined;
        points = [];

        let clickHandler = (event) => {
            if(goAgain) {
                return;
            }
            let x = event.clientX;
            let y = event.clientY - canvasOffset;
            if(startX == undefined) {
                startX = x;
                startY = y;
            }
            
            if(makeOwnShape) {
                points.push({x: x, y: y});
            } else {
                points = createPointsArray(points.length+1);
            }
            if(midPoints.length > 0) {
                points = midPoints;
            }

            points = sortPointsClockwise(points);

            drawPolygon(points);
        }
    
        canvas.addEventListener('click', clickHandler);
    } else {
        goAgain = false;
        let x = window.innerWidth/2;
        let y = window.innerHeight/5*2;
        startButton.innerHTML = "Start";
        midPoints = [];
        let angle = 0;
        let increment = 1/(4*points.length);
        for(;angle < 180; angle += increment) {
            let line = [
                {
                    x: x + canvasDimensions.width/2 * Math.cos(angle/180*Math.PI), 
                    y: y + canvasDimensions.height/2 * Math.sin(angle/180*Math.PI)
                },
                {
                    x: x - canvasDimensions.width/2 * Math.cos(angle/180*Math.PI), 
                    y: y - canvasDimensions.height/2 * Math.sin(angle/180*Math.PI)
                }
            ];
            if(line[0].x > line[1].x) {
                let obj = line[1];
                line[1] = line[0];
                line[0] = obj;
            }
            let areas = splitPolygonArea(points, line);
            let percentError = Math.abs(Math.abs(areas[0]) - Math.abs(areas[1]))/(Math.abs(areas[0]) + Math.abs(areas[1]));
            let step = -10;
            let previousPercentError;
            while(percentError > 0.0001 || areas[0] == 0 || areas[1] == 0) {
                if(previousPercentError == undefined) {
                    previousPercentError = percentError;
                } else {

                    if(percentError > previousPercentError) {
                        step /= -5;
                    }

                    if(Math.abs(Math.sin(angle / 180 * Math.PI)) > 1/2**0.5) {
                        line[0].x -= step;
                        line[1].x -= step;
                    } else {
                        line[0].y += step;
                        line[1].y += step;
                    }

                    areas = splitPolygonArea(points, line);
                    previousPercentError = percentError;
                    percentError = Math.abs(Math.abs(areas[0]) - Math.abs(areas[1]))/(Math.abs(areas[0]) + Math.abs(areas[1]));
                    if(isNaN(percentError)) {
                        percentError = Infinity;
                    }
                }
            }
            drawPolygon(points);
            drawPoints(midPoints);
            ctx.beginPath();
            ctx.moveTo(line[0].x, line[0].y);
            ctx.lineTo(line[1].x, line[1].y);
            ctx.closePath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'red';
            ctx.stroke();

            midPoints.push(areas[2]);
            drawCircle(areas[2].x, areas[2].y, 1);
            if(Math.floor(angle)>angle-increment) {
                await delay(1);
            }
        }
        drawPolygon(points);
        drawPoints(midPoints);
        await delay(500);
        let finalMag = Math.sqrt(2 * points.length);
        for(let i = 0; i < 20; i++) {
            enlargeMidpoints({x: window.innerWidth/2, y: window.innerHeight/5*2}, 1 + Math.abs((1-finalMag)/20));
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawPoints(midPoints);
            await delay(1000/60);
        }
        let factor = Math.floor(midPoints.length / 180);
        points = [];
        for(let i = 0; i < midPoints.length-1; i += factor) {
            points.push(midPoints[i]);
        }
        console.log(points);
    }
}

function enlargeMidpoints(center, mag) {
    console.log(mag);
    for (let i = 0; i < midPoints.length; i++) {
        // Calculate the vector from center to the point and scale it by mag
        const scaledX = center.x + (midPoints[i].x - center.x) * mag;
        const scaledY = center.y + (midPoints[i].y - center.y) * mag;

        // Update the point with the new, scaled position
        midPoints[i].x = scaledX;
        midPoints[i].y = scaledY;
    }
}

let drawPoints = (arr, radius = 1, color = 'rgb(179, 54, 45') => {
    arr.forEach(point => {
        drawCircle(point.x, point.y, radius, color);
    });
}

function drawCircle(x, y, radius = 6, color = 'rgb(179, 54, 45)') {

    ctx.beginPath(); // Start a new path
    ctx.arc(x, y, radius, 0, Math.PI * 2, true); // Create the circle path
    ctx.fillStyle = color; // Set the fill color
    ctx.fill(); // Fill the path with the color
}

function drawPolygon(points) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!points || points.length < 3) {
        return;
    }

    points.forEach(point => {
        drawCircle(point.x, point.y);
    });

    // Begin path for polygon
    ctx.beginPath();

    // Move to the first point
    ctx.moveTo(points[0].x, points[0].y);

    // Connect all points
    points.forEach(point => {
        ctx.lineTo(point.x, point.y);
    });

    // Close the path to make sure the last point connects to the first one
    ctx.closePath();

    // Set the fill color and fill the polygon
    ctx.fillStyle = 'rgb(77, 116, 130)'; // Background color
    ctx.fill();

    // Set the border style and stroke the polygon
    ctx.strokeStyle = 'white'; // Border color
    ctx.lineWidth = 1; // Border width
    ctx.stroke();

    // Reset the border width to 0px
    ctx.lineWidth = 0;
}

let createPointsArray = (vertices) => {
    if(vertices < 3) {
        vertices = 3;
    }
    let diameter = 2*calculateRadius(vertices, 1);
    let length = (canvasDimensions.height/10*9)/diameter;
    let exteriorAngle = -360/vertices;

    let x = window.innerWidth/2 - length/2;
    let y = window.innerHeight/10*4 + (length/2) * Math.abs(Math.tan((180+exteriorAngle)/2/180*Math.PI));
    let newPoints = [{x: x, y: y}];

    let angle = 0;

    for(let i = 0; i < vertices-1; angle += exteriorAngle, i++) {
        x += length * Math.cos(angle/180*Math.PI);
        y += length * Math.sin(angle/180*Math.PI);

        newPoints.push({x: x, y: y});
    }

    return newPoints;
}