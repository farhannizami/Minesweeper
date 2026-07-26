import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './style.css';
import flagIconUrl from '../images/flag.svg';
import { ensureAnonymousAuth } from './firebase.js';
import { createGame } from './game.js';
import { loadLeaderboard, submitScore } from './leaderboard.js';
import { hideModal, renderDifficultySelector, renderLeaderboard, renderLeaderboardTabs, showModal } from './ui.js';

const grid = document.querySelector('.gridgg');
const gameBox = document.querySelector('.gamebox');
const selector = document.getElementById('difficulty-selector');
const timerElement = document.getElementById('timer');
const flagCounterElement = document.getElementById('flagcounter');
document.getElementById('flag-icon').src = flagIconUrl;
const playerInfo = document.getElementById('playerinfo');
const nameInput = document.getElementById('name');
const submitButton = document.querySelector('.submit');
const submitStatus = document.getElementById('submit-status');
const winTimeElement = document.getElementById('win-time');
const winDifficultyElement = document.getElementById('win-difficulty');

let activeDifficulty = null;
let finalTimeSeconds = 0;
let isSubmitting = false;

const game = createGame({
  grid,
  timerElement,
  flagCounterElement,
  onLoss: () => showModal('gameover-modal'),
  onWin: (time, difficulty) => {
    finalTimeSeconds = time;
    winTimeElement.textContent = String(time);
    winDifficultyElement.textContent = difficulty.label;
    showModal('win-modal');
  },
});

function selectDifficulty(difficulty) {
  activeDifficulty = difficulty;
  selector.hidden = true;
  gameBox.hidden = false;
  game.start(difficulty);
}

function changeDifficulty() {
  activeDifficulty = null;
  finalTimeSeconds = 0;
  selector.hidden = false;
  gameBox.hidden = true;
}

async function refreshLeaderboard(difficulty) {
  playerInfo.textContent = 'Loading...';
  try {
    renderLeaderboard(playerInfo, await loadLeaderboard(difficulty));
  } catch (error) {
    console.error('Failed to load leaderboard', error);
    playerInfo.textContent = 'Could not load leaderboard.';
  }
}

async function saveScore() {
  const playerName = nameInput.value.trim().slice(0, 24);
  if (!playerName || !activeDifficulty || finalTimeSeconds < 1 || isSubmitting) return;
  isSubmitting = true;
  submitButton.disabled = true;
  submitStatus.textContent = 'Saving score...';
  try {
    await submitScore({ playerName, timeSeconds: finalTimeSeconds, difficulty: activeDifficulty });
    hideModal('win-modal');
    nameInput.value = '';
    submitStatus.textContent = '';
    game.start(activeDifficulty);
  } catch (error) {
    console.error('Failed to save score', error);
    submitStatus.textContent = 'Could not save score. Check Firebase Auth, Firestore, and rules setup.';
  } finally {
    isSubmitting = false;
    submitButton.disabled = false;
  }
}

function setGameTabLayout(isGameTab) {
  document.getElementById('myTabContent').classList.toggle('d-flex', isGameTab);
  document.getElementById('myTabContent').classList.toggle('justify-content-center', isGameTab);
  document.getElementById('myTabContent').classList.toggle('align-items-center', isGameTab);
}

renderDifficultySelector(document.getElementById('difficulty-options'), selectDifficulty);
renderLeaderboardTabs(document.getElementById('leaderboard-difficulty-tabs'), refreshLeaderboard);
changeDifficulty();
refreshLeaderboard({ id: 'easy' });

document.getElementById('play-tab').addEventListener('click', () => setTimeout(() => setGameTabLayout(true), 150));
document.getElementById('leaderboard-tab').addEventListener('click', () => setTimeout(() => setGameTabLayout(false), 150));
document.getElementById('change-difficulty').addEventListener('click', changeDifficulty);
document.querySelectorAll('.play-again').forEach((button) => button.addEventListener('click', () => {
  hideModal('gameover-modal');
  if (activeDifficulty) game.start(activeDifficulty);
}));
submitButton.addEventListener('click', saveScore);

ensureAnonymousAuth().catch((error) => {
  console.error('Anonymous sign-in failed', error);
  submitStatus.textContent = 'Score submission is unavailable until Firebase Auth is configured.';
});
