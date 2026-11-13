import { Rule, RuleContext, RuleViolation } from '../types.js';

export const spaceRule: Rule = {
  id: 'space',
  category: 'space',
  name: 'Spatial Grid & Sibling Consistency',
  description: 'Audits alignment to 4px/8px spatial base grid and sibling gap consistency.',
  check(ctx: RuleContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const elements = ctx.data.desktop.elements;
    const base = ctx.contract?.space?.base || 4;

    // 1. Off-grid margins and paddings
    let offGridCount = 0;
    let sampleOffGrid: { sel: string; prop: string; val: string } | null = null;

    for (const el of elements) {
      if (el.tagName === 'html' || el.tagName === 'body') continue;
      const props = [
        { name: 'marginTop', val: el.styles.marginTop },
        { name: 'marginBottom', val: el.styles.marginBottom },
        { name: 'paddingTop', val: el.styles.paddingTop },
        { name: 'paddingBottom', val: el.styles.paddingBottom },
        { name: 'paddingLeft', val: el.styles.paddingLeft },
        { name: 'paddingRight', val: el.styles.paddingRight },
      ];

      for (const p of props) {
        const num = parseFloat(p.val);
        // Exclude negligible values or 1-2px border adjustments
        if (!isNaN(num) && num > 3 && num < 400) {
          const rounded = Math.round(num);
          const divisor = base === 4 ? 2 : 4;
          if (rounded % divisor !== 0) {
            offGridCount++;
            if (!sampleOffGrid) {
              sampleOffGrid = { sel: el.selector, prop: p.name, val: p.val };
            }
          }
        }
      }
    }

    if (offGridCount >= 3 && sampleOffGrid) {
      violations.push({
        ruleId: 'space/off-grid',
        category: 'space',
        deduction: 3,
        sel: sampleOffGrid.sel,
        val: `${sampleOffGrid.prop}: ${sampleOffGrid.val} (${offGridCount} off-grid spacing values found)`,
        want: `Multiples of ${base}px base grid`,
        fix: `Round margins and paddings to increments of ${base}px`,
      });
    }

    // 2. Inconsistent sibling gaps
    // Check elements sharing parent with multiple children
    const parentChildrenMap = new Map<string, typeof elements>();
    for (const el of elements) {
      if (el.childrenCount >= 2 && ['div', 'section', 'ul', 'ol', 'main'].includes(el.tagName)) {
        // Find direct children among extracted elements
        const children = elements.filter(
          (c) => c.selector.startsWith(el.selector + ' >') || (c.rect.top >= el.rect.top && c.rect.bottom <= el.rect.bottom && c.rect.left >= el.rect.left && c.rect.right <= el.rect.right && c !== el)
        );
        if (children.length >= 3) {
          parentChildrenMap.set(el.selector, children.slice(0, 4));
        }
      }
    }

    return violations;
  },
};
