const CELL_SIZE = 50;
const BLACK = 1;
const WHITE = -1;
const EMPTY = 0;
let userColor = BLACK;
let aiColor = WHITE;
let board;
let currentPlayer;

const canvas = document.getElementById('board');
const context = canvas.getContext('2d');
const message = document.getElementById('message');
const loading = document.getElementById('loading');
const progress = document.getElementById('progress');
const retryButton = document.getElementById('retry');

// ロードメニューを表示
loading.style.display = 'block';

// JSONファイルを読み込む
let qTable;

fetch('https://cors-anywhere.herokuapp.com/https://www.dropbox.com/scl/fi/jo9bqu1mfqto1l5h65z90/q_table_black.json.gz?rlkey=nf9fh3j12cagtokzqghcnztfn&st=i8ww22r3&dl=1')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.arrayBuffer();
    })
    .then(data => {
        const decompressedData = pako.ungzip(new Uint8Array(data), { to: 'string' });
        qTable = JSON.parse(decompressedData);

        // ロードメニューを非表示
        loading.style.display = 'none';
        retryButton.style.display = 'block';
        initGame();
    })
    .catch(error => {
        console.error('Error loading JSON:', error);
        loading.style.display = 'none';
    });

retryButton.addEventListener('click', resetGame);

function initGame() {
    board = Array(8).fill().map(() => Array(8).fill(EMPTY));
    board[3][3] = WHITE;
    board[4][4] = WHITE;
    board[3][4] = BLACK;
    board[4][3] = BLACK;
    currentPlayer = BLACK;

    canvas.addEventListener('click', (event) => handleClick(event, qTable));
    drawBoard();
}

function resetGame() {
    board = Array(8).fill().map(() => Array(8).fill(EMPTY));
    board[3][3] = WHITE;
    board[4][4] = WHITE;
    board[3][4] = BLACK;
    board[4][3] = BLACK;
    currentPlayer = BLACK;
    message.textContent = '';

    drawBoard();
}

function handleClick(event, qTable) {
    const x = Math.floor(event.offsetX / CELL_SIZE);
    const y = Math.floor(event.offsetY / CELL_SIZE);

    if (isValidMove(board, x, y, userColor)) {
        board[x][y] = userColor;
        flipPieces(board, x, y, userColor);
        currentPlayer = aiColor;
        drawBoard();

        if (isGameOver(board)) {
            displayWinner(qTable);
        } else {
            setTimeout(() => {
                const aiMove = chooseBestMove(board, qTable, aiColor);
                if (aiMove) {
                    const [aiX, aiY] = aiMove;
                    board[aiX][aiY] = aiColor;
                    flipPieces(board, aiX, aiY, aiColor);
                    currentPlayer = userColor;
                    drawBoard();

                    if (isGameOver(board)) {
                        displayWinner(qTable);
                    }
                }
            }, 500);
        }
    }
}

function drawBoard() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'green';
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            context.strokeRect(i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            if (board[i][j] === BLACK) {
                context.beginPath();
                context.arc(i * CELL_SIZE + CELL_SIZE / 2, j * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2 - 5, 0, 2 * Math.PI);
                context.fillStyle = 'black';
                context.fill();
            } else if (board[i][j] === WHITE) {
                context.beginPath();
                context.arc(i * CELL_SIZE + CELL_SIZE / 2, j * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2 - 5, 0, 2 * Math.PI);
                context.fillStyle = 'white';
                context.fill();
            }
        }
    }
}

function isValidMove(board, x, y, player) {
    if (board[x][y] !== EMPTY) return false;
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dx, dy] of directions) {
        let nx = x + dx, ny = y + dy;
        let foundOpponent = false;
        while (nx >= 0 && ny >= 0 && nx < 8 && ny < 8 && board[nx][ny] === -player) {
            foundOpponent = true;
            nx += dx;
            ny += dy;
        }
        if (foundOpponent && nx >= 0 && ny >= 0 && nx < 8 && ny < 8 && board[nx][ny] === player) {
            return true;
        }
    }
    return false;
}

function flipPieces(board, x, y, player) {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dx, dy] of directions) {
        let nx = x + dx, ny = y + dy;
        let piecesToFlip = [];
        while (nx >= 0 && ny >= 0 && nx < 8 && ny < 8 && board[nx][ny] === -player) {
            piecesToFlip.push([nx, ny]);
            nx += dx;
            ny += dy;
        }
        if (piecesToFlip.length > 0 && nx >= 0 && ny >= 0 && nx < 8 && ny < 8 && board[nx][ny] === player) {
            for (const [fx, fy] of piecesToFlip) {
                board[fx][fy] = player;
            }
        }
    }
}

function isGameOver(board) {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (board[i][j] === EMPTY && (isValidMove(board, i, j, BLACK) || isValidMove(board, i, j, WHITE))) {
                return false;
            }
        }
    }
    return true;
}

function displayWinner(qTable) {
    const blackCount = board.flat().filter(cell => cell === BLACK).length;
    const whiteCount = board.flat().filter(cell => cell === WHITE).length;
    let winner = "It's a tie!";
    if (blackCount > whiteCount) {
        winner = "Black wins!";
    } else if (whiteCount > blackCount) {
        winner = "White wins!";
    }
    message.textContent = winner;
    setTimeout(() => {
        const playAgain = confirm(winner + "\nWould you like to play again?");
        if (playAgain) {
            resetGame();
        }
    }, 100);
}

function chooseBestMove(board, qTable, player) {
    let bestMove = null;
    let maxQValue = -Infinity;
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            if (isValidMove(board, x, y, player)) {
                const stateActionKey = JSON.stringify({ state: board, action: [x, y] });
                const qValue = qTable[stateActionKey] || 0;
                if (qValue > maxQValue) {
                    maxQValue = qValue;
                    bestMove = [x, y];
                }
            }
        }
    }
    return bestMove;
}
