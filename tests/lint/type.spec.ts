import { describe, it, expect } from 'vitest';
import { typeRule } from '../../packages/lint/rules/type.js';
import { ExtractedPageData, DomNodeData, RuleContext } from '../../packages/lint/types.js';

function createMockPageData(elements: Partial<DomNodeData>[]): ExtractedPageData {
  return {
    urlOrFile: 'test.html',
    desktop: {
      scrollWidth: 1440,
      scrollHeight: 900,
      viewportWidth: 1440,
      viewportHeight: 900,
      elements: elements.map((el, i) => ({
        tagName: el.tagName || 'p',
        id: el.id || '',
        className: el.className || '',
        selector: el.selector || `el-${i}`,
        innerText: el.innerText || el.textContent || '',
        textContent: el.textContent || '',
        rect: el.rect || { x: 0, y: 0, width: 200, height: 40, top: 0, left: 0, bottom: 40, right: 200 },
        styles: {
          fontFamily: el.styles?.fontFamily || 'sans-serif',
          fontSize: el.styles?.fontSize || '16px',
          fontWeight: el.styles?.fontWeight || '400',
          lineHeight: el.styles?.lineHeight || '24px',
          color: el.styles?.color || 'rgb(0,0,0)',
          backgroundColor: el.styles?.backgroundColor || 'transparent',
          effectiveBgColor: el.styles?.effectiveBgColor || 'rgb(255,255,255)',
          borderRadius: el.styles?.borderRadius || '0px',
          boxShadow: el.styles?.boxShadow || 'none',
          margin: el.styles?.margin || '0px',
          marginTop: el.styles?.marginTop || '0px',
          marginRight: el.styles?.marginRight || '0px',
          marginBottom: el.styles?.marginBottom || '0px',
          marginLeft: el.styles?.marginLeft || '0px',
          padding: el.styles?.padding || '0px',
          paddingTop: el.styles?.paddingTop || '0px',
          paddingRight: el.styles?.paddingRight || '0px',
          paddingBottom: el.styles?.paddingBottom || '0px',
          paddingLeft: el.styles?.paddingLeft || '0px',
          transition: el.styles?.transition || '',
          transitionDuration: el.styles?.transitionDuration || '0s',
          transitionProperty: el.styles?.transitionProperty || '',
          animation: el.styles?.animation || '',
          animationName: el.styles?.animationName || '',
          animationDuration: el.styles?.animationDuration || '',
          textAlign: el.styles?.textAlign || 'left',
          textWrap: el.styles?.textWrap || 'normal',
          overflow: el.styles?.overflow || 'visible',
          overflowX: el.styles?.overflowX || 'visible',
          overflowY: el.styles?.overflowY || 'visible',
          display: el.styles?.display || 'block',
          position: el.styles?.position || 'static',
          outline: el.styles?.outline || '',
          outlineWidth: el.styles?.outlineWidth || '',
          outlineStyle: el.styles?.outlineStyle || '',
        },
        attrs: el.attrs || {},
        metrics: el.metrics || { scrollWidth: 200, scrollHeight: 40, clientWidth: 200, clientHeight: 40 },
        childrenCount: el.childrenCount || 0,
        directChildTagNames: el.directChildTagNames || [],
        hasEmoji: Boolean(el.hasEmoji),
        emojis: el.emojis || [],
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

describe('TYPE Rule Checks', () => {
  it('flags line-height outside 1.2-1.7 for body text', () => {
    const data = createMockPageData([
      {
        tagName: 'p',
        textContent: 'This is a long reading paragraph that should have sufficient breathing room.',
        styles: { fontSize: '16px', lineHeight: '16px' } as any, // ratio 1.0 (too tight)
      },
    ]);

    const violations = typeRule.check({ data });
    expect(violations.some((v) => v.ruleId === 'type/line-height')).toBe(true);
  });

  it('passes compliant line-height (1.5 ratio)', () => {
    const data = createMockPageData([
      {
        tagName: 'p',
        textContent: 'This is a long reading paragraph that should have sufficient breathing room.',
        styles: { fontSize: '16px', lineHeight: '24px' } as any, // ratio 1.5
      },
    ]);

    const violations = typeRule.check({ data });
    expect(violations.some((v) => v.ruleId === 'type/line-height')).toBe(false);
  });

  it('flags line measure > 75ch on wide paragraphs', () => {
    const data = createMockPageData([
      {
        tagName: 'p',
        textContent: 'A'.repeat(120),
        rect: { x: 0, y: 0, width: 950, height: 40, top: 0, left: 0, bottom: 40, right: 950 },
        styles: { fontSize: '16px' } as any,
      },
    ]);

    const violations = typeRule.check({ data });
    expect(violations.some((v) => v.ruleId === 'type/measure')).toBe(true);
  });

  it('flags missing text-wrap balance on multi-word headlines', () => {
    const data = createMockPageData([
      {
        tagName: 'h1',
        textContent: 'The Future of Distributed Cloud Systems',
        styles: { textWrap: 'normal' } as any,
      },
    ]);

    const violations = typeRule.check({ data });
    expect(violations.some((v) => v.ruleId === 'type/text-wrap-balance')).toBe(true);
  });

  it('passes heading with text-wrap: balance', () => {
    const data = createMockPageData([
      {
        tagName: 'h1',
        textContent: 'The Future of Distributed Cloud Systems',
        styles: { textWrap: 'balance' } as any,
      },
    ]);

    const violations = typeRule.check({ data });
    expect(violations.some((v) => v.ruleId === 'type/text-wrap-balance')).toBe(false);
  });
});

