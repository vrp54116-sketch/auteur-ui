import { Rule, RuleContext, RuleViolation } from '../types.js';

export const motionRule: Rule = {
  id: 'motion',
  category: 'motion',
  name: 'Motion Choreography & Reduced Motion',
  description: 'Audits interactive transitions, duration bounds, reduced motion queries, and GPU-safe animation properties.',
  check(ctx: RuleContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const elements = ctx.data.desktop.elements;
    const contract = ctx.contract;

    // Interactive elements
    const interactive = elements.filter(
      (el) =>
        ['button', 'a'].includes(el.tagName) ||
        (el.tagName === 'input' && ['button', 'submit'].includes(el.attrs.type || ''))
    );

    let hasAnyTransition = false;
    let missingTransitionReported = false;

    for (const el of interactive) {
      if (el.rect.width === 0 || el.rect.height === 0) continue;

      const durStr = el.styles.transitionDuration || '';
      const durSec = parseFloat(durStr) || 0;
      const transProp = (el.styles.transitionProperty || '').toLowerCase();

      if (durSec > 0) {
        hasAnyTransition = true;

        // Check layout-shifting animations
        const shiftProps = ['width', 'height', 'top', 'bottom', 'left', 'right', 'margin', 'padding'];
        for (const sp of shiftProps) {
          if (transProp.includes(sp) && !transProp.includes('transform')) {
            violations.push({
              ruleId: 'motion/layout-shift',
              category: 'motion',
              deduction: 3,
              sel: el.selector,
              val: `transition: ${el.styles.transition}`,
              want: 'Animate transform and opacity only (compositor thread)',
              fix: 'Replace geometry transition with transform: translate/scale',
            });
            break;
          }
        }

        // Check duration bounds
        const durMs = durSec * 1000;
        const maxContractDur = contract?.motion?.dur ? Math.max(...contract.motion.dur) : 500;
        if (durMs > maxContractDur + 150 || durMs > 700) {
          violations.push({
            ruleId: 'motion/sluggish-duration',
            category: 'motion',
            deduction: 2,
            sel: el.selector,
            val: `${durMs}ms`,
            want: `<= ${maxContractDur}ms`,
            fix: 'Snip transition duration to 150-300ms for snappy response',
          });
        }
      } else if (!missingTransitionReported && el.tagName === 'button') {
        // Flag button with 0 transition
        violations.push({
          ruleId: 'motion/no-transition',
          category: 'motion',
          deduction: 3,
          sel: el.selector,
          val: '0s transition',
          want: 'transition: 150ms-250ms ease on interactive state changes',
          fix: 'Add transition: background-color 0.18s ease, transform 0.18s ease',
        });
        missingTransitionReported = true;
      }
    }

    // Missing prefers-reduced-motion
    if (hasAnyTransition && !ctx.data.desktop.hasPrefersReducedMotion) {
      violations.push({
        ruleId: 'motion/missing-prefers-reduced-motion',
        category: 'motion',
        deduction: 3,
        sel: 'html',
        val: 'No @media (prefers-reduced-motion) query found',
        want: '@media (prefers-reduced-motion: reduce) { * { transition-duration: 0.01ms !important; } }',
        fix: 'Add prefers-reduced-motion media query to respect accessibility settings',
      });
    }

    return violations;
  },
};

