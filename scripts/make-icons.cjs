// Renders the PNG icons and logos from their SVGs: the app's icons in public/ (Android, iOS, browser,
// notification badge) and the brand files in brand/png/ (Play Store icon, logos). See brand/README.md.
// usage: PW=@playwright/test node scripts/make-icons.cjs   (first time: npx playwright install chromium)
const { mkdirSync, readFileSync } = require('node:fs');
const { join } = require('node:path');
const { chromium } = require(process.env.PW || 'playwright');

const root = join(__dirname, '..');
// [source SVG, width, height, output PNG], paths from the repo root.
const ICONS = [
  ['public/icon.svg', 192, 192, 'public/icon-192.png'],
  ['public/icon.svg', 512, 512, 'public/icon-512.png'],
  ['public/icon-maskable.svg', 512, 512, 'public/icon-maskable-512.png'],
  ['public/icon-maskable.svg', 180, 180, 'public/apple-touch-icon.png'],
  // Notification badge (Android shows it in one colour in the status bar).
  ['public/icon-badge.svg', 96, 96, 'public/icon-badge-96.png'],
  // Brand files.
  ['brand/app-icon-maskable.svg', 512, 512, 'brand/png/play-store-icon-512.png'],
  ['brand/app-icon.svg', 1024, 1024, 'brand/png/app-icon-1024.png'],
  ['brand/app-icon-dark.svg', 1024, 1024, 'brand/png/app-icon-dark-1024.png'],
  ['brand/logo-mark.svg', 1024, 1024, 'brand/png/logo-mark-1024.png'],
  ['brand/logo-mark-dark.svg', 1024, 1024, 'brand/png/logo-mark-dark-1024.png'],
  ['brand/logo.svg', 1368, 400, 'brand/png/logo.png'],
  ['brand/logo-on-dark.svg', 1368, 400, 'brand/png/logo-on-dark.png'],
];

// The wordmark is set in Inter; embed the app's own copy so it renders the same on any computer.
const inter = readFileSync(join(root, 'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')).toString('base64');
const fontCss = `@font-face{font-family:Inter;font-weight:100 900;src:url(data:font/woff2;base64,${inter}) format('woff2')}`;

(async () => {
  mkdirSync(join(root, 'brand/png'), { recursive: true });
  const browser = await chromium.launch();
  for (const [source, width, height, output] of ICONS) {
    const page = await browser.newPage({ viewport: { width, height } });
    const svg = readFileSync(join(root, source), 'utf8').replace('<svg ', `<svg width="${width}" height="${height}" `);
    await page.setContent(`<style>${fontCss}html,body{margin:0;background:transparent}</style>${svg}`);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('svg').screenshot({ path: join(root, output), omitBackground: true });
    console.log(output);
  }
  await browser.close();
})();
