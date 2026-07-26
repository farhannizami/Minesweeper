const MAX_SCORE_SECONDS = 999;
const BOMB_COLORS = ['red', 'green', 'blue', 'orange', 'yellow', 'purple', 'cyan'];
const NUMBER_COLORS = ['gray', 'blue', 'darkgreen', 'red', 'purple', 'maroon', 'turquoise', 'black'];

export function createGame({ grid, timerElement, flagCounterElement, onWin, onLoss }) {
  let difficulty;
  let squares = [];
  let isGameOver = false;
  let flagCount = 0;
  let isStarted = false;
  let startTime = 0;
  let currentTime = 0;
  let clock;
  let pendingTimers = [];

  function start(nextDifficulty) {
    stopClock();
    clearPendingTimers();
    difficulty = nextDifficulty;
    squares = [];
    isGameOver = false;
    flagCount = 0;
    isStarted = false;
    startTime = 0;
    currentTime = 0;
    timerElement.textContent = '000';
    flagCounterElement.textContent = String(difficulty.mines).padStart(2, '0');
    grid.style.setProperty('--board-size', difficulty.size);
    createBoard();
  }

  function createBoard() {
    const cells = [
      ...Array(difficulty.mines).fill('bomb'),
      ...Array(difficulty.size * difficulty.size - difficulty.mines).fill('empty'),
    ].sort(() => Math.random() - 0.5);

    grid.replaceChildren();
    cells.forEach((cellType, index) => {
      const square = document.createElement('button');
      const row = Math.floor(index / difficulty.size);
      const col = index % difficulty.size;

      square.type = 'button';
      square.classList.add(cellType, 'cell', (row + col) % 2 ? 'odd' : 'even');
      square.setAttribute('aria-label', `Cell ${row + 1}, ${col + 1}`);
      square.addEventListener('click', () => {
        startGameIfNeeded();
        reveal(index);
      });
      square.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        startGameIfNeeded();
        toggleFlag(index);
      });

      grid.append(square);
      squares.push(square);
    });

    squares.forEach((square, index) => {
      if (square.classList.contains('bomb')) return;
      square.dataset.bombs = String(neighbors(index).filter((neighbor) => (
        squares[neighbor].classList.contains('bomb')
      )).length);
    });
  }

  function neighbors(index) {
    const row = Math.floor(index / difficulty.size);
    const col = index % difficulty.size;
    const indexes = [];
    for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
      for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
        if (rowOffset === 0 && colOffset === 0) continue;
        const neighborRow = row + rowOffset;
        const neighborCol = col + colOffset;
        if (neighborRow >= 0 && neighborRow < difficulty.size
          && neighborCol >= 0 && neighborCol < difficulty.size) {
          indexes.push(neighborRow * difficulty.size + neighborCol);
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
    clock = setInterval(updateTime, 250);
  }

  function updateTime() {
    currentTime = Date.now();
    timerElement.textContent = formatTime(elapsedSeconds());
  }

  function elapsedSeconds() {
    return Math.min(Math.floor((currentTime - startTime) / 1000), MAX_SCORE_SECONDS);
  }

  function formatTime(seconds) {
    return String(seconds).padStart(3, '0');
  }

  function reveal(index) {
    const square = squares[index];
    if (isGameOver || square.classList.contains('checked') || square.classList.contains('flag')) return;
    if (square.classList.contains('bomb')) {
      gameOver(index);
      return;
    }

    const bombCount = Number(square.dataset.bombs || 0);
    revealSquare(square, bombCount);
    if (bombCount === 0) neighbors(index).forEach(reveal);
    checkWin();
  }

  function revealSquare(square, bombCount) {
    square.classList.add('checked');
    square.disabled = true;
    square.textContent = bombCount ? String(bombCount) : '';
    square.style.color = NUMBER_COLORS[bombCount] || 'gray';
  }

  function toggleFlag(index) {
    const square = squares[index];
    if (isGameOver || square.classList.contains('checked')) return;
    if (square.classList.contains('flag')) {
      square.classList.remove('flag');
      square.textContent = '';
      flagCount -= 1;
    } else if (flagCount < difficulty.mines) {
      square.classList.add('flag');
      square.textContent = 'F';
      flagCount += 1;
    }
    flagCounterElement.textContent = String(difficulty.mines - flagCount).padStart(2, '0');
  }

  function gameOver(triggerIndex) {
    isGameOver = true;
    stopClock();
    let revealedBombs = 0;
    squares.forEach((square, index) => {
      if (!square.classList.contains('bomb')) return;
      const delay = index === triggerIndex ? 0 : (++revealedBombs) * 100;
      schedule(() => revealBomb(square), delay);
    });
    schedule(onLoss, revealedBombs * 100 + 250);
  }

  function revealBomb(square) {
    square.textContent = 'B';
    square.style.backgroundColor = BOMB_COLORS[Math.floor(Math.random() * BOMB_COLORS.length)];
    square.classList.add('checked');
    square.disabled = true;
  }

  function checkWin() {
    const safeSquares = squares.filter((square) => (
      square.classList.contains('checked') && !square.classList.contains('bomb')
    )).length;
    if (safeSquares !== difficulty.size * difficulty.size - difficulty.mines) return;
    isGameOver = true;
    stopClock();
    onWin(Math.max(1, elapsedSeconds()), difficulty);
  }

  function stopClock() {
    clearInterval(clock);
  }

  function schedule(callback, delay) {
    const timer = setTimeout(() => {
      pendingTimers = pendingTimers.filter((pendingTimer) => pendingTimer !== timer);
      callback();
    }, delay);
    pendingTimers.push(timer);
  }

  function clearPendingTimers() {
    pendingTimers.forEach(clearTimeout);
    pendingTimers = [];
  }

  return { start };
}
