// Renders the PNG app icons (Android, iOS, Play Store) from public/icon.svg and public/icon-maskable.svg.
// usage: PW=<path to playwright> node scripts/make-icons.cjs   (e.g. after `npx playwright install chromium`)
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { chromium } = require(process.env.PW || 'playwright');

const pub = join(__dirname, '..', 'public');
const ICONS = [
  ['icon.svg', 192, 'icon-192.png'],
  ['icon.svg', 512, 'icon-512.png'],
  ['icon-maskable.svg', 512, 'icon-maskable-512.png'],
  ['icon-maskable.svg', 180, 'apple-touch-icon.png'],
];

(async () => {
  const browser = await chromium.launch();
  for (const [source, size, output] of ICONS) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    const svg = readFileSync(join(pub, source), 'utf8').replace('<svg ', `<svg width="${size}" height="${size}" `);
    await page.setContent(`<style>html,body{margin:0;background:transparent}</style>${svg}`);
    await page.locator('svg').screenshot({ path: join(pub, output), omitBackground: true });
    console.log(output);
  }
  await browser.close();
})();
