/**
 * @typedef {"pawn" | "king" | "queen" | "knight" | "rook" | "bishop"} Piece
 */

/**
 * Response object returned by the parser function
 * @typedef {object} ParseResponse
 * @property {boolean} isValid - true if the input string was a valid chess move notation
 * @property {string} input - The input move notation string
 * @property {Piece| null} piece - The chess piece that is moving
 * 
 * @property {string | null} from - The file or rank the piece is moving from
 * @property {string | null} fromFile - The file the piece is moving from
 * @property {string | null} fromRank - The rank the piece is moving from
 * 
 * @property {string | null} to - The destination square in algebraic notation
 * @property {string | null} toFile - The destination file in algebraic notation
 * @property {string | null} toRank - The destination row in algebraic notation
 * 
 * @property {boolean} isCapture - true if the move is a capture
 * @property {boolean} isCheck - true if the move checks the opponent's king
 * @property {boolean} isCheckmate - true if the move checkmates the opponent
 * @property {boolean} isCastle - true if the move is a castle
 * @property {boolean} isPromoted - true if the move is a pawn promotion
 * @property {Piece|null} promotePiece - The piece to promote to if promotion
 * @property {"long" | "short"| null} castleSide - The side for castle moves
 */

let powerPiece = "QKNRB";

/**
 *
 * @param {string} str
 * @returns {ParseResponse}
 */
function parser(str) {
  /** @type {ParseResponse} */
  let obj = {
    isValid: false,
    input: str,
    piece: null,
    from: null,
    fromFile: null,
    fromRank: null,

    to: null,
    toFile: null,
    toRank: null,
    isCapture: false,
    isCheck: false,
    isCheckmate: false,
    isCastle: false,
    isPromoted: false,
    promotePiece: null,
    castleSide: null,
  };
  if (typeof str !== "string" || str === "") return obj;
  if (str.length < 2) return obj;
  if (str.length > 8) return obj;

  // Check for any invalid character
  let validChar = "x+#=KQBNRPabcdefgh12345678O-";

  if (!str.split("").every((char) => validChar.includes(char))) {    return obj;
  }

  // check
  if (str.includes("+")) {
    if (str[str.length - 1] !== "+") return obj;  
    obj.isCheck = true;

    str = str.replace("+", "");
  }

  // checkmate
  if (str.includes("#")) {
    if (str[str.length - 1] !== "#") return obj;
    obj.isCheckmate = true;

    str = str.replace("#", "");
  }

  // capture
  if (str.includes("x")) {
    if (!(str[1] === "x" || str[2] === "x")) return obj;
    obj.isCapture = true;

    str = str.replace("x", "");
  }

  // Promotion
  if (str.includes("=")) {
    // note: we remove checks and checkmate flag in prev line
    if (str[str.length - 2] !== "=") return obj;
    let promoted = str[str.length - 1];
    if (!(powerPiece.includes(promoted) && promoted !== "K")) {
      return obj;
    }
    obj.isPromoted = true;
    obj.promotePiece = expandPieceAbbr(promoted);
    
    str = str.split("=")[0];
  }

  // castle
  if (str==="O-O") {
    obj.isValid = true;
    obj.isCastle = true;
    obj.castleSide = "short";
    return obj;
  }
  if (str==="O-O-O") {
    obj.isValid = true;
    obj.isCastle = true;
    obj.castleSide = "long";
    return obj;
  }

  // pawn move
  if (str.length === 2) {
    if (!isValidLocation(str)) return obj;
    obj.isValid = true;
    obj.piece = "pawn";
    obj.to = str;

    const { file: toFile, rank: toRank } = parsePlace(obj.to);
    obj.toFile = toFile;
    obj.toRank = toRank;

    return obj;
  }
  
  /**
   * Three format left
   * Kf8 -> Knight to f8
   * ab7 -> pawn from file 'a' capture b7 (axb7 but we remove x from prev)
   * Rab1 -> Rook at file 'a' file move to 'b1'
   */
  
  const isPawn = /[a-h]/g.test(str[0]);
  if (isPawn) {
    obj.isValid = true;
    obj.piece = "pawn";
    obj.to = str.slice(-2);
    
    const { file: toFile, rank: toRank } = parsePlace(obj.to);
    obj.toFile = toFile;
    obj.toRank = toRank;

    obj.from = str[0];
    
    const { file: fromFile, rank: fromRank } = parsePlace(obj.from);
    obj.fromFile = fromFile;
    obj.fromRank = fromRank;
    return obj
  }

  const isValidPowerPiece = powerPiece.includes(str[0]);

  if (!isValidPowerPiece) return obj;

  obj.piece = expandPieceAbbr(str[0]);
  obj.to = str.slice(-2);
  
  const { file: toFile, rank: toRank } = parsePlace(obj.to);
  obj.toFile = toFile;
  obj.toRank = toRank;

  if (str.length === 3) {
    obj.isValid = true;
    return obj;
  }

  if (!(obj.piece === "rook" || obj.piece === "knight")) return obj;

  obj.from = str[1];
  const { file: fromFile, rank: fromRank } = parsePlace(obj.from);
  obj.fromFile = fromFile;
  obj.fromRank = fromRank;

  obj.isValid = true;

  return obj;
}

// c4
function isValidLocation(str) {
  return /[a-h][1-8]/g.test(str);
}

function parsePlace(loc) {
  if (!loc) return { file: null, rank: null};
  if (loc.length === 2) return { file: loc[0], rank: loc[1], }
  if (/[a-h]/g.test(loc)) return { file: loc, rank: null}
  if (/[1-8]/g.test(loc)) return { file: null, rank: loc }
  return { file: null, rank: null};
}

function expandPieceAbbr(str) {
  const pieces = {
    Q: "queen",
    K: "king",
    N: "knight",
    R: "rook",
    B: "bishop",
    P: "pawn",
  };
  return pieces[str] || null;
}

module.exports = parser;
