import puppeteer, { type PDFOptions } from "puppeteer";

const DEFAULT_BROWSER_ARGS = [
  "--disable-dev-shm-usage",
  "--font-render-hinting=none",
  "--no-sandbox",
  "--disable-setuid-sandbox",
];

const DEFAULT_PDF_OPTIONS: PDFOptions = {
  format: "A4",
  margin: {
    top: "12mm",
    right: "10mm",
    bottom: "12mm",
    left: "10mm",
  },
  printBackground: true,
};

export async function renderHtmlToPdf(
  html: string,
  options: PDFOptions = {}
): Promise<Buffer> {
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH?.trim();
  const browser = await puppeteer.launch({
    args: DEFAULT_BROWSER_ARGS,
    executablePath: executablePath || undefined,
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 1280,
      height: 1800,
      deviceScaleFactor: 1,
    });
    await page.emulateMediaType("screen");
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      ...DEFAULT_PDF_OPTIONS,
      ...options,
      margin: {
        ...DEFAULT_PDF_OPTIONS.margin,
        ...options.margin,
      },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
