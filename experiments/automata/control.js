const playPause = document.querySelector('[button-play-pause]');
const reload = document.querySelector('[button-reload]');
const playOnce = document.querySelector('[button-play-once]');

const chooseBlue = document.querySelector('[button-blue]');
const chooseBlack = document.querySelector('[button-black]');
const chooseGreen = document.querySelector('[button-green]');
const chooseRed = document.querySelector('[button-red]');
const chooseWhite = document.querySelector('[button-white]');

let srcImage = document.getElementById('i');
const mapaColors = {
  white: 0, // espaço em branco
  green: 1, // portão de saída
  red: 2, // rosa, são pessoas
  black: 3, // parede
  blue: 4 // não acho que precisaremos
};
const lifeStates = {
  dead: 0,
  alive: 1,
};
const cellData = {
  state: 0,
};

let placeChoice;

// const placeChoices = ['blue', 'black', 'green', 'red', 'white'];
chooseBlue.addEventListener('click', () => activatePlacement('blue'));
chooseBlack.addEventListener('click', () => activatePlacement('black'));
chooseGreen.addEventListener('click', () => activatePlacement('green'));
chooseRed.addEventListener('click', () => activatePlacement('red'));
chooseWhite.addEventListener('click', () => activatePlacement('white'));

function activatePlacement(color) {
  placeChoice = color;
}

playPause.addEventListener('click', () => togglePlaying());
reload.addEventListener('click', () => reloadBoard());
playOnce.addEventListener('click', step);

const startClass = 'fa-play';
const pauseClass = 'fa-pause';
const TARGET_FPS = 2;
//const CELL_SIZE= 8;
const SIZE = 64;
const canvas = document.querySelector('#canvas');
canvas.onmousemove = onMouseMove;
const ctx = canvas.getContext('2d');
const {height, width} = canvas;
const DEAD = false;
const ALIVE = true;


const GRID_COUNT = SIZE;
const CELL_SIZE = width/GRID_COUNT;
let isRunning = false;  
let frameID;
let board;

const COLORS = {
  live: 'rgba(40, 169, 255, 1)',
  dead: 'rgba(255, 255, 255, 1)',
  mouse: 'rgba(255, 50, 50, 1)',
  white: 'rgba(255, 255, 255, 1)',
  green: 'rgba(0, 255, 0, 1)',
  red: 'rgba(255, 70, 255, 1)',
  black: 'rgba(0, 0, 0, 1)',
};

let xMousePos;
let yMousePos;

function onMouseMove(e) {
  let bounds = canvas.getBoundingClientRect();
  let x = e.clientX - bounds.left;
  let y = e.clientY - bounds.top;
  
  xMousePos = Math.floor(x/CELL_SIZE);
  yMousePos = Math.floor(y/CELL_SIZE);
  //draw();
}

function draw(ctx, isLive) {
  const color = isLive ? COLORS.live : COLORS.dead;
  function f(xGrid, yGrid) {
    ctx.lineWidth = 5;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.fillRect(xGrid*CELL_SIZE,
      yGrid*CELL_SIZE,
      CELL_SIZE-2,
      CELL_SIZE-2);
  }
  return f;
}


const drawAlive = draw(ctx, true);
const drawDead = draw(ctx, false);

function drawState(ctx, cell, xGrid, yGrid) {
  let color;
  const state = cell.state;
  switch (state) {
    case mapaColors.white: color = COLORS.white; break;
    case mapaColors.green: color = COLORS.green; break;
    case mapaColors.red: color = COLORS.red; break;
    case mapaColors.blue: color = COLORS.live; break;
    default:
      color = COLORS.black;
      break;
  }
  //if(cell.state === lifeStates.alive) {color = COLORS.live;} else {color = COLORS.dead;}
  ctx.lineWidth = 5;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.fillRect(
    xGrid*CELL_SIZE,
    yGrid*CELL_SIZE,
    CELL_SIZE-2,
    CELL_SIZE-2);
}
// rules
const FEW = 2;
const MANY = 3;
const PLENTY = 3;

const isLiveState = c => c.state === lifeStates.alive;
const isUnderPopulatedCheck = n => n < FEW;
const isOverPopulatedCheck = n => n > MANY;
const canReproduceCheck = n => n === PLENTY;
const willContinueCheck = n => !(isUnderPopulatedCheck(n)) && !(isOverPopulatedCheck(n));

const isLive = c => c === ALIVE;
const isUnderPopulated = n => n < FEW;
const isOverPopulated = n => n > MANY;
const canReproduce = n => n === PLENTY;
const willContinue = n => !(isUnderPopulated(n)) && !(isOverPopulated(n));
//end rules

function newRow() {return Array(SIZE).fill({state: lifeStates.dead});}

function newBoard() {
  let board = newEmptyBoard();
  board = boardFromImageData(srcImage, board);
  return board;
}
function newEmptyBoard () {
  const board = [...Array(SIZE)].map(e => Array(SIZE));
  return board;
}
const reloadBoard = () => board = newBoard();

//const renderRow = (r, y) => r.map((c, i) => (c ? drawAlive(i, y) : drawDead(i, y)) && c);
const renderRow = (r, y) => r.map((cell, i) => (drawState(ctx, cell, i, y)) && cell);
function renderBoard(b) {
  ctx.clearRect(0, 0, width, height);
  let ret = b.map(renderRow);
  

  // draw mouse cursor
  ctx.strokeStyle = COLORS.mouse;
  ctx.fillStyle = COLORS.mouse;
  ctx.fillRect(xMousePos*CELL_SIZE,
    yMousePos*CELL_SIZE,
    CELL_SIZE-2,
    CELL_SIZE-2);
}

function togglePlaying() {
  if (isRunning) {
    cancelAnimationFrame(frameID);
    playPause.querySelector('i').classList.add(startClass);
    playPause.querySelector('i').classList.remove(pauseClass);        
  } else {
    frameID = requestAnimationFrame(main);
    playPause.querySelector('i').classList.remove(startClass);
    playPause.querySelector('i').classList.add(pauseClass);        
  }
  isRunning = !isRunning;
}

function adjacencyBoard(board, arrayOfNeighborCoords) {
  const nextBoard = newEmptyBoard();
  for (let x = 0; x < board.length; x++) {
    for (let y = 0; y < board.length; y++) {
      const neighbors = arrayOfNeighborCoords[x][y].map(xy => cellAtCoordinate(board, ...xy));
      nextBoard[x][y] = neighbors.filter((t) => t.state === lifeStates.alive).length;
    }
  }
  return nextBoard;
}
// unused
function cellStateFromNeighbors(cell, neighbors) {
  neighborCount = neighbors.filter(isLive).length;
  return stateFromNeighborCount(neighborCount, cell);
}

function cellAtCoordinate (board, x, y) {return board[x][y];}

function neighborCellsForCoordinateArray(board, arrayOfNeighborCoords){
  return arrayOfNeighborCoords.map(neighborCoordsForCell => {
    return neighborCoordsForCell.map(coordsArray => {
      return coordsArray.map(xyArray => cellAtCoordinate(board, ...xyArray))
    })
  })
}

function stateFromNeighborCount (neighborCount, cell) {
  if (isLiveState(cell)) {
    if (isUnderPopulatedCheck(neighborCount)) {
      return {state: lifeStates.dead};
    } else if (isOverPopulatedCheck(neighborCount)) {
      return {state: lifeStates.dead};
    } else if (willContinueCheck(neighborCount)) {
      return {state: lifeStates.alive};
    }
  } else if (canReproduceCheck(neighborCount)) {
    return {state: lifeStates.alive};
  } else {
    return {state: lifeStates.dead};
  }
};

function numberRowAsLiveDeadCells(rowOfNumbers, rowOfCells){return rowOfNumbers.map((n, i) => stateFromNeighborCount(n, rowOfCells[i]));}
function numberBoardAsLiveDeadCells(boardOfNumbers, boardOfCells){return boardOfNumbers.map((r, i) => numberRowAsLiveDeadCells(r, boardOfCells[i]));}

function calculateStateFromNeighborCount(neighborCountBoard, cellBoard) {
  const nextBoard = newEmptyBoard();
  for (let x = 0; x < cellBoard.length; x++) {
    for (let y = 0; y < cellBoard.length; y++) {
      count = neighborCountBoard[x][y];
      cell = cellBoard[x][y];
      nextBoard[x][y] = stateFromNeighborCount(count, cell);
    }
  }
  return nextBoard
}
const isWithinBounds = v => v >= 0 && v < SIZE;
const areWithinBounds = (x, y) => isWithinBounds(x) && isWithinBounds(y);
const neighborCoordinates = (x, y) => [
  [x-1, y-1], [x, y-1], [x+1, y-1],
  [x-1, y],             [x+1, y],
  [x-1, y+1], [x, y+1], [x+1, y+1],  
].filter(xyArr => areWithinBounds(...xyArr));

function allNeighborsCoordinates(x, y) {
  return [
  [x-1, y-1], [x, y-1], [x+1, y-1],
  [x-1, y],             [x+1, y],
  [x-1, y+1], [x, y+1], [x+1, y+1], 
]
}

function neighborCoordinatesFromBoard(board) {
  const nextBoard = newEmptyBoard();
  for (let x = 0; x < board.length; x++) {
    for (let y = 0; y < board.length; y++) {
      nextBoard[x][y] = allNeighborsCoordinates(x, y).filter(xy => areWithinBounds(...xy));
    }
  }
  return nextBoard;
}

function main() {
    if (isRunning) {
      tick++;
      // taxa de atualização da simulação
      if(tick % 10 == 0) {
        step();
      }
      renderBoard(board);
      // taxa de atualização da animação
      setTimeout(() => {
        frameID = requestAnimationFrame(main);    
      }, 100/TARGET_FPS);    
    }
}
let tick = 0;

function step() {
  let coords = neighborCoordinatesFromBoard(board);
  neighbors = adjacencyBoard(board, coords);
  board = calculateStateFromNeighborCount(neighbors, board);
  renderBoard(board);
}

board = newBoard();
renderBoard(board);

function getColorByValue(pixel) {
  if (pixel[0] > 200 && pixel[1] > 200 && pixel[2] > 200) {
      return {state: mapaColors.white};
  } else if (pixel[0] < 100 && pixel[1] > 200 && pixel[2] < 100) {
      return {state: mapaColors.green};
  } else if (pixel[0] > 200 && pixel[1] < 100 && pixel[2] > 200) {
      return {state: mapaColors.red};
  } else {
      return {state: mapaColors.black};
  }
}

function boardFromImageData(imgEl, buffer) {
  // o próximo passo é pegar os dados dessa imagem para colocar no tabuleiro
  var blockSize = 5, // only visit every 5 pixels
      defaultRGB = {r:0,g:0,b:0}, // for non-supporting envs
      canvas = document.createElement('canvas'),
      context = canvas.getContext && canvas.getContext('2d'),
      data, width, height,
      i = 0,
      length,
      rgb = {r:0,g:0,b:0},
      count = 0;
      
  if (!context) {
      return defaultRGB;
  }

  height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
  width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;
  if (buffer.length < Math.max(width, height)) {
      console.log("Insufficient capacity of buffer");
      return;
  }
  context.drawImage(imgEl, 0, 0);

  try {
      data = context.getImageData(0, 0, width, height);
  } catch(e) {
      /* security error, img on diff domain */alert('security error, img on diff domain');
      return defaultRGB;
  }
  length = data.data.length;
  for(let i = 0; i < length; i += 4) {
    buffer[Math.floor(count/width)][count%width] = getColorByValue([data.data[i  ], data.data[i+1], data.data[i+2]]);
    count++;
}
  return buffer;
}
