import { describe, it, expect } from 'vitest';
import { colorRule, contrastRatio, parseRgb } from '../../packages/lint/rules/color.js';
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

describe('COLOR Rule Checks', () => {
  it('correctly calculates contrast ratio between white and black', () => {
    const white = parseRgb('rgb(255, 255, 255)')!;
    const black = parseRgb('rgb(0, 0, 0)')!;
    const ratio = contrastRatio(white, black);
    expect(ratio).toBeCloseTo(21.0, 1);
  });

  it('flags low WCAG AA contrast text', () => {
    const data = createMockPageData([
      {
        tagName: 'p',
        textContent: 'Subtle text with poor contrast',
        styles: {
          color: 'rgb(180, 180, 180)',
          effectiveBgColor: 'rgb(255, 255, 255)',
          fontSize: '14px',
        } as any,
      },
    ]);

    const violations = colorRule.check({ data });
    expect(violations.some((v) => v.ruleId === 'color/contrast-ratio')).toBe(true);
  });

  it('passes high WCAG AA contrast text', () => {
    const data = createMockPageData([
      {
        tagName: 'p',
        textContent: 'Crisp editorial text with high contrast',
        styles: {
          color: 'rgb(28, 26, 23)',
          effectiveBgColor: 'rgb(249, 248, 245)',
          fontSize: '18px',
        } as any,
      },
    ]);

    const violations = colorRule.check({ data });
    expect(violations.some((v) => v.ruleId === 'color/contrast-ratio')).toBe(false);
  });

  it('flags pure black #000 on large area surfaces', () => {
    const data = createMockPageData([
      {
        tagName: 'div',
        rect: { x: 0, y: 0, width: 1200, height: 400, top: 0, left: 0, bottom: 400, right: 1200 },
        styles: {
          backgroundColor: 'rgb(0, 0, 0)',
        } as any,
      },
    ]);

    const violations = colorRule.check({ data });
    expect(violations.some((v) => v.ruleId === 'color/pure-black-surface')).toBe(true);
  });
});

