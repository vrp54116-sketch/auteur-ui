import { Rule, RuleContext, RuleViolation } from '../types.js';

export const typeRule: Rule = {
  id: 'type',
  category: 'type',
  name: 'Typography & Modular Scale',
  description: 'Audits font-scale discipline, line-height bounds, line measure, and heading balance.',
  check(ctx: RuleContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const elements = ctx.data.desktop.elements;
    const contract = ctx.contract;

    // 1. Distinct font-size count & off-scale sizes
    const fontSizes = new Map<number, string[]>();
    for (const el of elements) {
      if (!el.textContent.trim()) continue;
      const sizePx = parseFloat(el.styles.fontSize);
      if (!isNaN(sizePx) && sizePx > 0) {
        const rounded = Math.round(sizePx * 10) / 10;
        if (!fontSizes.has(rounded)) {
          fontSizes.set(rounded, []);
        }
        fontSizes.get(rounded)!.push(el.selector);
      }
    }

    const distinctSizes = Array.from(fontSizes.keys()).sort((a, b) => a - b);
    if (distinctSizes.length > 8) {
      violations.push({
        ruleId: 'type/distinct-sizes',
        category: 'type',
        deduction: 3,
        sel: 'html',
        val: `${distinctSizes.length} distinct font sizes (${distinctSizes.slice(0, 6).join('px, ')}...px)`,
        want: '<= 7 distinct scale steps',
        fix: 'Constrain typography to a 5-7 step modular scale',
      });
    }

    // Off-scale check: standard modular scale based on 16px (1.2 or 1.25 ratio)
    // Common allowable steps: 10, 11, 12, 13, 14, 15, 16, 18, 20, 21, 22, 24, 26, 28, 30, 32, 36, 40, 42, 48, 56, 64, 72, 80
    const validScaleSteps = new Set([10, 11, 12, 13, 14, 15, 16, 18, 20, 21, 22, 24, 26, 28, 30, 32, 36, 40, 42, 48, 56, 64, 72, 80]);
    for (const [size, sels] of fontSizes.entries()) {
      const rounded = Math.round(size);
      if (rounded >= 11 && !validScaleSteps.has(rounded)) {
        violations.push({
          ruleId: 'type/off-scale',
          category: 'type',
          deduction: 2,
          sel: sels[0],
          val: `${size}px`,
          want: 'Value from modular type scale (e.g. 14, 16, 20, 24, 32, 48, 64px)',
          fix: 'Align font-size to contract type scale',
        });
        break; // Report the first representative off-scale size
      }
    }

    // 2. Line-height out of 1.2-1.7 for body text
    for (const el of elements) {
      if (el.tagName === 'p' && el.textContent.trim().length > 30) {
        const fontPx = parseFloat(el.styles.fontSize);
        const lhPx = parseFloat(el.styles.lineHeight);
        if (!isNaN(fontPx) && !isNaN(lhPx) && fontPx > 0) {
          const ratio = lhPx / fontPx;
          if (ratio < 1.18 || ratio > 1.82) {
            violations.push({
              ruleId: 'type/line-height',
              category: 'type',
              deduction: 3,
              sel: el.selector,
              val: `line-height ratio ${ratio.toFixed(2)} (${el.styles.lineHeight})`,
              want: 'Body line-height between 1.2 and 1.7',
              fix: 'Set body paragraph line-height to 1.5 - 1.7',
            });
            break;
          }
        }
      }
    }

    // 3. Measure > 75ch for body text paragraphs
    for (const el of elements) {
      if (el.tagName === 'p' && el.textContent.trim().length > 75) {
        const fontPx = parseFloat(el.styles.fontSize) || 16;
        const width = el.rect.width;
        // ~0.55ch per px width is a standard conservative estimate
        const approxCh = width / (fontPx * 0.52);
        if (approxCh > 80 && width > 750) {
          violations.push({
            ruleId: 'type/measure',
            category: 'type',
            deduction: 3,
            sel: el.selector,
            val: `measure ~${Math.round(approxCh)}ch (${Math.round(width)}px)`,
            want: 'Paragraph line length <= 75ch',
            fix: 'Set max-width: 65ch or 680px on reading paragraphs',
          });
          break;
        }
      }
    }

    // 4. Missing text-wrap balance on headings
    for (const el of elements) {
      if ((el.tagName === 'h1' || el.tagName === 'h2') && el.textContent.trim().split(/\s+/).length > 3) {
        const textWrap = (el.styles.textWrap || '').toLowerCase();
        if (textWrap !== 'balance' && textWrap !== 'pretty') {
          violations.push({
            ruleId: 'type/text-wrap-balance',
            category: 'type',
            deduction: 2,
            sel: el.selector,
            val: textWrap || 'normal',
            want: 'text-wrap: balance',
            fix: 'Add text-wrap: balance to headline selectors',
          });
          break;
        }
      }
    }

    return violations;
  },
};
