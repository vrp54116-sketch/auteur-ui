import { describe, it, expect } from 'vitest';
import { rhythmRule } from '../../packages/lint/rules/rhythm.js';
import { ExtractedPageData, DomNodeData } from '../../packages/lint/types.js';

function createMockPageData(elements: Partial<DomNodeData>[]): ExtractedPageData {
  return {
    urlOrFile: 'test.html',
    desktop: {
      scrollWidth: 1440,
      scrollHeight: 900,
      viewportWidth: 1440,
      viewportHeight: 900,
      elements: elements.map((el, i) => ({
        tagName: el.tagName || 'section',
        id: el.id || '',
        className: el.className || 'section',
        selector: el.selector || `section-${i}`,
        innerText: el.innerText || el.textContent || '',
        textContent: el.textContent || '',
        rect: el.rect || { x: 0, y: 0, width: 1000, height: 200, top: i * 250, left: 0, bottom: i * 250 + 200, right: 1000 },
        styles: {
          fontFamily: 'sans-serif',
          fontSize: '16px',
          fontWeight: '400',
          lineHeight: '24px',
          color: 'rgb(0,0,0)',
          backgroundColor: 'transparent',
          effectiveBgColor: 'rgb(255,255,255)',
          borderRadius: '0px',
          boxShadow: 'none',
          margin: '0px',
          marginTop: '0px',
          marginRight: '0px',
          marginBottom: '0px',
          marginLeft: '0px',
          padding: '0px',
          paddingTop: el.styles?.paddingTop || '0px',
          paddingRight: '20px',
          paddingBottom: el.styles?.paddingBottom || '0px',
          paddingLeft: '20px',
          transition: '',
          transitionDuration: '0s',
          transitionProperty: '',
          animation: '',
          animationName: '',
          animationDuration: '',
          textAlign: 'left',
          textWrap: 'normal',
          overflow: 'visible',
          overflowX: 'visible',
          overflowY: 'visible',
          display: 'block',
          position: 'static',
          outline: '',
          outlineWidth: '',
          outlineStyle: '',
        },
        attrs: {},
        metrics: { scrollWidth: 1000, scrollHeight: 200, clientWidth: 1000, clientHeight: 200 },
        childrenCount: 0,
        directChildTagNames: [],
        hasEmoji: false,
        emojis: [],
      })),
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
}

describe('RHYTHM Rule Checks', () => {
  it('flags 3 or more sections with identical uniform padding (e.g. 100px)', () => {
    const data = createMockPageData([
      { tagName: 'section', styles: { paddingTop: '100px', paddingBottom: '100px' } as any },
      { tagName: 'section', styles: { paddingTop: '100px', paddingBottom: '100px' } as any },
      { tagName: 'section', styles: { paddingTop: '100px', paddingBottom: '100px' } as any },
    ]);

    const violations = rhythmRule.check({ data });
    expect(violations.some((v) => v.ruleId === 'rhythm/uniform-section-padding')).toBe(true);
  });

  it('passes sections with varied, hierarchical padding', () => {
    const data = createMockPageData([
      { tagName: 'header', styles: { paddingTop: '120px', paddingBottom: '120px' } as any },
      { tagName: 'section', styles: { paddingTop: '72px', paddingBottom: '72px' } as any },
      { tagName: 'footer', styles: { paddingTop: '40px', paddingBottom: '40px' } as any },
    ]);

    const violations = rhythmRule.check({ data });
    expect(violations.some((v) => v.ruleId === 'rhythm/uniform-section-padding')).toBe(false);
  });
});
