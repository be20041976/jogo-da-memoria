const EMOJI_POOL = [
  '🐶', '🐱', '🦊', '🐻', '🐼', '🦁', '🐸', '🐵',
  '🐷', '🐨', '🐔', '🦄', '🐙', '🦋', '🐢', '🦉',
  '🍕', '🍔', '🍩', '🍎'
];

const DIFFICULTY = {
  '4x4': { cols: 4, rows: 4 },
  '4x6': { cols: 4, rows: 6 },
  '6x6': { cols: 6, rows: 6 }
};

const board = document.getElementById('board');
const movesEl = document.getElementById('moves');
const timerEl = document.getElementById('timer');
const pairsEl = document.getElementById('pairs');
const difficultySelect = document.getElementById('difficulty');
const restartBtn = document.getElementById('restart');
const winOverlay = document.getElementById('winOverlay');
const winStats = document.getElementById('winStats');
const playAgainBtn = document.getElementById('playAgain');

let flippedCards = [];
let matchedCount = 0;
let totalPairs = 0;
let moves = 0;
let lockBoard = false;
let seconds = 0;
let timerInterval = null;
let started = false;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  seconds = 0;
  timerEl.textContent = formatTime(seconds);
  timerInterval = setInterval(() => {
    seconds++;
    timerEl.textContent = formatTime(seconds);
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function buildBoard() {
  const { cols, rows } = DIFFICULTY[difficultySelect.value];
  totalPairs = (cols * rows) / 2;
  const symbols = shuffle(EMOJI_POOL).slice(0, totalPairs);
  const deck = shuffle([...symbols, ...symbols]);

  board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  board.innerHTML = '';

  deck.forEach((symbol) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.symbol = symbol;
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-back">?</div>
        <div class="card-face card-front">${symbol}</div>
      </div>
    `;
    card.addEventListener('click', () => onCardClick(card));
    board.appendChild(card);
  });

  matchedCount = 0;
  moves = 0;
  flippedCards = [];
  lockBoard = false;
  started = false;
  movesEl.textContent = '0';
  pairsEl.textContent = `0/${totalPairs}`;
  stopTimer();
  seconds = 0;
  timerEl.textContent = '00:00';
  winOverlay.classList.remove('show');
}

function onCardClick(card) {
  if (lockBoard) return;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
  if (flippedCards.length === 2) return;

  if (!started) {
    started = true;
    startTimer();
  }

  card.classList.add('flipped');
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    moves++;
    movesEl.textContent = moves;
    checkMatch();
  }
}

function checkMatch() {
  const [first, second] = flippedCards;
  const isMatch = first.dataset.symbol === second.dataset.symbol;

  if (isMatch) {
    first.classList.add('matched');
    second.classList.add('matched');
    matchedCount++;
    pairsEl.textContent = `${matchedCount}/${totalPairs}`;
    flippedCards = [];

    if (matchedCount === totalPairs) {
      stopTimer();
      setTimeout(showWin, 500);
    }
  } else {
    lockBoard = true;
    first.classList.add('shake');
    second.classList.add('shake');
    setTimeout(() => {
      first.classList.remove('flipped', 'shake');
      second.classList.remove('flipped', 'shake');
      flippedCards = [];
      lockBoard = false;
    }, 800);
  }
}

function showWin() {
  winStats.textContent = `Você completou em ${moves} jogadas e ${formatTime(seconds)}.`;
  winOverlay.classList.add('show');
}

restartBtn.addEventListener('click', buildBoard);
playAgainBtn.addEventListener('click', buildBoard);
difficultySelect.addEventListener('change', buildBoard);

buildBoard();
