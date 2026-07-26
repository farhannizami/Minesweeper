import { Modal } from 'bootstrap';
import { DIFFICULTY_LIST } from './difficulty.js';

export function renderDifficultySelector(container, onSelect) {
  container.replaceChildren(...DIFFICULTY_LIST.map((difficulty) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'difficulty-card';
    button.innerHTML = `<strong>${difficulty.label}</strong><span>${difficulty.size} × ${difficulty.size}</span><span>${difficulty.mines} mines</span>`;
    button.addEventListener('click', () => onSelect(difficulty));
    return button;
  }));
}

export function renderLeaderboardTabs(container, onSelect) {
  container.replaceChildren(...DIFFICULTY_LIST.map((difficulty, index) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    item.className = 'nav-item';
    item.role = 'presentation';
    button.type = 'button';
    button.className = `nav-link${index === 0 ? ' active' : ''}`;
    button.textContent = difficulty.label;
    button.addEventListener('click', () => {
      container.querySelectorAll('.nav-link').forEach((tab) => tab.classList.remove('active'));
      button.classList.add('active');
      onSelect(difficulty);
    });
    item.append(button);
    return item;
  }));
}

export function renderLeaderboard(container, scores) {
  container.replaceChildren();
  if (scores.length === 0) {
    container.textContent = 'No scores yet.';
    return;
  }
  scores.forEach((score, index) => {
    const row = document.createElement('div');
    row.className = 'row playername';
    row.innerHTML = `<div class="col-8"><span class="serial">${index + 1}.</span><span class="nameleader ${rankClass(index)}"></span></div><div class="col-4"><span class="timelead"></span> seconds</div>`;
    row.querySelector('.nameleader').textContent = typeof score.playerName === 'string' ? score.playerName : 'Unknown';
    row.querySelector('.timelead').textContent = Number.isInteger(score.timeSeconds) ? String(score.timeSeconds) : '-';
    container.append(row);
  });
}

function rankClass(index) {
  return ['firstplayer', 'secondplayer', 'thirdplayer'][index] || 'noob';
}

export function showModal(id) {
  Modal.getOrCreateInstance(document.getElementById(id)).show();
}

export function hideModal(id) {
  Modal.getOrCreateInstance(document.getElementById(id)).hide();
}
