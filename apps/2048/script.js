'use strict';

/* ==========================================================================
   2048 - script.js
   ========================================================================== */

const GRID_SIZE = 4;
const BEST_SCORE_KEY = 'best2048score';
const SWIPE_THRESHOLD = 30;

const boardEl = document.getElementById('board');
const boardGridEl = document.getElementById('boardGrid');
const boardTilesEl = document.getElementById('boardTiles');
const currentScoreEl = document.getElementById('currentScore');
const bestScoreEl = document.getElementById('bestScore');
const winOverlayEl = document.getElementById('winOverlay');
const gameOverOverlayEl = document.getElementById('gameOverOverlay');
const finalScoreEl = document.getElementById('finalScore');

const newGameBtn = document.getElementById('newGameBtn');
const restartBtn = document.getElementById('restartBtn');
const keepGoingBtn = document.getElementById('keepGoingBtn');
const winNewGameBtn = document.getElementById('winNewGameBtn');

let board = createEmptyBoard();
let score = 0;
let bestScore = 0;
let hasWon = false;
let locked = false;
let cellEls = [];
let touchStart = null;

function createEmptyBoard() {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
}

function buildGridCells() {
  boardGridEl.innerHTML = '';
  cellEls = [];
  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    boardGridEl.appendChild(cell);
    cellEls.push(cell);
  }
}

function getLineCoords(direction, index) {
  switch (direction) {
    case 'left':
      return [[index, 0], [index, 1], [index, 2], [index, 3]];
    case 'right':
      return [[index, 3], [index, 2], [index, 1], [index, 0]];
    case 'up':
      return [[0, index], [1, index], [2, index], [3, index]];
    case 'down':
      return [[3, index], [2, index], [1, index], [0, index]];
    default:
      throw new Error(`Unknown direction: ${direction}`);
  }
}

function processLine(line) {
  const original = line.slice();
  const filtered = original.filter((value) => value !== 0);
  const result = [];
  const mergedPositions = new Set();
  let gainedScore = 0;

  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const mergedValue = filtered[i] * 2;
      result.push(mergedValue);
      gainedScore += mergedValue;
      mergedPositions.add(result.length - 1);
      i += 2;
    } else {
      result.push(filtered[i]);
      i += 1;
    }
  }

  while (result.length < GRID_SIZE) {
    result.push(0);
  }

  const moved = original.some((value, idx) => value !== result[idx]);

  return { line: result, score: gainedScore, mergedPositions, moved };
}

function move(direction) {
  if (locked) {
    return;
  }

  const newBoard = board.map((row) => row.slice());
  let moved = false;
  let scoreGained = 0;
  const mergedCells = [];

  for (let index = 0; index < GRID_SIZE; index++) {
    const coords = getLineCoords(direction, index);
    const line = coords.map(([r, c]) => board[r][c]);
    const lineResult = processLine(line);

    if (lineResult.moved) {
      moved = true;
    }
    scoreGained += lineResult.score;

    lineResult.line.forEach((value, i) => {
      const [r, c] = coords[i];
      newBoard[r][c] = value;
      if (lineResult.mergedPositions.has(i)) {
        mergedCells.push([r, c]);
      }
    });
  }

  if (!moved) {
    return;
  }

  board = newBoard;
  score += scoreGained;
  updateScore();

  const newTile = spawnRandomTile();
  render({ newTiles: newTile ? [newTile] : [], mergedCells });

  checkWinCondition();
  checkGameOver();
}

function getEmptyCells() {
  const cells = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r][c] === 0) {
        cells.push([r, c]);
      }
    }
  }
  return cells;
}

function spawnRandomTile() {
  const emptyCells = getEmptyCells();
  if (emptyCells.length === 0) {
    return null;
  }
  const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  board[r][c] = Math.random() < 0.9 ? 2 : 4;
  return { row: r, col: c };
}

function canMoveAny() {
  const directions = ['left', 'right', 'up', 'down'];
  for (const direction of directions) {
    for (let index = 0; index < GRID_SIZE; index++) {
      const coords = getLineCoords(direction, index);
      const line = coords.map(([r, c]) => board[r][c]);
      if (processLine(line).moved) {
        return true;
      }
    }
  }
  return false;
}

function updateScore() {
  currentScoreEl.textContent = String(score);
  if (score > bestScore) {
    bestScore = score;
    bestScoreEl.textContent = String(bestScore);
    localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
  }
}

function checkWinCondition() {
  if (hasWon) {
    return;
  }
  const won = board.some((row) => row.some((value) => value >= 2048));
  if (won) {
    hasWon = true;
    locked = true;
    winOverlayEl.classList.remove('overlay--hidden');
  }
}

function checkGameOver() {
  if (locked && !winOverlayEl.classList.contains('overlay--hidden')) {
    return;
  }
  if (!canMoveAny()) {
    locked = true;
    finalScoreEl.textContent = String(score);
    gameOverOverlayEl.classList.remove('overlay--hidden');
  }
}

function isMergedCell(mergedCells, r, c) {
  return mergedCells.some(([mr, mc]) => mr === r && mc === c);
}

function isNewTile(newTiles, r, c) {
  return newTiles.some((tile) => tile.row === r && tile.col === c);
}

function render({ newTiles = [], mergedCells = [] } = {}) {
  boardTilesEl.innerHTML = '';
  const containerRect = boardTilesEl.getBoundingClientRect();

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const value = board[r][c];
      if (value === 0) {
        continue;
      }

      const cellRect = cellEls[r * GRID_SIZE + c].getBoundingClientRect();
      const left = cellRect.left - containerRect.left;
      const top = cellRect.top - containerRect.top;

      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.dataset.value = String(value);
      if (value > 2048) {
        tile.dataset.super = 'true';
      }
      tile.style.width = `${cellRect.width}px`;
      tile.style.height = `${cellRect.height}px`;
      tile.style.transform = `translate(${left}px, ${top}px)`;
      tile.textContent = String(value);

      if (isNewTile(newTiles, r, c)) {
        tile.classList.add('tile--new');
      } else if (isMergedCell(mergedCells, r, c)) {
        tile.classList.add('tile--merged');
      }

      boardTilesEl.appendChild(tile);
    }
  }
}

function startNewGame() {
  board = createEmptyBoard();
  score = 0;
  hasWon = false;
  locked = false;

  winOverlayEl.classList.add('overlay--hidden');
  gameOverOverlayEl.classList.add('overlay--hidden');

  updateScore();
  currentScoreEl.textContent = '0';

  const first = spawnRandomTile();
  const second = spawnRandomTile();
  render({ newTiles: [first, second].filter(Boolean), mergedCells: [] });
}

function handleKeydown(event) {
  const keyDirectionMap = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
  };

  const direction = keyDirectionMap[event.key];
  if (!direction) {
    return;
  }

  event.preventDefault();
  move(direction);
}

function handleTouchStart(event) {
  const touch = event.touches[0];
  touchStart = { x: touch.clientX, y: touch.clientY };
}

function handleTouchEnd(event) {
  if (!touchStart) {
    return;
  }

  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStart.x;
  const dy = touch.clientY - touchStart.y;
  touchStart = null;

  if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) {
    return;
  }

  let direction;
  if (Math.abs(dx) > Math.abs(dy)) {
    direction = dx > 0 ? 'right' : 'left';
  } else {
    direction = dy > 0 ? 'down' : 'up';
  }

  move(direction);
}

function handleResize() {
  render({ newTiles: [], mergedCells: [] });
}

function init() {
  buildGridCells();

  const storedBest = Number(localStorage.getItem(BEST_SCORE_KEY));
  bestScore = Number.isFinite(storedBest) && storedBest > 0 ? storedBest : 0;
  bestScoreEl.textContent = String(bestScore);

  document.addEventListener('keydown', handleKeydown);

  boardEl.addEventListener('touchstart', handleTouchStart, { passive: true });
  boardEl.addEventListener('touchend', handleTouchEnd, { passive: true });
  boardEl.addEventListener('touchmove', (event) => event.preventDefault(), { passive: false });

  window.addEventListener('resize', handleResize);

  newGameBtn.addEventListener('click', startNewGame);
  restartBtn.addEventListener('click', startNewGame);
  winNewGameBtn.addEventListener('click', startNewGame);
  keepGoingBtn.addEventListener('click', () => {
    winOverlayEl.classList.add('overlay--hidden');
    locked = false;
  });

  startNewGame();
}

init();
