import { Rule, RuleContext, RuleViolation } from '../types.js';

export const rhythmRule: Rule = {
  id: 'rhythm',
  category: 'rhythm',
  name: 'Vertical Rhythm & Section Padding',
  description: 'Audits vertical rhythm variance and flags uniform section padding slop tells.',
  check(ctx: RuleContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const elements = ctx.data.desktop.elements;

    // 1. Uniform section padding (slop tell)
    // Finding major section containers: sections, articles, or full-width divs
    const sectionContainers = elements.filter(
      (el) =>
        ['section', 'header', 'footer', 'article'].includes(el.tagName) ||
        (el.tagName === 'div' && el.rect.width >= 800 && el.rect.height >= 120 && el.className.includes('section'))
    );

    const paddingSignatures = new Map<string, string[]>();
    for (const s of sectionContainers) {
      const padTop = Math.round(parseFloat(s.styles.paddingTop) || 0);
      const padBottom = Math.round(parseFloat(s.styles.paddingBottom) || 0);
      if (padTop >= 40 && padTop === padBottom) {
        const sig = `${padTop}px`;
        if (!paddingSignatures.has(sig)) {
          paddingSignatures.set(sig, []);
        }
        paddingSignatures.get(sig)!.push(s.selector);
      }
    }

    for (const [sig, sels] of paddingSignatures.entries()) {
      if (sels.length >= 3) {
        violations.push({
          ruleId: 'rhythm/uniform-section-padding',
          category: 'rhythm',
          deduction: 4,
          sel: sels[0],
          val: `${sels.length} sections with identical ${sig} top/bottom padding`,
          want: 'Dynamic section rhythm varying with density and content hierarchy',
          fix: 'Modulate section padding (e.g., hero 96px, content 64px, footer 40px)',
        });
        break;
      }
    }

    // 2. Vertical rhythm variance
    // Measure gaps between consecutive flow siblings
    const flowElements = elements
      .filter((el) => ['h1', 'h2', 'h3', 'p', 'button', 'section'].includes(el.tagName) && el.rect.height > 0)
      .sort((a, b) => a.rect.top - b.rect.top);

    const verticalGaps: number[] = [];
    for (let i = 0; i < flowElements.length - 1; i++) {
      const gap = flowElements[i + 1].rect.top - flowElements[i].rect.bottom;
      if (gap > 8 && gap < 200) {
        verticalGaps.push(Math.round(gap));
      }
    }

    return violations;
  },
};

