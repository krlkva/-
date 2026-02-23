(function() {
    const SIZE = 4;
    const STORAGE_KEY = 'krlkva2048_state';
    const LEADERBOARD_KEY = 'krlkva2048_leaderboard';
    const BEST_KEY = 'krlkva2048_best';
    
    let board = [];
    let score = 0;
    let best = 0;
    let history = [];
    let gameOver = false;
    
    const boardElement = document.getElementById('board');
    const tileContainer = document.getElementById('tileContainer');
    const scoreElement = document.getElementById('score');
    const bestElement = document.getElementById('best');
    const mobileControls = document.getElementById('mobileControls');
    const boardContainer = document.getElementById('boardContainer');
    
    const gameOverModal = document.getElementById('gameOverModal');
    const leaderboardModal = document.getElementById('leaderboardModal');
    const playerNameInput = document.getElementById('playerName');
    const saveScoreBtn = document.getElementById('saveScoreBtn');
    const savedMessage = document.getElementById('savedMessage');
    const restartFromModalBtn = document.getElementById('restartFromModalBtn');
    const leaderboardBody = document.getElementById('leaderboardBody');
    
    const newGameBtn = document.getElementById('newGameBtn');
    const undoBtn = document.getElementById('undoBtn');
    const leaderboardBtn = document.getElementById('leaderboardBtn');
    const closeLeaderboardBtn = document.getElementById('closeLeaderboardBtn');
    
    let animating = false;
    let touchStartX = 0;
    let touchStartY = 0;
    
    function init() {
        createBoard();
        loadGame();
        loadBest();
        
        if (!board.length || board.flat().every(cell => cell === 0)) {
            resetBoard();
        }
        
        renderTiles();
        updateScore();
        checkGameOver();
        setupEventListeners();
    }
    
    function createBoard() {
        boardElement.innerHTML = '';
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                boardElement.appendChild(cell);
            }
        }
    }
    
    function resetBoard() {
        board = Array(SIZE).fill().map(() => Array(SIZE).fill(0));
        addRandomTile();
        addRandomTile();
        if (Math.random() < 0.5) addRandomTile();
    }
    
    function addRandomTile() {
        const empty = [];
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                if (board[i][j] === 0) empty.push([i, j]);
            }
        }
        if (empty.length === 0) return false;
        
        const [row, col] = empty[Math.floor(Math.random() * empty.length)];
        board[row][col] = Math.random() < 0.9 ? 2 : 4;
        return true;
    }
    
    function addNewTiles() {
        const count = Math.random() < 0.5 ? 1 : 2;
        for (let i = 0; i < count; i++) {
            if (!addRandomTile()) break;
        }
    }
    
    function getTilePosition(row, col) {
        const boardRect = boardElement.getBoundingClientRect();
        const cellSize = (boardRect.width - 45) / 4;
        
        return {
            top: row * (cellSize + 15),
            left: col * (cellSize + 15),
            width: cellSize,
            height: cellSize
        };
    }
    
    function renderTiles(mergedPositions = [], newTiles = []) {
        tileContainer.innerHTML = '';
        
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                const value = board[i][j];
                if (value === 0) continue;
                
                const pos = getTilePosition(i, j);
                const tile = document.createElement('div');
                tile.className = `tile tile-${value}`;
                tile.textContent = value;
                
                tile.style.top = pos.top + 'px';
                tile.style.left = pos.left + 'px';
                tile.style.width = pos.width + 'px';
                tile.style.height = pos.height + 'px';
                
                if (newTiles.some(([r, c]) => r === i && c === j)) {
                    tile.classList.add('tile-new');
                }
                
                if (mergedPositions.some(([r, c]) => r === i && c === j)) {
                    tile.classList.add('tile-merge');
                }
                
                tileContainer.appendChild(tile);
            }
        }
    }
    
    function moveLeft() {
        if (animating || gameOver) return false;
        
        let moved = false;
        let scoreGain = 0;
        let mergedPositions = [];
        let newTiles = [];
        
        const oldBoard = JSON.parse(JSON.stringify(board));
        
        for (let i = 0; i < SIZE; i++) {
            let row = board[i].filter(cell => cell !== 0);
            
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    scoreGain += row[j];
                    row.splice(j + 1, 1);
                    moved = true;
                    mergedPositions.push([i, j]);
                }
            }
            
            while (row.length < SIZE) row.push(0);
            
            if (JSON.stringify(board[i]) !== JSON.stringify(row)) {
                moved = true;
            }
            
            board[i] = row;
        }
        
        if (moved) {
            animating = true;
            score += scoreGain;
            updateScore();
            
            renderTiles(mergedPositions);
            
            setTimeout(() => {
                addNewTiles();
                
                for (let i = 0; i < SIZE; i++) {
                    for (let j = 0; j < SIZE; j++) {
                        if (oldBoard[i][j] === 0 && board[i][j] !== 0) {
                            newTiles.push([i, j]);
                        }
                    }
                }
                
                renderTiles([], newTiles);
                animating = false;
                saveGame();
                checkGameOver();
            }, 150);
        }
        
        return moved;
    }
    
    function moveRight() {
        if (animating || gameOver) return false;
        
        for (let i = 0; i < SIZE; i++) {
            board[i] = board[i].reverse();
        }
        const moved = moveLeft();
        for (let i = 0; i < SIZE; i++) {
            board[i] = board[i].reverse();
        }
        return moved;
    }
    
    function moveUp() {
        if (animating || gameOver) return false;
        
        transpose();
        const moved = moveLeft();
        transpose();
        return moved;
    }
    
    function moveDown() {
        if (animating || gameOver) return false;
        
        transpose();
        for (let i = 0; i < SIZE; i++) {
            board[i] = board[i].reverse();
        }
        const moved = moveLeft();
        for (let i = 0; i < SIZE; i++) {
            board[i] = board[i].reverse();
        }
        transpose();
        return moved;
    }
    
    function transpose() {
        for (let i = 0; i < SIZE; i++) {
            for (let j = i + 1; j < SIZE; j++) {
                [board[i][j], board[j][i]] = [board[j][i], board[i][j]];
            }
        }
    }
    
    function saveToHistory() {
        if (animating) return;
        history.push({
            board: JSON.parse(JSON.stringify(board)),
            score: score
        });
        if (history.length > 10) history.shift();
    }
    
    function undo() {
        if (history.length === 0 || gameOver || animating) return;
        const prev = history.pop();
        board = prev.board;
        score = prev.score;
        renderTiles();
        updateScore();
        saveGame();
        checkGameOver();
    }
    
    function checkGameOver() {
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                if (board[i][j] === 0) {
                    gameOver = false;
                    return false;
                }
            }
        }
        
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE - 1; j++) {
                if (board[i][j] === board[i][j + 1]) {
                    gameOver = false;
                    return false;
                }
            }
        }
        
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
        playerNameInput.classList.remove('hidden');
        saveScoreBtn.classList.remove('hidden');
        savedMessage.classList.add('hidden');
        restartFromModalBtn.classList.remove('hidden');
        mobileControls.style.display = 'none';
    }
    
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
    
    function newGame() {
        if (animating) return;
        board = Array(SIZE).fill().map(() => Array(SIZE).fill(0));
        score = 0;
        history = [];
        gameOver = false;
        
        addRandomTile();
        addRandomTile();
        if (Math.random() < 0.5) addRandomTile();
        
        renderTiles();
        updateScore();
        saveGame();
        gameOverModal.classList.add('hidden');
        
        if (window.innerWidth <= 520) {
            mobileControls.style.display = 'flex';
        }
    }
    
    function updateScore() {
        scoreElement.textContent = score;
        updateBest();
    }
    
    function handleTouchStart(e) {
        if (gameOver || animating) return;
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }
    
    function handleTouchEnd(e) {
        if (gameOver || animating || touchStartX === 0) return;
        
        const touch = e.changedTouches[0];
        const dx = touch.clientX - touchStartX;
        const dy = touch.clientY - touchStartY;
        const minSwipeDistance = 30;
        
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipeDistance) {
            saveToHistory();
            if (dx > 0) {
                moveRight();
            } else {
                moveLeft();
            }
        } else if (Math.abs(dy) > minSwipeDistance) {
            saveToHistory();
            if (dy > 0) {
                moveDown();
            } else {
                moveUp();
            }
        }
        
        touchStartX = 0;
        touchStartY = 0;
    }
    
    function setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (gameOver || animating || !gameOverModal.classList.contains('hidden') || !leaderboardModal.classList.contains('hidden')) return;
            
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
        });
        
        document.querySelectorAll('.joystick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (gameOver || animating || !gameOverModal.classList.contains('hidden') || !leaderboardModal.classList.contains('hidden')) return;
                
                const direction = e.currentTarget.dataset.direction;
                
                saveToHistory();
                
                switch(direction) {
                    case 'left': moveLeft(); break;
                    case 'right': moveRight(); break;
                    case 'up': moveUp(); break;
                    case 'down': moveDown(); break;
                }
            });
        });
        
        boardContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
        boardContainer.addEventListener('touchend', handleTouchEnd);
        
        newGameBtn.addEventListener('click', newGame);
        undoBtn.addEventListener('click', undo);
        
        leaderboardBtn.addEventListener('click', () => {
            loadLeaderboard();
            leaderboardModal.classList.remove('hidden');
            mobileControls.style.display = 'none';
        });
        
        closeLeaderboardBtn.addEventListener('click', () => {
            leaderboardModal.classList.add('hidden');
            if (window.innerWidth <= 520 && !gameOver) {
                mobileControls.style.display = 'flex';
            }
        });
        
        saveScoreBtn.addEventListener('click', saveRecord);
        
        restartFromModalBtn.addEventListener('click', () => {
            newGame();
        });
        
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.add('hidden');
                    if (window.innerWidth <= 520 && !gameOver) {
                        mobileControls.style.display = 'flex';
                    }
                }
            });
        });
        
        window.addEventListener('resize', () => {
            if (!animating) {
                renderTiles();
            }
            
            if (window.innerWidth <= 520 && !gameOver && gameOverModal.classList.contains('hidden') && leaderboardModal.classList.contains('hidden')) {
                mobileControls.style.display = 'flex';
            } else if (window.innerWidth > 520) {
                mobileControls.style.display = 'none';
            }
        });
    }
    
    init();
})();
