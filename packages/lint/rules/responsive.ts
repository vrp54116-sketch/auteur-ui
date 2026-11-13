import { Rule, RuleContext, RuleViolation } from '../types.js';

export const responsiveRule: Rule = {
  id: 'responsive',
  category: 'responsive',
  name: 'Mobile Responsiveness & Layout Stability',
  description: 'Audits mobile viewport constraints at 390px, horizontal overflow, CLS proxies, and text clipping.',
  check(ctx: RuleContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const mobile = ctx.data.mobile;
    const elements = ctx.data.desktop.elements;

    // 1. Horizontal overflow at 390px mobile viewport
    if (mobile.hasHorizontalOverflow && mobile.scrollWidth > 392) {
      violations.push({
        ruleId: 'responsive/horizontal-overflow',
        category: 'responsive',
        deduction: 6,
        sel: 'html',
        val: `scrollWidth ${mobile.scrollWidth}px at 390px viewport (+${mobile.scrollWidth - 390}px overflow)`,
        want: 'Zero horizontal scroll at 390px width',
        fix: 'Add responsive media queries, max-width: 100%, and flexible grid/flex wrapping',
      });
    }

    // 2. CLS proxy: images missing dimensions or aspect-ratio
    for (const el of elements) {
      if (el.tagName === 'img') {
        const hasWidthAttr = Boolean(el.attrs.type || el.selector.includes('width')); // check if dimensions exist
        const hasExplicitRatio = el.styles.position === 'absolute' || el.rect.height > 0;
        // If image lacks width or aspect ratio
        if (!hasExplicitRatio) {
          violations.push({
            ruleId: 'responsive/cls-image-ratio',
            category: 'responsive',
            deduction: 2,
            sel: el.selector,
            val: '<img> missing explicit width/height or aspect-ratio',
            want: 'aspect-ratio or explicit dimensions to prevent layout shift',
            fix: 'Add aspect-ratio or width/height attributes to image',
          });
          break;
        }
      }
    }

    // 3. Text clipping
    if (mobile.clippedElements.length > 0) {
      violations.push({
        ruleId: 'responsive/text-clipping',
        category: 'responsive',
        deduction: 3,
        sel: mobile.clippedElements[0],
        val: 'Text content clipped by overflow: hidden',
        want: 'Fluid text wrapping without clipping',
        fix: 'Ensure container height accommodates multi-line wrapped text',
      });
    }

    return violations;
  },
};

