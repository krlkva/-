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

// Анимация
let animationSpeed = 100; // мс
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
const nameArea = document.getElementById('name-area');
const savedConfirm = document.getElementById('saved-confirm');
const playerName = document.getElementById('player-name');
const saveBtn = document.getElementById('save-btn');
const restartGame = document.getElementById('restart-game');
const closeLeaderboard = document.getElementById('close-leaderboard');
const closeSpeed = document.getElementById('close-speed');
const speedSlider = document.getElementById('speed-slider');
const leaderboardList = document.getElementById('leaderboard-list');

// Кнопки
const mobileBtns = document.querySelectorAll('.mobile-btn');

// ===== ИНИЦИАЛИЗАЦИЯ ПОЛЯ =====
function createBoard() {
    boardElement.innerHTML = '';
    for (let i = 0; i < 16; i++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.setAttribute('data-value', '0');
        boardElement.appendChild(tile);
    }
}
createBoard();

const tiles = document.querySelectorAll('.tile');

// ===== ОБНОВЛЕНИЕ ПОЛЯ =====
function updateBoard() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const tile = tiles[i * 4 + j];
            const value = board[i][j];
            tile.setAttribute('data-value', value);
            tile.textContent = value || '';
        }
    }
    scoreDisplay.textContent = score;
    if (score > bestScore) {
        bestScore = score;
        bestDisplay.textContent = bestScore;
        localStorage.setItem('2048-best', bestScore);
    }
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
    
    // Анимация появления
    const tile = tiles[row * 4 + col];
    tile.classList.add('tile-appear');
    setTimeout(() => tile.classList.remove('tile-appear'), 150);
    
    return true;
}

// ===== ИСПРАВЛЕННАЯ ЛОГИКА ДВИЖЕНИЯ =====
/**
 * Обрабатывает одну строку/столбец для движения влево
 * @param {number[]} line - массив из 4 чисел
 * @returns {Object} - новая строка и полученные очки
 */
function processLineLeft(line) {
    // Убираем нули
    const filtered = line.filter(val => val !== 0);
    const result = [];
    let scoreGain = 0;
    
    for (let i = 0; i < filtered.length; i++) {
        if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
            // Слияние
            result.push(filtered[i] * 2);
            scoreGain += filtered[i] * 2;
            i++; // Пропускаем следующий элемент
        } else {
            result.push(filtered[i]);
        }
    }
    
    // Дополняем нулями до 4 элементов
    while (result.length < 4) {
        result.push(0);
    }
    
    return { newLine: result, scoreGain };
}

/**
 * Обрабатывает одну строку/столбец для движения вправо
 * @param {number[]} line - массив из 4 чисел
 * @returns {Object} - новая строка и полученные очки
 */
function processLineRight(line) {
    // Для движения вправо разворачиваем, обрабатываем как влево, потом разворачиваем обратно
    const reversed = [...line].reverse();
    const { newLine: processedReversed, scoreGain } = processLineLeft(reversed);
    const newLine = processedReversed.reverse();
    return { newLine, scoreGain };
}

// ===== ДВИЖЕНИЕ ВЛЕВО =====
function moveLeft() {
    let moved = false;
    let totalGain = 0;
    
    for (let i = 0; i < 4; i++) {
        const originalRow = [...board[i]];
        const { newLine, scoreGain } = processLineLeft(originalRow);
        
        // Проверяем, изменилась ли строка
        if (newLine.some((val, idx) => val !== originalRow[idx])) {
            moved = true;
        }
        
        board[i] = newLine;
        totalGain += scoreGain;
    }
    
    return { moved, scoreGain: totalGain };
}

// ===== ДВИЖЕНИЕ ВПРАВО (ИСПРАВЛЕНО) =====
function moveRight() {
    let moved = false;
    let totalGain = 0;
    
    for (let i = 0; i < 4; i++) {
        const originalRow = [...board[i]];
        const { newLine, scoreGain } = processLineRight(originalRow);
        
        // Проверяем, изменилась ли строка
        if (newLine.some((val, idx) => val !== originalRow[idx])) {
            moved = true;
        }
        
        board[i] = newLine;
        totalGain += scoreGain;
    }
    
    return { moved, scoreGain: totalGain };
}

// ===== ДВИЖЕНИЕ ВВЕРХ =====
function moveUp() {
    let moved = false;
    let totalGain = 0;
    
    for (let j = 0; j < 4; j++) {
        // Собираем столбец
        const column = [board[0][j], board[1][j], board[2][j], board[3][j]];
        const originalCol = [...column];
        const { newLine, scoreGain } = processLineLeft(column);
        
        // Проверяем, изменился ли столбец
        if (newLine.some((val, idx) => val !== originalCol[idx])) {
            moved = true;
        }
        
        // Записываем обратно
        for (let i = 0; i < 4; i++) {
            board[i][j] = newLine[i];
        }
        totalGain += scoreGain;
    }
    
    return { moved, scoreGain: totalGain };
}

// ===== ДВИЖЕНИЕ ВНИЗ =====
function moveDown() {
    let moved = false;
    let totalGain = 0;
    
    for (let j = 0; j < 4; j++) {
        // Собираем столбец (снизу вверх для обработки)
        const column = [board[3][j], board[2][j], board[1][j], board[0][j]];
        const originalCol = [...column];
        const { newLine, scoreGain } = processLineLeft(column);
        
        // Проверяем, изменился ли столбец
        if (newLine.some((val, idx) => val !== originalCol[idx])) {
            moved = true;
        }
        
        // Записываем обратно (разворачиваем)
        const result = newLine.reverse();
        for (let i = 0; i < 4; i++) {
            board[i][j] = result[i];
        }
        totalGain += scoreGain;
    }
    
    return { moved, scoreGain: totalGain };
}

// ===== ПРОВЕРКА НАЛИЧИЯ ХОДОВ =====
function canMove() {
    // Проверяем пустые клетки
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 0) return true;
        }
    }
    
    // Проверяем возможные слияния по горизонтали
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j] === board[i][j+1]) return true;
        }
    }
    
    // Проверяем возможные слияния по вертикали
    for (let j = 0; j < 4; j++) {
        for (let i = 0; i < 3; i++) {
            if (board[i][j] === board[i+1][j]) return true;
        }
    }
    
    return false;
}

// ===== ОСНОВНОЙ ХОД =====
function makeMove(direction) {
    if (gameOver || boardPaused) return;
    
    // Сохраняем предыдущее состояние для Undo
    previousBoard = JSON.parse(JSON.stringify(board));
    previousScore = score;
    
    let result;
    switch(direction) {
        case 'left': 
            result = moveLeft(); 
            break;
        case 'right': 
            result = moveRight(); 
            break;
        case 'up': 
            result = moveUp(); 
            break;
        case 'down': 
            result = moveDown(); 
            break;
        default: return;
    }
    
    // Если движение не привело к изменениям, ничего не делаем
    if (!result.moved) {
        return;
    }
    
    // Обновляем счёт
    score += result.scoreGain;
    updateBoard();
    
    // Анимация слияния
    tiles.forEach(t => t.classList.add('tile-merge'));
    setTimeout(() => tiles.forEach(t => t.classList.remove('tile-merge')), 150);
    
    // Блокируем до окончания анимации
    boardPaused = true;
    
    setTimeout(() => {
        // Добавляем новую плитку
        addRandomTile();
        updateBoard();
        
        // Проверяем, не закончилась ли игра
        if (!canMove()) {
            gameOver = true;
            showGameOver();
        }
        
        boardPaused = false;
        undoCheck.disabled = false;
    }, animationSpeed);
}

// ===== ПОКАЗ ОКНА ЗАВЕРШЕНИЯ =====
function showGameOver() {
    finalScore.textContent = `Вы набрали ${score} очков`;
    
    // Проверка рекорда
    const isRecord = isNewRecord(score);
    document.querySelectorAll('.checkbox-group .checkbox-item')[0].style.display = isRecord ? 'flex' : 'none';
    document.querySelectorAll('.checkbox-group .checkbox-item')[1].style.display = (leaderboard.length === 0 || score > leaderboard[0]?.score) ? 'flex' : 'none';
    
    nameArea.style.display = isRecord ? 'flex' : 'none';
    savedConfirm.style.display = 'none';
    
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
        name: name || 'Аноним',
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
    
    // Добавляем 2-3 стартовые плитки
    const startTiles = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < startTiles; i++) {
        addRandomTile();
    }
    updateBoard();
}

// ===== UNDO =====
function undo() {
    if (previousBoard.length === 0 || gameOver) return;
    board = JSON.parse(JSON.stringify(previousBoard));
    score = previousScore;
    updateBoard();
    undoCheck.disabled = true;
    previousBoard = []; // Чтобы нельзя было отменить дважды
}

// ===== ЗАГРУЗКА СОСТОЯНИЯ =====
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

// ===== ТЕСТОВАЯ ФУНКЦИЯ ДЛЯ ПРОВЕРКИ =====
function testMoves() {
    console.log("Тестирование движения...");
    
    // Тест 1: Движение вправо с [2,2,4,4] должно дать [0,0,4,8]
    board = [
        [2,2,4,4],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0]
    ];
    console.log("До движения вправо:", board[0]);
    moveRight();
    console.log("После движения вправо:", board[0], "Ожидается: [0,0,4,8]");
    
    // Тест 2: Движение влево с [2,2,4,4] должно дать [4,8,0,0]
    board = [
        [2,2,4,4],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0]
    ];
    console.log("До движения влево:", board[0]);
    moveLeft();
    console.log("После движения влево:", board[0], "Ожидается: [4,8,0,0]");
    
    // Тест 3: Движение вверх с [2,0,0,0; 2,0,0,0; 4,0,0,0; 4,0,0,0] должно дать [4,0,0,0; 8,0,0,0; 0,0,0,0; 0,0,0,0]
    board = [
        [2,0,0,0],
        [2,0,0,0],
        [4,0,0,0],
        [4,0,0,0]
    ];
    console.log("До движения вверх:");
    console.log(board.map(row => row[0]));
    moveUp();
    console.log("После движения вверх (первый столбец):", [board[0][0], board[1][0], board[2][0], board[3][0]], "Ожидается: [4,8,0,0]");
}

// Раскомментируйте для теста:
// testMoves();

// ===== ИНИЦИАЛИЗАЦИЯ =====
loadLeaderboard();
loadGame();

// ===== СОБЫТИЯ =====

// Управление с клавиатуры
document.addEventListener('keydown', (e) => {
    if (e.key.startsWith('Arrow') && !gameOver && !boardPaused && !gameoverModal.classList.contains('active') && !leaderboardModal.classList.contains('active')) {
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
    animationSpeed = 100 / speedMarkers[val];
    speedDisplay.textContent = `x${speedMarkers[val]}`;
});

// Сохранение рекорда
saveBtn.addEventListener('click', () => {
    addToLeaderboard(playerName.value, score);
    nameArea.style.display = 'none';
    savedConfirm.style.display = 'flex';
});

// Рестарт после игры
restartGame.addEventListener('change', () => {
    gameoverModal.classList.remove('active');
    newGame();
});

// Закрытие модалок по клику на фон
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
    });
});

// Сохраняем игру при каждом ходе
setInterval(saveGame, 1000);

// Старт игры, если поле пустое
if (!board.some(row => row.some(v => v !== 0))) {
    newGame();
}
