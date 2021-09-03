/* eslint-disable no-plusplus */

/*
  To do:
    Add listeners to options
    Refactor some shitty looking code for the table building
    Fix the HTML alignment of the board
    Add clock
    Add timings for each move made
*/

class Timer {
  constructor() {
    this.timer = document.getElementById('timer');
    this.startingTime = 80;
    this.currentTime = -1;
    this.minutes = -1;
    this.seconds = -1;

    this.timer.addEventListener('mouseenter', (event) => {
      this.timer.style.backgroundColor = 'green';
    });

    this.timer.addEventListener('mouseleave', (event) => {
      this.timer.style.backgroundColor = 'rgb(59, 0, 0)';
    });

    this.timer.addEventListener('click', (event) => {
      if (!this.gamePlaying) {
        this.start();
      } else {
        this.stop();
      }
    });
  }

  countdown() {
    this.seconds = this.currentTime % 60;
    this.minutes = Math.floor(this.currentTime / 60);
    this.updateTimer();
    this.currentTime--;
  }

  updateTimer() {
    this.timer.innerText = this.minutes + ":" + this.seconds;
  }

  start() {
    this.currentTime = this.startingTime;
  }
}

class Game {
  constructor(timer) {
    this.board = document.getElementById('chessboard');
    this.overlay = document.getElementById('overlay');
    this.prompter = document.getElementById('prompter');
    this.results = document.getElementById('results');
    this.gametype = document.querySelector('input[name="gametype"]:checked').value;
    this.timer = timer;
    this.startingTime = 80;
    this.currentTime = this.startingTime;
    this.gamePlaying = false;
    this.prompt = undefined;
    this.history = [];
    this.allSquares = [];
    this.total = 0;
    this.limit = 20;
    this.correctCount = 0;
    this.overlayRank = -1;
    this.overlayFile = -1;
    this.files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    this.options = {
      promptType: 3, // 0: Ranks, 1: Files, 2: Both, 3: Squares
      drawNotation: false,
      drawOverlay: false,
      flashCorrectSquare: false,
    };

    this.initialize();
    this.start();
  }

  initialize() {
    // BOARD
    for (let i = 0; i < 8; i++) {
      const boardlayer = document.createElement('div');
      for (let j = 0; j < 8; j++) {
        const square = document.createElement('div');
        const name = this.files[j] + (i + 1);
        if ((i + j) % 2 === 0) {
          square.className = 'blackSquare';
        } else {
          square.className = 'whiteSquare';
        }
        square.setAttribute('rank', i + 1);
        square.setAttribute('file', j);
        square.setAttribute('name', name);
        square.innerText = name;
        this.allSquares.push(name);

        boardlayer.append(square);
      }
      this.board.prepend(boardlayer);
    }

    // LISTENERS
    // Gets square beneath cursor
    if (this.options.drawOverlay) {
      this.board.addEventListener('mouseover', (event) => {
        this.overlayFile = event.target.getAttribute('file');
        this.overlayRank = event.target.getAttribute('rank');
        this.update();
      }, true);


      this.board.addEventListener('mouseleave', (event) => {
        this.overlay.style.visibility = 'hidden';
      });

      this.board.addEventListener('mouseenter', (event) => {
        this.overlay.style.visibility = 'visible';
      });
    }

    this.board.addEventListener('mousedown', (event) => {
      if (this.gamePlaying) {
        this.guess(event.target.getAttribute('rank'), this.files[event.target.getAttribute('file')]);
      }
    });
  }

  formatTimer() {
    console.log("time: " + this.currentTime);
    const seconds = this.currentTime % 60;
    const minutes = Math.floor(this.currentTime / 60);
    // console.log(`${this.startingTime}:${this.currentTime}`);
    // console.log(`${minutes}:${seconds}`);
    // minutes = minutes < 10 ? `0${minutes}` : minutes;
    // seconds = seconds < 10 ? `0${seconds}` : seconds;
    this.currentTime--;
    this.timer.innerText = minutes + ":" + seconds;
  }

  drawRank() {
    this.prompt = Math.floor(1 + Math.random() * 7);
  }

  drawFile() {
    this.prompt = this.files[Math.random() * 7];
  }

  drawRankOrFile() {
    if (Math.random() > 0.5) {
      this.drawRank();
    }
    this.drawFile();
  }

  drawSquare() {
    this.prompt = this.drawFile + this.drawRank();
  }

  next() {
    switch (this.options.promptType) {
      case 0:
        this.prompt = Math.floor(1 + Math.random() * 7);
        break;
      case 1:
        this.prompt = this.files[Math.random() * 7];
        break;
      case 2:
        if (Math.random() > 0.5) {
          this.prompt = Math.floor(1 + Math.random() * 7);
        } else {
          this.prompt = this.files[Math.random() * 7];
        }
        break;
      case 3:
        this.prompt = this.allSquares[Math.floor(Math.random() * 63)];
        break;
      default:
    }

    this.prompter.innerText = this.prompt;
  }

  guess(rank, file) {
    this.total += 1;
    const guess = file + rank;
    let correct = false;
    switch (this.options.promptType) {
      case 0: // Rank
        if (rank === this.prompt) {
          this.correctCount += 1;
          correct = true;
        }
        this.history.push([this.prompt, rank, correct]);
        break;
      case 1: // File
        if (file === this.prompt) {
          this.correctCount += 1;
          correct = true;
        }
        this.history.push([this.prompt, file, correct]);
        break;
      case 3: // Square
        if (guess === this.prompt) {
          this.correctCount += 1;
          correct = true;
        }
        this.history.push([this.prompt, guess, correct]);
        break;
      default:
    }

    if (this.total < this.limit) {
      this.next();
    } else {
      this.stop();
    }
  }

  start() {
    console.log(this.startingTime);
    console.log(this.currentTime);
    // this.currentTime = this.startingTime;
    setInterval(this.timer.countdown, 1000);
    this.gamePlaying = true;
    this.history = [];
    this.correctCount = 0;
    this.total = 0;
    this.next();
  }

  stop() {
    this.gamePlaying = false;
    // this.toggleText();
    this.buildResults();
    this.prompter.innerText = 'Game stopped.';
  }

  buildResults() {
    let row; let prompt; let answer; let number;
    const table = document.getElementById('results-table');
    for (let i = 0; i < this.history.length; i++) {
      row = table.insertRow(-1);
      number = row.insertCell(0)
      prompt = row.insertCell(1);
      answer = row.insertCell(2);
      prompt.innerHTML = this.history[i][0];
      answer.innerHTML = this.history[i][1];
      number.innerHTML = i;
      if (this.history[i][2]) {
        row.setAttribute('correct', 'true')
      } else {
        row.setAttribute('correct', 'false');
      }
    }
  }

  toggleText() {
    if (this.drawNotation) {
      this.chessboard.style.fontSize = '11';
      this.drawNotation = false;
    } else {
      this.chessboard.style.fontSize = '0';
      this.drawNotation = true;
    }
  }

  update() {
    document.getElementById('rankOL').style.marginTop = `${560 - 70 * this.overlayRank}px`;
    document.getElementById('fileOL').style.marginLeft = `${70 * this.overlayFile}px`;
  }
}


const timer = new Timer();
const game = new Game(timer);
