import { Rule, RuleContext, RuleViolation } from '../types.js';

export function parseRgb(colorStr: string): [number, number, number] | null {
  if (!colorStr || colorStr === 'transparent') return null;
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i);
  if (match) {
    if (match[4] !== undefined && parseFloat(match[4]) === 0) {
      return null; // Alpha is 0 (fully transparent)
    }
    return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
  }
  if (colorStr.startsWith('#')) {
    let hex = colorStr.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    if (hex.length >= 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return [r, g, b];
    }
  }
  return null;
}

export function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function contrastRatio(c1: [number, number, number], c2: [number, number, number]): number {
  const l1 = relativeLuminance(...c1);
  const l2 = relativeLuminance(...c2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export const colorRule: Rule = {
  id: 'color',
  category: 'color',
  name: 'Color Palette & WCAG AA Contrast',
  description: 'Audits accessible contrast ratios, color entropy, large-surface pure black/white, and saturation consistency.',
  check(ctx: RuleContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const elements = ctx.data.desktop.elements;

    // 1. WCAG AA Contrast per text node
    let lowContrastCount = 0;
    for (const el of elements) {
      if (!el.textContent.trim() || el.rect.width === 0 || el.rect.height === 0) continue;
      // Skip SVGs and non-text wrappers
      if (['svg', 'img', 'header', 'footer', 'main', 'section'].includes(el.tagName)) continue;

      const fg = parseRgb(el.styles.color);
      const bg = parseRgb(el.styles.effectiveBgColor);

      if (fg && bg) {
        const ratio = contrastRatio(fg, bg);
        const fontSizePx = parseFloat(el.styles.fontSize) || 16;
        const isBold = parseInt(el.styles.fontWeight, 10) >= 600 || el.styles.fontWeight === 'bold';
        const isLargeText = fontSizePx >= 24 || (fontSizePx >= 18.66 && isBold);
        const requiredRatio = isLargeText ? 3.0 : 4.5;

        if (ratio < requiredRatio - 0.05) {
          lowContrastCount++;
          if (lowContrastCount === 1) {
            violations.push({
              ruleId: 'color/contrast-ratio',
              category: 'color',
              deduction: 4,
              sel: el.selector,
              val: `${ratio.toFixed(2)}:1 (fg: ${el.styles.color}, bg: ${el.styles.effectiveBgColor})`,
              want: `>= ${requiredRatio}:1 (WCAG AA)`,
              fix: 'Increase contrast between text color and background',
            });
          }
        }
      }
    }

    // 2. Distinct color count (Entropy)
    const colorSet = new Set<string>();
    for (const el of elements) {
      if (el.styles.color && el.styles.color !== 'rgba(0, 0, 0, 0)') {
        colorSet.add(el.styles.color);
      }
      if (el.styles.backgroundColor && el.styles.backgroundColor !== 'rgba(0, 0, 0, 0)' && el.styles.backgroundColor !== 'transparent') {
        colorSet.add(el.styles.backgroundColor);
      }
    }

    if (colorSet.size > 15) {
      violations.push({
        ruleId: 'color/entropy',
        category: 'color',
        deduction: 3,
        sel: 'body',
        val: `${colorSet.size} distinct colors`,
        want: '<= 12 semantic color tokens',
        fix: 'Consolidate colors into design system semantic tokens',
      });
    }

    // 3. Pure #000 / #fff on large surface areas
    for (const el of elements) {
      if (el.rect.width >= 700 && el.rect.height >= 250) {
        const bg = parseRgb(el.styles.backgroundColor);
        if (bg && bg[0] === 0 && bg[1] === 0 && bg[2] === 0) {
          // Pure stark black
          violations.push({
            ruleId: 'color/pure-black-surface',
            category: 'color',
            deduction: 2,
            sel: el.selector,
            val: el.styles.backgroundColor,
            want: 'Tinted warm dark tone (e.g. oklch(0.18 0.02 240) or #09090b)',
            fix: 'Replace pure #000 with a softened or warmed dark tone',
          });
          break;
        }
      }
    }

    // 4. Saturation variance across dominant colors
    let maxSaturation = 0;
    let highSatCount = 0;
    for (const colorStr of colorSet) {
      const rgb = parseRgb(colorStr);
      if (rgb) {
        const [r, g, b] = [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;
        const sat = delta === 0 ? 0 : delta / (1 - Math.abs(max + min - 1));
        if (sat > 0.85) {
          highSatCount++;
        }
        if (sat > maxSaturation) maxSaturation = sat;
      }
    }

    if (highSatCount > 4) {
      violations.push({
        ruleId: 'color/saturation-variance',
        category: 'color',
        deduction: 3,
        sel: 'body',
        val: `${highSatCount} high-saturation colors (>85% sat)`,
        want: '<= 4 calibrated semantic accent/status colors',
        fix: 'Mute background and secondary tints, reserve saturation for focal accents and alerts',
      });
    }

    return violations;
  },
};
