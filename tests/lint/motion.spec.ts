import { describe, it, expect } from 'vitest';
import { motionRule } from '../../packages/lint/rules/motion.js';
import { ExtractedPageData, DomNodeData } from '../../packages/lint/types.js';

function createMockPageData(elements: Partial<DomNodeData>[], hasReducedMotion = false): ExtractedPageData {
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
        selector: el.selector || `btn-${i}`,
        innerText: el.innerText || el.textContent || '',
        textContent: el.textContent || 'Click Me',
        rect: el.rect || { x: 0, y: 0, width: 120, height: 48, top: 0, left: 0, bottom: 48, right: 120 },
        styles: {
          fontFamily: 'sans-serif',
          fontSize: '16px',
          fontWeight: '500',
          lineHeight: '24px',
          color: 'rgb(255,255,255)',
          backgroundColor: 'rgb(20,20,20)',
          effectiveBgColor: 'rgb(20,20,20)',
          borderRadius: '4px',
          boxShadow: 'none',
          margin: '0px',
          marginTop: '0px',
          marginRight: '0px',
          marginBottom: '0px',
          marginLeft: '0px',
          padding: '12px 24px',
          paddingTop: '12px',
          paddingRight: '24px',
          paddingBottom: '12px',
          paddingLeft: '24px',
          transition: el.styles?.transition || '',
          transitionDuration: el.styles?.transitionDuration || '0s',
          transitionProperty: el.styles?.transitionProperty || 'all',
          animation: '',
          animationName: '',
          animationDuration: '',
          textAlign: 'center',
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
        attrs: {},
        metrics: { scrollWidth: 120, scrollHeight: 48, clientWidth: 120, clientHeight: 48 },
        childrenCount: 0,
        directChildTagNames: [],
        hasEmoji: false,
        emojis: [],
      })),
      hasPrefersReducedMotion: hasReducedMotion,
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

describe('MOTION Rule Checks', () => {
  it('flags interactive button with zero transition', () => {
    const data = createMockPageData([
      { tagName: 'button', styles: { transitionDuration: '0s' } as any },
    ]);

    const violations = motionRule.check({ data });
    expect(violations.some((v) => v.ruleId === 'motion/no-transition')).toBe(true);
  });

  it('flags transitions animating layout-shifting geometry (e.g. width/height)', () => {
    const data = createMockPageData([
      {
        tagName: 'button',
        styles: {
          transition: 'width 0.3s ease',
          transitionDuration: '0.3s',
          transitionProperty: 'width',
        } as any,
      },
    ]);

    const violations = motionRule.check({ data });
    expect(violations.some((v) => v.ruleId === 'motion/layout-shift')).toBe(true);
  });

  it('flags missing prefers-reduced-motion when transitions exist', () => {
    const data = createMockPageData(
      [
        {
          tagName: 'button',
          styles: {
            transition: 'background-color 0.2s ease',
            transitionDuration: '0.2s',
            transitionProperty: 'background-color',
          } as any,
        },
      ],
      false // no prefers-reduced-motion
    );

    const violations = motionRule.check({ data });
    expect(violations.some((v) => v.ruleId === 'motion/missing-prefers-reduced-motion')).toBe(true);
  });

  it('passes when prefers-reduced-motion is provided with valid transform transitions', () => {
    const data = createMockPageData(
      [
        {
          tagName: 'button',
          styles: {
            transition: 'transform 0.2s ease',
            transitionDuration: '0.2s',
            transitionProperty: 'transform',
          } as any,
        },
      ],
      true // reduced motion query present
    );

    const violations = motionRule.check({ data });
    expect(violations.some((v) => v.ruleId === 'motion/no-transition')).toBe(false);
    expect(violations.some((v) => v.ruleId === 'motion/missing-prefers-reduced-motion')).toBe(false);
  });
});

