import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
// @ts-ignore
import { fontPairingConfigs } from '../code/type/next-font.js';
// @ts-ignore
import { getPairing, applyPairingScale } from '../code/type/index.mjs';

describe('Typography Pairings (Phase 6)', () => {
  const rootDir = process.cwd();
  const pairingsPath = join(rootDir, 'code', 'type', 'pairings.json');
  const fontFacePath = join(rootDir, 'code', 'type', 'font-face.css');
  const scalesPath = join(rootDir, 'code', 'type', 'scales.css');

  it('asserts code/type/pairings.json exists and contains exactly 12 authentic OFL pairings', () => {
    expect(existsSync(pairingsPath)).toBe(true);
    const pairings = JSON.parse(readFileSync(pairingsPath, 'utf-8'));
    expect(Array.isArray(pairings)).toBe(true);
    expect(pairings.length).toBe(12);

    for (const p of pairings) {
      expect(p.id).toBeDefined();
      expect(p.name).toBeDefined();
      expect(p.license).toBe('SIL OFL 1.1');
      expect(p.display).toBeDefined();
      expect(p.display.family).toBeDefined();
      expect(p.body).toBeDefined();
      expect(p.body.family).toBeDefined();

      // Fluid clamp scale validation
      expect(p.scale).toBeDefined();
      const scaleKeys = ['textXs', 'textSm', 'textBase', 'textLg', 'textXl', 'text2xl', 'text3xl', 'text4xl', 'text5xl'];
      for (const k of scaleKeys) {
        expect(p.scale[k]).toMatch(/^clamp\(/);
      }
    }
  });

  it('verifies next-font.js exports configurations for all 12 pairings', () => {
    const pairings = JSON.parse(readFileSync(pairingsPath, 'utf-8'));
    for (const p of pairings) {
      const config = (fontPairingConfigs as Record<string, any>)[p.id];
      expect(config).toBeDefined();
      expect(config.display).toBeDefined();
      expect(config.display.loader).toBeDefined();
      expect(config.body).toBeDefined();
      expect(config.body.loader).toBeDefined();
    }
  });

  it('verifies font-face.css and scales.css exist with valid declarations', () => {
    expect(existsSync(fontFacePath)).toBe(true);
    expect(existsSync(scalesPath)).toBe(true);

    const fontFace = readFileSync(fontFacePath, 'utf-8');
    const scales = readFileSync(scalesPath, 'utf-8');

    expect(fontFace).toContain('@import url(');
    expect(fontFace).toContain('fonts.googleapis.com');
    expect(scales).toContain('--text-base: clamp(');
    expect(scales).toContain('font-optical-sizing: auto');
  });

  it('verifies getPairing and applyPairingScale helper functions', () => {
    const p = getPairing('nocturne-editorial');
    expect(p).not.toBeNull();
    expect(p?.display.family).toBe('Newsreader');

    const fakeEl = {
      style: {
        setProperty: (name: string, val: string) => {
          (fakeEl.style as any)[name] = val;
        },
      },
    };
    const applied = applyPairingScale('nocturne-editorial', fakeEl as any);
    expect(applied).toBe(true);
    expect((fakeEl.style as any)['--font-display']).toBe('Newsreader');
    expect((fakeEl.style as any)['--text-base']).toBe(p?.scale.textBase);
  });
});
