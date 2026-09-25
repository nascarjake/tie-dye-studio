import { test, expect } from "@playwright/test";

async function reachDye(page, fold = "Spiral") {
  await page.goto("/?ui=v1");
  await page.getByRole("button", { name: new RegExp(`^${fold} `) }).click();
  await page.getByRole("button", { name: "Fold my shirt" }).click();
  for (let i = 0; i < 3; i++)
    await page.getByRole("button", { name: /Add a rubber band/ }).click();
  await page.getByRole("button", { name: "Bring on the dye" }).click();
  return page.locator("#shirt-canvas");
}

async function paint(page, count = 5) {
  const canvas = page.locator("#shirt-canvas");
  const box = await canvas.boundingBox();
  for (let i = 0; i < count; i++)
    await canvas.click({
      position: {
        x: box.width * (0.46 + (i % 3) * 0.04),
        y: box.height * (0.44 + (i % 2) * 0.06),
      },
    });
}

test("default game has a colorful intro and all eight dyes", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Make a tee that is totally yours." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Enter the studio" }).click();
  await reachDye(page);
  for (const color of [
    "Cherry", "Tangerine", "Sunshine", "Emerald",
    "Aqua", "Sky", "Violet", "Magenta",
  ])
    await expect(page.getByRole("button", { name: color })).toBeVisible();
  await expect(page.getByText("0 / 300 paint points")).toBeVisible();
});

test("colors appear while painting and finish as a decorated shirt", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const canvas = await reachDye(page, "Chevron");
  await page.getByRole("button", { name: "Magenta" }).click();
  await page.getByRole("button", { name: "Bold", exact: true }).click();
  await paint(page, 4);
  const chroma = await canvas.evaluate((element) => {
    const gl = element.getContext("webgl");
    const pixels = new Uint8Array(element.width * element.height * 4);
    gl.readPixels(0, 0, element.width, element.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    let total = 0, opaque = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] > 200) {
        opaque++;
        total += Math.max(pixels[i], pixels[i + 1], pixels[i + 2]) - Math.min(pixels[i], pixels[i + 1], pixels[i + 2]);
      }
    }
    return total / opaque;
  });
  expect(chroma).toBeGreaterThan(8);
  await page.getByRole("button", { name: "Finish my shirt" }).click();
  await page.getByRole("button", { name: "Unfold my shirt" }).click();
  await expect(page.getByRole("heading", { name: "Your tee is ready!" })).toBeVisible();
  await page.getByRole("button", { name: "Star sticker" }).click();
  await expect(page.locator(".placed-sticker")).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("the paint-point budget stops at 300 without slowing the shader", async ({ page }) => {
  await reachDye(page);
  const canvas = page.locator("#shirt-canvas");
  const elapsed = await canvas.evaluate((element) => {
    element.setPointerCapture = () => {};
    const bounds = element.getBoundingClientRect();
    const start = performance.now();
    for (let index = 0; index < 320; index++) {
      element.dispatchEvent(new PointerEvent("pointerdown", {
        bubbles: true,
        pointerId: index + 1,
        clientX: bounds.left + bounds.width * 0.5,
        clientY: bounds.top + bounds.height * 0.5,
      }));
      element.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: index + 1 }));
    }
    return performance.now() - start;
  });
  await expect(page.locator("#drop-count")).toHaveText("300 / 300 paint points");
  expect(elapsed).toBeLessThan(5000);
});

test("a finished shirt saves locally, downloads, and starts another tee", async ({ page }) => {
  await reachDye(page, "Sunburst");
  await paint(page, 5);
  await page.getByRole("button", { name: "Finish my shirt" }).click();
  await page.getByRole("button", { name: "Unfold my shirt" }).click();
  await page.getByRole("button", { name: "Save & share", exact: true }).click();
  await page.getByLabel("Made by").fill("Studio Tester");
  await page.getByLabel("Name your tee").fill("Rainbow Rush");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save my shirt" }).click();
  expect((await download).suggestedFilename()).toMatch(/^dye-day-.*\.png$/);
  await page.getByRole("button", { name: "Hang it on the clothesline" }).click();
  await expect(page.getByRole("heading", { name: "Rainbow Rush" })).toBeVisible();
  await expect(page.getByText("Made by Studio Tester")).toBeVisible();
  await page.getByRole("button", { name: "Make another shirt" }).click();
  await expect(page.getByRole("heading", { name: "Choose your fold." })).toBeVisible();
  await expect(page.locator("#edition")).toHaveText("TEE 002");
});

test("short mobile screens keep shirt and controls in one viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  await page.getByRole("button", { name: "Enter the studio" }).click();
  await page.getByRole("button", { name: "Fold my shirt" }).click();
  for (let i = 0; i < 3; i++)
    await page.getByRole("button", { name: /Add a rubber band/ }).click();
  await page.getByRole("button", { name: "Bring on the dye" }).click();
  await expect(page.getByRole("button", { name: "Finish my shirt" })).toBeVisible();
  const layout = await page.evaluate(() => ({
    viewport: window.innerHeight,
    document: document.documentElement.scrollHeight,
    controlsBottom: document.querySelector(".controls").getBoundingClientRect().bottom,
  }));
  expect(layout.document).toBeLessThanOrEqual(layout.viewport + 1);
  expect(layout.controlsBottom).toBeLessThanOrEqual(layout.viewport + 1);
});
