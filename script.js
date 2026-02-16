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
let tileColors = [
    [237, 216, 190],
    [237, 216, 190],
    [240, 178, 111],
    [230, 80, 65],
    [200, 60, 85],
    [120, 65, 115]
];

let isBoardPaused = false;
let baseSpeed = 100;
let animationSpeed = 150;

const markers = [0.25, 0.5, 0.75, 1, 2, 3, 5, 10];

// ===== DOM ЭЛЕМЕНТЫ =====
const main_container = document.getElementById('main-container');
const settings = main_container.querySelector('.settings');

const undo = settings.querySelector('.undo-btn');
const speed_control_btn = settings.querySelector('.speed-control-btn');
const speed_control_value = speed_control_btn.querySelector('span');
const leaderboardBtn = settings.querySelector('.leaderboard-btn');
const reset = settings.querySelector('.reset-btn');

const speed_control_wrapper = main_container.querySelector('.speed-wrapper');
const speed_control = speed_control_wrapper.querySelector('.speed-control');
const speed_control_close = speed_control.querySelector('.close-btn');
const speed_control_slider = speed_control.querySelector('.speed-control__slider');
const speed_control_input = speed_control_slider.querySelector('input');

const scores = main_container.querySelector('.scores');
const [elem_score, elem_best] = scores.querySelectorAll('.scores__value');

const board = main_container.querySelector('.gameboard');

// Создаём плитки
for (let i = 0; i < 16; i++) {
    let board_tile_wrapper = document.createElement('div');
    board_tile_wrapper.classList.add('gameboard__tile-wrapper');
    board.appendChild(board_tile_wrapper);
    let board_tile = document.createElement('div');
    board_tile.classList.add('gameboard__tile');
    board_tile_wrapper.appendChild(board_tile);
}
const visualTiles = board.querySelectorAll('.gameboard__tile');

const controls = main_container.querySelector('.controls');
const controls_btns = controls.querySelectorAll('.controls__arrow');

const leaderboard_wrapper = main_container.querySelector('.leaderboard-wrapper');
const leaderboard = main_container.querySelector('.leaderboard');
const leaderboard_close = leaderboard.querySelector('.close-btn');
const leaderboard_list = leaderboard.querySelector('ol');

const victory_screen_wrapper = main_container.querySelector('.victory-wrapper');
const victory_screen = main_container.querySelector('.victory');
const victory_score = victory_screen.querySelector('h3');
const victory_record = victory_screen.querySelector('.victory__title-record');
const victory_best = victory_screen.querySelector('.victory__title-best');
const victory_save = victory_screen.querySelector('.victory__title-save');
const victory_gif = victory_screen.querySelector('.victory__gif');
const victory_submit = victory_screen.querySelector('form');
const victory_save_confirm = victory_screen.querySelector('.victory__title-confirm');
const victory_submit_name = victory_submit.querySelector('input');
const victory_submitBtn = victory_submit.querySelector('button');
const victory_reset = victory_screen.querySelector('.victory__reset');

const nuke = main_container.querySelector('.nuke');

// ===== ФУНКЦИИ =====
function sanitize(string) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
    };
    const reg = /[&<>"'/]/ig;
    return string.replace(reg, (match) => (map[match]));
}

function updateScore(newAmount) {
    gameScore = Math.max(0, gameScore + newAmount);
    elem_score.textContent = gameScore;
    localStorage.setItem('game-score', JSON.stringify(gameScore));
    updateBestScore();
}

function updateBestScore() {
    if (leaderboardList.length > 0) {
        let bestScore = leaderboardList.sort(compareScore)[0].score;
        if (gameScore > bestScore) {
            elem_best.textContent = gameScore;
        } else {
            elem_best.textContent = bestScore;
        }
    } else {
        elem_best.textContent = gameScore;
    }
}

function updateBoardMove(direction) {
    if (isBoardPaused || gameIsFinished) {
        return;
    }
    prevGameScore = gameScore;
    isBoardPaused = true;
    if (speed_control_input) speed_control_input.disabled = true;

    let movedTiles = collectMovedTiles(direction);
    if (movedTiles.length === 0) {
        isBoardPaused = false;
        if (speed_control_input) speed_control_input.disabled = false;
        return;
    }
    updateBoardSnap(movedTiles);
}

function updateBoardSnap(movedTiles) {
    prevGameBoard = JSON.parse(JSON.stringify(gameBoard));
    let animations = [];

    // Поднимаем двигающиеся ячейки
    for (let tile of movedTiles) {
        let movingTile = visualTiles[tile[0][0] * 4 + tile[0][1]];
        movingTile.style.zIndex = '100';
        movingTile.classList.add('moving');
    }

    for (let tile of movedTiles) {
        let shift = tile[2];
        let animation = animateTile('moved', visualTiles[tile[0][0] * 4 + tile[0][1]], shift);
        if (animation) animations.push(animation);
    }

    setTimeout(function() {
        for (let animation of animations) {
            if (animation) animation.cancel();
        }

        // Сбрасываем z-index
        for (let i = 0; i < visualTiles.length; i++) {
            visualTiles[i].style.transform = '';
            visualTiles[i].style.zIndex = '';
            visualTiles[i].classList.remove('moving');
        }

        for (let tile of movedTiles) {
            let oldTile = gameBoard[tile[0][0]][tile[0][1]];
            let newTile = gameBoard[tile[1][0]][tile[1][1]];
            if (oldTile != newTile) {
                gameBoard[tile[0][0]][tile[0][1]] = 0;
                gameBoard[tile[1][0]][tile[1][1]] = oldTile;
            } else {
                gameBoard[tile[0][0]][tile[0][1]] = 0;
                gameBoard[tile[1][0]][tile[1][1]] = oldTile * 2;
                updateScore(oldTile * 2);
                let visualTile = visualTiles[tile[1][0] * 4 + tile[1][1]];
                animateTile('combined', visualTile);
                visualTile.classList.add('active-tile-combined');
            }
        }
        updateBoardVisual();
        updateBoardAdd();

        setTimeout(function() {
            if (getFreeTiles().length === 0 && areMovesAvailable() === false) {
                finishGame();
                return;
            }
            resetActiveTiles();
        }, animationSpeed * 2);

    }, animationSpeed);
}

function updateBoardAdd() {
    addNewRandomTile();
    if (speed_control_input) speed_control_input.disabled = false;
    setTimeout(function() {
        updateBoardVisual();
        if (gameIsFinished === false) {
            isBoardPaused = false;
        }
    }, animationSpeed);
}

function undoMove() {
    if (prevGameBoard.length === 0 || gameIsFinished || isBoardPaused) {
        return;
    }
    gameBoard = JSON.parse(JSON.stringify(prevGameBoard));
    updateBoardVisual();
    updateScore((prevGameScore - gameScore) * 2);
    prevGameBoard = [];
    undo.classList.add('disabled');
}

function animateTile(type, tile, shift = '0%, 0%') {
    let animation = null;
    switch (type) {
        case 'appeared':
            tile.classList.add('tile-appear');
            setTimeout(() => tile.classList.remove('tile-appear'), animationSpeed);
            break;
        case 'combined':
            tile.style.zIndex = '101';
            tile.classList.add('tile-merge');
            setTimeout(() => {
                tile.classList.remove('tile-merge');
                tile.style.zIndex = '';
            }, animationSpeed);
            break;
        case 'moved':
            tile.style.transformOrigin = 'center center';
            animation = tile.animate([{
                transform: 'translate(0)'
            }, {
                transform: 'translate(' + shift + ')'
            }, ], {
                duration: animationSpeed,
                iterations: 1,
                fill: 'forwards',
                easing: 'ease-in-out'
            });
            break;
    }
    return animation;
}

function collectMovedTiles(direction) {
    let movedTiles = [];
    direction = direction.toLowerCase();
    switch (direction) {
        case 'up':
            movedTiles = moveBoardUp();
            break;
        case 'right':
            movedTiles = moveBoardRight();
            break;
        case 'down':
            movedTiles = moveBoardDown();
            break;
        case 'left':
            movedTiles = moveBoardLeft();
            break;
    }
    return movedTiles;
}

function moveTileList(tiles) {
    let movedTiles = [];
    let gameBoardWidth = document.getElementsByClassName('gameboard')[0].offsetWidth;
    let tileWidth = document.getElementsByClassName('gameboard__tile')[0].offsetWidth;
    let ratio = (gameBoardWidth / tileWidth - 4) / 10;
    for (let k = 0; k < 4; k++) {
        if (tiles[k] == 0) {
            for (let l = k + 1; l < 4; l++) {
                if (tiles[l] != 0) {
                    tiles[k] = tiles[l];
                    tiles[l] = 0;
                    movedTiles.push([l, k, (l - k + (ratio * 2 * (l - k)))]);
                    break;
                }
            }
        }

        if (tiles[k] != 0) {
            for (let l = k + 1; l < 4; l++) {
                if (tiles[l] == 0) {
                    continue;
                }
                if (tiles[l] == tiles[k]) {
                    tiles[k] = tiles[l] * 2;
                    tiles[l] = 0;
                    movedTiles.push([l, k, (l - k + (ratio * 2 * (l - k)))]);
                }
                break;
            }
        }
    }
    return movedTiles;
}

function moveBoardUp() {
    let movedTiles = [];
    for (let j = 0; j < 4; j++) {
        let column = [];
        for (let k = 0; k < 4; k++) {
            column.push(gameBoard[k][j]);
        }
        let movedColumnTiles = moveTileList(column);
        if (movedColumnTiles.length > 0) {
            for (let k = 0; k < movedColumnTiles.length; k++) {
                movedTiles.push([
                    [movedColumnTiles[k][0], j],
                    [movedColumnTiles[k][1], j],
                    '0%, ' + (-movedColumnTiles[k][2]) * 100 + '%'
                ]);
            }
        }
    }
    return movedTiles;
}

function moveBoardDown() {
    let movedTiles = [];
    for (let j = 0; j < 4; j++) {
        let column = [];
        for (let k = 3; k >= 0; k--) {
            column.push(gameBoard[k][j]);
        }
        let movedColumnTiles = moveTileList(column);
        if (movedColumnTiles.length > 0) {
            for (let k = 0; k < movedColumnTiles.length; k++) {
                movedTiles.push([
                    [3 - movedColumnTiles[k][0], j],
                    [3 - movedColumnTiles[k][1], j],
                    '0%, ' + (movedColumnTiles[k][2]) * 100 + '%'
                ]);
            }
        }
    }
    return movedTiles;
}

function moveBoardRight() {
    let movedTiles = [];
    for (let i = 0; i < 4; i++) {
        let column = [];
        for (let k = 3; k >= 0; k--) {
            column.push(gameBoard[i][k]);
        }
        let movedColumnTiles = moveTileList(column);
        if (movedColumnTiles.length > 0) {
            for (let k = 0; k < movedColumnTiles.length; k++) {
                movedTiles.push([
                    [i, 3 - movedColumnTiles[k][0]],
                    [i, 3 - movedColumnTiles[k][1]],
                    (movedColumnTiles[k][2]) * 100 + '%, 0%'
                ]);
            }
        }
    }
    return movedTiles;
}

function moveBoardLeft() {
    let movedTiles = [];
    for (let i = 0; i < 4; i++) {
        let column = [];
        for (let k = 0; k < 4; k++) {
            column.push(gameBoard[i][k]);
        }
        let movedColumnTiles = moveTileList(column);
        if (movedColumnTiles.length > 0) {
            for (let k = 0; k < movedColumnTiles.length; k++) {
                movedTiles.push([
                    [i, movedColumnTiles[k][0]],
                    [i, movedColumnTiles[k][1]],
                    (-movedColumnTiles[k][2]) * 100 + '%, 0%'
                ]);
            }
        }
    }
    return movedTiles;
}

function areMovesAvailable() {
    let movesLeft = collectMovedTiles('left');
    let movesRight = collectMovedTiles('right');
    let movesUp = collectMovedTiles('up');
    let movesDown = collectMovedTiles('down');
    if (movesLeft.length != 0 || movesRight.length != 0 || movesUp.length != 0 || movesDown.length != 0) {
        return true;
    }
    return false;
}

function getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
}

function getRandomInteger(max) {
    return Math.floor(Math.random() * max)
}

function addNewRandomTile() {
    let freeTiles = getFreeTiles();
    if (freeTiles.length === 0) {
        return false;
    }
    let randomIndex = getRandomInteger(freeTiles.length);
    let [row, col] = freeTiles[randomIndex];
    let tileValue = (getRandomInteger(2) + 1) * 2;
    gameBoard[row][col] = tileValue;
    animateTile('appeared', visualTiles[row * 4 + col]);
    return true;
}

function getFreeTiles() {
    let freeTiles = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (gameBoard[i][j] === 0) {
                freeTiles.push([i, j]);
            }
        }
    }
    return freeTiles;
}

function disableAllButtons(exception) {
    let buttons = document.querySelectorAll('button');
    let exceptions = exception.querySelectorAll('button');

    for (let btn of buttons) {
        if ([].indexOf.call(exceptions, btn) == -1) {
            btn.tabIndex = '-1';
        }
    }

    let links = document.querySelectorAll('a');
    for (let link of links) {
        link.tabIndex = '-1';
    }
}

function enableAllButtons() {
    let buttons = document.querySelectorAll('button');
    for (let btn of buttons) {
        btn.tabIndex = '0';
    }
    let links = document.querySelectorAll('a');
    for (let link of links) {
        link.tabIndex = '0';
    }
}

function finishGame() {
    disableAllButtons(victory_screen);
    victory_gif.style.display = 'none';
    victory_best.style.display = 'none';
    victory_record.style.display = 'none';
    victory_save.style.display = 'none';
    victory_save_confirm.style.display = 'none';
    victory_submit.style.display = 'none';
    isBoardPaused = true;
    gameIsFinished = true;
    if (gameScore == null) {
        gameScore = 0;
    }
    victory_score.textContent = 'You scored ' + gameScore + ' points.';
    if (isNewRecord(gameScore)) {
        victory_submit.style.display = 'flex';
        victory_save.style.display = 'block';
        if (leaderboardList.length === 0 || gameScore > leaderboardList.sort(compareScore)[0].score) {
            victory_gif.style.display = 'block';
            victory_best.style.display = 'block';
        } else {
            victory_record.style.display = 'block';
        }
    }
    victory_submit_name.value = userName;
    victory_screen_wrapper.classList.remove('hidden');
    document.body.classList.add('stop-scrolling');
    localStorage.removeItem('game-board');
    localStorage.removeItem('game-score');
}

function startNewGame() {
    gameIsFinished = false;
    isBoardPaused = false;
    victory_screen_wrapper.classList.add('hidden');

    gameBoard = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];

    prevGameBoard = [];
    prevGameScore = 0;
    gameScore = 0;

    enableAllButtons();
    updateScore(0);
    updateBoardVisual();
    updateBestScore();

    // Добавляем 2-3 стартовые плитки
    let tilesToAdd = getRandomInteger(2) + 2;
    for (let i = 0; i < tilesToAdd; i++) {
        addNewRandomTile();
    }
    setTimeout(function() {
        updateBoardVisual();
    }, animationSpeed);
}

function resetActiveTiles() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            let chosenTile = visualTiles[i * 4 + j];
            chosenTile.classList.remove('active-tile-combined');
        }
    }
}

function updateBoardVisual() {
    if (prevGameBoard.length === 0) {
        undo.classList.add('disabled');
    } else {
        undo.classList.remove('disabled');
    }
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            let chosenTile = visualTiles[i * 4 + j];
            let tileValue = gameBoard[i][j];
            chosenTile.setAttribute('data-value', tileValue);
            if (tileValue != 0) {
                chosenTile.textContent = tileValue;
                chosenTile.classList.add('active-tile');
            } else {
                chosenTile.textContent = '';
                chosenTile.classList.remove('active-tile');
            }
            let tileVisual = Math.max(1, tileFont - tileFontRate * tileValue.toString().length);
            chosenTile.style.fontSize = tileVisual.toString() + 'rem';
            changeTileColor(chosenTile);
        }
    }
    if (gameIsFinished == false) {
        localStorage.setItem('game-board', JSON.stringify(gameBoard));
    }
}

function changeTileFont(x) {
    if (x.matches) {
        if (tileFont != 2) {
            tileFont = 2;
            tileFontRate = 0.25;
            updateBoardVisual();
        }
    } else {
        if (tileFont != 2.25) {
            tileFont = 2.25;
            tileFontRate = 0.125;
            updateBoardVisual();
        }
    }
}

function pickHex(color1, color2, weight) {
    let w2 = weight;
    let w1 = 1 - w2;
    let rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
        Math.round(color1[1] * w1 + color2[1] * w2),
        Math.round(color1[2] * w1 + color2[2] * w2)
    ];
    return rgb;
}

function changeTileColor(tile) {
    let tileValue = tile.getAttribute('data-value');
    if (tileValue == 0) {
        tile.style.background = '';
        return;
    }
    let tileValuePercent = Math.min(1, getBaseLog(2, tileValue) / getBaseLog(2, maxTileValue));
    let gradientEdge = Math.round(tileValuePercent * 100 / 25);
    let firstColor = tileColors[gradientEdge];
    let secondColor = tileColors[Math.min(gradientEdge + 1, tileColors.length - 1)];
    let weight = (tileValuePercent * 100 / 25 - (Math.min(gradientEdge) - 1));
    let color = pickHex(firstColor, secondColor, weight);
    tile.style.background = 'rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';
}

function compareScore(a, b) {
    return b.score - a.score;
}

function isNewRecord(newScore) {
    if (leaderboardList.length < 10) return true;
    leaderboardList.sort(compareScore);
    if (leaderboardList[leaderboardList.length - 1].score < newScore) {
        return true;
    }
    return false;
}

function addToLeaderboard(newName, newScore, newDate) {
    if (!isNewRecord(newScore)) return;

    if (leaderboardList.length >= 10) {
        leaderboardList.sort(compareScore);
        leaderboardList.pop();
    }
    leaderboardList.push({
        name: sanitize(newName) || 'user',
        date: newDate,
        score: newScore
    });
    localStorage.setItem('leaderboard', JSON.stringify(leaderboardList));
    populateLeaderboard();
}

function populateLeaderboard() {
    leaderboard_list.innerHTML = '';
    leaderboardList.sort(compareScore);
    for (let entry of leaderboardList) {
        let leaderboard_entry = document.createElement('li');
        leaderboard_entry.innerHTML = `<span>${entry.name}</span> <span>${entry.score}</span> <span>${entry.date}</span>`;
        leaderboard_list.appendChild(leaderboard_entry);
    }
    for (let i = leaderboardList.length; i < 10; i++) {
        let leaderboard_entry = document.createElement('li');
        leaderboard_entry.innerHTML = `<span>...</span> <span>0</span> <span>YYYY-MM-DD</span>`;
        leaderboard_list.appendChild(leaderboard_entry);
    }
}

function closeSpeedControl(e) {
    isBoardPaused = false;
    enableAllButtons();
    if (!e.target.classList.contains('popup')) {
        return;
    }
    if (!speed_control_wrapper.classList.contains('hidden')) {
        speed_control_wrapper.classList.add('hidden');
        if (document.body.classList.contains('stop-scrolling')) {
            document.body.classList.remove('stop-scrolling');
        };
    }
}

function openLeaderboard() {
    disableAllButtons(leaderboard_wrapper);
    leaderboard_wrapper.classList.remove('hidden');
    document.body.classList.add('stop-scrolling');
}

function closeLeaderboard() {
    enableAllButtons();
    leaderboard_wrapper.classList.add('hidden');
    document.body.classList.remove('stop-scrolling');
}

// ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
undo.addEventListener('click', function(e) {
    e.preventDefault();
    undoMove();
    this.querySelector('input').checked = false;
});

reset.addEventListener('click', function(e) {
    e.preventDefault();
    if (confirm('Are you absolutely sure you want to start a new game?') === true) {
        startNewGame();
    }
    this.querySelector('input').checked = false;
});

speed_control_btn.addEventListener('click', function(e) {
    e.preventDefault();
    if (speed_control_wrapper.classList.contains('hidden')) {
        isBoardPaused = true;
        disableAllButtons(speed_control_wrapper);
        speed_control_wrapper.classList.remove('hidden');
        document.body.classList.add('stop-scrolling');
    }
    this.querySelector('input').checked = false;
});

speed_control_close.addEventListener('click', (e) => {
    closeSpeedControl(speed_control_wrapper);
});

speed_control_wrapper.addEventListener('click', (e) => {
    closeSpeedControl(e.target);
});

speed_control_input.addEventListener('change', (event) => {
    animationSpeed = baseSpeed * (1 / markers[event.target.value]);
    localStorage.setItem('game-speed', animationSpeed);
    speed_control_value.textContent = 'x' + markers[event.target.value];
});

leaderboardBtn.addEventListener('click', function(e) {
    e.preventDefault();
    openLeaderboard();
    this.querySelector('input').checked = false;
});

leaderboard_wrapper.addEventListener('click', (e) => {
    if (e.target.classList.contains('popup')) {
        closeLeaderboard();
    }
});

leaderboard_close.addEventListener('click', () => {
    closeLeaderboard();
});

for (let btn of controls_btns) {
    btn.addEventListener('click', () => {
        updateBoardMove(btn.dataset.direction);
    });
}

// Обработчик клавиатуры
document.addEventListener('keydown', (e) => {
    if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        let direction = e.key.slice(5).toLowerCase();
        if (!gameIsFinished && !isBoardPaused && victory_screen_wrapper.classList.contains('hidden') && leaderboard_wrapper.classList.contains('hidden')) {
            updateBoardMove(direction);
        }
    }
});

victory_submit.addEventListener('submit', (e) => {
    e.preventDefault();
    addToLeaderboard(victory_submit_name.value, gameScore, new Date().toISOString().slice(0, 10));
    victory_submit.style.display = 'none';
    victory_save.style.display = 'none';
    victory_record.style.display = 'none';
    victory_gif.style.display = 'none';
    victory_best.style.display = 'none';
    victory_save_confirm.style.display = 'block';
    userName = sanitize(victory_submit_name.value);
    localStorage.setItem('user-name', userName);
});

victory_reset.addEventListener('click', function(e) {
    e.preventDefault();
    victory_screen_wrapper.classList.add('hidden');
    startNewGame();
});

// Кнопка закрытия в окне победы
const victoryCloseBtn = victory_screen.querySelector('.close-btn');
if (victoryCloseBtn) {
    victoryCloseBtn.addEventListener('click', () => {
        victory_screen_wrapper.classList.add('hidden');
        document.body.classList.remove('stop-scrolling');
        enableAllButtons();
    });
}

// Кнопка Close в окне скорости
const closeSpeedBtn = document.getElementById('close-speed-btn');
if (closeSpeedBtn) {
    closeSpeedBtn.addEventListener('click', function(e) {
        e.preventDefault();
        closeSpeedControl(speed_control_wrapper);
    });
}

nuke.addEventListener('click', function() {
    if (confirm('Are you absolutely sure you want to get rid of your saves & start a new game?') === true) {
        localStorage.clear();
        elem_best.textContent = '0';
        prevGameBoard = [];
        leaderboardList = [];
        gameScore = 0;
        prevGameScore = 0;
        speed_control_input.value = 3;
        animationSpeed = baseSpeed;
        speed_control_value.textContent = 'x' + markers[3];
        populateLeaderboard();
        startNewGame();
    }
});

// Адаптация шрифта
let x = window.matchMedia('(max-width: 512px)');
x.addEventListener('change', function() {
    changeTileFont(x);
});

// ===== ЗАГРУЗКА СОХРАНЕНИЙ =====
if (localStorage.getItem('leaderboard')) {
    leaderboardList = JSON.parse(localStorage.getItem('leaderboard'));
    updateBestScore();
}

if (localStorage.getItem('game-board')) {
    gameBoard = JSON.parse(localStorage.getItem('game-board'));
    gameScore = JSON.parse(localStorage.getItem('game-score'));
    if (gameScore == null) {
        gameScore = 0;
    }
    elem_score.textContent = gameScore;
    updateBoardVisual();
} else {
    startNewGame();
}

if (localStorage.getItem('game-speed')) {
    animationSpeed = JSON.parse(localStorage.getItem('game-speed'));
    let speed = Math.round(baseSpeed * 100 / animationSpeed) / 100;
    let ind = markers.indexOf(Number(speed));
    if (ind >= 0) {
        speed_control_input.value = ind;
        speed_control_value.textContent = 'x' + markers[ind];
    }
}
if (localStorage.getItem('user-name')) {
    userName = localStorage.getItem('user-name');
}

populateLeaderboard();
changeTileFont(x);
