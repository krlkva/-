// ===== ПЕРЕМЕННЫЕ =====
let gameBoard = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
];
let prevGameBoard = [];
let leaderboardList = [];
let gameScore = 0;
let prevGameScore = 0;
let tileFont = 2.25;
let tileFontRate = 0.125;
let maxTileValue = 2048;
let userName = 'user';
let gameIsFinished = false;
let isBoardPaused = false;
let baseSpeed = 100;
let animationSpeed = 150;

const markers = [0.25, 0.5, 0.75, 1, 2, 3, 5, 10];

// ===== DOM ЭЛЕМЕНТЫ =====
const board = document.querySelector('.gameboard');
const elemScore = document.getElementById('current-score');
const elemBest = document.getElementById('best-score');
const undoBtn = document.getElementById('undo-move');
const newGameBtn = document.getElementById('new-game');
const leaderboardBtn = document.getElementById('show-leaders');
const speedBtn = document.getElementById('speed-control');
const speedDisplay = document.getElementById('speed-display');
const victoryModal = document.getElementById('victory-modal');
const leaderboardModal = document.getElementById('leaderboard-modal');
const speedModal = document.getElementById('speed-modal');
const victoryScore = document.getElementById('victory-score');
const recordMessage = document.getElementById('record-message');
const bestMessage = document.getElementById('best-message');
const saveMessage = document.getElementById('save-message');
const victoryGif = document.getElementById('victory-gif');
const victoryForm = document.getElementById('victory-form');
const savedConfirm = document.getElementById('saved-confirm');
const playerName = document.getElementById('player-name');
const restartGame = document.getElementById('restart-game');
const leaderboardList = document.getElementById('leaderboard-list');
const speedSlider = document.getElementById('speed-slider');
const nukeBtn = document.getElementById('nuke');
const controlsBtns = document.querySelectorAll('.controls__arrow');

// ===== СОЗДАНИЕ ПОЛЯ =====
function createBoard() {
    board.innerHTML = '';
    for (let i = 0; i < 16; i++) {
        let tile = document.createElement('div');
        tile.classList.add('gameboard__tile');
        tile.setAttribute('data-value', '0');
        board.appendChild(tile);
    }
}
createBoard();
const visualTiles = document.querySelectorAll('.gameboard__tile');

// ===== ФУНКЦИИ =====
function updateScore(newAmount) {
    gameScore = Math.max(0, gameScore + newAmount);
    elemScore.textContent = gameScore;
    localStorage.setItem('game-score', JSON.stringify(gameScore));
    updateBestScore();
}

function updateBestScore() {
    if (leaderboardList.length > 0) {
        let bestScore = [...leaderboardList].sort((a, b) => b.score - a.score)[0].score;
        elemBest.textContent = gameScore > bestScore ? gameScore : bestScore;
    } else {
        elemBest.textContent = gameScore;
    }
}

function getFreeTiles() {
    let free = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (gameBoard[i][j] === 0) free.push([i, j]);
        }
    }
    return free;
}

function addNewRandomTile() {
    let free = getFreeTiles();
    if (free.length === 0) return false;
    
    let [row, col] = free[Math.floor(Math.random() * free.length)];
    let value = Math.random() < 0.9 ? 2 : 4;
    gameBoard[row][col] = value;
    
    let tile = visualTiles[row * 4 + col];
    tile.classList.add('tile-appear');
    setTimeout(() => tile.classList.remove('tile-appear'), animationSpeed);
    
    return true;
}

function moveTileList(tiles) {
    let moved = [];
    let filtered = tiles.filter(v => v !== 0);
    let merged = [];
    let used = new Array(filtered.length).fill(false);
    
    for (let i = 0; i < filtered.length; i++) {
        if (used[i]) continue;
        if (i < filtered.length - 1 && filtered[i] === filtered[i + 1] && !used[i + 1]) {
            merged.push(filtered[i] * 2);
            used[i] = used[i + 1] = true;
        } else {
            merged.push(filtered[i]);
            used[i] = true;
        }
    }
    
    while (merged.length < 4) merged.push(0);
    
    for (let i = 0; i < 4; i++) {
        if (tiles[i] !== merged[i]) {
            moved.push([i, merged[i]]);
        }
    }
    
    return { merged, moved };
}

function moveLeft() {
    let moved = [];
    let scoreGain = 0;
    
    for (let i = 0; i < 4; i++) {
        let row = gameBoard[i];
        let { merged, moved: movedCells } = moveTileList(row);
        
        for (let m of movedCells) {
            if (m[1] > row[m[0]]) {
                scoreGain += m[1];
            }
        }
        
        gameBoard[i] = merged;
    }
    
    return { moved: moved.length > 0, scoreGain };
}

function moveRight() {
    let moved = [];
    let scoreGain = 0;
    
    for (let i = 0; i < 4; i++) {
        let row = [...gameBoard[i]].reverse();
        let { merged, moved: movedCells } = moveTileList(row);
        
        for (let m of movedCells) {
            if (m[1] > row[m[0]]) {
                scoreGain += m[1];
            }
        }
        
        gameBoard[i] = merged.reverse();
    }
    
    return { moved: moved.length > 0, scoreGain };
}

function moveUp() {
    let moved = [];
    let scoreGain = 0;
    
    for (let j = 0; j < 4; j++) {
        let col = [gameBoard[0][j], gameBoard[1][j], gameBoard[2][j], gameBoard[3][j]];
        let { merged, moved: movedCells } = moveTileList(col);
        
        for (let m of movedCells) {
            if (m[1] > col[m[0]]) {
                scoreGain += m[1];
            }
        }
        
        for (let i = 0; i < 4; i++) {
            gameBoard[i][j] = merged[i];
        }
    }
    
    return { moved: moved.length > 0, scoreGain };
}

function moveDown() {
    let moved = [];
    let scoreGain = 0;
    
    for (let j = 0; j < 4; j++) {
        let col = [gameBoard[3][j], gameBoard[2][j], gameBoard[1][j], gameBoard[0][j]];
        let { merged, moved: movedCells } = moveTileList(col);
        
        for (let m of movedCells) {
            if (m[1] > col[m[0]]) {
                scoreGain += m[1];
            }
        }
        
        let result = merged.reverse();
        for (let i = 0; i < 4; i++) {
            gameBoard[i][j] = result[i];
        }
    }
    
    return { moved: moved.length > 0, scoreGain };
}

function canMove() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (gameBoard[i][j] === 0) return true;
            if (j < 3 && gameBoard[i][j] === gameBoard[i][j + 1]) return true;
            if (i < 3 && gameBoard[i][j] === gameBoard[i + 1][j]) return true;
        }
    }
    return false;
}

function updateBoardVisual() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            let tile = visualTiles[i * 4 + j];
            let value = gameBoard[i][j];
            tile.setAttribute('data-value', value);
            tile.textContent = value || '';
            
            let size = Math.max(1, tileFont - tileFontRate * value.toString().length);
            tile.style.fontSize = size + 'rem';
        }
    }
    
    undoBtn.disabled = prevGameBoard.length === 0;
    localStorage.setItem('game-board', JSON.stringify(gameBoard));
}

function makeMove(direction) {
    if (isBoardPaused || gameIsFinished) return;
    
    prevGameBoard = JSON.parse(JSON.stringify(gameBoard));
    prevGameScore = gameScore;
    
    let result;
    switch(direction) {
        case 'left': result = moveLeft(); break;
        case 'right': result = moveRight(); break;
        case 'up': result = moveUp(); break;
        case 'down': result = moveDown(); break;
        default: return;
    }
    
    if (!result.moved) {
        prevGameBoard = [];
        return;
    }
    
    gameScore += result.scoreGain;
    updateBoardVisual();
    
    isBoardPaused = true;
    
    setTimeout(() => {
        addNewRandomTile();
        updateBoardVisual();
        
        if (!canMove()) {
            gameIsFinished = true;
            finishGame();
        }
        
        isBoardPaused = false;
    }, animationSpeed);
}

function undoMove() {
    if (prevGameBoard.length === 0 || gameIsFinished || isBoardPaused) return;
    
    gameBoard = JSON.parse(JSON.stringify(prevGameBoard));
    gameScore = prevGameScore;
    updateBoardVisual();
    
    prevGameBoard = [];
    prevGameScore = 0;
    undoBtn.disabled = true;
}

function finishGame() {
    victoryScore.textContent = `You scored ${gameScore} points.`;
    
    let isRecord = false;
    if (leaderboardList.length < 10) isRecord = true;
    else {
        let sorted = [...leaderboardList].sort((a, b) => b.score - a.score);
        if (gameScore > sorted[sorted.length - 1].score) isRecord = true;
    }
    
    recordMessage.style.display = 'none';
    bestMessage.style.display = 'none';
    saveMessage.style.display = 'none';
    victoryGif.style.display = 'none';
    victoryForm.style.display = 'none';
    savedConfirm.style.display = 'none';
    
    if (isRecord) {
        saveMessage.style.display = 'block';
        victoryForm.style.display = 'flex';
        
        let best = leaderboardList.length === 0 || gameScore > [...leaderboardList].sort((a, b) => b.score - a.score)[0]?.score;
        if (best) {
            bestMessage.style.display = 'block';
            victoryGif.style.display = 'block';
        } else {
            recordMessage.style.display = 'block';
        }
    }
    
    playerName.value = userName;
    victoryModal.classList.add('active');
    document.body.classList.add('stop-scrolling');
}

function startNewGame() {
    gameBoard = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    gameScore = 0;
    prevGameBoard = [];
    prevGameScore = 0;
    gameIsFinished = false;
    isBoardPaused = false;
    
    updateBoardVisual();
    updateScore(0);
    
    for (let i = 0; i < 3; i++) {
        addNewRandomTile();
    }
    
    victoryModal.classList.remove('active');
    document.body.classList.remove('stop-scrolling');
    undoBtn.disabled = true;
}

// ===== ЛИДЕРБОРД =====
function loadLeaderboard() {
    let saved = localStorage.getItem('leaderboard');
    if (saved) leaderboardList = JSON.parse(saved);
}

function saveLeaderboard() {
    localStorage.setItem('leaderboard', JSON.stringify(leaderboardList));
}

function addToLeaderboard(name, score) {
    leaderboardList.push({
        name: name || 'user',
        score: score,
        date: new Date().toLocaleDateString('ru-RU')
    });
    leaderboardList.sort((a, b) => b.score - a.score);
    if (leaderboardList.length > 10) leaderboardList.pop();
    saveLeaderboard();
    renderLeaderboard();
}

function renderLeaderboard() {
    leaderboardList.innerHTML = '';
    leaderboardList.sort((a, b) => b.score - a.score);
    
    for (let entry of leaderboardList) {
        let li = document.createElement('li');
        li.innerHTML = `${entry.name} - ${entry.score} (${entry.date})`;
        leaderboardList.appendChild(li);
    }
    
    for (let i = leaderboardList.length; i < 10; i++) {
        let li = document.createElement('li');
        li.innerHTML = '... - 0 (----)';
        leaderboardList.appendChild(li);
    }
}

// ===== СОБЫТИЯ =====
document.addEventListener('keydown', (e) => {
    if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        let dir = e.key.slice(5).toLowerCase();
        makeMove(dir);
    }
});

controlsBtns.forEach(btn => {
    btn.addEventListener('click', () => makeMove(btn.dataset.direction));
});

newGameBtn.addEventListener('click', () => {
    if (confirm('Начать новую игру?')) startNewGame();
});

undoBtn.addEventListener('click', undoMove);

leaderboardBtn.addEventListener('click', () => {
    renderLeaderboard();
    leaderboardModal.classList.add('active');
    document.body.classList.add('stop-scrolling');
});

speedBtn.addEventListener('click', () => {
    speedModal.classList.add('active');
    document.body.classList.add('stop-scrolling');
    isBoardPaused = true;
});

speedSlider.addEventListener('input', (e) => {
    let val = e.target.value;
    animationSpeed = baseSpeed * (1 / markers[val]);
    speedDisplay.textContent = 'x' + markers[val];
});

victoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addToLeaderboard(playerName.value, gameScore);
    victoryForm.style.display = 'none';
    saveMessage.style.display = 'none';
    recordMessage.style.display = 'none';
    bestMessage.style.display = 'none';
    victoryGif.style.display = 'none';
    savedConfirm.style.display = 'block';
});

restartGame.addEventListener('click', () => {
    victoryModal.classList.remove('active');
    document.body.classList.remove('stop-scrolling');
    startNewGame();
});

// Закрытие модалок
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
        victoryModal.classList.remove('active');
        leaderboardModal.classList.remove('active');
        speedModal.classList.remove('active');
        document.body.classList.remove('stop-scrolling');
        isBoardPaused = false;
    });
});

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
            document.body.classList.remove('stop-scrolling');
            isBoardPaused = false;
        }
    });
});

nukeBtn.addEventListener('click', () => {
    if (confirm('Удалить все сохранения?')) {
        localStorage.clear();
        leaderboardList = [];
        startNewGame();
        renderLeaderboard();
    }
});

// ===== ЗАГРУЗКА =====
loadLeaderboard();

if (localStorage.getItem('game-board')) {
    gameBoard = JSON.parse(localStorage.getItem('game-board'));
    gameScore = JSON.parse(localStorage.getItem('game-score')) || 0;
    updateBoardVisual();
    elemScore.textContent = gameScore;
} else {
    startNewGame();
}

if (localStorage.getItem('game-speed')) {
    animationSpeed = JSON.parse(localStorage.getItem('game-speed'));
    let speed = baseSpeed / animationSpeed;
    let ind = markers.indexOf(Number(speed.toFixed(2)));
    if (ind >= 0) {
        speedSlider.value = ind;
        speedDisplay.textContent = 'x' + markers[ind];
    }
}

renderLeaderboard();
