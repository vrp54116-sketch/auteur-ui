import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { encode } from 'gpt-tokenizer';
import { lint } from '../../packages/lint/index.js';

describe('Phase 5 Acceptance: 6 Evals Fixtures', () => {
  const root = process.cwd();

  const badFixtures = ['slop-1.html', 'slop-2.html', 'slop-3.html'];
  const goodFixtures = ['good-1.html', 'good-2.html', 'good-3.html'];

  for (const f of badFixtures) {
    it(`evaluates bad fixture ${f} with score < 50 and pass = false`, async () => {
      const htmlPath = resolve(root, 'evals', 'fixtures', f);
      const result = await lint({ html: htmlPath });

      const jsonStr = JSON.stringify(result);
      const tokenCount = encode(jsonStr).length;

      console.log(`\n------------------------------------------------------`);
      console.log(` Bad Fixture: ${f}`);
      console.log(` Score      : ${result.score}/100 (Required < 50)`);
      console.log(` Pass       : ${result.pass} (Required false)`);
      console.log(` Failures   : ${result.fail.length}`);
      console.log(` JSON Tokens: ${tokenCount} / 250 budget`);
      console.log(` Sample Fail: ${result.fail[0]?.r} -> ${result.fail[0]?.val}`);
      console.log(`------------------------------------------------------\n`);

      expect(result.score).toBeLessThan(50);
      expect(result.pass).toBe(false);
      expect(tokenCount).toBeLessThanOrEqual(250);
    }, 20000);
  }

  for (const f of goodFixtures) {
    it(`evaluates good fixture ${f} with score > 80 and pass = true`, async () => {
      const htmlPath = resolve(root, 'evals', 'fixtures', f);
      const result = await lint({ html: htmlPath });

      const jsonStr = JSON.stringify(result);
      const tokenCount = encode(jsonStr).length;

      console.log(`\n------------------------------------------------------`);
      console.log(` Good Fixture: ${f}`);
      console.log(` Score       : ${result.score}/100 (Required > 80)`);
      console.log(` Pass        : ${result.pass} (Required true)`);
      console.log(` Failures    : ${result.fail.length}`);
      console.log(` JSON Tokens : ${tokenCount} / 250 budget`);
      if (result.fail.length > 0) {
        console.log(` Failures    : ${result.fail.map((x) => x.r).join(', ')}`);
      }
      console.log(`------------------------------------------------------\n`);

      expect(result.score).toBeGreaterThan(80);
      expect(result.pass).toBe(true);
      expect(tokenCount).toBeLessThanOrEqual(250);
    }, 20000);
  }
});
