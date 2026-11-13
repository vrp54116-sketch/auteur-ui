import { Rule, RuleContext, RuleViolation } from '../types.js';

export const slopRule: Rule = {
  id: 'slop',
  category: 'slop',
  name: 'Slop Tells & Generic Anti-Patterns',
  description: 'Detects the 10 cardinal aesthetic sins of generic AI-generated interfaces (-8 pts each).',
  check(ctx: RuleContext): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const elements = ctx.data.desktop.elements;
    const styleCss = ctx.data.desktop.styleSheetsCss.toLowerCase();

    // 1. Inter/Roboto default with no display face
    const allFonts = elements
      .map((el) => el.styles.fontFamily.toLowerCase())
      .filter(Boolean);
    const usesInterOrRoboto = allFonts.some(
      (f) => f.includes('inter') || f.includes('roboto') || f.includes('system-ui')
    );
    const hasDisplayFace =
      styleCss.includes('font-mono') ||
      styleCss.includes('monospace') ||
      styleCss.includes('serif') ||
      allFonts.some(
        (f) =>
          (f.includes('serif') && !f.includes('sans-serif')) ||
          f.includes('mono') ||
          f.includes('charter') ||
          f.includes('georgia') ||
          f.includes('newsreader') ||
          f.includes('syne') ||
          f.includes('garamond') ||
          f.includes('fraunces') ||
          f.includes('clash')
      );

    if (usesInterOrRoboto && !hasDisplayFace) {
      violations.push({
        ruleId: 'slop/inter-roboto-default',
        category: 'slop',
        deduction: 8,
        sel: 'body',
        val: 'Inter / Roboto default with no display or serif font',
        want: 'Pairing with authentic display face or expressive serif/mono',
        fix: 'Add a distinctive display serif (Newsreader, Charter) or geometric grotesque (Syne)',
      });
    }

    // 2. Purple -> Blue gradient hero
    const purpleTokens = ['#6366f1', '#8b5cf6', '#7c3aed', '#a855f7', '#4338ca', '#4f46e5', '99, 102, 241', '139, 92, 246', '124, 58, 237'];
    const bluePinkTokens = ['#ec4899', '#d946ef', '#3b82f6', '#06b6d4', '236, 72, 153', '217, 70, 239'];

    let hasPurpleGradient = false;
    let gradientSel = '';
    let gradientVal = '';

    for (const el of elements) {
      const bg = el.styles.backgroundColor.toLowerCase() + ' ' + (el.styles as any).background;
      const inlineStyle = el.selector;
      const combined = (bg + ' ' + styleCss).toLowerCase();

      // Check if element has gradient containing purple
      if (
        (el.tagName === 'header' || el.className.includes('hero') || el.className.includes('banner') || el.className.includes('header')) &&
        (styleCss.includes('linear-gradient') || styleCss.includes('radial-gradient'))
      ) {
        const hasPurple = purpleTokens.some((t) => styleCss.includes(t.toLowerCase()));
        const hasPinkBlue = bluePinkTokens.some((t) => styleCss.includes(t.toLowerCase()));
        if (hasPurple && (hasPinkBlue || styleCss.includes('linear-gradient(135deg') || styleCss.includes('linear-gradient(90deg'))) {
          hasPurpleGradient = true;
          gradientSel = el.selector;
          gradientVal = 'Purple/violet/indigo gradient hero background';
          break;
        }
      }
    }

    if (hasPurpleGradient) {
      violations.push({
        ruleId: 'slop/purple-blue-gradient',
        category: 'slop',
        deduction: 8,
        sel: gradientSel || '.hero',
        val: gradientVal,
        want: 'Solid neutral surface, photographic plate, or intentional brand palette token',
        fix: 'Replace AI-cliché purple gradient with high-contrast neutral or authentic palette tone',
      });
    }

    // 3. Centered hero + exactly 3 equal feature cards
    const hasCenteredHero = elements.some(
      (el) =>
        (el.className.includes('hero') || el.className.includes('banner') || el.className.includes('header')) &&
        el.styles.textAlign === 'center'
    );

    // Look for grid-template-columns repeat(3, 1fr) or 3 equal cards
    const hasThreeEqualCards =
      styleCss.includes('repeat(3, 1fr)') ||
      styleCss.includes('repeat(3,1fr)') ||
      elements.some(
        (el) =>
          (el.className.includes('cards-grid') || el.className.includes('grid-3') || el.className.includes('stats-container')) &&
          el.childrenCount === 3
      );

    if (hasCenteredHero && hasThreeEqualCards) {
      violations.push({
        ruleId: 'slop/centered-hero-3-cards',
        category: 'slop',
        deduction: 8,
        sel: '.cards-grid, .grid-3',
        val: 'Centered hero followed by exactly 3 equal-width feature cards',
        want: 'Asymmetric layout, varying grid weights, or editorial hierarchy',
        fix: 'Break grid symmetry: use 7fr/5fr split or hierarchical focal spans',
      });
    }

    // 4. Emoji as icons
    const emojiElements = elements.filter(
      (el) =>
        el.hasEmoji &&
        (el.className.includes('icon') ||
          el.className.includes('emoji') ||
          el.tagName === 'button' ||
          el.tagName === 'h1' ||
          el.tagName === 'h2' ||
          el.tagName === 'h3' ||
          el.tagName === 'h4')
    );

    if (emojiElements.length > 0) {
      const sample = emojiElements[0];
      violations.push({
        ruleId: 'slop/emoji-icons',
        category: 'slop',
        deduction: 8,
        sel: sample.selector,
        val: `Emoji used as interface iconography (${sample.emojis.join(' ')})`,
        want: 'Precise SVG vector icons or typographic markers',
        fix: 'Replace raw Unicode emoji with custom SVG iconography or clean text labels',
      });
    }

    // 5. Uniform border-radius on everything
    const radiusCounts = new Map<string, string[]>();
    for (const el of elements) {
      if (['button', 'input', 'div', 'span', 'article'].includes(el.tagName)) {
        const rad = el.styles.borderRadius;
        if (rad && rad !== '0px' && rad !== '0') {
          if (!radiusCounts.has(rad)) {
            radiusCounts.set(rad, []);
          }
          radiusCounts.get(rad)!.push(el.selector);
        }
      }
    }

    for (const [rad, sels] of radiusCounts.entries()) {
      if (sels.length >= 4 && (rad === '8px' || rad === '0.5rem' || rad.includes('8px'))) {
        violations.push({
          ruleId: 'slop/uniform-radius',
          category: 'slop',
          deduction: 8,
          sel: sels[0],
          val: `Uniform ${rad} border-radius applied indiscriminately across ${sels.length} elements`,
          want: 'Intentional radius hierarchy (e.g. sharp 0px or calibrated inner/outer nesting)',
          fix: 'Adopt a distinct radius strategy: strict 0px Swiss or mathematical nested radii',
        });
        break;
      }
    }

    // 6. Drop shadow on every surface
    const shadowElements = elements.filter(
      (el) => el.styles.boxShadow && el.styles.boxShadow !== 'none'
    );
    if (shadowElements.length >= 3) {
      violations.push({
        ruleId: 'slop/drop-shadow-everywhere',
        category: 'slop',
        deduction: 8,
        sel: shadowElements[0].selector,
        val: `${shadowElements.length} elements with ambient drop shadows`,
        want: 'Boundary definition via borders or high-contrast background surfaces',
        fix: 'Remove diffuse box-shadow; use 1px solid borders or contrasting background tones',
      });
    }

    // 7. "Get Started" / "Learn More" CTA pair
    const buttonTexts = elements
      .filter((el) => el.tagName === 'button' || el.tagName === 'a')
      .map((el) => el.textContent.trim().toLowerCase());

    const hasGetStarted = buttonTexts.some((t) => t.includes('get started'));
    const hasLearnMore = buttonTexts.some((t) => t.includes('learn more'));

    if (hasGetStarted && hasLearnMore) {
      violations.push({
        ruleId: 'slop/generic-cta-pair',
        category: 'slop',
        deduction: 8,
        sel: 'button, a',
        val: 'Cliché "Get Started" + "Learn More" CTA pairing',
        want: 'Specific, domain-relevant action verbs (e.g. "Create Telemetry Stream", "Read Issue 08")',
        fix: 'Replace generic SaaS CTA phrases with context-specific action labels',
      });
    } else if (hasGetStarted) {
      // Minor slop tell when single generic CTA is prominent
      violations.push({
        ruleId: 'slop/generic-cta-pair',
        category: 'slop',
        deduction: 8,
        sel: 'button',
        val: 'Generic "Get Started" CTA button',
        want: 'Domain-specific action verb',
        fix: 'Replace generic "Get Started" with specific verb (e.g. "Deploy Cluster", "Start Reading")',
      });
    }

    // 8. 3-column pricing with highlighted middle
    const hasPricingGrid =
      styleCss.includes('pricing') ||
      elements.some((el) => el.className.includes('pricing') || el.id.includes('pricing'));
    if (hasPricingGrid && hasThreeEqualCards) {
      violations.push({
        ruleId: 'slop/pricing-highlight',
        category: 'slop',
        deduction: 8,
        sel: '.pricing-card',
        val: '3-column pricing table with highlighted middle tier',
        want: 'Asymmetric or tabular feature pricing layout',
        fix: 'Present tiers with tabular comparative matrices instead of generic cards',
      });
    }

    // 9. Gray-on-gray text
    const grayTextRegex = /rgb\((?:100|148|156|113|107),\s*(?:116|163|174|129|114),\s*(?:139|184|187|141|128)\)/;
    const hasGrayText = elements.some((el) => {
      const color = el.styles.color.toLowerCase();
      return (
        color.includes('#64748b') ||
        color.includes('#94a3b8') ||
        color.includes('#9ca3af') ||
        color.includes('#71717a') ||
        grayTextRegex.test(color)
      );
    });

    if (hasGrayText) {
      violations.push({
        ruleId: 'slop/gray-on-gray',
        category: 'slop',
        deduction: 8,
        sel: 'p, span',
        val: 'Muted slate/gray-on-gray low-contrast body text (#64748b / #94a3b8)',
        want: 'High contrast text in authentic ink/charcoal or warm tinted darks',
        fix: 'Use higher-lightness contrast or warm-toned neutrals (e.g. #1e293b, #1c1a17)',
      });
    }

    // 10. Stock avatar circles
    const hasStockAvatars = elements.some(
      (el) =>
        (el.className.includes('avatar') || el.className.includes('testimonial')) &&
        (el.styles.borderRadius === '50%' || el.styles.borderRadius === '9999px')
    );
    if (hasStockAvatars) {
      violations.push({
        ruleId: 'slop/stock-avatars',
        category: 'slop',
        deduction: 8,
        sel: '.avatar',
        val: 'Circular stock photo avatar social proof',
        want: 'Verified organizational logos or typographic attribution',
        fix: 'Replace stock circles with authentic editorial quotes or monospace attribution',
      });
    }

    return violations;
  },
};
