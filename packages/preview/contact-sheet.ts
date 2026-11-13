import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';

export interface ContactSheetOptions {
  width?: number;
  height?: number;
  fullPage?: boolean;
  timeoutMs?: number;
}

/**
 * Uses Playwright to render preview HTML and save a single 1200px-wide PNG contact sheet
 * for the human to view in the repository.
 * Zero LLM involvement.
 */
export async function generateContactSheet(
  html: string,
  outputPath: string,
  options: ContactSheetOptions = {}
): Promise<string> {
  const width = options.width ?? 1200;
  const height = options.height ?? 800;
  const fullPage = options.fullPage ?? true;

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });

    await page.setContent(html, { waitUntil: 'load' });
    // Settle CSS entrance animations and fonts
    await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished)));
    await page.waitForTimeout(options.timeoutMs ?? 100);

    const outDir = dirname(outputPath);
    if (!existsSync(outDir)) {
      mkdirSync(outDir, { recursive: true });
    }

    await page.screenshot({ path: outputPath, fullPage });
    return outputPath;
  } finally {
    await browser.close();
  }
}
