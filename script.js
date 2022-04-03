class Game {
  constructor(boardSize = 3, winSize = 3) {
    if (boardSize < winSize) throw new Error('Board cannot be smaller than winning line!');
    this.BOARD_SIZE = boardSize;
    this.WIN_SIZE = winSize;
  }

  BOARD_SIZE = 3
  WIN_SIZE = 3
  X_CLASS = 'x'
  O_CLASS = 'o'
  DEFAULT_CLASS = this.X_CLASS;
  PLAYERS_IDS = [null, this.X_CLASS, this.O_CLASS]
  HIDDEN_CLASS = 'hidden'

  currentClass = this.DEFAULT_CLASS;
  board = [];
  
  boardEl = document.getElementById('board')
  // created each time
  cellsEls = [];
  endMessageEl = document.getElementById('endMessage')
  restartButtonEl = document.getElementById('restartButton')

  // utils

  handleClick(e) {
    const cell = e.target;
    const cellId = this.getCellIndexByEl(cell);

    this.updateBoard(cellId);
    this.renderState(cell);
  }

  getCellIndexByEl(cell) {
    return this.cellsEls.indexOf(cell);
  }

  getRow(index) {
    return parseInt(index / this.BOARD_SIZE);
  }

  getRowEl(index) {
    return index % this.BOARD_SIZE;
  }

  createCell() {
    const cell = document.createElement('div');
    cell.setAttribute('data-cell', '');
    cell.classList.add('cell');
    return cell;
  }

  // state methods
  
  createBoard() {
    const board = [];

    for (let i = 0; i < this.BOARD_SIZE; i++) {
      const row = Array.from(Array(this.BOARD_SIZE)).map(() => 0);
      board.push(row);
    }

    this.board = board;

    // create HTML board
    this.boardEl.innerHTML = '';
    this.cellsEls = [];
    for (let i = 0; i < this.BOARD_SIZE**2; i++) {
      const cell = this.createCell();
      cell.addEventListener('click', this.handleClick.bind(this), { once: true });
      this.cellsEls.push(cell);
      this.boardEl.appendChild(cell);
    }
    this.boardEl.style.gridTemplateColumns = `repeat(${this.BOARD_SIZE}, auto)`
  }

  updateBoard(cellIndex) {
    const row = this.getRow(cellIndex);
    const cell = this.getRowEl(cellIndex);
    const stateId = this.PLAYERS_IDS.indexOf(this.currentClass);

    this.board[row][cell] = stateId;
  }

  swapPlayer() {
    this.currentClass = this.currentClass === this.X_CLASS ? this.O_CLASS : this.X_CLASS;
  }

  checkRow(...cells) {
    // check first cell non-zero and all cells match
    return cells[0] && cells.every(cell => cell === cells[0]);
  }
  
  checkWin() {
    const size = this.BOARD_SIZE;
    const minSize = size - this.WIN_SIZE + 1;
    // check right
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < minSize; c++) {
        if (this.checkRow(...this.board[r].slice(c, c + this.WIN_SIZE))) return this.board[r][c];
      }
    }

    // check down
    for (let r = 0; r < minSize; r++) {
      for (let c = 0; c < size; c++) {
        if (this.checkRow(...this.board.slice(r, r + this.WIN_SIZE).map(row => row[c]))) return this.board[r][c];
      }
    }

    // check down-right
    for (let r = 0; r < minSize; r++) {
      for (let c = 0; c < minSize; c++) {
        if (this.checkRow(...this.board.slice(r, r + this.WIN_SIZE).map((row, i) => row[c + i]))) return this.board[r][c];
      }
    }

    // check down left
    for (let r = 0; r < minSize; r++) {
      for (let c = size - 1; c >= minSize - 1; c--) {
        if (this.checkRow(...this.board.slice(r, r + this.WIN_SIZE).map((row, i) => row[c - i]))) return this.board[r][c];
      }
    }
  }

  checkHasFreeCells() {
    // check if there are cells with no value (0)
    return this.board.some(row => row.some(cell => !cell));
  }
  
  // render methods
  
  lockBoard() {
    this.boardEl.style.pointerEvents = 'none';
  }

  unlockBoard() {
    this.boardEl.style.removeProperty('pointer-events');
  }
  
  clearBoardState() {
    this.boardEl.classList.remove(this.X_CLASS, this.O_CLASS);
  }
  
  clearCells() {
    this.cellsEls.forEach(cellEl => cellEl.classList.remove(this.X_CLASS, this.O_CLASS));
  }
  
  setCellState(cell, className) {
    cell.classList.add(className);
  }

  setBoardState() {
    this.clearBoardState();
    this.boardEl.classList.add(this.currentClass);
  }

  clearEndMessage() {
    this.endMessageEl.textContent = '';
  }
  
  setEndMessage(playerId) {
    if (!playerId) {
      this.endMessageEl.textContent = 'DRAW';
    } else {
      const player = this.PLAYERS_IDS[playerId];
      this.endMessageEl.textContent = `${player.toUpperCase()} WINS!`;
    }
  }

  // handle visuals

  renderState(cell) {
    // set cell
    this.setCellState(cell, this.currentClass);
    // set endGame state
    const winnerId = this.checkWin();
    const hasFreeCells = this.checkHasFreeCells();

    if (winnerId) {
      this.lockBoard();
      this.setEndMessage(winnerId);
    }

    if (!hasFreeCells) {
      this.setEndMessage();
    }

    // swap class
    this.swapPlayer();
    // set board turn class after player swapped
    this.setBoardState();
  }

  // reset

  reset() {
    this.currentClass = this.DEFAULT_CLASS;
    this.clearCells();
    this.clearEndMessage();
    this.unlockBoard();
    this.startGame();
  }
  
  // init

  startGame() {
    this.currentClass = this.DEFAULT_CLASS;
    this.createBoard();
    this.setBoardState();
  }
  
  init() {
    this.restartButtonEl.addEventListener('click', this.reset.bind(this));
    this.startGame();
  }
}

const game = new Game(10, 4);

game.init();