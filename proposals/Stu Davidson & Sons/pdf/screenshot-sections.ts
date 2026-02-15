import { chromium } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function screenshotSections() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // A4 content area after margins at 96dpi
  await page.setViewportSize({ width: 661, height: 958 });
  await page.emulateMedia({ media: "print" });

  const htmlPath = path.resolve(__dirname, "proposal-print.html");
  const fileUrl = `file:///${htmlPath.replace(/\\/g, "/")}`;
  await page.goto(fileUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);

  const screenshotDir = path.resolve(__dirname, "..", "output", "screenshots");

  // Screenshot cover
  const cover = page.locator(".cover");
  await cover.screenshot({
    path: path.resolve(screenshotDir, "pdf-cover.png"),
  });
  console.log("Cover screenshot saved");

  // Screenshot each .page section
  const sections = page.locator(".page");
  const count = await sections.count();
  console.log(`Found ${count} page sections`);

  for (let i = 0; i < count; i++) {
    await sections.nth(i).screenshot({
      path: path.resolve(screenshotDir, `pdf-section-${i + 2}.png`),
    });
    console.log(`Section ${i + 2} screenshot saved`);
  }

  await browser.close();
}

screenshotSections().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
