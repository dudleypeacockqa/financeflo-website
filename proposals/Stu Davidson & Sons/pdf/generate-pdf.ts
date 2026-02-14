import { chromium } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function generatePDF() {
  const htmlPath = path.resolve(__dirname, "proposal-print.html");
  const outputDir = path.resolve(__dirname, "..", "output");
  const outputPath = path.resolve(outputDir, "stu-davidson-proposal.pdf");

  // Ensure output directory exists
  const fs = await import("fs");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log("Launching browser...");
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to the HTML file
  const fileUrl = `file:///${htmlPath.replace(/\\/g, "/")}`;
  console.log(`Loading: ${fileUrl}`);
  await page.goto(fileUrl, { waitUntil: "networkidle" });

  // Wait for fonts to load
  await page.waitForTimeout(2000);

  console.log("Generating PDF...");
  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `<span></span>`,
    footerTemplate: `
      <div style="width: 100%; font-size: 8px; font-family: 'Inter', Arial, sans-serif; color: #94a3b8; display: flex; justify-content: space-between; padding: 0 18mm;">
        <span>Confidential &mdash; Stu Davidson & Sons (Pty) Ltd</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `,
    margin: {
      top: "0",
      bottom: "15mm",
      left: "0",
      right: "0",
    },
  });

  await browser.close();
  console.log(`PDF generated: ${outputPath}`);
}

generatePDF().catch((err) => {
  console.error("Error generating PDF:", err);
  process.exit(1);
});
