import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './style.css';
import { Modal } from 'bootstrap';
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db, ensureAnonymousAuth } from './firebase.js';

const grid = document.querySelector('.gridgg');
const tabContent = document.getElementById('myTabContent');
const timerElement = document.getElementById('timer');
const flagCounterElement = document.getElementById('flagcounter');
const winTimeElement = document.getElementById('win-time');
const nameInput = document.getElementById('name');
const submitButton = document.querySelector('.submit');
const submitStatus = document.getElementById('submit-status');
const playerInfo = document.getElementById('playerinfo');

const width = 10;
const bombAmount = 15;
const maxScoreSeconds = 999;
const leaderboardLimit = 25;
const bombColors = ['red', 'green', 'blue', 'orange', 'yellow', 'purple', 'cyan'];
const numberColors = ['gray', 'blue', 'darkgreen', 'red', 'purple', 'maroon', 'turquoise', 'black', 'gray'];

let squares = [];
let isGameOver = false;
let flagCount = 0;
let isStarted = false;
let startTime = 0;
let currentTime = 0;
let clock;
let finalTimeSeconds = 0;
let isSubmitting = false;

function createBoard() {
  const bombs = Array(bombAmount).fill('bomb');
  const empty = Array(width * width - bombAmount).fill('empty');
  const shuffledCells = empty.concat(bombs).sort(() => Math.random() - 0.5);

  grid.replaceChildren();
  squares = [];

  for (let i = 0; i < width * width; i += 1) {
    const square = document.createElement('button');
    const row = Math.floor(i / width);
    const col = i % width;

    square.type = 'button';
    square.id = String(i);
    square.classList.add(shuffledCells[i], 'cell', (row + col) % 2 === 1 ? 'odd' : 'even');
    square.setAttribute('aria-label', `Cell ${row + 1}, ${col + 1}`);

    square.addEventListener('click', () => {
      startGameIfNeeded();
      click(square);
    });

    square.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      startGameIfNeeded();
      addFlag(square);
    });

    grid.appendChild(square);
    squares.push(square);
  }

  calculateAdjacentBombs();
}

function calculateAdjacentBombs() {
  squares.forEach((square, index) => {
    if (square.classList.contains('bomb')) return;

    const total = getNeighborIndexes(index).filter((neighborIndex) => (
      squares[neighborIndex].classList.contains('bomb')
    )).length;

    square.dataset.bombs = String(total);
  });
}

function getNeighborIndexes(index) {
  const row = Math.floor(index / width);
  const col = index % width;
  const indexes = [];

  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
      if (rowOffset === 0 && colOffset === 0) continue;

      const neighborRow = row + rowOffset;
      const neighborCol = col + colOffset;

      if (neighborRow >= 0 && neighborRow < width && neighborCol >= 0 && neighborCol < width) {
        indexes.push(neighborRow * width + neighborCol);
      }
    }
  }

  return indexes;
}

function startGameIfNeeded() {
  if (isStarted || isGameOver) return;

  isStarted = true;
  startTime = Date.now();
  currentTime = startTime;
  clock = setInterval(timeUpdate, 250);
}

function timeUpdate() {
  if (isGameOver) {
    clearInterval(clock);
    return;
  }

  currentTime = Date.now();
  timerElement.textContent = formatTime(getElapsedSeconds());
}

function getElapsedSeconds() {
  if (!startTime) return 0;
  return Math.min(Math.floor((currentTime - startTime) / 1000), maxScoreSeconds);
}

function formatTime(seconds) {
  return String(seconds).padStart(3, '0');
}

function click(square) {
  if (isGameOver || square.classList.contains('checked') || square.classList.contains('flag')) return;

  const id = Number(square.id);

  if (square.classList.contains('bomb')) {
    gameOver(square);
    return;
  }

  const total = Number(square.dataset.bombs || 0);
  revealSquare(square, total);

  if (total === 0) {
    setTimeout(() => {
      getNeighborIndexes(id).forEach((neighborIndex) => click(squares[neighborIndex]));
    }, 40);
  }

  checkWin();
}

function revealSquare(square, total) {
  square.classList.add('checked');
  square.disabled = true;
  square.textContent = total > 0 ? String(total) : '';
  square.style.color = numberColors[total] || 'gray';
}

function gameOver(triggerSquare) {
  isGameOver = true;
  clearInterval(clock);

  const bombIndex = Number(triggerSquare.id);
  revealBomb(triggerSquare);

  let revealedBombCount = 0;
  squares.forEach((square, index) => {
    if (!square.classList.contains('bomb') || index === bombIndex) return;

    revealedBombCount += 1;
    setTimeout(() => revealBomb(square), revealedBombCount * 250);
  });

  setTimeout(() => {
    Modal.getOrCreateInstance(document.getElementById('gameover-modal')).show();
  }, bombAmount * 250);
}

function revealBomb(square) {
  const colorIndex = Math.floor(Math.random() * bombColors.length);
  square.textContent = 'B';
  square.style.backgroundColor = bombColors[colorIndex];
  square.classList.add('checked');
  square.disabled = true;
}

function addFlag(square) {
  if (isGameOver || square.classList.contains('checked')) return;

  if (!square.classList.contains('flag') && flagCount < bombAmount) {
    square.classList.add('flag');
    square.textContent = 'F';
    flagCount += 1;
  } else if (square.classList.contains('flag')) {
    square.classList.remove('flag');
    square.textContent = '';
    flagCount -= 1;
  }

  flagCounterElement.textContent = String(bombAmount - flagCount).padStart(2, '0');
}

function checkWin() {
  const revealedSafeSquares = squares.filter((square) => (
    square.classList.contains('checked') && !square.classList.contains('bomb')
  )).length;

  if (revealedSafeSquares !== width * width - bombAmount) return;

  isGameOver = true;
  clearInterval(clock);
  finalTimeSeconds = Math.max(1, getElapsedSeconds());

  setTimeout(() => {
    winTimeElement.textContent = String(finalTimeSeconds);
    Modal.getOrCreateInstance(document.getElementById('win-modal')).show();
  }, 400);
}

async function submitScore() {
  const playerName = nameInput.value.trim().slice(0, 24);

  if (!playerName || isSubmitting || finalTimeSeconds < 1) return;

  isSubmitting = true;
  submitButton.disabled = true;
  submitStatus.textContent = 'Saving score...';

  try {
    const user = await ensureAnonymousAuth();
    await addDoc(collection(db, 'leaderboard'), {
      playerName,
      timeSeconds: finalTimeSeconds,
      createdAt: serverTimestamp(),
      uid: user.uid,
    });

    window.location.reload();
  } catch (error) {
    console.error('Failed to save score', error);
    submitStatus.textContent = 'Could not save score. Check Firebase Auth, Firestore, and rules setup.';
    submitButton.disabled = false;
    isSubmitting = false;
  }
}

async function leaderboardLoad() {
  playerInfo.textContent = 'Loading...';

  try {
    const scoresQuery = query(
      collection(db, 'leaderboard'),
      orderBy('timeSeconds', 'asc'),
      orderBy('createdAt', 'asc'),
      limit(leaderboardLimit),
    );
    const snapshot = await getDocs(scoresQuery);
    const scores = snapshot.docs.map((doc) => doc.data());

    renderLeaderboard(scores);
  } catch (error) {
    console.error('Failed to load leaderboard', error);
    playerInfo.textContent = 'Could not load leaderboard.';
  }
}

function renderLeaderboard(scores) {
  playerInfo.replaceChildren();

  if (scores.length === 0) {
    playerInfo.textContent = 'No scores yet.';
    return;
  }

  scores.forEach((score, index) => {
    const row = document.createElement('div');
    const nameColumn = document.createElement('div');
    const timeColumn = document.createElement('div');
    const serial = document.createElement('span');
    const name = document.createElement('span');
    const time = document.createElement('span');

    row.className = 'row playername';
    nameColumn.className = 'col-8';
    timeColumn.className = 'col-4';
    serial.className = 'serial';
    name.className = `nameleader ${getRankClass(index)}`;
    time.className = 'timelead';

    serial.textContent = `${index + 1}.`;
    name.textContent = typeof score.playerName === 'string' ? score.playerName : 'Unknown';
    time.textContent = Number.isInteger(score.timeSeconds) ? String(score.timeSeconds) : '-';

    nameColumn.append(serial, name);
    timeColumn.append(time, document.createTextNode(' seconds'));
    row.append(nameColumn, timeColumn);
    playerInfo.appendChild(row);
  });
}

function getRankClass(index) {
  if (index === 0) return 'firstplayer';
  if (index === 1) return 'secondplayer';
  if (index === 2) return 'thirdplayer';
  return 'noob';
}

function setGameTabLayout(isGameTab) {
  tabContent.classList.toggle('d-flex', isGameTab);
  tabContent.classList.toggle('justify-content-center', isGameTab);
  tabContent.classList.toggle('align-items-center', isGameTab);
}

function bindEvents() {
  document.getElementById('play-tab').addEventListener('click', () => {
    setTimeout(() => setGameTabLayout(true), 150);
  });

  document.getElementById('leaderboard-tab').addEventListener('click', () => {
    setTimeout(() => setGameTabLayout(false), 150);
    leaderboardLoad();
  });

  document.querySelectorAll('.play-again').forEach((button) => {
    button.addEventListener('click', () => window.location.reload());
  });

  submitButton.addEventListener('click', submitScore);
}

createBoard();
bindEvents();
leaderboardLoad();
ensureAnonymousAuth().catch((error) => {
  console.error('Anonymous sign-in failed', error);
  submitStatus.textContent = 'Score submission is unavailable until Firebase Auth is configured.';
});