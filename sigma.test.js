import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock/stub.ts";
import * as scrabble_frozen from "./assessment/index.js";

// TODO: export library
const LOTest = (name, LOs = [], fn, weight = 1) =>
  Deno.env.get("CI")
    ? Deno.test(JSON.stringify({ name, ...LOs, weight }), fn)
    : Deno.test(name, fn);

let scrabble = {
  ...scrabble_frozen,
  reset: function () {
    this.YOUR_LETTERS.length = 0;
    this.round = 1;
    this.points = 0;
  },
};

LOTest(
  "Get letter tiles",
  [
    {
      loID: "W01-LO01",
      confidence: 0.9,
    },
    {
      loID: "W01-LO06",
      confidence: 0.9,
    },
  ],
  () => {
    scrabble.reset();
    assertEquals(scrabble.YOUR_LETTERS.length, 0);
    scrabble.generateLetterTiles(1);
    assertEquals(scrabble.YOUR_LETTERS.length, 1);
    scrabble.reset();
    scrabble.generateLetterTiles(8);
    assertEquals(scrabble.YOUR_LETTERS.length, 8);
    scrabble.generateLetterTiles(1);
    assertEquals(scrabble.YOUR_LETTERS.length, 9);
  }
);

LOTest(
  "Get 8 letter tiles when nothing passed",
  [
    {
      loID: "W01-LO01",
      confidence: 0.9,
    },
    {
      loID: "W01-LO06",
      confidence: 0.9,
    },
  ],
  () => {
    scrabble.reset();
    scrabble.generateLetterTiles();
    assertEquals(scrabble.YOUR_LETTERS.length, 8);
  },
  0.5
);

LOTest(
  "Remove played letters",
  [
    {
      loID: "W01-LO06",
      confidence: 0.5,
    },
  ],
  () => {
    scrabble = {
      ...scrabble,
      generateLetterTiles: function () {
        this.YOUR_LETTERS.push("s", "i", "g", "m", "a", "x", "x");
      },
    };
    scrabble.reset();
    assertEquals(scrabble.YOUR_LETTERS.length, 0);
    scrabble.generateLetterTiles();
    assertEquals(scrabble.YOUR_LETTERS.length, 7);
    scrabble.removePlayedLetters("x");
    assertEquals(scrabble.YOUR_LETTERS.length, 6);
    scrabble.removePlayedLetters("sigma");
    assertEquals(scrabble.YOUR_LETTERS.length, 1);
    scrabble.removePlayedLetters("x");
    assertEquals(scrabble.YOUR_LETTERS.length, 0);
  }
);

LOTest(
  "Check valid word",
  [
    {
      loID: "W01-LO06",
      confidence: 0.5,
    },
    {
      loID: "W01-LO08",
      confidence: 0.9,
    },
  ],
  () => {
    scrabble = {
      ...scrabble,
      generateLetterTiles: function () {
        this.YOUR_LETTERS.push("s", "i", "g", "m", "a", "x", "x");
      },
    };
    scrabble.reset();
    assertEquals(scrabble.YOUR_LETTERS.length, 0);
    scrabble.generateLetterTiles();
    assertEquals(scrabble.YOUR_LETTERS.length, 7);
    assertEquals(scrabble.isValidGuess("sig"), true);
    assertEquals(scrabble.isValidGuess("sigma"), true);
    assertEquals(scrabble.isValidGuess("xx"), true);
    assertEquals(scrabble.isValidGuess("xxx"), false);
  }
);

LOTest(
  "Is a played word in dictionary",
  [
    {
      loID: "W01-LO08",
      confidence: 0.9,
    },
  ],
  () => {
    scrabble = {
      ...scrabble,
      generateLetterTiles: function () {
        this.YOUR_LETTERS.push("s", "i", "g", "m", "a", "x", "x");
      },
      getDictionary: function () {
        this.dictionary.length = 0;
        this.dictionary.push("sigma");
      },
    };
    scrabble.reset();
    scrabble.getDictionary();
    assertEquals(scrabble.isWordInDictionary("sigma"), true);
    assertEquals(scrabble.isWordInDictionary("hello"), false);
  }
);

LOTest(
  "Get word from player",
  [
    {
      loID: "W01-LO07",
      confidence: 1,
    },
  ],
  () => {
    const fn = stub(window, "prompt", () => "sigma");
    scrabble.reset();
    assertEquals(scrabble.getWordFromPlayer(), "sigma");
    fn.restore();
  }
);

LOTest(
  "Get word from player returns in lower case",
  [
    {
      loID: "W01-LO07",
      confidence: 1,
    },
  ],
  () => {
    const fn = stub(window, "prompt", () => "SIGMA");
    scrabble.reset();
    assertEquals(scrabble.getWordFromPlayer(), "sigma");
    fn.restore();
  },
  0.5
);

LOTest(
  "Ask player for word again if input is blank",
  [
    {
      loID: "W01-LO07",
      confidence: 0.9,
    },
    {
      loID: "W01-LO08",
      confidence: 0.9,
    },
  ],
  () => {
    const playerResponses = ["sigma", "", "sigma"];
    const fn = stub(window, "prompt", () => playerResponses.shift());
    scrabble.reset();
    assertEquals(fn.calls.length, 0);
    assertEquals(scrabble.getWordFromPlayer(), "sigma");
    assertEquals(fn.calls.length, 1);
    assertEquals(scrabble.getWordFromPlayer(), "sigma");
    assertEquals(fn.calls.length, 3); // asked twice because the second response was blank
    fn.restore();
  }
);
