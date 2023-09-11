let canvas = document.getElementById("clock");

// canvas where we draw the body of the clock
let body = canvas.getContext("2d");

// canvas where we draw and update clock pointers
let pointers = document.getElementById("pointers").getContext("2d");
const context = pointers;

const orange = '#ffa500';
// this is more of a green shade
const white1 = '#8b2439';
const white3 = '#446127';
const red = '#ff6b6b';
const black = '#3f3c3c';

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
    // context.globalAlpha = 0.3; // set global alpha

    // Draw clock border.
    context.strokeStyle = black;
    context.lineWidth = 3;
    circle(center, clockRadius, false);

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
    }
    ;

    /**
   * Draw the sun light arc.
   *
   * @param {Object<{latitude, longitude}>} loc location.
   * @param {Number} utcoff UTC offset.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset
   */
    function drawArc(loc, utcoff) {
        let today = new Date();
        let times = SunCalc.getTimes(today, loc.latitude, loc.longitude);

        // your local timezone offset in minutes (eg -180).
        // NOT the timezone offset of the date object.
        let offset;
        let timezoneOffset = today.getTimezoneOffset() / 60;
        if (typeof utcoff === "undefined") {
            offset = 0;
            cityOffset = -timezoneOffset;
        } else {
            offset = timezoneOffset + utcoff;
            cityOffset = utcoff;
        }

        // format sunrise time from the Date object
        let sunriseStr = times.sunrise.getHours() + offset + ":" + times.sunrise.getMinutes();

        // format sunset time from the Date object
        let sunsetStr = times.sunset.getHours() + offset + ":" + times.sunset.getMinutes();

        console.log(sunriseStr, sunsetStr);
        context.strokeStyle = orange;
        arc(center, clockRadius - 8, sunriseStr, sunsetStr, false);
    }

    // Draw the tick numbers.
    context.textAlign = "center";
    context.textBaseline = "middle";

    // Draw 12 inner numbers.
    context.font = setFont(clockRadius / 10);
    drawClock.romans.map((n,i)=>{
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
    c: white1
}, {
    txt: "II",
    c: white1
}, {
    txt: "III",
    c: white1
}, {
    txt: "IV",
    c: white1
}, {
    txt: "V",
    c: white1
}, {
    txt: "VI",
    c: white1
}, {
    txt: "VII",
    c: white1
}, {
    txt: " VIII",
    c: white1
}, {
    txt: "IX",
    c: white1
}, {
    txt: "X",
    c: white1
}, {
    txt: "XI",
    c: white1
}, {
    txt: "XII",
    c: white1
},];

drawClock.romans = romans.reverse();
let centerCoord = translate({
    x: 0,
    y: 0
}, center);

/**
 * Clock number x color.
 * @member {Array<{txt: String, c: color}>} decimal clock numbers.
 */
drawClock.decimals = Array.from(Array(24), (_,i)=>{
    return {
        txt: String(i),
        c: white1
    };
}
);
drawClock.decimals[0].txt = "24";
drawClock.decimals[6].c = white3;
drawClock.decimals[18].c = white3;
// Now draw the pointers

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
        c: white3
    }, ];
    const oneMin = Math.PI / 30;
    // 6 degrees
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
        clock_handles[3].time2Angle = (-1) * fiveMin * (+hours + minutes / 60) * 0.5;

        // Clear screen.
        pointers.clearRect(0, 0, canvas.width, canvas.height);

        let theight = clockRadius / 15;
        pointers.font = setFont(theight);
        pointers.fillStyle = white1;

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
        // Draw the cap in front
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

/**
 * Draw a circle.
 *
 * @param {point} center center of the circle.
 * @param {Number} radius radius of the circle.
 * @param {Boolean} fill draws a solid or hollow circle.
 * @see https://riptutorial.com/html5-canvas/example/11126/beginpath--a-path-command-
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/stroke
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/closePath
 */
function circle(center, radius, fill=true) {
    pointers.beginPath();
    pointers.arc(center[0], center[1], radius, 0, 2 * Math.PI);
    if (fill)
        pointers.fill();
    else
        pointers.stroke();
}
