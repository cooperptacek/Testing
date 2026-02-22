const SIZE = 6;

const boardEl = document.getElementById('board');
const topCluesEl = document.getElementById('top-clues');
const leftCluesEl = document.getElementById('left-clues');
const messageEl = document.getElementById('message');
const solvedCountEl = document.getElementById('solved-count');
const seedInput = document.getElementById('seed-input');

const newPuzzleBtn = document.getElementById('new-puzzle');
const loadSeedBtn = document.getElementById('load-seed');

let puzzle;
let playerGrid;
let solvedCount = 0;

function createRng(seed) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function generatePuzzle(seed) {
  const random = createRng(seed);
  const solution = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));

  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      solution[r][c] = random() < 0.45 ? 1 : 0;
    }
  }

  const rowClues = solution.map((row) => row.reduce((a, b) => a + b, 0));
  const colClues = Array.from({ length: SIZE }, (_, c) =>
    solution.reduce((sum, row) => sum + row[c], 0),
  );

  return { seed, solution, rowClues, colClues };
}

function buildBoard() {
  boardEl.innerHTML = '';
  playerGrid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));

  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      const cell = document.createElement('button');
      cell.className = 'cell';
      cell.type = 'button';
      cell.dataset.row = String(r);
      cell.dataset.col = String(c);
      cell.dataset.state = '0';
      cell.setAttribute('aria-label', `Row ${r + 1} column ${c + 1}`);
      cell.addEventListener('click', onCellClick);
      boardEl.appendChild(cell);
    }
  }
}

function renderClues() {
  topCluesEl.innerHTML = '';
  leftCluesEl.innerHTML = '';

  for (const clue of puzzle.colClues) {
    const div = document.createElement('div');
    div.textContent = clue;
    topCluesEl.appendChild(div);
  }

  for (const clue of puzzle.rowClues) {
    const div = document.createElement('div');
    div.textContent = clue;
    leftCluesEl.appendChild(div);
  }
}

function onCellClick(event) {
  const cell = event.currentTarget;
  const r = Number(cell.dataset.row);
  const c = Number(cell.dataset.col);
  const nextState = (Number(cell.dataset.state) + 1) % 3;

  cell.dataset.state = String(nextState);
  cell.classList.toggle('state-fill', nextState === 1);
  cell.classList.toggle('state-block', nextState === 2);

  playerGrid[r][c] = nextState === 1 ? 1 : 0;

  checkWin();
}

function checkWin() {
  const rowCounts = playerGrid.map((row) => row.reduce((a, b) => a + b, 0));
  const colCounts = Array.from({ length: SIZE }, (_, c) =>
    playerGrid.reduce((sum, row) => sum + row[c], 0),
  );

  const won =
    rowCounts.every((count, i) => count === puzzle.rowClues[i]) &&
    colCounts.every((count, i) => count === puzzle.colClues[i]);

  if (won) {
    messageEl.textContent = `Solved puzzle #${puzzle.seed}! Generate another.`;
    solvedCount += 1;
    solvedCountEl.textContent = String(solvedCount);
  } else {
    messageEl.textContent = `Puzzle #${puzzle.seed}: match all row and column clues.`;
  }
}

function loadPuzzle(seed) {
  puzzle = generatePuzzle(seed);
  seedInput.value = String(seed);
  buildBoard();
  renderClues();
  messageEl.textContent = `Puzzle #${seed}: match all row and column clues.`;
}

newPuzzleBtn.addEventListener('click', () => {
  loadPuzzle(Math.floor(Math.random() * 1_000_000_000) + 1);
});

loadSeedBtn.addEventListener('click', () => {
  const seed = Number(seedInput.value);
  if (!Number.isInteger(seed) || seed < 1) {
    messageEl.textContent = 'Enter a positive integer seed.';
    return;
  }

  loadPuzzle(seed);
});

loadPuzzle(Math.floor(Math.random() * 1_000_000_000) + 1);
