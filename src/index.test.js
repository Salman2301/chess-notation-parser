const parser = require(".");
const { z } = require("zod");


const ParserResponse = z.object({
  isValid: z.boolean(),
  input: z.any(),

  piece: z.enum(["pawn", "king", "queen", "bishop", "knight", "rook"]).or(z.null()),

  from: z.string().or(z.null()),
  fromFile: z.enum(["a", "b", "c", "d", "e", "f", "g", "h"]).or(z.null()),
  fromRank: z.enum(["1", "2", "3", "4", "5", "6", "7", "8"]).or(z.null()),

  to: z.string().or(z.null()),
  toFile: z.enum(["a", "b", "c", "d", "e", "f", "g", "h"]).or(z.null()),
  toRank: z.enum(["1", "2", "3", "4", "5", "6", "7", "8"]).or(z.null()),

  isCapture: z.boolean(),
  isCheck: z.boolean(),
  isCheckmate: z.boolean(),
  isCastle: z.boolean(),
  isPromoted: z.boolean(),

  promotePiece: z.enum(["queen", "bishop", "knight", "rook"]).or(z.null()),
  castleSide: z.enum(["long", "short"]).or(z.null()),  
}).strict();

test('Parser should always be truthy', () => {
  // @ts-expect-error - Parser should always be string
  expect(parser()).toBeTruthy();
});

test('Parser should return whatever the input parameter is', () => {
  expect(parser("test").input).toEqual("test");
  expect(parser("").input).toEqual("");
  // @ts-expect-error - Parser should always be string
  expect(parser().input).toEqual(undefined);
});

test("Parser should only accept validate input", () => {
  // @ts-expect-error
  expect(parser().isValid).toEqual(false);
  expect(parser("").isValid).toEqual(false);
  expect(parser("1").isValid).toEqual(false);
  expect(parser("12345678").isValid).toEqual(false);
  expect(parser("gasded").isValid).toEqual(false);
  
  // valid pawn moves
  expect(parser("e4").isValid).toEqual(true);
  expect(parser("c3").isValid).toEqual(true);
  expect(parser("e6+").isValid).toEqual(true);
  expect(parser("g6#").isValid).toEqual(true);

});

test("Parser should handle castling", () => {
  expect(parser("O-O").isValid).toEqual(true);
  expect(parser("O-O-O").isValid).toEqual(true);
  expect(parser("O-O-O1").isValid).toEqual(false);
  expect(parser("O-O1").isValid).toEqual(false);
  
  expect(parser("O-O+").isValid).toEqual(true);
  expect(parser("O-O+").isCheck).toEqual(true);
  expect(parser("O-O+").isCheckmate).toEqual(false);

  expect(parser("O-O-O#").isCheck).toEqual(false);
  expect(parser("O-O-O#").isCheckmate).toEqual(true);
})

test("Parser should return a valid JSON based on ZOD schema", () => {
  // @ts-expect-error - Parser should always be string
  expect(ParserResponse.parse(parser()));
  expect(ParserResponse.parse(parser("bxe8")));
  expect(ParserResponse.parse(parser("dxe8=Q")));
  expect(ParserResponse.parse(parser("dxe8=B")));
});

test("Parser should able to handle checkmate", () => {
  // @ts-expect-error - Parser should always be string
  expect(parser().isCheckmate).toEqual(false);
  expect(parser("e6+").isCheckmate).toEqual(false);
  expect(parser("Kf8#").isCheckmate).toEqual(true);
  expect(parser("cxd8#").isCheckmate).toEqual(true);
});

test("Parser should able to handle check", () => {
  // @ts-expect-error - Parser should always be string
  expect(parser().isCheck).toEqual(false);
  expect(parser("e6+").isCheck).toEqual(true);
  expect(parser("Kf8+").isCheck).toEqual(true);
  expect(parser("dxe8=K+").isCheck).toEqual(true);
  expect(parser("cxd8#").isCheck).toEqual(false);
});

test("Parser should handle if piece is captured", () => {
  // @ts-expect-error - Parser should always be string
  expect(parser().isCapture).toEqual(false);
  expect(parser("e6+").isCapture).toEqual(false);
  expect(parser("Kxf8+").isCapture).toEqual(true);
  expect(parser("cxd8#").isCapture).toEqual(true);
  expect(parser("bxc8=Q#").isCapture).toEqual(true);
  expect(parser("Raxb1").isCapture).toEqual(true);
});

test("Parser should handle promotions", () => {
  expect(parser("e6+").isPromoted).toEqual(false);
  expect(parser("e6+").promotePiece).toEqual(null);
  expect(parser("h8=N+").isPromoted).toEqual(true);
  expect(parser("h8=N+").promotePiece).toEqual("knight");
  expect(parser("bxc8=Q").isPromoted).toEqual(true);
  expect(parser("bxc8=Q").promotePiece).toEqual("queen");
  // invalid
  expect(parser("bxc8=K").isValid).toEqual(false);
  expect(parser("bxc8=a").isValid).toEqual(false);
});

test("Parser should handle pawn move", () => {

  expect(parser("e6+").piece).toEqual("pawn");
  expect(parser("g5+").isCheck).toEqual(true);
  expect(parser("a5").to).toEqual("a5");

  expect(parser("gg#").isValid).toEqual(false);
  expect(parser("13").isValid).toEqual(false);
});


test("Parser should handle for pawn move to e6 with checkmate", () => {
  expect(parser("e6#").isValid).toEqual(true);
  expect(parser("e6#").input).toEqual("e6#");
  expect(parser("e6#").piece).toEqual("pawn");
  expect(parser("e6#").from).toEqual(null);
  expect(parser("e6#").to).toEqual("e6");
  expect(parser("e6#").isCheckmate).toEqual(true);
  expect(parser("e6#").from).toEqual(null);
});

test("Parser should handle for pawns e file promoted to Rook with check ", () => {
  expect(parser("e8=R+").isValid).toEqual(true);
  expect(parser("e8=R+").isPromoted).toEqual(true);
  expect(parser("e8=R+").isCheck).toEqual(true);
  expect(parser("e8=R+").promotePiece).toEqual("rook");
  expect(parser("e8=R+").to).toEqual("e8");
  expect(parser("e8=R+").piece).toEqual("pawn");
  expect(parser("e8=R+").from).toEqual(null);
});

test("Parser should handle d pawns captures e6 with promotion to bishop and checkmated ", () => {
  expect(parser("dxe8=B#").isValid).toEqual(true);
  expect(parser("dxe8=B#").isPromoted).toEqual(true);
  expect(parser("dxe8=B#").isCheckmate).toEqual(true);
  expect(parser("dxe8=B#").promotePiece).toEqual("bishop");
  expect(parser("dxe8=B#").to).toEqual("e8");
  expect(parser("dxe8=B#").from).toEqual("d");
  expect(parser("dxe8=B#").piece).toEqual("pawn");
});

test("Parser should handle for location dxe8", () => {
  expect(parser("dxe8").isValid).toEqual(true);
  
  expect(parser("dxe8").from).toEqual("d");
  expect(parser("dxe8").fromFile).toEqual("d");
  expect(parser("dxe8").fromRank).toEqual(null);
  
  expect(parser("dxe8").to).toEqual("e8");
  expect(parser("dxe8").toFile).toEqual("e");
  expect(parser("dxe8").toRank).toEqual("8");

  expect(parser("dxe8").piece).toEqual("pawn");
});

test("Parser should handle for location Bh7", () => {
  expect(parser("Bh7").isValid).toEqual(true);
  
  expect(parser("Bh7").from).toEqual(null);
  expect(parser("Bh7").fromFile).toEqual(null);
  expect(parser("Bh7").fromRank).toEqual(null);
  
  expect(parser("Bh7").to).toEqual("h7");
  expect(parser("Bh7").toFile).toEqual("h");
  expect(parser("Bh7").toRank).toEqual("7");
  
  expect(parser("Bh7").piece).toEqual("bishop");
  expect(parser("Bh7").isCapture).toEqual(false);
});

test("Parser should handle for location Rab1", () => {
  expect(parser("Rab1").isValid).toEqual(true);
  
  expect(parser("Rab1").from).toEqual("a");
  expect(parser("Rab1").fromFile).toEqual("a");
  expect(parser("Rab1").fromRank).toEqual(null);
  
  expect(parser("Rab1").to).toEqual("b1");
  expect(parser("Rab1").toFile).toEqual("b");
  expect(parser("Rab1").toRank).toEqual("1");
  
  expect(parser("Rab1").piece).toEqual("rook");
});

// Nbxd2
// Rfxe1
// Kxg5+

test("Parser should handle for location Rab1", () => {
  expect(parser("Rab1").isValid).toEqual(true);
  
  expect(parser("Rab1").from).toEqual("a");
  expect(parser("Rab1").fromFile).toEqual("a");
  expect(parser("Rab1").fromRank).toEqual(null);
  
  expect(parser("Rab1").to).toEqual("b1");
  expect(parser("Rab1").toFile).toEqual("b");
  expect(parser("Rab1").toRank).toEqual("1");
  
  expect(parser("Rab1").piece).toEqual("rook");
})

test("Parser should handle for location Nbxd2", () => {
  expect(parser("Nbxd2").isValid).toEqual(true);
  
  expect(parser("Nbxd2").from).toEqual("b");
  expect(parser("Nbxd2").fromFile).toEqual("b");
  expect(parser("Nbxd2").fromRank).toEqual(null);
  
  expect(parser("Nbxd2").to).toEqual("d2");
  expect(parser("Nbxd2").toFile).toEqual("d");
  expect(parser("Nbxd2").toRank).toEqual("2");
  
  expect(parser("Nbxd2").piece).toEqual("knight");
  expect(parser("Nbxd2").isCapture).toEqual(true);
});

test("Parser should handle for location N5f3", () => {
  expect(parser("N5f3").isValid).toEqual(true);
  
  expect(parser("N5f3").from).toEqual("5");
  expect(parser("N5f3").fromFile).toEqual(null);
  expect(parser("N5f3").fromRank).toEqual("5");
  
  expect(parser("N5f3").to).toEqual("f3");
  expect(parser("N5f3").toFile).toEqual("f");
  expect(parser("N5f3").toRank).toEqual("3");
  
  expect(parser("N5f3").piece).toEqual("knight");
  expect(parser("N5f3").isCapture).toEqual(false);
});
