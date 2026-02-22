const SIZE = 8;

const boardEl = document.getElementById('board');
const topCluesEl = document.getElementById('top-clues');
const leftCluesEl = document.getElementById('left-clues');
const messageEl = document.getElementById('message');
const seedInput = document.getElementById('seed-input');
const puzzleIdEl = document.getElementById('puzzle-id');
const timerEl = document.getElementById('timer');
const mistakesEl = document.getElementById('mistakes');
const streakEl = document.getElementById('streak');

const dailyBtn = document.getElementById('daily-btn');
const endlessBtn = document.getElementById('endless-btn');
const newPuzzleBtn = document.getElementById('new-puzzle');
const loadSeedBtn = document.getElementById('load-seed');
const checkBoardBtn = document.getElementById('check-board');
const clearBoardBtn = document.getElementById('clear-board');

let puzzle;
let playerGrid;
let mode = 'daily';
let mistakes = 0;
let streak = 0;
let startedAt = Date.now();
let timerHandle;
let won = false;

function createRng(seed) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function runClues(line) {
  const out = [];
  let run = 0;
  for (const cell of line) {
    if (cell === 1) run += 1;
    else if (run > 0) {
      out.push(run);
      run = 0;
    }
  }
  if (run > 0) out.push(run);
  return out.length ? out : [0];
}

function generatePuzzle(seed) {
  const random = createRng(seed);
  const solution = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));

  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      solution[r][c] = random() < 0.47 ? 1 : 0;
    }
  }

  const rowClues = solution.map((row) => runClues(row));
  const colClues = Array.from({ length: SIZE }, (_, c) => runClues(solution.map((row) => row[c])));

  return { seed, solution, rowClues, colClues };
}

function fmtSeconds(ms) {
  const sec = Math.floor(ms / 1000);
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function startTimer() {
  clearInterval(timerHandle);
  startedAt = Date.now();
  timerEl.textContent = '00:00';
  timerHandle = setInterval(() => {
    timerEl.textContent = fmtSeconds(Date.now() - startedAt);
  }, 500);
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
      cell.setAttribute('aria-label', `Row ${r + 1}, column ${c + 1}`);
      cell.addEventListener('click', onCellClick);
      boardEl.appendChild(cell);
    }
  }
}

function renderClues() {
  topCluesEl.innerHTML = '';
  leftCluesEl.innerHTML = '';

  for (const clueSet of puzzle.colClues) {
    const div = document.createElement('div');
    div.className = 'clue';
    div.textContent = clueSet.join(' ');
    topCluesEl.appendChild(div);
  }
  for (const clueSet of puzzle.rowClues) {
    const div = document.createElement('div');
    div.className = 'clue';
    div.textContent = clueSet.join(' ');
    leftCluesEl.appendChild(div);
  }
}

function onCellClick(event) {
  if (won) return;
  const cell = event.currentTarget;
  const r = Number(cell.dataset.row);
  const c = Number(cell.dataset.col);
  const nextState = (Number(cell.dataset.state) + 1) % 3;

  cell.dataset.state = String(nextState);
  cell.classList.toggle('state-fill', nextState === 1);
  cell.classList.toggle('state-block', nextState === 2);
  cell.classList.remove('wrong');

  playerGrid[r][c] = nextState === 1 ? 1 : 0;
  evaluate();
}

function evaluate() {
  const rowCluesNow = playerGrid.map((row) => runClues(row));
  const colCluesNow = Array.from({ length: SIZE }, (_, c) => runClues(playerGrid.map((row) => row[c])));

  const solvedRows = rowCluesNow.every((clue, i) => clue.join(',') === puzzle.rowClues[i].join(','));
  const solvedCols = colCluesNow.every((clue, i) => clue.join(',') === puzzle.colClues[i].join(','));

  if (solvedRows && solvedCols) {
    won = true;
    streak += 1;
    streakEl.textContent = String(streak);
    messageEl.textContent = `Solved in ${timerEl.textContent}. Nice!`;
    clearInterval(timerHandle);
  } else {
    messageEl.textContent = 'Keep going — match all row and column runs.';
  }
}

function checkBoard() {
  if (won) return;
  let wrongCount = 0;
  document.querySelectorAll('.cell').forEach((cell) => {
    const r = Number(cell.dataset.row);
    const c = Number(cell.dataset.col);
    const filled = Number(cell.dataset.state) === 1;
    const correct = puzzle.solution[r][c] === 1;

    if (filled && !correct) {
      cell.classList.add('wrong');
      wrongCount += 1;
    }
  });

  if (wrongCount > 0) {
    mistakes += 1;
    mistakesEl.textContent = String(mistakes);
    messageEl.textContent = `Found ${wrongCount} incorrect pip(s).`;
  } else {
    messageEl.textContent = 'No incorrect pips found so far.';
  }
}

function clearBoard() {
  buildBoard();
  messageEl.textContent = `Puzzle #${puzzle.seed}: fill the grid.`;
}

function dailySeedFromDate() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return Number(`${y}${m}${d}`);
}

function loadPuzzle(seed) {
  puzzle = generatePuzzle(seed);
  won = false;
  mistakes = 0;
  mistakesEl.textContent = '0';
  seedInput.value = String(seed);
  puzzleIdEl.textContent = `Puzzle #${seed}`;
  buildBoard();
  renderClues();
  startTimer();
  messageEl.textContent = `Puzzle #${seed}: fill the grid.`;
}

function setMode(nextMode) {
  mode = nextMode;
  dailyBtn.classList.toggle('active', mode === 'daily');
  endlessBtn.classList.toggle('active', mode === 'endless');
  if (mode === 'daily') loadPuzzle(dailySeedFromDate());
  else loadPuzzle(Math.floor(Math.random() * 1_000_000_000) + 1);
}

dailyBtn.addEventListener('click', () => setMode('daily'));
endlessBtn.addEventListener('click', () => setMode('endless'));
newPuzzleBtn.addEventListener('click', () => {
  if (mode === 'daily') setMode('daily');
  else loadPuzzle(Math.floor(Math.random() * 1_000_000_000) + 1);
});
loadSeedBtn.addEventListener('click', () => {
  const seed = Number(seedInput.value);
  if (!Number.isInteger(seed) || seed < 1) {
    messageEl.textContent = 'Enter a positive integer seed.';
    return;
  }
  setMode('endless');
  loadPuzzle(seed);
});
checkBoardBtn.addEventListener('click', checkBoard);
clearBoardBtn.addEventListener('click', clearBoard);

setMode('daily');
