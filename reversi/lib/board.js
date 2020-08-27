let Piece = require("./piece");

/**
 * Returns a 2D array (8 by 8) with two black pieces at [3, 4] and [4, 3]
 * and two white pieces at [3, 3] and [4, 4]
 */
function _makeGrid () {
  let grid = Array(8);
  for(let i=0; i<8; i++){
    grid[i]=Array(8);
  }
  grid[3][4] = new Piece('black');
  grid[4][3] = new Piece('black');
  grid[3][3] = new Piece('white');
  grid[4][4] = new Piece('white');
  return grid;
}

/**
 * Constructs a Board with a starting grid set up.
 */
function Board () {
  this.grid = _makeGrid();
}

Board.DIRS = [
  [ 0,  1], [ 1,  1], [ 1,  0],
  [ 1, -1], [ 0, -1], [-1, -1],
  [-1,  0], [-1,  1]
];

/**
 * Checks if a given position is on the Board.
 */ 
Board.prototype.isValidPos = function (pos) {
  return ((pos[0] >= 0 && pos[0] < 8) && (pos[1] >= 0 && pos[1] < 8));
};

/**
 * Returns the piece at a given [x, y] position,
 * throwing an Error if the position is invalid.
 */
Board.prototype.getPiece = function (pos) {
  if (this.isValidPos(pos)) {
    return this.grid[pos[0]][pos[1]];
  }
  else {
    throw Error('Position is invalid');
  }
};

/**
 * Checks if the piece at a given position
 * matches a given color.
 */
Board.prototype.isMine = function (pos, color) {
  let piece = this.getPiece(pos);
  if (piece) {
   return (piece.color === color);
  }
  return false;
};

/**
 * Checks if a given position has a piece on it.
 */
Board.prototype.isOccupied = function (pos) {
  if (this.getPiece(pos)){
      return true;
  }
  return false;
};

/**
 * Recursively follows a direction away from a starting position, adding each
 * piece of the opposite color until hitting another piece of the current color.
 * It then returns an array of all pieces between the starting position and
 * ending position.
 *
 * Returns an empty array if it reaches the end of the board before finding another piece
 * of the same color.
 *
 * Returns empty array if it hits an empty position.
 *
 * Returns empty array if no pieces of the opposite color are found.
 */
Board.prototype._positionsToFlip = function(pos, color, dir, piecesToFlip){
  let newPos = [];
  newPos.push(pos[0] + dir[0]);
  newPos.push(pos[1] + dir[1]);

  if (!piecesToFlip){
    piecesToFlip = [];
  }
  if (!this.isValidPos(newPos)){
    return [];
  }
  else if (!this.isOccupied(newPos)){
    return [];
  }
  else if (this.isMine(newPos, color)){
    return piecesToFlip;
  }
  piecesToFlip.push(newPos);
    
  return this._positionsToFlip(newPos, color, dir, piecesToFlip);
};

/**
 * Checks that a position is not already occupied and that the color
 * taking the position will result in some pieces of the opposite
 * color being flipped.
 */
Board.prototype.validMove = function (pos, color) {
    let result = false;
    if(!this.isOccupied(pos)){
      let board = this;
      Board.DIRS.forEach(function(dir) {
        if (board._positionsToFlip(pos, color, dir).length > 0){
        result = true;
        }
      });
    }
    return result;
};

/**
 * Adds a new piece of the given color to the given position, flipping the
 * color of any pieces that are eligible for flipping.
 *
 * Throws an error if the position represents an invalid move.
 */
Board.prototype.placePiece = function (pos, color) {
  let positions = [];
  let board = this;
  let temp = "";
  if (this.validMove(pos, color)) { 
    this.grid[pos[0]][pos[1]] = new Piece(color);
      Board.DIRS.forEach(function (dir) {
        temp = (board._positionsToFlip(pos, color, dir));
          if (temp.length > 0) positions = temp;
        });
    positions.forEach(function (pos) {
    board.getPiece(pos).flip();
  });
}
  else {
    throw Error('invalid move');
  }
};

/**
 * Produces an array of all valid positions on
 * the Board for a given color.
 */
Board.prototype.validMoves = function (color) {
    let result = [];
    for(let x=0; x<8; x++){
      for(let j=0; j<8; j++){
        if (this.validMove([x,j], color)) result.push([x,j]);
      }
    }
    return result;
};

/**
 * Checks if there are any valid moves for the given color.
 */
Board.prototype.hasMove = function (color) {
    return (this.validMoves(color).length > 0 ? true : false );
};



/**
 * Checks if both the white player and
 * the black player are out of moves.
 */
Board.prototype.isOver = function () {
  return (!this.hasMove('white') && !this.hasMove('black'));
};




/**
 * Prints a string representation of the Board to the console.
 */
Board.prototype.print = function () {
  let piece = "";
  console.log(" 0  1  2  3  4  5  6  7  ")
  for(let x=0; x<8; x++){
    for(let y=0; y<8; y++){
      piece = this.grid[x][y];
        if (piece) { 
          process.stdout.write(` ${piece.toString()} `);
        }
        else {
          process.stdout.write(" _ ");
      }
    }
    console.log(`${x}`);
  }
};



module.exports = Board;
