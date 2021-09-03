/* eslint-disable no-plusplus */

/* TODO
  Clean up page, center board
  Add alternate modes for rank and file
  Square flashing
  Generating entire sequence at start of game
  Showing large overlay like how lichess does it
  Refactor class to keep some things global
*/

class Game {
  constructor() {
    this.board = document.getElementById('chessboard');
    this.overlay = document.getElementById('overlay');
    this.started = false;
    this.current = undefined;
    this.allSquares = [];
    this.total = 0;
    this.correct = 0;
    this.overlayRank = -1;
    this.overlayFile = -1;
    this.files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    this.drawNotation = false;
    this.results = [];
    this.resultsTable = document.getElementById("results-table").firstElementChild;
    this.tableRow;
    this.overlayCheckbox = document.getElementsByName("overlay")[0];

    this.initialize();
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
    this.board.addEventListener('mouseover', (event) => {
      this.overlayFile = event.target.getAttribute('file');
      this.overlayRank = event.target.getAttribute('rank');
      this.update();
    }, true);

    this.board.addEventListener('mouseleave', (event) => {
      this.overlay.style.visibility = 'hidden';
    });

    this.board.addEventListener('mouseenter', (event) => {
      if (this.overlayCheckbox.checked){
        this.overlay.style.visibility = 'visible';
      }
    });

    this.board.addEventListener('mousedown', (event) => {
      if (this.started) {
        this.guess(event.target.getAttribute('name'));
      }
    });

    document.getElementById('start-stop').addEventListener('mouseup', (event) => {
      if (!this.started) {
        this.start();
      } else {
        this.stop();
      }
    });
  }

  next() {
    this.current = this.allSquares[Math.floor(Math.random() * 63)];
    // Add row to table
    this.tableRow = document.createElement("tr");
    this.tableRow.setAttribute("correct", "guess");
    this.tableRow.insertCell(0);
    this.tableRow.insertCell(1);
    this.tableRow.insertCell(2);
    this.tableRow.cells[0].innerText = this.total+1;
    this.tableRow.cells[1].innerText = this.current;
    this.resultsTable.append(this.tableRow);
    this.results.push(this.tableRow);
    prompter.innerText = `Current: ${this.current}`;
  }

  guess(namedSquare) {
    if (namedSquare === this.current) {
      this.tableRow.setAttribute("correct", "true");
      this.correct++;
    }
    else {
      this.tableRow.setAttribute("correct", "false");
    }
    this.total++;
    score.innerText = `${this.correct}/${this.total}`;
    this.tableRow.cells[2].innerText = namedSquare;
    this.next();
  }

  start() {
    this.started = true;
    this.correct, this.total = 0;
    this.next();
    this.toggleText();
    prompter.innerText = `Current: ${this.current}`;
    // Clear results table
    this.results.forEach(row => row.remove());
  }

  stop() {
    this.started = false;
    this.toggleText();
    prompter.innerText = 'Game stopped.';
  }


  toggleText() {
    if (this.drawNotation) {
      chessboard.style.fontSize = '11';
      this.drawNotation = false;
    } else {
      chessboard.style.fontSize = '0';
      this.drawNotation = true;
    }
  }

  update() {
    document.getElementById('rankOL').style.marginTop = `${560-70 * this.overlayRank}px`;
    document.getElementById('fileOL').style.marginLeft = `${70 * this.overlayFile}px`;
  }
}


const game = new Game();
