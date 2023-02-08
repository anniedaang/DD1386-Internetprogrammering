// function createChocolateBar that creates a matrix with row and col
// row 1 and col 1 always P
function createChocolateBar(row, col) {
  // create an empty matrix
  let matrix = [];
  // loop through the rows
  for (let i = 0; i < row; i++) {
    // create an empty array for each row
    matrix[i] = [];
    // add i+1 + "" + j+1 to each column in the row
    for (let j = 0; j < col; j++) {
      matrix[i][j] = (i + 1) + "" + (j + 1);
    }
  }
  // change the first element to P
  matrix[0][0] = "P ";
  return matrix;
}

function printChocolateBar(gameboard) {
  const gameboardHolder = document.getElementById("gameboardHolder");
  gameboardHolder.innerHTML = '';
  // loop through the matrix
  for (let i = 0; i < gameboard.length; i++) {
    let divrow = document.createElement("div");
    divrow.setAttribute("class", "row");
    for (let j = 0; j < gameboard[i].length; j++) {
      let divblock = document.createElement("div");
      divblock.setAttribute("class", "block");
      divblock.innerHTML = gameboard[i][j];
      divrow.appendChild(divblock);
      divblock.addEventListener("click", (event)=>{selectBlock(gameboard, i, j)});
    }
    gameboardHolder.appendChild(divrow);
  }
}

function selectBlock(gameboard, row, col) {
  let check = false;
  [gameboard, check] = chomp(gameboard, row, col);
  if (check) {
    document.getElementById("gameboardHolder").innerHTML = "";
    printChocolateBar(gameboard);
    if (checkWinner(gameboard)) {
      document.getElementById('message').innerText = `The winner is the ${player[turn % 2]} player! 🥳 🥂`;
    }
    else {
      turn++;
      document.getElementById('message').innerText = `The ${player[turn % 2]} player turn to select!`;
    }
  }
}

// function that removes the columns to the right and the rows below the row and column that the user entered
// in parameter, a matrix with strings, row and col, returns the new matrix
function chomp(matrix, row, col) {
  // can't select P
  if (matrix[row][col] !== "P ") {
    // loop through the matrix
    for (let i = 0; i < matrix.length; i++) {
      if (i >= row) {
        // remove the columns to the right of the column that the user entered
          matrix[i].splice(col, matrix[i].length - col);
      }
    }
  }
  else {
    return [matrix, false];
  }
  // if an array is empty, remove it
  for (let i = 0; i < matrix.length; i++) {
    if (matrix[i].length === 0) {
      matrix.splice(i, matrix.length);
    }
  }
  return [matrix, true];
}

// function checkWinner checks if there's a winner or not - in parameter, a matrix with strings
// return true if the matrix size is 1x1, false otherwise
function checkWinner(matrix) {
  if (matrix.length === 1 && matrix[0].length === 1) {
    return true;
  }
  return false;
}

const gameboard = createChocolateBar(6, 7);
let turn = 0;
let player = ["first", "second"];

printChocolateBar(gameboard);

document.getElementById("message").innerText = `The ${
  player[turn % 2]
} player turn to select!`;