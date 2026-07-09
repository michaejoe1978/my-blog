'use strict';

// ─── Palette ───────────────────────────────────────────────────────────────
const PALETTE = [
  '#000000','#ffffff','#ff0000','#00ff00','#0000ff','#ffff00','#ff00ff','#00ffff',
  '#ff8800','#8800ff','#00ff88','#ff0088','#0088ff','#88ff00','#ff8888','#88ff88',
  '#8888ff','#ffff88','#ff88ff','#88ffff','#884400','#448800','#004488','#884488',
  '#aaaaaa','#555555','#ffccaa','#aaffcc','#ccaaff','#ffaacc','#ccffaa','#aaccff'
];

// ─── State ─────────────────────────────────────────────────────────────────
const state = {
  grid: Array(256).fill(null),
  tool: 'pen',
  color: '#000000',
  history: [],
  future: [],
  recentColors: [],
  isDrawing: false,
  lastIndex: -1
};

// ─── DOM refs ──────────────────────────────────────────────────────────────
const canvasEl       = document.getElementById('pixel-canvas');
const paletteEl      = document.getElementById('palette');
const recentEl       = document.getElementById('recent-colors');
const colorPreview   = document.getElementById('current-color-preview');
const colorPicker    = document.getElementById('color-picker');
const exportScaleEl  = document.getElementById('export-scale');
const exportBtn      = document.getElementById('export-btn');
const clearBtn       = document.getElementById('clear-btn');
const statusTool     = document.getElementById('status-tool');
const statusCoord    = document.getElementById('status-coord');
const toolBtns       = document.querySelectorAll('.tool-btn[data-tool]');

// ─── Grid init ─────────────────────────────────────────────────────────────
function initGrid() {
  canvasEl.innerHTML = '';
  for (let i = 0; i < 256; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;

    cell.addEventListener('mousedown', onCellMousedown);
    cell.addEventListener('mouseenter', onCellMouseenter);
    cell.addEventListener('contextmenu', onCellContextmenu);

    canvasEl.appendChild(cell);
  }
}

function getCell(idx) {
  return canvasEl.children[idx];
}

// ─── Paint ─────────────────────────────────────────────────────────────────
function paintCell(idx, color) {
  state.grid[idx] = color;
  const cell = getCell(idx);
  if (color) {
    cell.style.background = color;
  } else {
    cell.style.background = '';
  }
}

function renderGrid() {
  for (let i = 0; i < 256; i++) {
    const cell = getCell(i);
    if (state.grid[i]) {
      cell.style.background = state.grid[i];
    } else {
      cell.style.background = '';
    }
  }
}

// ─── Flood fill (BFS) ──────────────────────────────────────────────────────
function floodFill(startIdx, fillColor) {
  const targetColor = state.grid[startIdx];
  if (targetColor === fillColor) return;

  const queue = [startIdx];
  const visited = new Set([startIdx]);

  while (queue.length > 0) {
    const idx = queue.shift();
    paintCell(idx, fillColor);

    const row = Math.floor(idx / 16);
    const col = idx % 16;
    const neighbors = [];

    if (row > 0)  neighbors.push(idx - 16);
    if (row < 15) neighbors.push(idx + 16);
    if (col > 0)  neighbors.push(idx - 1);
    if (col < 15) neighbors.push(idx + 1);

    for (const n of neighbors) {
      if (!visited.has(n) && state.grid[n] === targetColor) {
        visited.add(n);
        queue.push(n);
      }
    }
  }
}

// ─── History ───────────────────────────────────────────────────────────────
function saveSnapshot() {
  state.history.push(state.grid.slice());
  if (state.history.length > 50) state.history.shift();
  state.future = [];
}

function undo() {
  if (state.history.length === 0) return;
  state.future.push(state.grid.slice());
  state.grid = state.history.pop();
  renderGrid();
}

function redo() {
  if (state.future.length === 0) return;
  state.history.push(state.grid.slice());
  state.grid = state.future.pop();
  renderGrid();
}

// ─── Tool application ──────────────────────────────────────────────────────
function applyTool(idx) {
  switch (state.tool) {
    case 'pen':
      if (state.lastIndex !== idx) {
        paintCell(idx, state.color);
        state.lastIndex = idx;
      }
      break;
    case 'eraser':
      if (state.lastIndex !== idx) {
        paintCell(idx, null);
        state.lastIndex = idx;
      }
      break;
    case 'fill':
      floodFill(idx, state.color);
      addRecentColor(state.color);
      break;
    case 'eyedropper': {
      const picked = state.grid[idx];
      if (picked) {
        setColor(picked);
        addRecentColor(picked);
      }
      // Switch back to pen after picking
      selectTool('pen');
      break;
    }
  }
}

// ─── Mouse events ──────────────────────────────────────────────────────────
function onCellMousedown(e) {
  if (e.button === 2) return; // handled by contextmenu
  e.preventDefault();
  const idx = parseInt(e.currentTarget.dataset.index);
  saveSnapshot();
  state.isDrawing = true;
  state.lastIndex = -1;
  applyTool(idx);
  if (state.tool === 'pen') addRecentColor(state.color);
}

function onCellMouseenter(e) {
  if (!state.isDrawing) {
    // Update coord display
    const idx = parseInt(e.currentTarget.dataset.index);
    const col = idx % 16;
    const row = Math.floor(idx / 16);
    statusCoord.textContent = `좌표: (${col + 1}, ${row + 1})`;
    return;
  }
  const idx = parseInt(e.currentTarget.dataset.index);
  const col = idx % 16;
  const row = Math.floor(idx / 16);
  statusCoord.textContent = `좌표: (${col + 1}, ${row + 1})`;
  if (state.tool === 'pen' || state.tool === 'eraser') {
    applyTool(idx);
  }
}

function onCellContextmenu(e) {
  e.preventDefault();
  const idx = parseInt(e.currentTarget.dataset.index);
  saveSnapshot();
  paintCell(idx, null);
}

document.addEventListener('mouseup', () => {
  state.isDrawing = false;
  state.lastIndex = -1;
});

// 마우스가 브라우저 창 밖으로 나갔을 때 드래그 해제
document.documentElement.addEventListener('mouseleave', () => {
  state.isDrawing = false;
  state.lastIndex = -1;
});

canvasEl.addEventListener('mouseleave', () => {
  statusCoord.textContent = '좌표: -';
});

// ─── Touch events ──────────────────────────────────────────────────────────
function getCellFromTouch(touch) {
  const el = document.elementFromPoint(touch.clientX, touch.clientY);
  if (el && el.classList.contains('cell')) {
    return parseInt(el.dataset.index);
  }
  return -1;
}

canvasEl.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const idx = getCellFromTouch(e.touches[0]);
  if (idx < 0) return;
  saveSnapshot();
  state.isDrawing = true;
  state.lastIndex = -1;
  applyTool(idx);
  if (state.tool === 'pen') addRecentColor(state.color);
}, { passive: false });

canvasEl.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (!state.isDrawing) return;
  const idx = getCellFromTouch(e.touches[0]);
  if (idx < 0) return;
  if (state.tool === 'pen' || state.tool === 'eraser') {
    applyTool(idx);
  }
}, { passive: false });

canvasEl.addEventListener('touchend', () => {
  state.isDrawing = false;
  state.lastIndex = -1;
});

// ─── Tool selection ────────────────────────────────────────────────────────
const TOOL_NAMES = { pen: '펜', eraser: '지우개', fill: '채우기', eyedropper: '스포이드' };

function selectTool(tool) {
  state.tool = tool;
  toolBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tool === tool);
  });
  statusTool.textContent = `도구: ${TOOL_NAMES[tool] || tool}`;
}

toolBtns.forEach(btn => {
  btn.addEventListener('click', () => selectTool(btn.dataset.tool));
});

// ─── Color ─────────────────────────────────────────────────────────────────
function setColor(color) {
  state.color = color;
  colorPreview.style.background = color;
  colorPicker.value = color;
  // Update swatch selection
  document.querySelectorAll('.swatch').forEach(s => {
    s.classList.toggle('selected', s.dataset.color === color);
  });
}

colorPreview.addEventListener('click', () => colorPicker.click());

colorPicker.addEventListener('input', (e) => {
  setColor(e.target.value);
});

colorPicker.addEventListener('change', (e) => {
  setColor(e.target.value);
  addRecentColor(e.target.value);
});

// ─── Palette ───────────────────────────────────────────────────────────────
function initPalette() {
  paletteEl.innerHTML = '';
  PALETTE.forEach(color => {
    const sw = document.createElement('div');
    sw.className = 'swatch';
    sw.dataset.color = color;
    sw.style.background = color;
    sw.title = color;
    sw.addEventListener('click', () => {
      setColor(color);
      addRecentColor(color);
    });
    paletteEl.appendChild(sw);
  });
}

// ─── Recent colors ─────────────────────────────────────────────────────────
function addRecentColor(color) {
  if (!color) return;
  state.recentColors = state.recentColors.filter(c => c !== color);
  state.recentColors.unshift(color);
  if (state.recentColors.length > 8) state.recentColors.length = 8;
  renderRecentColors();
}

function renderRecentColors() {
  recentEl.innerHTML = '';
  state.recentColors.forEach(color => {
    const sw = document.createElement('div');
    sw.className = 'swatch';
    sw.dataset.color = color;
    sw.style.background = color;
    sw.title = color;
    sw.addEventListener('click', () => {
      setColor(color);
    });
    recentEl.appendChild(sw);
  });
}

// ─── Clear ─────────────────────────────────────────────────────────────────
clearBtn.addEventListener('click', () => {
  saveSnapshot();
  state.grid.fill(null);
  renderGrid();
});

// ─── Export PNG ────────────────────────────────────────────────────────────
exportBtn.addEventListener('click', () => {
  const scale = parseInt(exportScaleEl.value) || 8;
  const size = 16 * scale;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Transparent background
  ctx.clearRect(0, 0, size, size);

  for (let i = 0; i < 256; i++) {
    const color = state.grid[i];
    if (color) {
      const col = i % 16;
      const row = Math.floor(i / 16);
      ctx.fillStyle = color;
      ctx.fillRect(col * scale, row * scale, scale, scale);
    }
  }

  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = `pixel-art-${size}x${size}.png`;
  a.click();
});

// ─── Keyboard shortcuts ────────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;

  if (e.ctrlKey && e.key === 'z') {
    e.preventDefault();
    undo();
  } else if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
    e.preventDefault();
    redo();
  }

  // Tool shortcuts
  switch (e.key.toLowerCase()) {
    case 'p': selectTool('pen'); break;
    case 'e': selectTool('eraser'); break;
    case 'f': selectTool('fill'); break;
    case 'i': selectTool('eyedropper'); break;
  }
});

// ─── Init ──────────────────────────────────────────────────────────────────
initGrid();
initPalette();
setColor('#000000');
