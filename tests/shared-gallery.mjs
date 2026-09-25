// Optional live smoke test. It creates one clearly named shirt in the configured studio gallery.
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";

const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  args: ["--enable-webgl", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
try {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  const testUrl = new URL(process.env.SHARED_TEST_URL || "http://127.0.0.1:5173/");
  testUrl.searchParams.set("ui", "v1");
  await page.goto(testUrl.href);
  await page.getByRole("button", { name: "Fold my shirt" }).click();
  for (let i = 0; i < 3; i++)
    await page.getByRole("button", { name: /Add a rubber band/ }).click();
  await page.getByRole("button", { name: "Bring on the dye" }).click();
  await page.getByRole("button", { name: "Rainbow remix" }).click();
  await page.getByRole("button", { name: "Finish my shirt" }).click();
  await page.getByRole("button", { name: "Unfold my shirt" }).click();
  await page.getByRole("button", { name: "Save & share", exact: true }).click();
  await page.getByLabel("Made by").fill("Gallery verification");
  await page.getByLabel("Name your tee").fill("Shared gallery test");
  const submission = page.waitForResponse(
    (response) => response.request().method() === "POST" && response.url().endsWith("/shirts"),
  );
  await page.getByRole("button", { name: "Hang it on the clothesline" }).click();
  assert.equal((await submission).status(), 201);
  await page.getByRole("heading", { name: "Shared gallery test" }).waitFor();
  console.log("PASS: the live clothesline accepted and displayed a test shirt.");
} finally {
  await browser.close();
}
