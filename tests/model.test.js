import test from "node:test";
import assert from "node:assert/strict";
import {
  FOLDS,
  DYE_COLORS,
  MAX_DROPS,
  STICKERS,
  STICKER_CATEGORIES,
  createShirt,
  addDrop,
  canAdvance,
  publicTextError,
  validEntry,
} from "../src/model.js";
test("six folds offer distinct pattern choices", () => {
  assert.equal(FOLDS.length, 6);
  assert.equal(new Set(FOLDS.map((fold) => fold.id)).size, 6);
  assert.equal(new Set(FOLDS.map((fold) => fold.symbol)).size, 6);
});
test("finishing requires tying and dyeing; shirts start fresh", () => {
  const shirt = createShirt();
  assert.equal(canAdvance(0, shirt), true);
  assert.equal(canAdvance(1, shirt), false);
  shirt.bands = 3;
  assert.equal(canAdvance(1, shirt), true);
  assert.equal(canAdvance(2, shirt), false);
  for (let i = 0; i < 3; i++) addDrop(shirt, 0.2, 0.1, 1);
  assert.equal(canAdvance(2, shirt), true);
  assert.equal(createShirt().drops.length, 0);
  assert.equal(createShirt().soak, 40);
});
test("dye data stays inside shader limits and records placement and shades", () => {
  assert.equal(DYE_COLORS.length, 8);
  assert.equal(new Set(DYE_COLORS.map((dye) => dye.hex)).size, 8);
  const shirt = createShirt();
  addDrop(shirt, 0.1, -0.3, 2);
  assert.deepEqual(shirt.drops[0], [0.1, -0.3, 2, 0.19]);
  const mixed = createShirt();
  addDrop(mixed, -0.2, 0.4, 1, 0.08, 1);
  assert.deepEqual(mixed.drops[0], [-0.2, 0.4, 4, 0.08]);
  assert.equal(addDrop(shirt, NaN, 0, 0), false);
  assert.equal(addDrop(shirt, 0, 0, 0, 0.1, NaN), false);
  const rainbow = createShirt();
  addDrop(rainbow, 0, 0, 1, 0.1, 7);
  assert.deepEqual(rainbow.drops[0], [0, 0, 22, 0.1]);
  for (let i = 0; i < MAX_DROPS + 16; i++) addDrop(shirt, 8, -8, 9);
  assert.equal(shirt.drops.length, MAX_DROPS);
  assert.equal(MAX_DROPS, 300);
  assert.deepEqual(shirt.drops[1], [1, -1, 2, 0.19]);
});
test("gallery accepts bounded PNG data and rejects unsafe or oversized content", () => {
  const entry = {
    id: "example",
    name: "Family",
    title: "Love",
    image: "data:image/png;base64,aGVsbG8=",
  };
  assert.equal(validEntry(entry), true);
  assert.equal(validEntry({ ...entry, image: "javascript:alert(1)" }), false);
  assert.equal(validEntry({ ...entry, name: "x".repeat(33) }), false);
  assert.equal(validEntry({ ...entry, name: "https://example.com" }), false);
  assert.equal(validEntry({ ...entry, title: "what the fuck" }), false);
  assert.equal(
    validEntry({
      ...entry,
      image: "data:image/png;base64," + "a".repeat(350000),
    }),
    false,
  );
});

test("band placements retain drop location and are bounded to three", async () => {
  const { addBand } = await import("../src/model.js");
  const shirt = createShirt();
  addBand(shirt, { x: 0.2, y: 0.1 });
  assert.equal(shirt.bandPlacements[0].offset, 0.2);
  addBand(shirt);
  addBand(shirt);
  assert.equal(addBand(shirt), false);
  assert.equal(shirt.bands, 3);
  const chevron = createShirt();
  chevron.fold = 4;
  addBand(chevron);
  addBand(chevron);
  addBand(chevron);
  assert.deepEqual(
    chevron.bandPlacements.map(({ offset }) => offset),
    [-0.28, 0, 0.28],
  );
});
test("stickers remain on the fabric through scaling and dragging", async () => {
  const { addSticker, constrainSticker } = await import("../src/model.js");
  const shirt = createShirt();
  const sticker = addSticker(shirt, "heart");
  sticker.x = 20;
  sticker.y = -20;
  sticker.size = 10;
  constrainSticker(sticker);
  assert.equal(sticker.size, 0.42);
  assert.equal(sticker.color, "#fffaf2");
  assert.equal(sticker.x, 0.8 + sticker.size * 0.22);
  assert.equal(sticker.y, -0.7 - sticker.size * 0.22);
  for (let i = 0; i < 14; i++) addSticker(shirt, "star");
  assert.equal(shirt.stickers.length, 12);
  assert.deepEqual(
    shirt.stickers.slice(4, 6).map(({ x, y }) => [x, y]),
    [
      [-0.57, 0.34],
      [0.57, 0.34],
    ],
  );
  assert.equal(addSticker(shirt, "?"), null);
});
test("sticker collections offer a colorful range of choices", () => {
  assert.equal(STICKERS.length, 48);
  assert.equal(new Set(STICKERS).size, 48);
  assert.deepEqual(Object.keys(STICKER_CATEGORIES), [
    "Basic shapes",
    "Symbols",
    "Emojis",
    "Nature",
    "Animals",
    "Fun stuff",
  ]);
});
test("public shirt details reject profanity and URLs", () => {
  assert.equal(publicTextError("Rainbow Rider", 48), "");
  assert.match(publicTextError("www.example.com", 48), /addresses/);
  assert.match(publicTextError("sh1t", 48), /family-friendly/);
});
