import { describe, it, expect } from 'vitest';
import { slopRule } from '../../packages/lint/rules/slop.js';
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
        tagName: el.tagName || 'div',
        id: el.id || '',
        className: el.className || '',
        selector: el.selector || `el-${i}`,
        innerText: el.innerText || el.textContent || '',
        textContent: el.textContent || '',
        rect: el.rect || { x: 0, y: 0, width: 200, height: 40, top: 0, left: 0, bottom: 40, right: 200 },
        styles: {
          fontFamily: el.styles?.fontFamily || 'Inter, sans-serif',
          fontSize: el.styles?.fontSize || '16px',
          fontWeight: '400',
          lineHeight: '24px',
          color: el.styles?.color || 'rgb(0,0,0)',
          backgroundColor: el.styles?.backgroundColor || 'transparent',
          effectiveBgColor: 'rgb(255,255,255)',
          borderRadius: el.styles?.borderRadius || '0px',
          boxShadow: el.styles?.boxShadow || 'none',
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
          textAlign: el.styles?.textAlign || 'left',
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
        metrics: { scrollWidth: 200, scrollHeight: 40, clientWidth: 200, clientHeight: 40 },
        childrenCount: el.childrenCount || 0,
        directChildTagNames: [],
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

describe('SLOP TELLS Rule Checks (-8 pts each)', () => {
  it('detects Inter/Roboto default with no display face', () => {
    const data = createMockPageData([
      { tagName: 'body', styles: { fontFamily: 'Inter, sans-serif' } as any },
      { tagName: 'h1', styles: { fontFamily: 'Inter, sans-serif' } as any },
    ]);

    const violations = slopRule.check({ data });
    expect(violations.some((v) => v.ruleId === 'slop/inter-roboto-default')).toBe(true);
  });

  it('detects purple-to-blue gradient hero', () => {
    const css = '.hero { background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%); }';
    const data = createMockPageData(
      [
        { tagName: 'header', className: 'hero', styles: { backgroundColor: '#6366f1' } as any },
      ],
      css
    );

    const violations = slopRule.check({ data });
    expect(violations.some((v) => v.ruleId === 'slop/purple-blue-gradient')).toBe(true);
  });

  it('detects centered hero + exactly 3 equal cards', () => {
    const css = '.cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); }';
    const data = createMockPageData(
      [
        { tagName: 'div', className: 'hero', styles: { textAlign: 'center' } as any },
        { tagName: 'div', className: 'cards-grid', childrenCount: 3 },
      ],
      css
    );

    const violations = slopRule.check({ data });
    expect(violations.some((v) => v.ruleId === 'slop/centered-hero-3-cards')).toBe(true);
  });

  it('detects emoji used as icons', () => {
    const data = createMockPageData([
      {
        tagName: 'div',
        className: 'card-icon',
        textContent: '⚡️',
        hasEmoji: true,
        emojis: ['⚡️'],
      },
    ]);

    const violations = slopRule.check({ data });
    expect(violations.some((v) => v.ruleId === 'slop/emoji-icons')).toBe(true);
  });

  it('detects uniform border-radius on everything', () => {
    const data = createMockPageData([
      { tagName: 'button', styles: { borderRadius: '8px' } as any },
      { tagName: 'input', styles: { borderRadius: '8px' } as any },
      { tagName: 'div', styles: { borderRadius: '8px' } as any },
      { tagName: 'span', styles: { borderRadius: '8px' } as any },
    ]);

    const violations = slopRule.check({ data });
    expect(violations.some((v) => v.ruleId === 'slop/uniform-radius')).toBe(true);
  });

  it('detects diffuse drop shadows on every surface', () => {
    const data = createMockPageData([
      { tagName: 'div', styles: { boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' } as any },
      { tagName: 'button', styles: { boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)' } as any },
      { tagName: 'div', styles: { boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)' } as any },
    ]);

    const violations = slopRule.check({ data });
    expect(violations.some((v) => v.ruleId === 'slop/drop-shadow-everywhere')).toBe(true);
  });

  it('detects generic "Get Started" CTA button', () => {
    const data = createMockPageData([
      { tagName: 'button', textContent: 'Get Started Free' },
    ]);

    const violations = slopRule.check({ data });
    expect(violations.some((v) => v.ruleId === 'slop/generic-cta-pair')).toBe(true);
  });
});

