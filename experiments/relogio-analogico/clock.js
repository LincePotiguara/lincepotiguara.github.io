// why in omne sanctissimum if I use this line it doesn't use anti-alias
// let canvas = document.getElementById("clock");
// but this line does for both chrome and firefox
let canvas = document.getElementById("pointers");

let canvas2 = document.getElementById("clock");
let bg = canvas2.getContext("2d");
// canvas where we draw the body of the clock
let body = canvas.getContext("2d");

// canvas where we draw and update clock pointers
let pointers = document.getElementById("pointers").getContext("2d");
const context = pointers;

// this is more of a green shade
const burgundy = '#8b2439';
const red = '#ff6b6b';
const black = '#3f3c3c';

// img
const image = new Image();
// Draw when image has loaded
image.onload = drawBgImage; 
image.src = "./relogio-analogico/estrela.png";
function drawBgImage() {
    const size = clockRadius*1.2;
    // image size in pixels
    const imgSize = 500;
    // the center point of the image
    let imgCenter = {
        x: 250,
        y: 275
    };
    // the normalized center point
    let coords = {
        x: imgCenter.x/imgSize,
        y: imgCenter.y/imgSize
    };
    bg.drawImage(this, centerCoord.x- coords.x*size, centerCoord.y - coords.y*size, size, size);
  }
  


/**
 * Clock radius.
 * @type {Number}
 */
var clockRadius = Math.min(canvas.width, canvas.height) / 3.1;

/**
 * Canvas center.
 * @type {point}
 */
var center = [canvas.width / 2, canvas.height / 2];

/** Each 5 min is 30 degrees. */
const fiveMin = Math.PI / 6;
const oneMin = Math.PI / 30;
// 6 degrees

/**
 * Sets font size and style.
 *
 * @param {Number} size font size in pixels.
 * @return {String} html font.
 */
function setFont(size) {
    return `bold ${1.2 * size}px arial`;
}
/**
 * A 2D point.
 *
 * @typedef {Object} point
 * @property {Number} x - coordinate.
 * @property {Number} y - coordinate.
 */

/**
 * Convert from polar to cartesian coordinates.
 * <ul>
 * <li>Note that 0° is at three o'clock.</li>
 * <li>For the clock, however, 0° is at twelve o'clock.</li>
 * </ul>
 *
 * @param {Number} radius vector length.
 * @param {Number} angle vector angle.
 * @return {point} a 2D point.
 */
function polar2Cartesian(radius, angle) {
    angle -= Math.PI / 2;
    return {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
    };
}
/**
 * Translate a point.
 *
 * @param {point} pos given point.
 * @param {number[]} vec translation vector.
 * @return {point} a new translated point.
 */
function translate(pos, vec) {
    return {
        x: pos.x + vec[0],
        y: pos.y + vec[1],
    };
}
/**
 * Draw the clock: a logo, a circle, and the ticks.
 *
 * @param {String} place a location name.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API/Using_the_Geolocation_API
 */
function drawClock() {
    // Draw clock border.
    body.strokeStyle = black;
    body.lineWidth = 3;
    body.beginPath();
    body.arc(centerCoord.x, centerCoord.y, clockRadius, 0, 2 * Math.PI, false);
    body.stroke();

    /**
   * <p>A modulo function that works for negative numbers.</p>
   * The modulo is calculated from remainder using the modular property:<br/>
   * • (a + b) mod c = (a mod c + b mod c) mod c.
   *
   * @function
   * @global
   * @param {Number} b divisor.
   * @returns {Number} this modulo b.
   * @see https://en.wikipedia.org/wiki/Modulo_operation
   * @see https://www.geeksforgeeks.org/how-to-get-negative-result-using-modulo-operator-in-javascript/
   */
    Number.prototype.mod = function(b) {
        return ((this % b) + b) % b;
    };

    // Draw the tick numbers.
    context.textAlign = "center";
    context.textBaseline = "middle";

    // Draw 12 inner numbers.
    context.font = setFont(clockRadius / 10);
    drawClock.romans.map((n,i) => {
        context.fillStyle = n.c;
        var coord = polar2Cartesian(0.85 * clockRadius, i * fiveMin);
        // translate to the center of the canvas
        coord = translate(coord, center);
        context.fillText(n.txt, coord.x, coord.y);
    }
    );
}

/**
 * Clock roman x color.
 * @member {Array<{txt: String, c: color}>} roman clock numbers.
 */
let romans  = [{
    txt: "I",
    c: burgundy
}, {
    txt: "II",
    c: burgundy
}, {
    txt: "III",
    c: burgundy
}, {
    txt: "IV",
    c: burgundy
}, {
    txt: "V",
    c: burgundy
}, {
    txt: "VI",
    c: burgundy
}, {
    txt: "VII",
    c: burgundy
}, {
    txt: " VIII",
    c: burgundy
}, {
    txt: "IX",
    c: burgundy
}, {
    txt: "X",
    c: burgundy
}, {
    txt: "XI",
    c: burgundy
}, {
    txt: "XII",
    c: burgundy
},];

drawClock.romans = romans.reverse();
let centerCoord = translate({
    x: 0,
    y: 0
}, center);


var runAnimation = (()=>{
    // clock handles width x length X color
    const clock_handles = [{
        width: 8,
        length: 0.5,
        c: black
    }, {
        width: 8,
        length: 0.8,
        c: black
    }, {
        width: 2,
        length: 0.9,
        c: red
    }, {
        width: 1,
        length: 0.95,
        c: black
    }, ];
    // one minute is 6 degrees
    const oneMin = Math.PI / 30;
    let timer = null;

    function drawHandles() {
        let today = new Date();
        let hours = today.getHours();
        let minutes = today.getMinutes();
        let seconds = today.getSeconds();

        // 12 hours format: AM / PM
        let hours12 = hours % 12 || 12;

        // Hours pointer
        clock_handles[0].time2Angle = (-1) * fiveMin * (+hours12 + minutes / 60);

        // Minutes pointer
        clock_handles[1].time2Angle = (-1) * oneMin * (+minutes + seconds / 60);

        // Seconds pointer
        clock_handles[2].time2Angle = (-1) * oneMin * seconds;

        // 24 hour pointer
        // clock_handles[3].time2Angle = (-1) * fiveMin * (+hours + minutes / 60) * 0.5;

        // Clear screen.
        pointers.clearRect(0, 0, canvas.width, canvas.height);

        let theight = clockRadius / 15;
        pointers.font = setFont(theight);

        pointers.lineCap = "round";

        // Draw the handles.
        clock_handles.map((handle)=>{
            pointers.strokeStyle = handle.c;
            pointers.beginPath();
            coord = polar2Cartesian(0.057 * clockRadius, handle.time2Angle);
            //coord = polar2Cartesian(0.057 * clockRadius, handle.time2Angle);
            coord = translate(coord, center);
            pointers.moveTo(coord.x, coord.y);

            var coord = polar2Cartesian(handle.length * clockRadius, handle.time2Angle);
            coord = translate(coord, center);
            pointers.lineTo(coord.x, coord.y);
            pointers.lineWidth = handle.width;
            pointers.stroke();
        }
        );
        // Draw the red cap in front
        let capRadius = clockRadius / 12;

        pointers.beginPath();
        //pointers.strokeStyle = red;
        pointers.arc(centerCoord.x, centerCoord.y, capRadius, 0, 2 * Math.PI);
        pointers.fillStyle = red;
        pointers.fill();

        drawClock();
        cancelAnimationFrame(timer);
        timer = requestAnimationFrame(drawHandles);
    }
    timer = requestAnimationFrame(drawHandles);
    return drawHandles;
}
)();

