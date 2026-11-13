import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { join } from 'node:path';
import { chromium, Browser } from 'playwright';

describe('Motion Primitives & WAAPI Animations (Phase 6)', () => {
  let fileUrl: string;
  let browser: Browser;

  const primitives = [
    'reveal',
    'stagger',
    'sheet',
    'flip',
    'magnetic',
    'page',
    'ticker',
    'skeleton',
  ] as const;

  beforeAll(async () => {
    const rootDir = process.cwd();
    fileUrl = `file://${join(rootDir, 'examples', 'kitchen-sink.html')}`;

    browser = await chromium.launch({
      headless: true,
      args: ['--allow-file-access-from-files'],
    });
  });

  afterAll(async () => {
    if (browser) await browser.close();
  });

  // =========================================================================
  // 1. All 8 primitives actually animate: sample at t=0 vs t=mid
  // =========================================================================
  it('asserts each of the 8 motion primitives actually animates (sample computed transform at t=0 and t=mid)', async () => {
    const page = await browser.newPage();
    await page.goto(fileUrl, { waitUntil: 'load' });
    await page.waitForFunction(() => Boolean((window as any).__auteur));

    console.log('\n======================================================');
    console.log('   Motion Primitives Animation Sampling (t=0 vs t=mid)');
    console.log('======================================================');

    for (const name of primitives) {
      // Trigger the primitive
      await page.evaluate((prim) => {
        const runOpts = prim === 'reveal' ? { immediate: true } : {};
        (window as any).__auteur.run(prim, runOpts);
      }, name);

      // Sample computed transform at t=0 and t=mid
      const sample = await page.evaluate((prim) => {
        return (window as any).__auteur.sample(prim);
      }, name);

      console.log(`[Primitive: ${name.padEnd(10)}] dur=${sample.dur}ms | at0=${sample.at0} | atMid=${sample.atMid}`);

      expect(sample.ok, `Primitive "${name}" failed to produce an active animation`).toBe(true);
      expect(sample.dur).toBeGreaterThan(0);
      expect(sample.at0).not.toBe(sample.atMid);
    }
    console.log('======================================================\n');

    await page.close();
  });

  // =========================================================================
  // 2. Reduced motion disables all animations immediately
  // =========================================================================
  it('asserts prefers-reduced-motion completely disables all motion animations', async () => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(fileUrl, { waitUntil: 'load' });
    await page.waitForFunction(() => Boolean((window as any).__auteur));

    console.log('\n======================================================');
    console.log('   Reduced-Motion Safety Check (prefers-reduced-motion)');
    console.log('======================================================');

    for (const name of primitives) {
      // Trigger the primitive under reduced-motion
      await page.evaluate((prim) => {
        const runOpts = prim === 'reveal' ? { immediate: true } : {};
        (window as any).__auteur.run(prim, runOpts);
      }, name);

      const hasAnim = await page.evaluate((prim) => {
        return (window as any).__auteur.hasAnim(prim);
      }, name);

      const sample = await page.evaluate((prim) => {
        return (window as any).__auteur.sample(prim);
      }, name);

      console.log(`[Primitive: ${name.padEnd(10)}] hasAnim=${hasAnim} | sampleOk=${sample.ok}`);

      // With reduced motion, WAAPI animation must not be running
      expect(hasAnim).toBe(false);
      expect(sample.ok).toBe(false);
    }
    console.log('======================================================\n');

    await page.close();
    await context.close();
  });
});
