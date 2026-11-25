import { chromium } from '@playwright/test';

// Export the original revision separately; never simulate a previous application UI.
// See docs/evidence/README.md for server commands and revision details.
const browser = await chromium.launch({
  executablePath: process.env.CHROME_BIN || '/usr/bin/google-chrome',
  args: ['--no-sandbox'],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    locale: 'zh-CN',
    colorScheme: 'light',
    deviceScaleFactor: 1,
  });
  await page.goto(process.env.BASELINE_URL || 'http://127.0.0.1:4174');
  await page.screenshot({ path: 'docs/evidence/before-desktop.png' });
  await page.goto(process.env.APP_URL || 'http://127.0.0.1:4175');
  await page.locator('#scene-image').evaluate(image => image.decode());
  await page.screenshot({ path: 'docs/evidence/after-desktop.png' });
  await page.screenshot({ path: 'docs/evidence/after-desktop-full.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(process.env.BASELINE_URL || 'http://127.0.0.1:4174');
  await page.screenshot({ path: 'docs/evidence/before-mobile.png' });
  await page.goto(process.env.APP_URL || 'http://127.0.0.1:4175');
  await page.locator('#scene-image').evaluate(image => image.decode());
  await page.screenshot({ path: 'docs/evidence/after-mobile.png' });
  await page.screenshot({ path: 'docs/evidence/after-mobile-full.png', fullPage: true });
} finally {
  await browser.close();
}
