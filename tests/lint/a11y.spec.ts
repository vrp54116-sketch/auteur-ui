import { describe, it, expect } from 'vitest';
import { a11yRule } from '../../packages/lint/rules/a11y.js';
import { ExtractedPageData, DomNodeData } from '../../packages/lint/types.js';

function createMockPageData(elements: Partial<DomNodeData>[], css: string = ''): ExtractedPageData {
  return {
    urlOrFile: 'test.html',
    desktop: {
      scrollWidth: 1440,
      scrollHeight: 900,
      viewportWidth: 1440,
      viewportHeight: 900,
      elements: elements.map((el, i) => ({
        tagName: el.tagName || 'button',
        id: el.id || '',
        className: el.className || '',
        selector: el.selector || `el-${i}`,
        innerText: el.innerText || el.textContent || '',
        textContent: el.textContent || '',
        rect: el.rect || { x: 0, y: 0, width: 60, height: 48, top: 0, left: 0, bottom: 48, right: 60 },
        styles: {
          fontFamily: 'sans-serif',
          fontSize: '14px',
          fontWeight: '400',
          lineHeight: '20px',
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
          display: 'inline-block',
          position: 'static',
          outline: '',
          outlineWidth: '',
          outlineStyle: '',
        },
        attrs: el.attrs || {},
        metrics: { scrollWidth: 60, scrollHeight: 48, clientWidth: 60, clientHeight: 48 },
        childrenCount: 0,
        directChildTagNames: el.directChildTagNames || [],
        hasEmoji: Boolean(el.hasEmoji),
        emojis: el.emojis || [],
      })),
      hasPrefersReducedMotion: false,
      styleSheetsCss: css,
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

describe('A11Y Rule Checks (Hard Fails)', () => {
  it('flags tap target < 44px as a HARD FAIL', () => {
    const data = createMockPageData([
      {
        tagName: 'button',
        textContent: 'Small',
        rect: { x: 0, y: 0, width: 32, height: 28, top: 0, left: 0, bottom: 28, right: 32 },
      },
    ]);

    const violations = a11yRule.check({ data });
    const violation = violations.find((v) => v.ruleId === 'a11y/tap-target-size');
    expect(violation).toBeDefined();
    expect(violation?.isHardFail).toBe(true);
  });

  it('flags img element without alt attribute as a HARD FAIL', () => {
    const data = createMockPageData([
      {
        tagName: 'img',
        attrs: { alt: null },
      },
    ]);

    const violations = a11yRule.check({ data });
    const violation = violations.find((v) => v.ruleId === 'a11y/missing-alt-text');
    expect(violation).toBeDefined();
    expect(violation?.isHardFail).toBe(true);
  });

  it('flags icon button lacking aria-label or title as a HARD FAIL', () => {
    const data = createMockPageData([
      {
        tagName: 'button',
        textContent: '▶️',
        hasEmoji: true,
        emojis: ['▶️'],
        directChildTagNames: [],
        attrs: { ariaLabel: null, title: null },
      },
    ]);

    const violations = a11yRule.check({ data });
    const violation = violations.find((v) => v.ruleId === 'a11y/icon-button-missing-aria');
    expect(violation).toBeDefined();
    expect(violation?.isHardFail).toBe(true);
  });

  it('flags stripped outline without :focus-visible as a HARD FAIL', () => {
    const data = createMockPageData([], 'button { outline: none; }');

    const violations = a11yRule.check({ data });
    const violation = violations.find((v) => v.ruleId === 'a11y/focus-visible');
    expect(violation).toBeDefined();
    expect(violation?.isHardFail).toBe(true);
  });
});

