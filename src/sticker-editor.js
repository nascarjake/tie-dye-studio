import { constrainSticker, STICKER_NAMES } from "./model.js";
import { STICKER_DETAILS, stickerSvg } from "./stickers.js";

const shirtOutline = [
  [-0.22, 0.68],
  [-0.47, 0.6],
  [-0.78, 0.31],
  [-0.59, 0.06],
  [-0.43, 0.18],
  [-0.43, -0.68],
  [0.43, -0.68],
  [0.43, 0.18],
  [0.59, 0.06],
  [0.78, 0.31],
  [0.47, 0.6],
  [0.22, 0.68],
];
const stickerPaths = new Map();
function shirtPoint(width, height, [x, y]) {
  return [width / 2 + (x * height) / 2.08, height / 2 - (y * height) / 2.08];
}
function clipToShirt(ctx, width, height) {
  ctx.beginPath();
  shirtOutline.forEach((point, index) => {
    const [x, y] = shirtPoint(width, height, point);
    if (index) ctx.lineTo(x, y);
    else ctx.moveTo(x, y);
  });
  ctx.closePath();
  const [neckX, neckY] = shirtPoint(width, height, [0, 0.75]);
  ctx.moveTo(neckX + (0.245 * height) / 2.08, neckY);
  ctx.arc(neckX, neckY, (0.245 * height) / 2.08, 0, Math.PI * 2);
  ctx.clip("evenodd");
}

// The live editor and PNG export share the same shirt-space coordinates and size.
export function paintStickers(ctx, stickers, width, height) {
  ctx.save();
  clipToShirt(ctx, width, height);
  for (const sticker of stickers) {
    const detail = STICKER_DETAILS[sticker.symbol];
    if (!detail) continue;
    const pixels = (sticker.size * height) / 2.08;
    const x = width / 2 + (sticker.x * height) / 2.08;
    const y = height / 2 - (sticker.y * height) / 2.08;
    const scale = pixels / Math.max(detail.width, detail.height);
    let path = stickerPaths.get(sticker.symbol);
    if (!path) {
      path = new Path2D(detail.path);
      stickerPaths.set(sticker.symbol, path);
    }
    ctx.save();
    ctx.translate(
      x - (detail.width * scale) / 2,
      y - (detail.height * scale) / 2,
    );
    ctx.scale(scale, scale);
    ctx.lineJoin = "round";
    ctx.lineWidth = 12;
    ctx.strokeStyle = "#34372c";
    ctx.fillStyle = sticker.color || "#fffaf2";
    ctx.stroke(path);
    ctx.fill(path);
    ctx.restore();
  }
  ctx.restore();
}

export class StickerEditor {
  constructor(layer, canvas, getState, onSelect, onChange) {
    Object.assign(this, { layer, canvas, getState, onSelect, onChange });
  }
  sync() {
    const { shirt, selected, enabled } = this.getState();
    const ids = shirt.stickers.map((s) => s.id).join(",");
    if (ids !== this.ids) {
      this.ids = ids;
      this.layer.replaceChildren();
      for (const sticker of shirt.stickers) {
        const button = document.createElement("button");
        button.className = "placed-sticker";
        button.dataset.id = sticker.id;
        button.innerHTML = `<span aria-hidden="true">${stickerSvg(sticker.symbol)}</span>`;
        button.setAttribute(
          "aria-label",
          `${STICKER_NAMES[sticker.symbol]} on shirt. Drag or use arrow keys to move.`,
        );
        button.onfocus = () => {
          if (this.getState().selected !== sticker.id)
            this.onSelect(sticker.id);
        };
        button.onpointerdown = (event) => {
          if (!this.getState().enabled) return;
          event.preventDefault();
          this.onSelect(sticker.id);
          button.focus({ preventScroll: true });
          const start = {
            x: event.clientX,
            y: event.clientY,
            sx: sticker.x,
            sy: sticker.y,
          };
          button.setPointerCapture(event.pointerId);
          button.classList.add("dragging");
          button.onpointermove = (move) => {
            if (!this.getState().enabled) return;
            const height = this.canvas.getBoundingClientRect().height;
            sticker.x = start.sx + ((move.clientX - start.x) * 2.08) / height;
            sticker.y = start.sy - ((move.clientY - start.y) * 2.08) / height;
            constrainSticker(sticker);
            this.sync();
          };
          const finish = () => {
            button.onpointermove = null;
            button.classList.remove("dragging");
            this.onChange();
          };
          button.onpointerup = finish;
          button.onpointercancel = finish;
          button.onlostpointercapture = finish;
        };
        button.onkeydown = (event) => {
          if (!this.getState().enabled) return;
          const moves = {
            ArrowLeft: [-0.025, 0],
            ArrowRight: [0.025, 0],
            ArrowUp: [0, 0.025],
            ArrowDown: [0, -0.025],
          };
          if (moves[event.key]) {
            event.preventDefault();
            sticker.x += moves[event.key][0];
            sticker.y += moves[event.key][1];
          } else if (["+", "=", "-"].includes(event.key)) {
            event.preventDefault();
            sticker.size += event.key === "-" ? -0.02 : 0.02;
          } else return;
          constrainSticker(sticker);
          this.sync();
          this.onChange();
        };
        this.layer.append(button);
      }
    }
    const { width, height } = this.canvas.getBoundingClientRect();
    for (const button of this.layer.children) {
      const sticker = shirt.stickers.find((s) => s.id === button.dataset.id);
      const pixels = (sticker.size * height) / 2.08;
      button.style.left = `${width / 2 + (sticker.x * height) / 2.08}px`;
      button.style.top = `${height / 2 - (sticker.y * height) / 2.08}px`;
      button.style.setProperty("--sticker-size", `${pixels}px`);
      button.style.setProperty("--sticker-stroke", `${pixels * 0.025}px`);
      button.style.setProperty("--sticker-color", sticker.color || "#fffaf2");
      button.classList.toggle("selected", enabled && sticker.id === selected);
      button.setAttribute("aria-pressed", String(sticker.id === selected));
      button.disabled = !enabled;
    }
  }
}
