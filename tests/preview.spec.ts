import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, Browser } from 'playwright';
import { encode } from 'gpt-tokenizer';
import { renderDirections, Direction, TaskBrief } from '../packages/preview/index.js';

describe('Preview Renderer (Phase 3)', () => {
  const rootDir = process.cwd();
  const fixturePath = join(rootDir, 'tests', 'fixtures', 'directions.json');
  const goldenPath = join(rootDir, 'tests', 'fixtures', 'preview.golden.html');

  let rawDirectionsJson: string;
  let directions: Direction[];
  const musicTask: TaskBrief = {
    id: 'spotify-listening',
    title: 'Music Listening App',
    prompt: 'Build a music listening app like Spotify',
    type: 'music',
  };

  beforeAll(() => {
    rawDirectionsJson = readFileSync(fixturePath, 'utf-8');
    directions = JSON.parse(rawDirectionsJson);
  });

  // =========================================================================
  // 1. Hard Constraint: 5 Directions <= 400 Output Tokens
  // =========================================================================
  it('HARD CONSTRAINT: 5 directions must consume <= 400 output tokens', () => {
    const formattedTokens = encode(rawDirectionsJson).length;
    const compactTokens = encode(JSON.stringify(directions)).length;

    console.log('\n======================================================');
    console.log('   Direction Output Token Budget Verification');
    console.log('======================================================');
    console.log(`Formatted directions.json tokens : ${formattedTokens} / 400 limit`);
    console.log(`Compact JSON tokens              : ${compactTokens} / 400 limit`);
    console.log(`Status                           : ${formattedTokens <= 400 ? '✓ PASS' : '✗ FAIL'}`);
    console.log('======================================================\n');

    expect(directions).toHaveLength(5);
    expect(formattedTokens).toBeLessThanOrEqual(400);
    expect(compactTokens).toBeLessThanOrEqual(400);
  });

  // =========================================================================
  // 2. Golden-File HTML Snapshot Stability
  // =========================================================================
  it('Golden-file test: produces stable, deterministic HTML matching snapshot', () => {
    const renderedHtml = renderDirections(directions, musicTask);
    const goldenHtml = readFileSync(goldenPath, 'utf-8');

    expect(renderedHtml).toBe(goldenHtml);
    expect(renderedHtml).toContain('<!DOCTYPE html>');
    expect(renderedHtml).toContain('data-direction-id="kinetic-groove"');
    expect(renderedHtml).toContain('data-direction-id="swiss-audio"');
    expect(renderedHtml).toContain('data-direction-id="nocturne-sound"');
    expect(renderedHtml).toContain('data-direction-id="terminal-hifi"');
    expect(renderedHtml).toContain('data-direction-id="paper-acoustics"');
  });

  // =========================================================================
  // 3. Template Adaptation across all 4 subject templates
  // =========================================================================
  it('adapts subject template across all 4 task types with identical markup structure', () => {
    const taskTypes = ['music', 'dashboard', 'landing', 'editorial'] as const;

    for (const t of taskTypes) {
      const task: TaskBrief = { id: `task-${t}`, type: t, prompt: `Build a ${t} experience` };
      const html = renderDirections(directions, task);

      // Verify panel count
      expect(html).toContain('class="preview-stage"');
      expect(html).toContain('data-index="1"');
      expect(html).toContain('data-index="5"');

      // Verify template specific markers
      if (t === 'music') {
        expect(html).toContain('music-player-bar');
        expect(html).toContain('track-list');
        expect(html).toContain('album-grid');
      } else if (t === 'dashboard') {
        expect(html).toContain('stat-grid');
        expect(html).toContain('chart-box');
        expect(html).toContain('table-box');
      } else if (t === 'landing') {
        expect(html).toContain('landing-hero');
        expect(html).toContain('feature-grid');
        expect(html).toContain('terminal-block');
      } else if (t === 'editorial') {
        expect(html).toContain('editorial-header');
        expect(html).toContain('pull-quote');
        expect(html).toContain('editorial-body');
        expect(html).toContain('editorial-plate');
      }

      // Verify offline resilience hooks
      expect(html).toContain('fonts.googleapis.com');
      expect(html).toContain('onerror=');
      expect(html).toContain('document.fonts.ready');

      // Verify WebAudio blip synthesis & keyboard handlers
      expect(html).toContain('playSound(');
      expect(html).toContain('bubble-pop');
      expect(html).toContain('minimal-click');
      expect(html).toContain('warm-thud');
      expect(html).toContain('mechanical-switch');
      expect(html).toContain('paper-rustle');
      expect(html).toContain('Press 1–5 to select');
    }
  });

  // =========================================================================
  // 4. Playwright Pixel-Diff Test with 1% Tolerance
  // =========================================================================
  describe('Playwright 1200px Rendering & Pixel-Diff Test', () => {
    let browser: Browser;

    beforeAll(async () => {
      browser = await chromium.launch({ headless: true });
    });

    afterAll(async () => {
      if (browser) await browser.close();
    });

    it('renders at 1200px viewport and achieves pixel-diff < 1% tolerance across renders', async () => {
      const page = await browser.newPage({
        viewport: { width: 1200, height: 900 },
        deviceScaleFactor: 1,
      });

      const html = renderDirections(directions, musicTask);

      // Render Run 1
      await page.setContent(html, { waitUntil: 'load' });
      await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished)));
      await page.waitForTimeout(100);
      const screenshot1 = await page.screenshot({ fullPage: true });

      // Render Run 2 (independent reload)
      await page.setContent(html, { waitUntil: 'load' });
      await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished)));
      await page.waitForTimeout(100);
      const screenshot2 = await page.screenshot({ fullPage: true });

      expect(screenshot1.length).toBeGreaterThan(10000);
      expect(screenshot2.length).toBeGreaterThan(10000);

      // Pixel comparison in page context
      const diffRatio: number = await page.evaluate(async ({ b1, b2 }) => {
        const loadImg = (b64: string): Promise<HTMLImageElement> =>
          new Promise((res, rej) => {
            const img = new Image();
            img.onload = () => res(img);
            img.onerror = rej;
            img.src = 'data:image/png;base64,' + b64;
          });

        const [img1, img2] = await Promise.all([loadImg(b1), loadImg(b2)]);
        const canvas1 = document.createElement('canvas');
        canvas1.width = img1.width;
        canvas1.height = img1.height;
        const ctx1 = canvas1.getContext('2d')!;
        ctx1.drawImage(img1, 0, 0);
        const data1 = ctx1.getImageData(0, 0, img1.width, img1.height).data;

        const canvas2 = document.createElement('canvas');
        canvas2.width = img2.width;
        canvas2.height = img2.height;
        const ctx2 = canvas2.getContext('2d')!;
        ctx2.drawImage(img2, 0, 0);
        const data2 = ctx2.getImageData(0, 0, img2.width, img2.height).data;

        let diffPixels = 0;
        const totalPixels = img1.width * img1.height;

        for (let i = 0; i < data1.length; i += 4) {
          const dr = Math.abs(data1[i] - data2[i]);
          const dg = Math.abs(data1[i + 1] - data2[i + 1]);
          const db = Math.abs(data1[i + 2] - data2[i + 2]);
          const da = Math.abs(data1[i + 3] - data2[i + 3]);
          if (dr > 8 || dg > 8 || db > 8 || da > 8) {
            diffPixels++;
          }
        }

        return diffPixels / totalPixels;
      }, {
        b1: screenshot1.toString('base64'),
        b2: screenshot2.toString('base64'),
      });

      console.log(`Playwright Pixel-Diff Measured: ${(diffRatio * 100).toFixed(4)}% (Tolerance <= 1.0%)`);
      expect(diffRatio).toBeLessThanOrEqual(0.01); // <= 1% tolerance

      await page.close();
    }, 20000);
  });
});
