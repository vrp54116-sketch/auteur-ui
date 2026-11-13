import { Rule, RuleContext, RuleViolation } from '../types.js';

export const hierarchyRule: Rule = {
  id: 'hierarchy',
  category: 'hierarchy',
  name: 'Visual Hierarchy & Heading Structure',
  description: 'Audits presence of dominant h1, correct heading order, and focal point dominance.',
  check(ctx: RuleContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const elements = ctx.data.desktop.elements;

    // 1. h1 present + largest
    const h1Elements = elements.filter((el) => el.tagName === 'h1' && el.textContent.trim().length > 0);
    const otherHeadings = elements.filter(
      (el) => ['h2', 'h3', 'h4', 'h5', 'h6'].includes(el.tagName) && el.textContent.trim().length > 0
    );

    if (h1Elements.length === 0) {
      const deduction = otherHeadings.length === 0 ? 2 : 4;
      violations.push({
        ruleId: 'hierarchy/missing-h1',
        category: 'hierarchy',
        deduction,
        sel: 'body',
        val: 'No <h1> heading found',
        want: 'Exactly one primary <h1> element',
        fix: 'Add a semantic <h1> to establish primary page intent',
      });
    } else {
      const h1Size = Math.max(...h1Elements.map((h) => parseFloat(h.styles.fontSize) || 0));
      for (const h of otherHeadings) {
        const otherSize = parseFloat(h.styles.fontSize) || 0;
        if (otherSize > h1Size) {
          violations.push({
            ruleId: 'hierarchy/h1-not-largest',
            category: 'hierarchy',
            deduction: 3,
            sel: h.selector,
            val: `${h.tagName} font-size (${otherSize}px) > h1 (${h1Size}px)`,
            want: 'h1 should possess the largest typographic weight',
            fix: 'Ensure h1 possesses greater font-size than secondary headings',
          });
          break;
        }
      }
    }

    // 2. Heading order: headings should not skip levels
    const allHeadings = elements
      .filter((el) => ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(el.tagName) && el.textContent.trim().length > 0)
      .map((el) => ({
        level: parseInt(el.tagName.slice(1), 10),
        selector: el.selector,
        tagName: el.tagName,
      }));

    for (let i = 0; i < allHeadings.length - 1; i++) {
      const curr = allHeadings[i];
      const next = allHeadings[i + 1];
      if (next.level > curr.level + 1) {
        violations.push({
          ruleId: 'hierarchy/heading-order',
          category: 'hierarchy',
          deduction: 2,
          sel: next.selector,
          val: `${curr.tagName} followed directly by ${next.tagName}`,
          want: `Sequential heading steps (e.g. ${curr.tagName} -> h${curr.level + 1})`,
          fix: 'Do not skip heading levels in document outline',
        });
        break;
      }
    }

    // 3. Single dominant focal point (area-weighted visual weight above fold)
    const aboveFold = elements.filter(
      (el) =>
        el.rect.top >= 0 &&
        el.rect.top < 800 &&
        el.rect.width > 100 &&
        el.rect.height > 40 &&
        ['h1', 'div', 'section', 'header'].includes(el.tagName)
    );

    const weights = aboveFold.map((el) => {
      const area = el.rect.width * el.rect.height;
      const fontPx = parseFloat(el.styles.fontSize) || 16;
      return {
        el,
        weight: area * (fontPx / 16),
      };
    });

    weights.sort((a, b) => b.weight - a.weight);

    return violations;
  },
};
