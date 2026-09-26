export const FOLDS = [
  {
    id: "spiral",
    name: "The classic swirl",
    short: "Spiral",
    description: "Twist the middle. Let it swirl.",
    symbol: "◎",
  },
  {
    id: "accordion",
    name: "Happy little stripes",
    short: "Accordion",
    description: "Back and forth, like a paper fan.",
    symbol: "≋",
  },
  {
    id: "crumple",
    name: "A beautiful mess",
    short: "Scrunch",
    description: "A little scrunch. A lot of personality.",
    symbol: "✳",
  },
  {
    id: "sunburst",
    name: "A sunny little burst",
    short: "Sunburst",
    description: "Rays from the middle, full of sparkle.",
    symbol: "☼",
  },
  {
    id: "chevron",
    name: "A zigzag story",
    short: "Chevron",
    description: "Crisp diagonal folds that zig and zag.",
    symbol: "⌁",
  },
  {
    id: "pebble",
    name: "Soft little pools",
    short: "Pebble",
    description: "Gentle bunches for a painterly pattern.",
    symbol: "◌",
  },
];
export const DYE_COLORS = [
  { name: "Cherry", hex: "#e84064", rgb: [232, 64, 100] },
  { name: "Tangerine", hex: "#f47b2c", rgb: [244, 123, 44] },
  { name: "Sunshine", hex: "#f4c52f", rgb: [244, 197, 47] },
  { name: "Emerald", hex: "#35a86b", rgb: [53, 168, 107] },
  { name: "Aqua", hex: "#26b7b5", rgb: [38, 183, 181] },
  { name: "Sky", hex: "#3d82e6", rgb: [61, 130, 230] },
  { name: "Violet", hex: "#8058d6", rgb: [128, 88, 214] },
  { name: "Magenta", hex: "#d84ba6", rgb: [216, 75, 166] },
];
export const MAX_DROPS = 300;
export {
  STICKERS,
  STICKER_CATEGORIES,
  STICKER_NAMES,
} from "./stickers.js";
import { STICKERS } from "./stickers.js";
export { publicTextError, validEntry } from "./validation.js";
export const STICKER_COLORS = [
  { name: "Cream", value: "#fffaf2" },
  { name: "Cherry", value: "#ef426f" },
  { name: "Orange", value: "#f08a32" },
  { name: "Sunshine", value: "#f4c52f" },
  { name: "Mint", value: "#42a875" },
  { name: "Sky", value: "#3d82e6" },
  { name: "Violet", value: "#8058d6" },
  { name: "Ink", value: "#17233b" },
];
export function createShirt() {
  return {
    id: crypto.randomUUID(),
    fold: 0,
    seed: Math.random() * 100,
    soak: 40,
    drops: [],
    bands: 0,
    bandPlacements: [],
    name: "",
    title: "",
    stickers: [],
  };
}
export function addDrop(shirt, x, y, shade, size = 0.19, palette = 0) {
  if (
    shirt.drops.length >= MAX_DROPS ||
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(shade) ||
    !Number.isFinite(size) ||
    !Number.isFinite(palette)
  )
    return false;
  const safeShade = Math.max(0, Math.min(2, shade));
  const safePalette = Math.max(0, Math.min(DYE_COLORS.length - 1, palette));
  shirt.drops.push([
    Math.max(-1, Math.min(1, x)),
    Math.max(-1, Math.min(1, y)),
    safeShade + safePalette * 3,
    Math.max(0.075, Math.min(0.25, size)),
  ]);
  return true;
}
export function canAdvance(step, shirt) {
  return (
    step === 0 ||
    (step === 1 && shirt.bands >= 3) ||
    (step === 2 && shirt.drops.length >= 3)
  );
}
export function addBand(shirt, point) {
  if (shirt.bands >= 3) return false;
  const angle =
    shirt.fold === 1
      ? Math.PI / 2
      : shirt.fold === 4
        ? Math.PI / 4
        : (shirt.bands * Math.PI) / 3;
  const offset =
    point && Number.isFinite(point.x) && Number.isFinite(point.y)
      ? Math.max(
          -0.35,
          Math.min(0.35, point.x * Math.cos(angle) + point.y * Math.sin(angle)),
        )
      : shirt.fold === 1
        ? (shirt.bands - 1) * 0.32
        : shirt.fold === 4
          ? [-0.28, 0, 0.28][shirt.bands]
        : 0;
  shirt.bandPlacements.push({ angle, offset });
  shirt.bands = shirt.bandPlacements.length;
  return true;
}
export function constrainSticker(sticker) {
  sticker.size = Math.max(0.1, Math.min(0.42, sticker.size));
  const visible = sticker.size * 0.22;
  sticker.x = Math.max(-0.8 - visible, Math.min(0.8 + visible, sticker.x));
  sticker.y = Math.max(-0.7 - visible, Math.min(0.7 + visible, sticker.y));
  return sticker;
}
export function addSticker(shirt, symbol, random = false, color = "#fffaf2") {
  if (shirt.stickers.length >= 12 || !STICKERS.includes(symbol)) return null;
  const places = [
    [0, 0.1],
    [-0.2, -0.18],
    [0.2, -0.18],
    [0, -0.4],
    [-0.57, 0.34],
    [0.57, 0.34],
    [-0.2, 0.29],
    [0.2, 0.29],
    [-0.2, -0.43],
    [0.2, -0.43],
    [-0.36, -0.08],
    [0.36, -0.08],
  ];
  const [x, y] = places[shirt.stickers.length];
  const sticker = constrainSticker({
    id: crypto.randomUUID(),
    symbol,
    x: random ? (Math.random() - 0.5) * 0.6 : x,
    y: random ? Math.random() * 0.8 - 0.5 : y,
    size: random ? 0.12 + Math.random() * 0.24 : 0.2,
    color: random
      ? STICKER_COLORS[Math.floor(Math.random() * STICKER_COLORS.length)].value
      : STICKER_COLORS.some((swatch) => swatch.value === color)
        ? color
        : "#fffaf2",
  });
  shirt.stickers.push(sticker);
  return sticker;
}
