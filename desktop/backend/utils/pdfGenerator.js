/**
 * utils/pdfGenerator.js
 * Renders an HTML string to a PDF buffer using Puppeteer.
 *
 * IMPORTANT deployment note:
 * Headless Chromium relies on fonts installed on the SERVER, not in Node.
 * For Arabic text to render correctly on Linux, install an Arabic-capable
 * font package before deploying, e.g. on Debian/Ubuntu:
 *   sudo apt-get install -y fonts-noto-naskh-arabic fonts-noto-color-emoji
 * Without this, Arabic glyphs may show as boxes ("tofu") in the PDF.
 *
 * npm install puppeteer
 */

const puppeteer = require('puppeteer');

let browserPromise = null;

function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browserPromise;
}

/**
 * @param {string} html - full HTML document to render
 * @param {object} opts
 * @param {string} opts.footerText - short text shown in the page footer (e.g. report title)
 * @returns {Promise<Buffer>} PDF file bytes
 */
async function generatePdfBuffer(html, { footerText = '' } = {}) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: `
        <div style="width:100%; font-size:9px; color:#666; text-align:center; direction:rtl; font-family: Tahoma, Arial, sans-serif;">
          ${footerText} — صفحة <span class="pageNumber"></span> من <span class="totalPages"></span>
        </div>`,
      margin: { top: '15mm', bottom: '18mm', left: '12mm', right: '12mm' },
    });
    return pdfBuffer;
  } finally {
    await page.close();
  }
}

/** Call once on process shutdown (e.g. in a SIGTERM handler) to free Chromium. */
async function closeBrowser() {
  if (browserPromise) {
    const browser = await browserPromise;
    await browser.close();
    browserPromise = null;
  }
}

module.exports = { generatePdfBuffer, closeBrowser };