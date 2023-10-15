import readlineSync from "readline-sync";

function input(prompt) {
  return readlineSync.question(prompt);
}

const answer = input("Want to play Chomp? (yes/no) ");
if (answer === "yes") {
  console.log("Let's play!");
} else {
  console.log("Bye!");
}


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

// function printChocolateBar prints the matrix with strings - in parameter, a matrix with strings
function printChocolateBar(matrix) {
  // loop through the matrix
  for (let i = 0; i < matrix.length; i++) {
    // loop through the row and print all the elements on the same line
    let row = "";
    for (let j = 0; j < matrix[i].length; j++) {
      row = row + matrix[i][j] + " ";
    }
    console.log(row);
  }
}

// function that removes the columns to the right and the rows below the row and column that the user entered
// in parameter, a matrix with strings, row and col, returns the new matrix
function chomp(matrix, row, col) {
  // loop through the matrix
  for (let i = 0; i < matrix.length; i++) {
    if (i + 1 >= row) {
      // remove the columns to the right of the column that the user entered
        matrix[i].splice(col - 1, matrix[i].length - col + 1);
    }
  }
  // if an array is empty, remove it
  for (let i = 0; i < matrix.length; i++) {
    if (matrix[i].length === 0) {
      matrix.splice(i, matrix.length);
    }
  }
  return matrix;
}

// function checkWinner checks if there's a winner or not - in parameter, a matrix with strings
// return true if the matrix size is 1x1, false otherwise
function checkWinner(matrix) {
  if (matrix.length === 1 && matrix[0].length === 1) {
    return true;
  }
  return false;
}

// function askCellNumber reads the user's choice of row and column. if the row and column are not valid, it will ask again
// in parameter, the matrix with strings
// returns and array with the valid row and column
function askCellNumber(matrix, player) {
  // userinput is a string with the row and col combined, ex. "12"
  let userinput = input(player + " spelarens tur, välj ett blocknummer: ");
  let row = userinput[0];
  let col = userinput[1];
  
  let check = checkUserInput(matrix, userinput);

  while (!check) {
    userinput = input(userinput + " är ett ogiltigt blocknummer, försök igen: ");
    check = checkUserInput(matrix, userinput);
    row = userinput[0];
    col = userinput[1];
  }
  return [row, col];
}

// help function to check if the row and column are valid, returns true if valid, false otherwise
function checkUserInput(matrix, userinput) {
  // if the row and column are valid, return true, else return false
  let numofrows = matrix.length;
  let numofcols = matrix[0].length;
  let x = numofrows.toString().length;
  let y = numofcols.toString().length;
  if (userinput.length !== x + y) {
    return false;
  }

  userinput = userinput.split("");
  let row = userinput[0];
  let col = userinput[1];
  if (row <= matrix.length && col <= matrix[0].length) {
    return true;
  }
  return false;
}

// THE GAME STARTS HERE
const row = 6;
const cols = 7;

const gameboard = createChocolateBar(row, cols); // create the chocolate bar
let turn = 0; 
let player = ["första", "andra"]; // array with the players
let gameIsOn = true;

console.log("Välkommen till spelet Chomp.");
console.log("Instruktioner: I spelet kommer du utmanas om att välja ett blocknummer från spelplanen. Det valda blocket och alla block under och till högre kommer att raderas. Spelet går ut på att undvika välja P, den spelare som väljer P förlorar och den andra spelare vinner.");

while (gameIsOn) {
  printChocolateBar(gameboard);
  let [row, col] = askCellNumber(gameboard, player[turn%2]); // ask the user for a row and column till the answer is valid
  let newGameboard = chomp(gameboard, row, col); // remove the rows and columns that are greater than the row and column that the user entered
  if (checkWinner(newGameboard)) {
    printChocolateBar(gameboard);
    console.log("Spelet är slut, Vinnare är den " + player[turn%2] + " spelaren!");
    gameIsOn = false;
  } else {
    // if the checkWinner is false increase turn
    turn++;
  }
}