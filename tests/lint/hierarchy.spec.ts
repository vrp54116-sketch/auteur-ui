import { describe, it, expect } from 'vitest';
import { hierarchyRule } from '../../packages/lint/rules/hierarchy.js';
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
        tagName: el.tagName || 'h1',
        id: el.id || '',
        className: el.className || '',
        selector: el.selector || `el-${i}`,
        innerText: el.innerText || el.textContent || '',
        textContent: el.textContent || '',
        rect: el.rect || { x: 0, y: 0, width: 600, height: 60, top: i * 80, left: 0, bottom: i * 80 + 60, right: 600 },
        styles: {
          fontFamily: 'sans-serif',
          fontSize: el.styles?.fontSize || '32px',
          fontWeight: '700',
          lineHeight: '40px',
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
          paddingTop: '0px',
          paddingRight: '0px',
          paddingBottom: '0px',
          paddingLeft: '0px',
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
        metrics: { scrollWidth: 600, scrollHeight: 60, clientWidth: 600, clientHeight: 60 },
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

describe('HIERARCHY Rule Checks', () => {
  it('flags missing h1 element', () => {
    const data = createMockPageData([
      { tagName: 'h2', textContent: 'Secondary Heading' },
    ]);

    const violations = hierarchyRule.check({ data });
    expect(violations.some((v) => v.ruleId === 'hierarchy/missing-h1')).toBe(true);
  });

  it('flags h1 when secondary heading is larger than h1', () => {
    const data = createMockPageData([
      { tagName: 'h1', textContent: 'Main Title', styles: { fontSize: '24px' } as any },
      { tagName: 'h2', textContent: 'Bigger Secondary Title', styles: { fontSize: '36px' } as any },
    ]);

    const violations = hierarchyRule.check({ data });
    expect(violations.some((v) => v.ruleId === 'hierarchy/h1-not-largest')).toBe(true);
  });

  it('flags skipped heading levels (e.g. h1 -> h4)', () => {
    const data = createMockPageData([
      { tagName: 'h1', textContent: 'Main Title', styles: { fontSize: '48px' } as any },
      { tagName: 'h4', textContent: 'Skipped Subhead', styles: { fontSize: '18px' } as any },
    ]);

    const violations = hierarchyRule.check({ data });
    expect(violations.some((v) => v.ruleId === 'hierarchy/heading-order')).toBe(true);
  });

  it('passes proper sequential heading hierarchy (h1 -> h2)', () => {
    const data = createMockPageData([
      { tagName: 'h1', textContent: 'Main Title', styles: { fontSize: '56px' } as any },
      { tagName: 'h2', textContent: 'Subhead Section', styles: { fontSize: '28px' } as any },
    ]);

    const violations = hierarchyRule.check({ data });
    expect(violations.some((v) => v.ruleId === 'hierarchy/h1-not-largest')).toBe(false);
    expect(violations.some((v) => v.ruleId === 'hierarchy/heading-order')).toBe(false);
  });
});

