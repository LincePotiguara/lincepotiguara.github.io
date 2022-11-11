const playPause = document.querySelector('[button-play-pause]');
const reload = document.querySelector('[button-reload]');
const playOnce = document.querySelector('[button-play-once]');

const chooseBlue = document.querySelector('[button-blue]');
const chooseBlack = document.querySelector('[button-black]');
const chooseGreen = document.querySelector('[button-green]');
const chooseRed = document.querySelector('[button-red]');
const chooseWhite = document.querySelector('[button-white]');

playPause.addEventListener('click', () => togglePlaying());
reload.addEventListener('click', () => reloadBoard());
playOnce.addEventListener('click', step);

const startClass = 'fa-play';
const pauseClass = 'fa-pause';
const TARGET_FPS = 2;
//const CELL_SIZE= 8;
const SIZE = 3;
const canvas = document.querySelector('#canvas');
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
    dead: 'rgba(255, 255, 255, 1)'
  };
  
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

// rules
const FEW = 2;
const MANY = 3;
const PLENTY = 3;

const isLive = c => c === ALIVE;
const isUnderPopulated = n => n < FEW;
const isOverPopulated = n => n > MANY;
const canReproduce = n => n === PLENTY;
const willContinue = n => !(isUnderPopulated(n)) && !(isOverPopulated(n));
//end rules

function newRow() {return Array(SIZE).fill(DEAD);}
function newBoard () {
  let board = newRow().map(newRow);
  board[1][0] = true;
  board[1][1] = true;
  board[1][2] = true;
  return board;
}
function newEmptyBoard () {
  const board = [...Array(SIZE)].map(e => Array(SIZE));
  return board;
}
const reloadBoard = () => board = newBoard();

const renderRow = (r, y) => r.map((c, i) => (c ? drawAlive(i, y) : drawDead(i, y)) && c);
function renderBoard(b) {
  ctx.clearRect(0, 0, width, height);
  return b.map(renderRow);
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
      nextBoard[x][y] = neighbors.filter(isLive).length;
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
  if (isLive(cell)) {
    if (isUnderPopulated(neighborCount)) {
      return DEAD;
    } else if (isOverPopulated(neighborCount)) {
      return DEAD;
    } else if (willContinue(neighborCount)) {
      return ALIVE;
    }
  } else if (canReproduce(neighborCount)) {
    return ALIVE;
  } else {
    return DEAD;
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
      step();
      setTimeout(() => {
        frameID = requestAnimationFrame(main);    
      }, 1000/TARGET_FPS);    
    }
}

function step() {
  let coords = neighborCoordinatesFromBoard(board);
  neighbors = adjacencyBoard(board, coords);
  board = calculateStateFromNeighborCount(neighbors, board);
  renderBoard(board);
}

board = newBoard();