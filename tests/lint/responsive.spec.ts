import { describe, it, expect } from 'vitest';
import { responsiveRule } from '../../packages/lint/rules/responsive.js';
import { ExtractedPageData } from '../../packages/lint/types.js';

describe('RESPONSIVE Rule Checks', () => {
  it('flags mobile horizontal scroll overflow at 390px', () => {
    const data: ExtractedPageData = {
      urlOrFile: 'test.html',
      desktop: {
        scrollWidth: 1440,
        scrollHeight: 900,
        viewportWidth: 1440,
        viewportHeight: 900,
        elements: [],
        hasPrefersReducedMotion: false,
        styleSheetsCss: '',
      },
      mobile: {
        scrollWidth: 460, // > 390px
        scrollHeight: 844,
        viewportWidth: 390,
        viewportHeight: 844,
        hasHorizontalOverflow: true,
        clippedElements: [],
      },
    };

    const violations = responsiveRule.check({ data });
    expect(violations.some((v) => v.ruleId === 'responsive/horizontal-overflow')).toBe(true);
  });

  it('passes when mobile viewport scrollWidth fits cleanly at 390px', () => {
    const data: ExtractedPageData = {
      urlOrFile: 'test.html',
      desktop: {
        scrollWidth: 1440,
        scrollHeight: 900,
        viewportWidth: 1440,
        viewportHeight: 900,
        elements: [],
        hasPrefersReducedMotion: false,
        styleSheetsCss: '',
      },
      mobile: {
        scrollWidth: 390,
        scrollHeight: 844,
        viewportWidth: 390,
        viewportHeight: 844,
        hasHorizontalOverflow: false,
        clippedElements: [],
      },
    };

    const violations = responsiveRule.check({ data });
    expect(violations.some((v) => v.ruleId === 'responsive/horizontal-overflow')).toBe(false);
  });
});

