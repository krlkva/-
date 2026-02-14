// ===== СОСТОЯНИЕ =====
let board = [
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0]
];
let previousBoard = [];
let previousScore = 0;
let score = 0;
let bestScore = 0;
let gameOver = false;
let boardPaused = false;

// Для анимации
let tileElements = [];
let tilePositions = [];
let animating = false;

// Анимация
let animationSpeed = 150;
const speedMarkers = [0.25, 0.5, 0.75, 1, 2, 3, 5, 10];

// Лидерборд
let leaderboard = [];

// ===== DOM ЭЛЕМЕНТЫ =====
const boardElement = document.getElementById('board');
const scoreDisplay = document.getElementById('score-display');
const bestDisplay = document.getElementById('best-display');

// Чекбоксы
const newGameCheck = document.getElementById('new-game');
const undoCheck = document.getElementById('undo-move');
const leaderboardCheck = document.getElementById('show-leaders');
const speedCheck = document.getElementById('speed-control');
const speedDisplay = document.getElementById('speed-display');

// Модалки
const gameoverModal = document.getElementById('gameover-modal');
const leaderboardModal = document.getElementById('leaderboard-modal');
const speedModal = document.getElementById('speed-modal');
const finalScore = document.getElementById('final-score');
const recordMessage = document.getElementById('record-message');
const saveMessage = document.getElementById('save-message');
const congratsMessage = document.getElementById('congrats-message');
const nameInputRow = document.getElementById('name-input-row');
const playerName = document.getElementById('player-name');
const saveBtn = document.getElementById('save-score-btn');
const restartCheck = document.getElementById('restart-checkbox');
const closeLeaderboard = document.getElementById('close-leaderboard');
const closeSpeed = document.getElementById('close-speed');
const speedSlider = document.getElementById('speed-slider');
const leaderboardList = document.getElementById('leaderboard-list');

// Кнопки
const mobileBtns = document.querySelectorAll('.mobile-btn');

// ===== ИНИЦИАЛИЗАЦИЯ ПОЛЯ =====
function createBoard() {
    boardElement.innerHTML = '';
    tileElements = [];
    
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.setAttribute('data-row', i);
            tile.setAttribute('data-col', j);
            tile.setAttribute('data-value', '0');
            
            const tileInner = document.createElement('div');
            tileInner.className = 'tile-inner';
            tile.appendChild(tileInner);
            
            boardElement.appendChild(tile);
            tileElements.push(tile);
        }
    }
    
    updateTilePositions();
}
createBoard();

// ===== ОБНОВЛЕНИЕ ПОЗИЦИЙ =====
function updateTilePositions() {
    tilePositions = [];
    tileElements.forEach(tile => {
        const rect = tile.getBoundingClientRect();
        const boardRect = boardElement.getBoundingClientRect();
        tilePositions.push({
            row: parseInt(tile.dataset.row),
            col: parseInt(tile.dataset.col),
            left: rect.left - boardRect.left,
            top: rect.top - boardRect.top,
            width: rect.width,
            height: rect.height
        });
    });
}

// ===== ОБНОВЛЕНИЕ ПОЛЯ =====
function updateBoard() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const tile = tileElements[i * 4 + j];
            const value = board[i][j];
            
            tile.setAttribute('data-value', value);
            const tileInner = tile.querySelector('.tile-inner');
            if (tileInner) {
                tileInner.textContent = value || '';
            }
            
            if (value === 0) {
                tile.classList.add('empty');
            } else {
                tile.classList.remove('empty');
            }
        }
    }
    
    scoreDisplay.textContent = score;
    if (score > bestScore) {
        bestScore = score;
        bestDisplay.textContent = bestScore;
        localStorage.setItem('2048-best', bestScore);
    }
    
    setTimeout(updateTilePositions, 10);
}

// ===== АНИМАЦИЯ ДВИЖЕНИЯ =====
function animateMove(moves) {
    return new Promise(resolve => {
        if (moves.length === 0) {
            resolve();
            return;
        }
        
        animating = true;
        const animTiles = [];
        
        moves.forEach(move => {
            const { fromRow, fromCol, toRow, toCol } = move;
            const fromIndex = fromRow * 4 + fromCol;
            const toIndex = toRow * 4 + toCol;
            
            const value = board[fromRow][fromCol];
            if (value === 0) return;
            
            const flyingTile = document.createElement('div');
            flyingTile.className = 'flying-tile';
            flyingTile.textContent = value;
            flyingTile.setAttribute('data-value', value);
            
            const boardRect = boardElement.getBoundingClientRect();
            const fromPos = tilePositions[fromIndex];
            
            flyingTile.style.width = fromPos.width + 'px';
            flyingTile.style.height = fromPos.height + 'px';
            flyingTile.style.left = fromPos.left + 'px';
            flyingTile.style.top = fromPos.top + 'px';
            flyingTile.style.position = 'absolute';
            flyingTile.style.zIndex = '100';
            flyingTile.style.transition = `all ${animationSpeed}ms ease-in-out`;
            
            boardElement.appendChild(flyingTile);
            
            animTiles.push({
                element: flyingTile,
                toPos: tilePositions[toIndex]
            });
        });
        
        requestAnimationFrame(() => {
            animTiles.forEach(tile => {
                tile.element.style.left = tile.toPos.left + 'px';
                tile.element.style.top = tile.toPos.top + 'px';
            });
        });
        
        setTimeout(() => {
            animTiles.forEach(tile => tile.element.remove());
            animating = false;
            resolve();
        }, animationSpeed + 50);
    });
}

// ===== АНИМАЦИЯ ПОЯВЛЕНИЯ =====
function animateAppear(row, col) {
    const tile = tileElements[row * 4 + col];
    tile.classList.add('tile-appear');
    setTimeout(() => tile.classList.remove('tile-appear'), animationSpeed);
}

// ===== АНИМАЦИЯ СЛИЯНИЯ =====
function animateMerge(row, col) {
    const tile = tileElements[row * 4 + col];
    tile.classList.add('tile-merge');
    setTimeout(() => tile.classList.remove('tile-merge'), animationSpeed);
}

// ===== ПОЛУЧЕНИЕ ИНФОРМАЦИИ О ДВИЖЕНИИ =====
function getMoves(newBoard, oldBoard) {
    const moves = [];
    
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (oldBoard[i][j] !== 0 && oldBoard[i][j] !== newBoard[i][j]) {
                for (let ni = 0; ni < 4; ni++) {
                    for (let nj = 0; nj < 4; nj++) {
                        if (newBoard[ni][nj] === oldBoard[i][j] && 
                            (ni !== i || nj !== j) && 
                            !moves.some(m => m.toRow === ni && m.toCol === nj)) {
                            moves.push({
                                fromRow: i,
                                fromCol: j,
                                toRow: ni,
                                toCol: nj
                            });
                        }
                    }
                }
            }
        }
    }
    
    return moves;
}

// ===== ОБРАБОТКА СТРОКИ =====
function processLine(line) {
    const filtered = line.filter(val => val !== 0);
    const result = [];
    const mergeInfo = [];
    
    for (let i = 0; i < filtered.length; i++) {
        if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
            result.push(filtered[i] * 2);
            mergeInfo.push({ index: result.length - 1, value: filtered[i] * 2 });
            i++;
        } else {
            result.push(filtered[i]);
        }
    }
    
    while (result.length < 4) result.push(0);
    return { result, mergeInfo };
}

// ===== ДВИЖЕНИЕ ВЛЕВО =====
function moveLeft() {
    const oldBoard = JSON.parse(JSON.stringify(board));
    let moved = false;
    let totalGain = 0;
    const merges = [];
    
    for (let i = 0; i < 4; i++) {
        const originalRow = [...board[i]];
        const { result, mergeInfo } = processLine(originalRow);
        
        if (result.some((val, idx) => val !== originalRow[idx])) {
            moved = true;
            mergeInfo.forEach(info => {
                merges.push({ row: i, col: info.index });
                totalGain += info.value;
            });
        }
        
        board[i] = result;
    }
    
    const moves = getMoves(board, oldBoard);
    return { moved, scoreGain: totalGain, moves, merges };
}

// ===== ДВИЖЕНИЕ ВПРАВО =====
function moveRight() {
    const oldBoard = JSON.parse(JSON.stringify(board));
    let moved = false;
    let totalGain = 0;
    const merges = [];
    
    for (let i = 0; i < 4; i++) {
        const originalRow = [...board[i]];
        const reversed = originalRow.reverse();
        const { result, mergeInfo } = processLine(reversed);
        const finalRow = result.reverse();
        
        if (finalRow.some((val, idx) => val !== originalRow[idx])) {
            moved = true;
            mergeInfo.forEach(info => {
                const col = 3 - info.index;
                merges.push({ row: i, col });
                totalGain += info.value;
            });
        }
        
        board[i] = finalRow;
    }
    
    const moves = getMoves(board, oldBoard);
    return { moved, scoreGain: totalGain, moves, merges };
}

// ===== ДВИЖЕНИЕ ВВЕРХ =====
function moveUp() {
    const oldBoard = JSON.parse(JSON.stringify(board));
    let moved = false;
    let totalGain = 0;
    const merges = [];
    
    for (let j = 0; j < 4; j++) {
        const column = [board[0][j], board[1][j], board[2][j], board[3][j]];
        const originalCol = [...column];
        const { result, mergeInfo } = processLine(column);
        
        if (result.some((val, idx) => val !== originalCol[idx])) {
            moved = true;
            mergeInfo.forEach(info => {
                merges.push({ row: info.index, col: j });
                totalGain += info.value;
            });
        }
        
        for (let i = 0; i < 4; i++) board[i][j] = result[i];
    }
    
    const moves = getMoves(board, oldBoard);
    return { moved, scoreGain: totalGain, moves, merges };
}

// ===== ДВИЖЕНИЕ ВНИЗ =====
function moveDown() {
    const oldBoard = JSON.parse(JSON.stringify(board));
    let moved = false;
    let totalGain = 0;
    const merges = [];
    
    for (let j = 0; j < 4; j++) {
        const column = [board[3][j], board[2][j], board[1][j], board[0][j]];
        const originalCol = [...column];
        const { result, mergeInfo } = processLine(column);
        const finalCol = result.reverse();
        
        if (finalCol.some((val, idx) => val !== board[idx][j])) {
            moved = true;
            mergeInfo.forEach(info => {
                const row = 3 - info.index;
                merges.push({ row, col: j });
                totalGain += info.value;
            });
        }
        
        for (let i = 0; i < 4; i++) board[i][j] = finalCol[i];
    }
    
    const moves = getMoves(board, oldBoard);
    return { moved, scoreGain: totalGain, moves, merges };
}

// ===== ПРОВЕРКА ХОДОВ =====
function canMove() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 0) return true;
            if (j < 3 && board[i][j] === board[i][j+1]) return true;
            if (i < 3 && board[i][j] === board[i+1][j]) return true;
        }
    }
    return false;
}

// ===== ОСНОВНОЙ ХОД =====
async function makeMove(direction) {
    if (gameOver || boardPaused || animating) return;
    
    previousBoard = JSON.parse(JSON.stringify(board));
    previousScore = score;
    
    let result;
    switch(direction) {
        case 'left': result = moveLeft(); break;
        case 'right': result = moveRight(); break;
        case 'up': result = moveUp(); break;
        case 'down': result = moveDown(); break;
        default: return;
    }
    
    if (!result.moved) return;
    
    boardPaused = true;
    updateTilePositions();
    await animateMove(result.moves);
    
    score += result.scoreGain;
    
    result.merges.forEach(merge => {
        animateMerge(merge.row, merge.col);
    });
    
    updateBoard();
    
    setTimeout(() => {
        addRandomTile();
        updateBoard();
        
        if (!canMove()) {
            gameOver = true;
            showGameOver();
        }
        
        boardPaused = false;
        undoCheck.disabled = false;
    }, animationSpeed);
}

// ===== ДОБАВЛЕНИЕ СЛУЧАЙНОЙ ПЛИТКИ =====
function addRandomTile() {
    const empty = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 0) empty.push([i, j]);
        }
    }
    if (empty.length === 0) return false;
    
    const [row, col] = empty[Math.floor(Math.random() * empty.length)];
    board[row][col] = Math.random() < 0.85 ? 2 : 4;
    animateAppear(row, col);
    return true;
}

// ===== ПОКАЗ ОКНА ЗАВЕРШЕНИЯ =====
function showGameOver() {
    finalScore.textContent = `You scored ${score} points.`;
    
    const isRecord = isNewRecord(score);
    
    if (isRecord) {
        recordMessage.style.display = 'inline-block';
        saveMessage.style.display = 'block';
        nameInputRow.style.display = 'flex';
        congratsMessage.style.display = 'none';
    } else {
        recordMessage.style.display = 'none';
        saveMessage.style.display = 'none';
        nameInputRow.style.display = 'none';
        congratsMessage.style.display = 'none';
    }
    
    gameoverModal.classList.add('active');
}

// ===== ЛИДЕРБОРД =====
function loadLeaderboard() {
    const saved = localStorage.getItem('2048-leaderboard');
    if (saved) leaderboard = JSON.parse(saved);
}

function saveLeaderboard() {
    localStorage.setItem('2048-leaderboard', JSON.stringify(leaderboard));
}

function isNewRecord(score) {
    if (leaderboard.length < 10) return true;
    leaderboard.sort((a, b) => b.score - a.score);
    return score > leaderboard[leaderboard.length - 1].score;
}

function addToLeaderboard(name, score) {
    leaderboard.push({
        name: name || 'user',
        score: score,
        date: new Date().toLocaleDateString('ru-RU')
    });
    leaderboard.sort((a, b) => b.score - a.score);
    if (leaderboard.length > 10) leaderboard.pop();
    saveLeaderboard();
    renderLeaderboard();
}

function renderLeaderboard() {
    leaderboardList.innerHTML = '';
    leaderboard.forEach(entry => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${entry.name}</span> <span>${entry.score}</span> <span>${entry.date}</span>`;
        leaderboardList.appendChild(li);
    });
}

// ===== НОВАЯ ИГРА =====
function newGame() {
    board = [
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0]
    ];
    score = 0;
    gameOver = false;
    previousBoard = [];
    undoCheck.disabled = true;
    
    updateBoard();
    
    const startTiles = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < startTiles; i++) {
        addRandomTile();
    }
    updateBoard();
}

// ===== UNDO =====
function undo() {
    if (previousBoard.length === 0 || gameOver || animating) return;
    board = JSON.parse(JSON.stringify(previousBoard));
    score = previousScore;
    updateBoard();
    undoCheck.disabled = true;
    previousBoard = [];
}

// ===== ЗАГРУЗКА =====
function loadGame() {
    const savedBoard = localStorage.getItem('2048-board');
    const savedScore = localStorage.getItem('2048-score');
    const savedBest = localStorage.getItem('2048-best');
    
    if (savedBoard) board = JSON.parse(savedBoard);
    if (savedScore) score = parseInt(savedScore);
    if (savedBest) bestScore = parseInt(savedBest);
    
    updateBoard();
    bestDisplay.textContent = bestScore;
}

// ===== СОХРАНЕНИЕ =====
function saveGame() {
    localStorage.setItem('2048-board', JSON.stringify(board));
    localStorage.setItem('2048-score', score);
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
loadLeaderboard();
loadGame();

// ===== СОБЫТИЯ =====

// Клавиатура
document.addEventListener('keydown', (e) => {
    if (e.key.startsWith('Arrow') && !gameOver && !boardPaused && !animating && !gameoverModal.classList.contains('active') && !leaderboardModal.classList.contains('active')) {
        e.preventDefault();
        makeMove(e.key.slice(5).toLowerCase());
    }
});

// Мобильные кнопки
mobileBtns.forEach(btn => {
    btn.addEventListener('click', () => makeMove(btn.dataset.dir));
});

// Чекбоксы
newGameCheck.addEventListener('change', (e) => {
    if (e.target.checked) {
        newGame();
        e.target.checked = false;
    }
});

undoCheck.addEventListener('change', (e) => {
    if (e.target.checked) {
        undo();
        e.target.checked = false;
    }
});

leaderboardCheck.addEventListener('change', (e) => {
    if (e.target.checked) {
        renderLeaderboard();
        leaderboardModal.classList.add('active');
        e.target.checked = false;
    }
});

speedCheck.addEventListener('change', (e) => {
    if (e.target.checked) {
        speedModal.classList.add('active');
        e.target.checked = false;
    }
});

// Закрытие модалок
closeLeaderboard.addEventListener('change', () => {
    leaderboardModal.classList.remove('active');
});

closeSpeed.addEventListener('change', () => {
    speedModal.classList.remove('active');
});

// Скорость
speedSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    animationSpeed = 150 / speedMarkers[val];
    speedDisplay.textContent = `x${speedMarkers[val]}`;
});

// Сохранение рекорда
saveBtn.addEventListener('click', () => {
    const name = playerName.value.trim() || 'user';
    addToLeaderboard(name, score);
    
    recordMessage.style.display = 'none';
    saveMessage.style.display = 'none';
    nameInputRow.style.display = 'none';
    congratsMessage.style.display = 'block';
});

// Рестарт после игры
restartCheck.addEventListener('change', () => {
    gameoverModal.classList.remove('active');
    newGame();
});

// Закрытие по клику на фон
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
    });
});

// Обновление позиций при ресайзе
window.addEventListener('resize', () => {
    setTimeout(updateTilePositions, 100);
});

// Автосохранение
setInterval(saveGame, 1000);

// Старт
if (!board.some(row => row.some(v => v !== 0))) {
    newGame();
} else {
    updateBoard();
}
