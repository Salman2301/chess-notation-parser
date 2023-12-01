# Chess notation parser
This package takes a chess algebraic notation and return a standard parsed JSON format. It's a [Portable Game Notation (PGN)][wiki] is a standard plain text format for recording chess games (both the moves and related data), which can be read by humans and is also supported by most chess software. Note this just convert the Algebraic notation (`bxc8` `Kb4`) a crucial part of PGN.

[![Tests](https://img.shields.io/github/actions/workflow/status/salman2301/chess-notation-parser/on-push.yaml?branch=main)](https://github.com/salman2301/chess-notation-parser/actions)

### How to:
```sh
npm install chess-notation-parser
```

```js
const chessNotationParser = require('chess-notation-parser');
// See below response
const parsedRes = chessNotationParser('bxc8=Q+')

```

```js
//˯ parsedRes
{
  isValid: true,
  // Pawn at b capture something at c8 and promoted to queen with a check
  input: 'bxc8=Q+',
  
  piece: 'pawn',

  from: 'b',
  fromFile: 'b',
  fromRank: null,

  to: 'c8',
  toFile: 'c',
  toRank: '8',

  promotePiece: 'queen',
  castleSide: null,

  isCapture: true,
  isCheck: true,
  isCheckmate: false,
  isCastle: false,
  isPromotion: true,
}
```


## Sample response

```ts
type Piece = "pawn" | "king" | "queen" | "knight" | "rook" | "bishop";
interface ParseResponse {
  isValid: boolean; // true
  input: string; // bxc8=Q+
  piece: Piece; // Pawn

  from?: string; // b - either file or rank N5f3 | Ngf3 => 5 | "g"
  fromFile?: string; // b
  fromRank?: string; // null

  to: string; // c8
  toFile: string; // c
  toRank: string; // 8

  promotePiece?: Piece; // queen
  castleSide?: "long" | "short";

  isCapture: boolean; // true
  isCheck: boolean; // true
  isCheckmate: boolean; // false;
  isCastle: boolean; // false
  isPromotion: boolean; // true
}
```

Unit [test](./src/index.test.js) run with different variations support

```
 PASS  src/index.test.js
  ✓ Parser should always be truthy (5 ms)
  ✓ Parser should return whatever the input parameter is (1 ms)
  ✓ Parser should only accept validate input (1 ms)
  ✓ Parser should handle castling (1 ms)
  ✓ Parser should return a valid JSON based on ZOD schema (3 ms)
  ✓ Parser should able to handle checkmate (1 ms)
  ✓ Parser should able to handle check (1 ms)
  ✓ Parser should handle if piece is captured (2 ms)
  ✓ Parser should handle promotions (1 ms)
  ✓ Parser should handle pawn move
  ✓ Parser should handle for pawn move to e6 with checkmate (1 ms)
  ✓ Parser should handle for pawns e file promoted to Rook with check 
  ✓ Parser should handle d pawns captures e6 with promotion to bishop and checkmated  (1 ms)
  ✓ Parser should handle for location dxe8
  ✓ Parser should handle for location Bh7 (1 ms)
  ✓ Parser should handle for location Rab1
  ✓ Parser should handle for location Rab1 (1 ms)
  ✓ Parser should handle for location Nbxd2
  ✓ Parser should handle for location N5f3 (1 ms)

Test Suites: 1 passed, 1 total
Tests:       19 passed, 19 total
Snapshots:   0 total
Time:        0.655 s, estimated 1 s
Ran all test suites related to changed files.
```

### Limitations:
- This parser doesn't provide if the pawn is capture via en passant or not. Since to know if the pawn could capture via en-passant, we would need to know previous move played by the opponent and position of the complete board. Which is out of scope for this lib.

- Same as if the input is `e6`, We don't know if the pawn move from `e4` to `e6` Double step or `e5` to `e6` without the complete information about the board.

This limitation are valid for this lib. as the idea is to just parse a chess notation. If this is an issue for your use case suggest looking into `fen` algorithm

<!-- Links -->
[wiki]: https://en.wikipedia.org/wiki/Portable_Game_Notation
