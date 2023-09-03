let canvas = document.getElementById("clock");

// canvas where we draw the body of the clock
let body = canvas.getContext("2d");

// canvas where we draw and update clock pointers
let pointers = document.getElementById("pointers").getContext("2d");

const orange = '#ffa500';
// this is more of a green shade
const white1 = '#8b2439';
const white3 = '#446127';

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
const oneMin = Math.PI / 30; // 6 degrees

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


var runAnimation = (() => {
    // clock handles width x length X color
    const clock_handles = [
      { width: 8, length: 0.5, c: orange },
      { width: 8, length: 0.8, c: orange },
      { width: 2, length: 0.9, c: orange },
      { width: 1, length: 0.95, c: white3 },
    ];
    const oneMin = Math.PI / 30; // 6 degrees
    let timer = null;

  
    function drawHandles() {
      let today = new Date();
      let hours = today.getHours();
      let minutes = today.getMinutes();
      let seconds = today.getSeconds();
        
      // 12 hours format: AM / PM
    let hours12 = hours % 12 || 12;

    // Hours pointer
    clock_handles[0].time2Angle = (-1)*fiveMin * (+hours12 + minutes / 60);

    // Minutes pointer
    clock_handles[1].time2Angle = (-1)*oneMin * (+minutes + seconds / 60);

    // Seconds pointer
    clock_handles[2].time2Angle = (-1)*oneMin * seconds;

    // 24 hour pointer
    clock_handles[3].time2Angle = (-1)*fiveMin * (+hours + minutes / 60) * 0.5;
  
      // Clear screen.
      pointers.clearRect(0, 0, canvas.width, canvas.height);
  
      let theight = clockRadius / 15;
      pointers.font = setFont(theight);
      pointers.fillStyle = white1;
  
      pointers.lineCap = "round";
  
      // Draw the handles.
      clock_handles.map((handle) => {
        pointers.strokeStyle = handle.c;
        pointers.beginPath();
        coord = polar2Cartesian(0.057 * clockRadius, handle.time2Angle);
        coord = translate(coord, center);
        pointers.moveTo(coord.x, coord.y);
  
        var coord = polar2Cartesian(
          handle.length * clockRadius,
          handle.time2Angle
        );
        coord = translate(coord, center);
        pointers.lineTo(coord.x, coord.y);
        pointers.lineWidth = handle.width;
        pointers.stroke();
      });
      cancelAnimationFrame(timer);
      timer = requestAnimationFrame(drawHandles);
    }
    // drawClock(city);
    timer = requestAnimationFrame(drawHandles);
    return drawHandles;
  })();