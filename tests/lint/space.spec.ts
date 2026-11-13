import { describe, it, expect } from 'vitest';
import { spaceRule } from '../../packages/lint/rules/space.js';
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
        tagName: el.tagName || 'div',
        id: el.id || '',
        className: el.className || '',
        selector: el.selector || `el-${i}`,
        innerText: el.innerText || el.textContent || '',
        textContent: el.textContent || '',
        rect: el.rect || { x: 0, y: 0, width: 200, height: 40, top: 0, left: 0, bottom: 40, right: 200 },
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
          marginTop: el.styles?.marginTop || '0px',
          marginRight: el.styles?.marginRight || '0px',
          marginBottom: el.styles?.marginBottom || '0px',
          marginLeft: el.styles?.marginLeft || '0px',
          padding: '0px',
          paddingTop: el.styles?.paddingTop || '0px',
          paddingRight: el.styles?.paddingRight || '0px',
          paddingBottom: el.styles?.paddingBottom || '0px',
          paddingLeft: el.styles?.paddingLeft || '0px',
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
        attrs: el.attrs || {},
        metrics: { scrollWidth: 200, scrollHeight: 40, clientWidth: 200, clientHeight: 40 },
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

describe('SPACE Rule Checks', () => {
  it('flags off-grid margins and paddings against 8px base', () => {
    const data = createMockPageData([
      { tagName: 'div', styles: { marginTop: '13px' } as any },
      { tagName: 'div', styles: { paddingTop: '27px' } as any },
      { tagName: 'div', styles: { marginBottom: '15px' } as any },
    ]);

    const violations = spaceRule.check({ data, contract: { space: { base: 8 } } as any });
    expect(violations.some((v) => v.ruleId === 'space/off-grid')).toBe(true);
  });

  it('passes grid-aligned spacing (16px, 24px, 32px)', () => {
    const data = createMockPageData([
      { tagName: 'div', styles: { marginTop: '16px' } as any },
      { tagName: 'div', styles: { paddingTop: '24px' } as any },
      { tagName: 'div', styles: { marginBottom: '32px' } as any },
    ]);

    const violations = spaceRule.check({ data, contract: { space: { base: 8 } } as any });
    expect(violations.some((v) => v.ruleId === 'space/off-grid')).toBe(false);
  });
});

