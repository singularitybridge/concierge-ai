const puppeteer = require('puppeteer');
const path = require('path');

async function captureScreenshot() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Set viewport for full HD screenshot
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 2 // For retina quality
  });

  console.log('Setting up authentication...');
  // Set localStorage to bypass login
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('niseko_authenticated', 'true');
    localStorage.setItem('niseko_role', 'admin');
  });

  console.log('Navigating to Revenue Intelligence dashboard...');
  await page.goto('http://localhost:4024/revenue-intelligence', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  // Wait for the page to fully render
  await page.waitForSelector('.backdrop-blur-xl', { timeout: 10000 });
  await new Promise(resolve => setTimeout(resolve, 2000)); // Extra wait for animations

  // Take full page screenshot
  const screenshotPath = path.join(__dirname, '..', 'public', 'screenshots', 'revenue-intelligence-dashboard.png');

  console.log('Taking screenshot...');
  await page.screenshot({
    path: screenshotPath,
    fullPage: true
  });

  // Also take a viewport-only screenshot
  const viewportPath = path.join(__dirname, '..', 'public', 'screenshots', 'revenue-intelligence-viewport.png');
  await page.screenshot({
    path: viewportPath,
    fullPage: false
  });

  console.log(`Screenshots saved to:`);
  console.log(`  - ${screenshotPath} (full page)`);
  console.log(`  - ${viewportPath} (viewport only)`);

  await browser.close();
  console.log('Done!');
}

captureScreenshot().catch(console.error);
