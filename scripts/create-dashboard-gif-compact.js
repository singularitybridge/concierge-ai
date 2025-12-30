const puppeteer = require('puppeteer');
const GIFEncoder = require('gif-encoder-2');
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

async function createDashboardGif() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const width = 800;
  const height = 450;
  await page.setViewport({ width, height, deviceScaleFactor: 1 });

  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('niseko_authenticated', 'true');
    localStorage.setItem('niseko_role', 'admin');
  });

  console.log('Navigating to dashboard...');
  await page.goto('http://localhost:4024/revenue-intelligence', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  await page.waitForSelector('.backdrop-blur-xl', { timeout: 10000 });
  await new Promise(r => setTimeout(r, 2000));

  const encoder = new GIFEncoder(width, height, 'neuquant', true);
  const gifPath = path.join(__dirname, '..', 'public', 'screenshots', 'revenue-intelligence-demo-compact.gif');

  encoder.createReadStream().pipe(fs.createWriteStream(gifPath));
  encoder.start();
  encoder.setDelay(200); // 200ms between frames
  encoder.setQuality(20); // Lower quality for smaller file
  encoder.setRepeat(0);

  const frames = [];

  // Helper to draw arrow
  function drawArrow(ctx, fromX, fromY, toX, toY, color = 'rgba(99, 102, 241, 0.9)') {
    const headLength = 10; // Smaller for compact version
    const headAngle = Math.PI / 6;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.save();

    // Draw line with glow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Draw arrowhead
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle - headAngle),
      toY - headLength * Math.sin(angle - headAngle)
    );
    ctx.lineTo(
      toX - headLength * Math.cos(angle + headAngle),
      toY - headLength * Math.sin(angle + headAngle)
    );
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Helper to draw caption bubble with optional arrow
  function drawCaption(ctx, text, position = 'bottom', arrowTo = null) {
    if (!text) return;

    ctx.save();

    const padding = 10;
    const fontSize = 12;
    const lineHeight = 16;
    const maxWidth = width - 60;
    const bubbleRadius = 8;

    ctx.font = `bold ${fontSize}px Arial, sans-serif`;

    // Word wrap
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth - padding * 2) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);

    // Calculate bubble dimensions
    const textWidth = Math.max(...lines.map(l => ctx.measureText(l).width));
    const bubbleWidth = textWidth + padding * 2;
    const bubbleHeight = lines.length * lineHeight + padding * 2;

    // Position
    let x, y;
    if (position === 'bottom') {
      x = (width - bubbleWidth) / 2;
      y = height - bubbleHeight - 20;
    } else if (position === 'top') {
      x = (width - bubbleWidth) / 2;
      y = 50;
    } else if (position === 'top-left') {
      x = 30;
      y = 50;
    } else if (position === 'bottom-left') {
      x = 30;
      y = height - bubbleHeight - 20;
    }

    // Draw arrow first (so it goes behind bubble if overlapping)
    if (arrowTo) {
      const arrowStartX = x + bubbleWidth / 2;
      const arrowStartY = position.includes('bottom') ? y : y + bubbleHeight;
      drawArrow(ctx, arrowStartX, arrowStartY, arrowTo.x, arrowTo.y);
    }

    // Draw shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;

    // Draw bubble background
    ctx.fillStyle = 'rgba(99, 102, 241, 0.95)';
    ctx.beginPath();
    ctx.roundRect(x, y, bubbleWidth, bubbleHeight, bubbleRadius);
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Draw border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    lines.forEach((line, i) => {
      const textY = y + padding + lineHeight / 2 + i * lineHeight;
      ctx.fillText(line, x + bubbleWidth / 2, textY);
    });

    ctx.restore();
  }

  async function captureFrame(caption, position = 'bottom', arrowTo = null) {
    const screenshot = await page.screenshot({ encoding: 'binary' });
    frames.push({ screenshot, caption, position, arrowTo });
    console.log(`Captured frame ${frames.length}: "${caption || 'no caption'}"`);
  }

  const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log(`Page height: ${pageHeight}px, Viewport: ${height}px`);

  // Scene 1: Introduction (no arrow - full dashboard)
  console.log('Scene 1: Introduction...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 300));

  for (let i = 0; i < 8; i++) {
    await captureFrame('Revenue Intelligence Dashboard - AI-Powered BI Analytics', 'bottom', null);
  }

  // Scene 2: Highlight metrics row - arrow pointing to metrics
  console.log('Scene 2: Key metrics...');
  for (let i = 0; i < 6; i++) {
    await captureFrame('Real-time KPIs: Occupancy, ADR, RevPAR, TRevPAR', 'bottom', { x: 400, y: 80 });
  }

  // Scene 3: Hover over metric card - arrow to occupancy card
  console.log('Scene 3: Hover interaction...');
  try {
    const occCard = await page.$('.group.relative');
    if (occCard) {
      await occCard.hover();
      await new Promise(r => setTimeout(r, 300));
      for (let i = 0; i < 6; i++) {
        await captureFrame('Hover metrics to reveal "Ask AI" button', 'bottom', { x: 60, y: 75 });
      }
    }
  } catch (e) {
    console.log('Hover failed:', e.message);
  }

  // Scene 4: Competitive Index - arrow to gauges
  console.log('Scene 4: Competitive Index...');
  await page.mouse.move(0, 0);
  await new Promise(r => setTimeout(r, 200));
  for (let i = 0; i < 6; i++) {
    await captureFrame('Competitive Index: MPI, ARI, RGI', 'bottom', { x: 100, y: 160 });
  }

  // Scene 5: Performance Trend - arrow to chart
  console.log('Scene 5: Performance Trend...');
  for (let i = 0; i < 6; i++) {
    await captureFrame('14-Day Performance Trend', 'bottom', { x: 520, y: 160 });
  }

  // Scene 6: Scroll to segments - arrow to segment chart
  console.log('Scene 6: Segments...');
  await page.evaluate(() => window.scrollTo({ top: 200, behavior: 'instant' }));
  await new Promise(r => setTimeout(r, 300));
  for (let i = 0; i < 6; i++) {
    await captureFrame('Revenue by Segment', 'bottom', { x: 160, y: 120 });
  }

  // Scene 7: Channel Performance - arrow to channel table
  console.log('Scene 7: Channels...');
  for (let i = 0; i < 6; i++) {
    await captureFrame('Channel Performance', 'bottom', { x: 580, y: 120 });
  }

  // Scene 8: Scroll to rate parity
  console.log('Scene 8: Rate monitoring...');
  await page.evaluate(() => window.scrollTo({ top: 320, behavior: 'instant' }));
  await new Promise(r => setTimeout(r, 300));
  for (let i = 0; i < 6; i++) {
    await captureFrame('Rate Parity Monitor', 'bottom', { x: 140, y: 100 });
  }

  // Scene 9: Competitor Rates
  console.log('Scene 9: Competitors...');
  for (let i = 0; i < 6; i++) {
    await captureFrame('Competitor Rates', 'bottom', { x: 400, y: 100 });
  }

  // Scene 10: Pickup Report
  console.log('Scene 10: Pickup...');
  for (let i = 0; i < 6; i++) {
    await captureFrame('Pickup Report', 'bottom', { x: 660, y: 100 });
  }

  // Scene 11: Scroll to forecast
  console.log('Scene 11: 90-Day Forecast...');
  await page.evaluate(() => {
    const sections = document.querySelectorAll('h3');
    for (const s of sections) {
      if (s.textContent.includes('90-Day')) {
        s.scrollIntoView({ behavior: 'instant', block: 'start' });
        break;
      }
    }
  });
  await new Promise(r => setTimeout(r, 400));
  for (let i = 0; i < 6; i++) {
    await captureFrame('90-Day Demand Forecast', 'bottom', { x: 400, y: 200 });
  }

  // Scene 12: Period toggles - arrow to buttons
  console.log('Scene 12: Period toggles...');
  for (let i = 0; i < 5; i++) {
    await captureFrame('Switch between 30D, 60D, 90D views', 'bottom', { x: 200, y: 50 });
  }

  // Click 60D
  const result60 = await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent.trim() === '60D') {
        btn.click();
        return true;
      }
    }
    return false;
  });
  if (result60) {
    await new Promise(r => setTimeout(r, 400));
    for (let i = 0; i < 5; i++) {
      await captureFrame('60-Day view selected', 'bottom', { x: 400, y: 170 });
    }
  }

  // Click 90D
  const result90 = await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent.trim() === '90D') {
        btn.click();
        return true;
      }
    }
    return false;
  });
  if (result90) {
    await new Promise(r => setTimeout(r, 400));
    for (let i = 0; i < 5; i++) {
      await captureFrame('90-Day view - Full quarter', 'bottom', { x: 400, y: 170 });
    }
  }

  // Scene 13: AI Insights panel - arrow to insights
  console.log('Scene 13: AI Insights...');
  for (let i = 0; i < 6; i++) {
    await captureFrame('AI Insights - Recommendations', 'bottom', { x: 660, y: 310 });
  }

  // Scene 14: Key Events - arrow to events
  console.log('Scene 14: Key Events...');
  for (let i = 0; i < 5; i++) {
    await captureFrame('Key Events with RevPAR impact', 'bottom', { x: 290, y: 310 });
  }

  // Scene 15: Open AI Panel - arrow to Ask AI button
  console.log('Scene 15: Open AI Assistant...');
  for (let i = 0; i < 4; i++) {
    await captureFrame('Click "Ask AI" to open Assistant', 'bottom', { x: 750, y: 50 });
  }

  const clicked = await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent.includes('Ask AI')) {
        btn.click();
        return true;
      }
    }
    return false;
  });

  if (clicked) {
    await new Promise(r => setTimeout(r, 600));

    // Scene 16: AI Panel open - arrow to panel
    console.log('Scene 16: AI Panel...');
    for (let i = 0; i < 8; i++) {
      await captureFrame('Revenue AI Assistant', 'top-left', { x: 680, y: 120 });
    }

    // Scene 17: Quick questions - arrow to quick question buttons
    console.log('Scene 17: Quick questions...');
    for (let i = 0; i < 6; i++) {
      await captureFrame('Quick questions for common queries', 'top-left', { x: 680, y: 200 });
    }

    // Click a question
    console.log('Scene 18: Ask question...');
    const asked = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent.includes('Rate strategy')) {
          btn.click();
          return true;
        }
      }
      return false;
    });

    if (asked) {
      await new Promise(r => setTimeout(r, 800));
      // Scene 18: AI Response
      for (let i = 0; i < 10; i++) {
        await captureFrame('AI provides recommendations', 'top-left', { x: 680, y: 280 });
      }
    }

    // Close panel
    console.log('Scene 19: Close panel...');
    await page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      for (const btn of btns) {
        const svg = btn.querySelector('svg');
        if (svg && svg.classList.contains('lucide-x')) {
          btn.click();
          break;
        }
      }
    });
    await new Promise(r => setTimeout(r, 400));
  }

  // Scene 20: Compression Calendar
  console.log('Scene 20: Compression Calendar...');
  await page.evaluate(() => window.scrollTo({ top: 570, behavior: 'instant' }));
  await new Promise(r => setTimeout(r, 300));
  for (let i = 0; i < 6; i++) {
    await captureFrame('Compression Calendar - Demand heatmap', 'bottom', { x: 260, y: 140 });
  }

  // Scene 21: Rate Explainer
  console.log('Scene 21: Rate Explainer...');
  for (let i = 0; i < 6; i++) {
    await captureFrame('Rate Explainer - Pricing factors', 'bottom', { x: 630, y: 140 });
  }

  // Scene 22: Budget section
  console.log('Scene 22: Budget tracking...');
  await page.evaluate(() => window.scrollTo({ top: 800, behavior: 'instant' }));
  await new Promise(r => setTimeout(r, 300));
  for (let i = 0; i < 6; i++) {
    await captureFrame('Budget vs Actual', 'bottom', { x: 230, y: 120 });
  }

  // Scene 23: Sales Pacing
  console.log('Scene 23: Sales Pacing...');
  for (let i = 0; i < 6; i++) {
    await captureFrame('Sales Pacing', 'bottom', { x: 600, y: 120 });
  }

  // Scene 24: Return to top - final message
  console.log('Scene 24: Return to top...');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await new Promise(r => setTimeout(r, 300));
  for (let i = 0; i < 8; i++) {
    await captureFrame('AI-Powered Revenue Intelligence!', 'bottom', null);
  }

  // Encode frames
  console.log(`\nEncoding ${frames.length} frames to GIF...`);

  for (let i = 0; i < frames.length; i++) {
    const { screenshot, caption, position, arrowTo } = frames[i];
    const png = PNG.sync.read(screenshot);
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Draw screenshot
    const imageData = ctx.createImageData(width, height);
    for (let j = 0; j < png.data.length; j++) {
      imageData.data[j] = png.data[j];
    }
    ctx.putImageData(imageData, 0, 0);

    // Draw caption bubble with arrow
    drawCaption(ctx, caption, position, arrowTo);

    encoder.addFrame(ctx);

    if (i % 30 === 0) {
      console.log(`Encoded frame ${i + 1}/${frames.length}`);
    }
  }

  encoder.finish();
  await browser.close();

  const stats = fs.statSync(gifPath);
  console.log(`\nGIF saved to: ${gifPath}`);
  console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log('Done!');
}

createDashboardGif().catch(console.error);
