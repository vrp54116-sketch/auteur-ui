import { Rule, RuleContext, RuleViolation } from '../types.js';

export const a11yRule: Rule = {
  id: 'a11y',
  category: 'a11y',
  name: 'Accessibility Baseline & Hard Fail Invariants',
  description: 'Enforces WCAG accessibility prerequisites: tap targets >= 44px, alt text, focus visibility, and icon button aria labels.',
  check(ctx: RuleContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const elements = ctx.data.desktop.elements;
    const styleCss = ctx.data.desktop.styleSheetsCss.toLowerCase();

    // 1. Focus-visible check
    const hasOutlineNone = styleCss.includes('outline: none') || styleCss.includes('outline:none') || styleCss.includes('outline: 0');
    const hasFocusVisible = styleCss.includes(':focus-visible') || styleCss.includes(':focus');
    if (hasOutlineNone && !hasFocusVisible) {
      violations.push({
        ruleId: 'a11y/focus-visible',
        category: 'a11y',
        isHardFail: true,
        deduction: 10,
        sel: 'html',
        val: 'outline: none without :focus-visible replacement',
        want: ':focus-visible { outline: 2px solid ... }',
        fix: 'Preserve visible keyboard focus indicators with :focus-visible',
      });
    }

    // 2. Tap targets >= 44px
    for (const el of elements) {
      if (el.tagName === 'button' || (el.tagName === 'input' && ['button', 'submit'].includes(el.attrs.type || ''))) {
        // Check rendered dimensions
        if (el.rect.width > 0 && el.rect.height > 0) {
          const isBelowMinimum = el.rect.width < 24 || el.rect.height < 24;
          const isUndersizedStandalone =
            (el.rect.width < 44 || el.rect.height < 44) &&
            !el.className.includes('icon-btn') &&
            !el.className.includes('pill') &&
            !el.className.includes('time-btn') &&
            !el.selector.includes('selector') &&
            !el.selector.includes('control-buttons');

          if (isBelowMinimum || isUndersizedStandalone) {
            violations.push({
              ruleId: 'a11y/tap-target-size',
              category: 'a11y',
              isHardFail: true,
              deduction: 10,
              sel: el.selector,
              val: `${Math.round(el.rect.width)}x${Math.round(el.rect.height)}px`,
              want: 'Tap target dimensions >= 44x44px (minimum 24x24px for grouped toolbar controls)',
              fix: 'Increase padding or min-height/min-width to at least 44px for touch targets',
            });
            break; // Report the first failing tap target
          }
        }
      }
    }

    // 3. Alt text on <img> tags
    for (const el of elements) {
      if (el.tagName === 'img') {
        const alt = el.attrs.alt;
        if (alt === null || alt === undefined) {
          violations.push({
            ruleId: 'a11y/missing-alt-text',
            category: 'a11y',
            isHardFail: true,
            deduction: 10,
            sel: el.selector,
            val: '<img> without alt attribute',
            want: 'Descriptive alt="..." or decorative alt=""',
            fix: 'Add an alt attribute describing image content or empty alt="" for decorative images',
          });
          break;
        }
      }
    }

    // 4. Aria on icon buttons
    for (const el of elements) {
      if (el.tagName === 'button' || el.tagName === 'a') {
        const text = el.textContent.trim();
        const hasAria = Boolean(el.attrs.ariaLabel || el.attrs.ariaLabelledby || el.attrs.title);
        // If element contains only emoji, or only svg/icon and no descriptive text
        const textWithoutEmoji = text.replace(/[\s\p{Emoji}\p{Extended_Pictographic}\uFE00-\uFE0F]/gu, '');
        const isIconOnly = text.length === 0 || textWithoutEmoji.length === 0;
        const containsSvg = el.directChildTagNames.includes('svg');

        if ((isIconOnly || (containsSvg && text.length === 0)) && !hasAria && el.rect.width > 0) {
          violations.push({
            ruleId: 'a11y/icon-button-missing-aria',
            category: 'a11y',
            isHardFail: true,
            deduction: 10,
            sel: el.selector,
            val: 'Icon-only button without accessible label',
            want: 'aria-label="..." or title="..." attribute',
            fix: 'Add aria-label describing button action for screen reader users',
          });
          break;
        }
      }
    }

    return violations;
  },
};
