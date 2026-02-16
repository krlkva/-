(function() {
    // Константы
    const SIZE = 4;
    const STORAGE_KEY = 'krlkva2048_state';
    const LEADERBOARD_KEY = 'krlkva2048_leaderboard';
    const BEST_KEY = 'krlkva2048_best';
    
    // Состояние игры
    let board = [];
    let score = 0;
    let best = 0;
    let history = [];
    let gameOver = false;
    
    // DOM элементы
    const boardElement = document.getElementById('board');
    const scoreElement = document.getElementById('score');
    const bestElement = document.getElementById('best');
    const multiplierElement = document.getElementById('multiplier');
    const mobileControls = document.getElementById('mobileControls');
    
    // Модальные окна
    const gameOverModal = document.getElementById('gameOverModal');
    const leaderboardModal = document.getElementById('leaderboardModal');
    const playerNameInput = document.getElementById('playerName');
    const saveScoreBtn = document.getElementById('saveScoreBtn');
    const savedMessage = document.getElementById('savedMessage');
    const restartFromModalBtn = document.getElementById('restartFromModalBtn');
    const leaderboardBody = document.getElementById('leaderboardBody');
    
    // Кнопки
    const newGameBtn = document.getElementById('newGameBtn');
    const undoBtn = document.getElementById('undoBtn');
    const leaderboardBtn = document.getElementById('leaderboardBtn');
    const closeLeaderboardBtn = document.getElementById('closeLeaderboardBtn');
    
    // ==================== ИНИЦИАЛИЗАЦИЯ ====================
    function initGame() {
        loadGame();
        loadBest();
        
        if (isBoardEmpty()) {
            initializeNewBoard();
        }
        
        renderBoard();
        updateScore();
        updateMultiplier();
        checkGameOver();
        setupEventListeners();
    }
    
    function isBoardEmpty() {
        return !board || board.length === 0 || board.flat().every(cell => cell === 0);
    }
    
    function initializeNewBoard() {
        board = Array(SIZE).fill().map(() => Array(SIZE).fill(0));
        addRandomTile();
        addRandomTile();
        if (Math.random() < 0.5) addRandomTile();
    }
    
    // ==================== ИГРОВАЯ ЛОГИКА ====================
    
    // Добавление случайной плитки (2 или 4)
    function addRandomTile() {
        const emptyCells = getEmptyCells();
        if (emptyCells.length === 0) return false;
        
        const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[row][col] = Math.random() < 0.9 ? 2 : 4;
        return true;
    }
    
    function getEmptyCells() {
        const empty = [];
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                if (board[i][j] === 0) empty.push([i, j]);
            }
        }
        return empty;
    }
    
    // Добавление 1-2 новых плиток после хода
    function addNewTiles() {
        const count = Math.random() < 0.5 ? 1 : 2;
        for (let i = 0; i < count; i++) {
            if (!addRandomTile()) break;
        }
    }
    
    // Движение влево
    function moveLeft() {
        let moved = false;
        let scoreGain = 0;
        
        for (let i = 0; i < SIZE; i++) {
            const row = board[i];
            const nonZero = row.filter(cell => cell !== 0);
            
            // Объединяем соседние одинаковые
            for (let j = 0; j < nonZero.length - 1; j++) {
                if (nonZero[j] === nonZero[j + 1]) {
                    nonZero[j] *= 2;
                    scoreGain += nonZero[j];
                    nonZero.splice(j + 1, 1);
                    moved = true;
                }
            }
            
            const newRow = [...nonZero, ...Array(SIZE - nonZero.length).fill(0)];
            
            if (JSON.stringify(board[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            
            board[i] = newRow;
        }
        
        if (moved) {
            score += scoreGain;
            updateScore();
            addNewTiles();
            saveGame();
        }
        
        return moved;
    }
    
    function moveRight() {
        for (let i = 0; i < SIZE; i++) {
            board[i] = board[i].reverse();
        }
        
        const moved = moveLeft();
        
        for (let i = 0; i < SIZE; i++) {
            board[i] = board[i].reverse();
        }
        
        if (moved) renderBoard();
        return moved;
    }
    
    function moveUp() {
        transpose();
        const moved = moveLeft();
        transpose();
        
        if (moved) renderBoard();
        return moved;
    }
    
    function moveDown() {
        transpose();
        for (let i = 0; i < SIZE; i++) {
            board[i] = board[i].reverse();
        }
        
        const moved = moveLeft();
        
        for (let i = 0; i < SIZE; i++) {
            board[i] = board[i].reverse();
        }
        transpose();
        
        if (moved) renderBoard();
        return moved;
    }
    
    function transpose() {
        for (let i = 0; i < SIZE; i++) {
            for (let j = i + 1; j < SIZE; j++) {
                [board[i][j], board[j][i]] = [board[j][i], board[i][j]];
            }
        }
    }
    
    // ==================== УПРАВЛЕНИЕ СОСТОЯНИЕМ ====================
    
    function saveToHistory() {
        history.push({
            board: JSON.parse(JSON.stringify(board)),
            score: score
        });
        
        if (history.length > 10) history.shift();
    }
    
    function undo() {
        if (history.length === 0 || gameOver) return;
        
        const prev = history.pop();
        board = prev.board;
        score = prev.score;
        
        renderBoard();
        updateScore();
        saveGame();
        checkGameOver();
    }
    
    // ==================== ПРОВЕРКА ОКОНЧАНИЯ ИГРЫ ====================
    
    function checkGameOver() {
        // Проверка пустых клеток
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                if (board[i][j] === 0) {
                    gameOver = false;
                    return false;
                }
            }
        }
        
        // Проверка горизонтальных объединений
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE - 1; j++) {
                if (board[i][j] === board[i][j + 1]) {
                    gameOver = false;
                    return false;
                }
            }
        }
        
        // Проверка вертикальных объединений
        for (let i = 0; i < SIZE - 1; i++) {
            for (let j = 0; j < SIZE; j++) {
                if (board[i][j] === board[i + 1][j]) {
                    gameOver = false;
                    return false;
                }
            }
        }
        
        gameOver = true;
        showGameOverModal();
        return true;
    }
    
    function showGameOverModal() {
        gameOverModal.classList.remove('hidden');
        document.getElementById('gameOverTitle').textContent = 'Игра завершена!';
        document.getElementById('gameOverMessage').textContent = 'Введите имя для сохранения рекорда';
        playerNameInput.classList.remove('hidden');
        saveScoreBtn.classList.remove('hidden');
        savedMessage.classList.add('hidden');
        restartFromModalBtn.classList.remove('hidden');
        mobileControls.style.display = 'none';
    }
    
    // ==================== РАБОТА С РЕКОРДАМИ ====================
    
    function saveRecord() {
        const name = playerNameInput.value.trim() || 'Аноним';
        const record = {
            name: name,
            score: score,
            date: new Date().toLocaleDateString('ru-RU')
        };
        
        let leaderboard = JSON.parse(localStorage.getItem(LEADERBOARD_KEY)) || [];
        leaderboard.push(record);
        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard = leaderboard.slice(0, 10);
        
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
        
        playerNameInput.classList.add('hidden');
        saveScoreBtn.classList.add('hidden');
        savedMessage.classList.remove('hidden');
        
        updateBest();
    }
    
    function updateBest() {
        if (score > best) {
            best = score;
            bestElement.textContent = best;
            localStorage.setItem(BEST_KEY, best);
        }
    }
    
    function loadBest() {
        const savedBest = localStorage.getItem(BEST_KEY);
        if (savedBest) {
            best = parseInt(savedBest, 10);
            bestElement.textContent = best;
        }
    }
    
    function loadLeaderboard() {
        const leaderboard = JSON.parse(localStorage.getItem(LEADERBOARD_KEY)) || [];
        leaderboardBody.innerHTML = '';
        
        if (leaderboard.length === 0) {
            leaderboardBody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px;">Пока нет рекордов</td></tr>';
        } else {
            leaderboard.forEach(record => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${record.name}</td>
                    <td>${record.score}</td>
                    <td>${record.date}</td>
                `;
                leaderboardBody.appendChild(row);
            });
        }
    }
    
    // ==================== СОХРАНЕНИЕ/ЗАГРУЗКА ====================
    
    function saveGame() {
        const gameState = { board, score, history };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    }
    
    function loadGame() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const gameState = JSON.parse(saved);
                board = gameState.board || [];
                score = gameState.score || 0;
                history = gameState.history || [];
            } catch (e) {
                console.error('Ошибка загрузки', e);
            }
        }
    }
    
    // ==================== НОВАЯ ИГРА ====================
    
    function newGame() {
        board = Array(SIZE).fill().map(() => Array(SIZE).fill(0));
        score = 0;
        history = [];
        gameOver = false;
        
        addRandomTile();
        addRandomTile();
        if (Math.random() < 0.5) addRandomTile();
        
        renderBoard();
        updateScore();
        saveGame();
        gameOverModal.classList.add('hidden');
        
        if (window.innerWidth <= 480) {
            mobileControls.style.display = 'grid';
        }
    }
    
    // ==================== ОТРИСОВКА ====================
    
    function renderBoard() {
        boardElement.innerHTML = '';
        
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                const value = board[i][j];
                
                if (value !== 0) {
                    cell.textContent = value;
                    cell.classList.add(`tile-${value}`);
                }
                
                boardElement.appendChild(cell);
            }
        }
    }
    
    function updateScore() {
        scoreElement.textContent = score;
        updateBest();
    }
    
    function updateMultiplier() {
        const multipliers = ['x0.25', 'x0.5', 'x1', 'x2', 'x4'];
        const index = Math.floor(Math.random() * multipliers.length);
        multiplierElement.textContent = multipliers[index];
    }
    
    // ==================== ОБРАБОТЧИКИ СОБЫТИЙ ====================
    
    function setupEventListeners() {
        // Клавиатура
        document.addEventListener('keydown', handleKeyDown);
        
        // Мобильные кнопки
        document.querySelectorAll('.mobile-btn').forEach(btn => {
            btn.addEventListener('click', handleMobileMove);
        });
        
        // Кнопки управления
        newGameBtn.addEventListener('click', newGame);
        undoBtn.addEventListener('click', undo);
        leaderboardBtn.addEventListener('click', showLeaderboard);
        closeLeaderboardBtn.addEventListener('click', hideLeaderboard);
        saveScoreBtn.addEventListener('click', saveRecord);
        restartFromModalBtn.addEventListener('click', newGame);
        
        // Закрытие модальных окон по клику на оверлей
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.add('hidden');
                    if (window.innerWidth <= 480 && !gameOver) {
                        mobileControls.style.display = 'grid';
                    }
                }
            });
        });
        
        // Ресайз окна
        window.addEventListener('resize', handleResize);
    }
    
    function handleKeyDown(e) {
        if (gameOver || !gameOverModal.classList.contains('hidden') || !leaderboardModal.classList.contains('hidden')) return;
        
        const arrows = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        if (arrows.includes(e.key)) {
            e.preventDefault();
        }
        
        saveToHistory();
        
        switch(e.key) {
            case 'ArrowLeft': moveLeft(); break;
            case 'ArrowRight': moveRight(); break;
            case 'ArrowUp': moveUp(); break;
            case 'ArrowDown': moveDown(); break;
            default: return;
        }
        
        renderBoard();
        checkGameOver();
    }
    
    function handleMobileMove(e) {
        if (gameOver || !gameOverModal.classList.contains('hidden') || !leaderboardModal.classList.contains('hidden')) return;
        
        const direction = e.currentTarget.dataset.direction;
        
        saveToHistory();
        
        switch(direction) {
            case 'left': moveLeft(); break;
            case 'right': moveRight(); break;
            case 'up': moveUp(); break;
            case 'down': moveDown(); break;
        }
        
        renderBoard();
        checkGameOver();
    }
    
    function showLeaderboard() {
        loadLeaderboard();
        leaderboardModal.classList.remove('hidden');
        mobileControls.style.display = 'none';
    }
    
    function hideLeaderboard() {
        leaderboardModal.classList.add('hidden');
        if (window.innerWidth <= 480 && !gameOver) {
            mobileControls.style.display = 'grid';
        }
    }
    
    function handleResize() {
        if (window.innerWidth <= 480 && !gameOver && gameOverModal.classList.contains('hidden') && leaderboardModal.classList.contains('hidden')) {
            mobileControls.style.display = 'grid';
        } else if (window.innerWidth > 480) {
            mobileControls.style.display = 'none';
        }
    }
    
    // Запуск игры
    initGame();
})();
