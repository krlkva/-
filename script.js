// ============ ПЕРЕМЕННЫЕ ============
let gameBoard = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
];
let prevGameBoard = [];
let prevGameScore = 0;

let leaderboardList = [];
let gameScore = 0;
let userName = 'user';
let gameIsFinished = false;
let isBoardPaused = false;

// Настройки анимации
let baseSpeed = 100;
let animationSpeed = 100;
const markers = [0.25, 0.50, 0.75, 1, 2, 3, 5, 10];

// Цвета для плиток (градиент)
const tileColors = [
    [237, 216, 190], // 2
    [240, 178, 111], // 4
    [230, 80, 65],   // 8
    [200, 60, 85],   // 16
    [120, 65, 115],  // 32
    [80, 55, 100],   // 64+
];
const maxTileValue = 2048;

// ============ DOM ЭЛЕМЕНТЫ ============
const mainContainer = document.getElementById('main-container');
const boardElement = document.querySelector('.gameboard');
const scoreElement = document.getElementById('current-score');
const bestScoreElement = document.getElementById('best-score');

// Кнопки
const undoBtn = document.querySelector('.undo-btn');
const resetBtn = document.querySelector('.reset-btn');
const leaderboardBtn = document.querySelector('.leaderboard-btn');
const speedControlBtn = document.querySelector('.speed-control-btn');
const speedControlSpan = speedControlBtn?.querySelector('span:last-child');

// Модальные окна
const victoryWrapper = document.querySelector('.victory-wrapper');
const victoryScreen = document.querySelector('.victory');
const victoryScore = document.getElementById('victory-score');
const victoryForm = document.getElementById('victory-form');
const victoryNameInput = document.getElementById('player-name');
const victorySaveConfirm = document.querySelector('.victory__title-confirm');
const victoryRecord = document.querySelector('.victory__title-record');
const victoryBest = document.querySelector('.victory__title-best');
const victorySave = document.querySelector('.victory__title-save');
const victoryGif = document.querySelector('.victory__gif');
const victoryReset = document.querySelector('.victory__reset');

const leaderboardWrapper = document.querySelector('.leaderboard-wrapper');
const leaderboardList = document.querySelector('.leaderboard__list');
const speedWrapper = document.querySelector('.speed-wrapper');
const speedSlider = document.querySelector('.speed-control__slider input');
const nukeBtn = document.querySelector('.nuke');

// Виртуальные кнопки
const controlArrows = document.querySelectorAll('.controls__arrow');

// ============ ИНИЦИАЛИЗАЦИЯ ПОЛЯ ============
function createGameBoard() {
    boardElement.innerHTML = '';
    for (let i = 0; i < 16; i++) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('gameboard__tile-wrapper');
        const tile = document.createElement('div');
        tile.classList.add('gameboard__tile');
        wrapper.appendChild(tile);
        boardElement.appendChild(wrapper);
    }
}
createGameBoard();

// Получаем все плитки
const visualTiles = document.querySelectorAll('.gameboard__tile');

// ============ УТИЛИТЫ ============
function sanitize(string) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    };
    const reg = /[&<>"'/]/ig;
    return string.replace(reg, (match) => map[match]);
}

function getRandomInteger(max) {
    return Math.floor(Math.random() * max);
}

function getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
}

// ============ СЧЁТ ============
function updateScore(newAmount) {
    gameScore = Math.max(0, gameScore + newAmount);
    scoreElement.textContent = gameScore;
    localStorage.setItem('game-score', JSON.stringify(gameScore));
    updateBestScore();
}

function updateBestScore() {
    if (leaderboardList.length > 0) {
        const bestScore = [...leaderboardList].sort(compareScore)[0].score;
        bestScoreElement.textContent = gameScore > bestScore ? gameScore : bestScore;
    } else {
        bestScoreElement.textContent = gameScore;
    }
}

// ============ ЛОГИКА ДВИЖЕНИЯ ============
function moveTileList(tiles) {
    const movedTiles = [];
    const gameBoardWidth = document.querySelector('.gameboard')?.offsetWidth || 400;
    const tileWidth = document.querySelector('.gameboard__tile')?.offsetWidth || 80;
    const ratio = (gameBoardWidth / tileWidth - 4) / 10;

    for (let k = 0; k < 4; k++) {
        if (tiles[k] === 0) {
            for (let l = k + 1; l < 4; l++) {
                if (tiles[l] !== 0) {
                    tiles[k] = tiles[l];
                    tiles[l] = 0;
                    movedTiles.push([l, k, (l - k + ratio * 2 * (l - k))]);
                    break;
                }
            }
        }

        if (tiles[k] !== 0) {
            for (let l = k + 1; l < 4; l++) {
                if (tiles[l] === 0) continue;
                if (tiles[l] === tiles[k]) {
                    tiles[k] = tiles[l] * 2;
                    tiles[l] = 0;
                    movedTiles.push([l, k, (l - k + ratio * 2 * (l - k))]);
                }
                break;
            }
        }
    }
    return movedTiles;
}

function moveBoardUp() {
    const movedTiles = [];
    for (let j = 0; j < 4; j++) {
        const column = [];
        for (let k = 0; k < 4; k++) column.push(gameBoard[k][j]);
        const movedColumnTiles = moveTileList(column);
        movedColumnTiles.forEach(tile => {
            movedTiles.push([[tile[0], j], [tile[1], j], `0%, ${-tile[2] * 100}%`]);
        });
    }
    return movedTiles;
}

function moveBoardDown() {
    const movedTiles = [];
    for (let j = 0; j < 4; j++) {
        const column = [];
        for (let k = 3; k >= 0; k--) column.push(gameBoard[k][j]);
        const movedColumnTiles = moveTileList(column);
        movedColumnTiles.forEach(tile => {
            movedTiles.push([[3 - tile[0], j], [3 - tile[1], j], `0%, ${tile[2] * 100}%`]);
        });
    }
    return movedTiles;
}

function moveBoardLeft() {
    const movedTiles = [];
    for (let i = 0; i < 4; i++) {
        const row = [];
        for (let k = 0; k < 4; k++) row.push(gameBoard[i][k]);
        const movedRowTiles = moveTileList(row);
        movedRowTiles.forEach(tile => {
            movedTiles.push([[i, tile[0]], [i, tile[1]], `${-tile[2] * 100}%, 0%`]);
        });
    }
    return movedTiles;
}

function moveBoardRight() {
    const movedTiles = [];
    for (let i = 0; i < 4; i++) {
        const row = [];
        for (let k = 3; k >= 0; k--) row.push(gameBoard[i][k]);
        const movedRowTiles = moveTileList(row);
        movedRowTiles.forEach(tile => {
            movedTiles.push([[i, 3 - tile[0]], [i, 3 - tile[1]], `${tile[2] * 100}%, 0%`]);
        });
    }
    return movedTiles;
}

function collectMovedTiles(direction) {
    direction = direction.toLowerCase();
    switch (direction) {
        case 'up': return moveBoardUp();
        case 'down': return moveBoardDown();
        case 'left': return moveBoardLeft();
        case 'right': return moveBoardRight();
        default: return [];
    }
}

// ============ АНИМАЦИЯ ============
function animateTile(type, tile, shift = '0%, 0%') {
    let animation;
    switch (type) {
        case 'appeared':
            animation = tile.animate(
                [{ transform: 'scale(0)' }, { transform: 'scale(1)' }],
                { duration: animationSpeed, iterations: 1, delay: animationSpeed - 10 }
            );
            break;
        case 'combined':
            animation = tile.animate(
                [{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }],
                { duration: animationSpeed, iterations: 1 }
            );
            break;
        case 'moved':
            animation = tile.animate(
                [{ transform: 'translate(0)' }, { transform: `translate(${shift})` }],
                { duration: animationSpeed, iterations: 1, fill: 'forwards' }
            );
            break;
    }
    return animation;
}

// ============ ОСНОВНОЙ ХОД ============
function updateBoardMove(direction) {
    if (isBoardPaused || gameIsFinished) return;
    
    prevGameScore = gameScore;
    isBoardPaused = true;
    if (speedSlider) speedSlider.disabled = true;
    
    const movedTiles = collectMovedTiles(direction);
    if (movedTiles.length === 0) {
        isBoardPaused = false;
        if (speedSlider) speedSlider.disabled = false;
        return;
    }
    
    // Сохраняем предыдущее состояние
    prevGameBoard = JSON.parse(JSON.stringify(gameBoard));
    undoBtn.classList.remove('disabled');
    
    // Анимация движения
    const animations = [];
    movedTiles.forEach(tile => {
        const tileElement = visualTiles[tile[0][0] * 4 + tile[0][1]];
        animations.push(animateTile('moved', tileElement, tile[2]));
    });
    
    setTimeout(() => {
        animations.forEach(anim => anim.cancel());
        
        movedTiles.forEach(tile => {
            const oldVal = gameBoard[tile[0][0]][tile[0][1]];
            const newVal = gameBoard[tile[1][0]][tile[1][1]];
            
            if (oldVal !== newVal) {
                gameBoard[tile[0][0]][tile[0][1]] = 0;
                gameBoard[tile[1][0]][tile[1][1]] = oldVal;
            } else {
                gameBoard[tile[0][0]][tile[0][1]] = 0;
                gameBoard[tile[1][0]][tile[1][1]] = oldVal * 2;
                updateScore(oldVal * 2);
                
                const visualTile = visualTiles[tile[1][0] * 4 + tile[1][1]];
                animateTile('combined', visualTile);
                visualTile.classList.add('active-tile-combined');
            }
        });
        
        updateBoardVisual();
        addNewRandomTile();
        
        setTimeout(() => {
            if (getFreeTiles().length === 0 && !areMovesAvailable()) {
                finishGame();
                return;
            }
            resetActiveTiles();
            isBoardPaused = false;
            if (speedSlider) speedSlider.disabled = false;
        }, animationSpeed * 1.5);
    }, animationSpeed);
}

// ============ ПРОВЕРКА ДОСТУПНЫХ ХОДОВ ============
function areMovesAvailable() {
    return ['left', 'right', 'up', 'down'].some(dir => collectMovedTiles(dir).length > 0);
}

// ============ СВОБОДНЫЕ КЛЕТКИ ============
function getFreeTiles() {
    const free = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (gameBoard[i][j] === 0) free.push([i, j]);
        }
    }
    return free;
}

// ============ ДОБАВЛЕНИЕ НОВОЙ ПЛИТКИ ============
function addNewRandomTile() {
    const freeTiles = getFreeTiles();
    if (freeTiles.length === 0) return false;
    
    const [row, col] = freeTiles[getRandomInteger(freeTiles.length)];
    const tileValue = Math.random() < 0.85 ? 2 : 4;
    gameBoard[row][col] = tileValue;
    animateTile('appeared', visualTiles[row * 4 + col]);
    return true;
}

// ============ ОТМЕНА ХОДА ============
function undoMove() {
    if (prevGameBoard.length === 0 || gameIsFinished) return;
    
    gameBoard = JSON.parse(JSON.stringify(prevGameBoard));
    updateBoardVisual();
    updateScore((prevGameScore - gameScore) * 2);
    prevGameBoard = [];
    undoBtn.classList.add('disabled');
}

// ============ ЗАВЕРШЕНИЕ ИГРЫ ============
function finishGame() {
    gameIsFinished = true;
    isBoardPaused = true;
    
    victoryScore.textContent = `Вы набрали ${gameScore} очков`;
    victoryWrapper.classList.remove('hidden');
    
    // Проверка рекорда
    const isNew = isNewRecord(gameScore);
    victoryRecord.classList.add('hidden');
    victoryBest.classList.add('hidden');
    victorySave.classList.remove('hidden');
    victoryForm.classList.remove('hidden');
    victorySaveConfirm.classList.add('hidden');
    victoryGif.classList.add('hidden');
    
    if (isNew) {
        victorySave.classList.remove('hidden');
        victoryNameInput.value = userName;
        
        if (leaderboardList.length === 0 || gameScore > [...leaderboardList].sort(compareScore)[0]?.score) {
            victoryBest.classList.remove('hidden');
            victoryGif.classList.remove('hidden');
        } else {
            victoryRecord.classList.remove('hidden');
        }
    } else {
        victorySave.classList.add('hidden');
        victoryForm.classList.add('hidden');
    }
}

// ============ НОВАЯ ИГРА ============
function startNewGame() {
    gameIsFinished = false;
    isBoardPaused = false;
    victoryWrapper.classList.add('hidden');
    
    gameBoard = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    prevGameBoard = [];
    prevGameScore = 0;
    gameScore = 0;
    
    updateScore(0);
    updateBoardVisual();
    updateBestScore();
    
    // Добавляем 1-3 случайных плитки
    const tilesCount = getRandomInteger(3) + 1;
    for (let i = 0; i < tilesCount; i++) {
        addNewRandomTile();
    }
    
    setTimeout(() => updateBoardVisual(), animationSpeed);
}

// ============ ВИЗУАЛИЗАЦИЯ ПОЛЯ ============
function updateBoardVisual() {
    undoBtn.classList.toggle('disabled', prevGameBoard.length === 0);
    
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const tile = visualTiles[i * 4 + j];
            const value = gameBoard[i][j];
            
            tile.setAttribute('tile-value', value);
            tile.textContent = value || '';
            tile.classList.toggle('active-tile', value !== 0);
            
            changeTileColor(tile);
        }
    }
    
    if (!gameIsFinished) {
        localStorage.setItem('game-board', JSON.stringify(gameBoard));
    }
}

// ============ ЦВЕТ ПЛИТКИ ============
function pickHex(color1, color2, weight) {
    const w2 = weight;
    const w1 = 1 - w2;
    return [
        Math.round(color1[0] * w1 + color2[0] * w2),
        Math.round(color1[1] * w1 + color2[1] * w2),
        Math.round(color1[2] * w1 + color2[2] * w2)
    ];
}

function changeTileColor(tile) {
    const value = parseInt(tile.getAttribute('tile-value'));
    if (!value) {
        tile.style.background = '';
        return;
    }
    
    const percent = Math.min(1, getBaseLog(2, value) / getBaseLog(2, maxTileValue));
    const gradientIndex = Math.floor(percent * 100 / 25);
    const idx = Math.min(gradientIndex, tileColors.length - 2);
    
    const color1 = tileColors[idx];
    const color2 = tileColors[Math.min(idx + 1, tileColors.length - 1)];
    const weight = (percent * 100 / 25) - idx;
    
    const rgb = pickHex(color1, color2, weight);
    tile.style.background = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    tile.style.color = value > 128 ? 'white' : '#1e293b';
}

function resetActiveTiles() {
    visualTiles.forEach(tile => tile.classList.remove('active-tile-combined'));
}

// ============ ТАБЛИЦА ЛИДЕРОВ ============
function compareScore(a, b) {
    return b.score - a.score;
}

function isNewRecord(newScore) {
    if (leaderboardList.length < 10) return true;
    leaderboardList.sort(compareScore);
    return leaderboardList[leaderboardList.length - 1].score < newScore;
}

function addToLeaderboard(newName, newScore, newDate) {
    if (!isNewRecord(newScore)) return;
    
    leaderboardList.sort(compareScore);
    if (leaderboardList.length >= 10) leaderboardList.pop();
    
    leaderboardList.push({
        name: sanitize(newName) || 'Аноним',
        date: newDate,
        score: newScore
    });
    
    localStorage.setItem('leaderboard', JSON.stringify(leaderboardList));
    populateLeaderboard();
}

function populateLeaderboard() {
    leaderboardList.sort(compareScore);
    leaderboardList.innerHTML = '';
    
    leaderboardList.forEach(entry => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${entry.name}</span> <span>${entry.score}</span> <span>${entry.date}</span>`;
        leaderboardList.appendChild(li);
    });
    
    for (let i = leaderboardList.length; i < 10; i++) {
        const li = document.createElement('li');
        li.innerHTML = `<span>...</span> <span>0</span> <span>----</span>`;
        leaderboardList.appendChild(li);
    }
}

// ============ ОБРАБОТЧИКИ СОБЫТИЙ ============

// Кнопки управления
undoBtn.addEventListener('click', undoMove);

resetBtn.addEventListener('click', () => {
    if (confirm('Начать новую игру?')) startNewGame();
});

leaderboardBtn.addEventListener('click', () => {
    populateLeaderboard();
    leaderboardWrapper.classList.remove('hidden');
});

// Кнопки направления
controlArrows.forEach(btn => {
    btn.addEventListener('click', () => updateBoardMove(btn.dataset.direction));
});

// Клавиатура
document.addEventListener('keydown', (e) => {
    if (e.key.startsWith('Arrow') && !gameIsFinished && !isBoardPaused && leaderboardWrapper.classList.contains('hidden') && victoryWrapper.classList.contains('hidden')) {
        e.preventDefault();
        updateBoardMove(e.key.slice(5));
    }
});

// Сохранение рекорда
victoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addToLeaderboard(victoryNameInput.value, gameScore, new Date().toISOString().slice(0, 10));
    
    victoryForm.classList.add('hidden');
    victorySave.classList.add('hidden');
    victorySaveConfirm.classList.remove('hidden');
    
    userName = sanitize(victoryNameInput.value);
    localStorage.setItem('user-name', userName);
});

victoryReset.addEventListener('click', startNewGame);

// Закрытие модальных окон
document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        victoryWrapper.classList.add('hidden');
        leaderboardWrapper.classList.add('hidden');
        speedWrapper.classList.add('hidden');
    });
});

// Скорость
speedControlBtn?.addEventListener('click', () => speedWrapper.classList.remove('hidden'));

speedSlider?.addEventListener('change', (e) => {
    animationSpeed = baseSpeed * (1 / markers[e.target.value]);
    localStorage.setItem('game-speed', animationSpeed);
    if (speedControlSpan) speedControlSpan.textContent = `x${markers[e.target.value]}`;
});

// Сброс
nukeBtn?.addEventListener('click', () => {
    if (confirm('Удалить все сохранения?')) {
        localStorage.clear();
        leaderboardList = [];
        startNewGame();
        populateLeaderboard();
    }
});

// Закрытие по клику на фон
[victoryWrapper, leaderboardWrapper, speedWrapper].forEach(wrapper => {
    wrapper.addEventListener('click', (e) => {
        if (e.target === wrapper) wrapper.classList.add('hidden');
    });
});

// ============ ЗАГРУЗКА ИЗ LOCALSTORAGE ============

// Лидерборд
if (localStorage.getItem('leaderboard')) {
    leaderboardList = JSON.parse(localStorage.getItem('leaderboard'));
    updateBestScore();
}

// Состояние игры
if (localStorage.getItem('game-board')) {
    gameBoard = JSON.parse(localStorage.getItem('game-board'));
    gameScore = JSON.parse(localStorage.getItem('game-score')) || 0;
    scoreElement.textContent = gameScore;
    updateBoardVisual();
} else {
    startNewGame();
}

// Скорость
if (localStorage.getItem('game-speed')) {
    animationSpeed = JSON.parse(localStorage.getItem('game-speed'));
    const speedIndex = markers.indexOf(Number((baseSpeed / animationSpeed).toFixed(2)));
    if (speedSlider && speedIndex >= 0) {
        speedSlider.value = speedIndex;
        if (speedControlSpan) speedControlSpan.textContent = `x${markers[speedIndex]}`;
    }
}

// Имя пользователя
if (localStorage.getItem('user-name')) {
    userName = localStorage.getItem('user-name');
}

// Инициализация лидерборда
populateLeaderboard();
