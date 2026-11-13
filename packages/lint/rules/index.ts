import { Rule } from '../types.js';
import { typeRule } from './type.js';
import { colorRule } from './color.js';
import { spaceRule } from './space.js';
import { rhythmRule } from './rhythm.js';
import { hierarchyRule } from './hierarchy.js';
import { motionRule } from './motion.js';
import { a11yRule } from './a11y.js';
import { responsiveRule } from './responsive.js';
import { slopRule } from './slop.js';

export const allRules: Rule[] = [
  typeRule,
  colorRule,
  spaceRule,
  rhythmRule,
  hierarchyRule,
  motionRule,
  a11yRule,
  responsiveRule,
  slopRule,
];

export interface RuleDoc {
  id: string;
  category: string;
  title: string;
  deduction: string;
  whyItMatters: string;
  badExample: string;
  goodExample: string;
}

export const ruleDocs: Record<string, RuleDoc> = {
  'type/distinct-sizes': {
    id: 'type/distinct-sizes',
    category: 'TYPE',
    title: 'Typographic Scale Entropy',
    deduction: '-3 pts',
    whyItMatters: 'Using more than 7 distinct font sizes destroys typographic rhythm and hierarchy.',
    badExample: 'font-size: 13px, 14px, 15px, 17px, 19px, 22px, 28px, 34px, 42px, 52px;',
    goodExample: 'Constrain sizes to a 5-step modular scale: 12px, 14px, 18px, 24px, 36px, 48px.',
  },
  'type/off-scale': {
    id: 'type/off-scale',
    category: 'TYPE',
    title: 'Off-Scale Font Size',
    deduction: '-2 pts',
    whyItMatters: 'Arbitrary font sizes disrupt mathematical visual cadence.',
    badExample: 'font-size: 17px; /* arbitrary non-scale size */',
    goodExample: 'font-size: 16px; or font-size: 18px;',
  },
  'type/line-height': {
    id: 'type/line-height',
    category: 'TYPE',
    title: 'Body Text Line-Height Out of Bounds',
    deduction: '-3 pts',
    whyItMatters: 'Line-height below 1.2 chokes text legibility; above 1.7 makes sentences drift apart.',
    badExample: 'line-height: 1.0; or line-height: 2.2;',
    goodExample: 'line-height: 1.5; to 1.65; for reading paragraphs.',
  },
  'type/measure': {
    id: 'type/measure',
    category: 'TYPE',
    title: 'Unconstrained Reading Measure',
    deduction: '-3 pts',
    whyItMatters: 'Paragraphs wider than 75ch cause eye fatigue when scanning to the next line.',
    badExample: 'p { width: 100%; /* stretches across 1400px screen */ }',
    goodExample: 'p { max-width: 65ch; }',
  },
  'type/text-wrap-balance': {
    id: 'type/text-wrap-balance',
    category: 'TYPE',
    title: 'Missing Heading Text-Wrap Balance',
    deduction: '-2 pts',
    whyItMatters: 'Unbalanced headlines leave orphan words on trailing lines.',
    badExample: 'h1 { font-size: 48px; } /* leaves single word on second line */',
    goodExample: 'h1 { font-size: 48px; text-wrap: balance; }',
  },
  'color/contrast-ratio': {
    id: 'color/contrast-ratio',
    category: 'COLOR',
    title: 'WCAG AA Insufficient Contrast',
    deduction: '-4 pts',
    whyItMatters: 'Low contrast impairs legibility and fails international accessibility standards.',
    badExample: 'color: #94a3b8; background: #ffffff; /* contrast ratio 2.4:1 */',
    goodExample: 'color: #1e293b; background: #ffffff; /* contrast ratio 12.6:1 */',
  },
  'color/entropy': {
    id: 'color/entropy',
    category: 'COLOR',
    title: 'Palette Color Entropy',
    deduction: '-3 pts',
    whyItMatters: 'Too many one-off hex colors dilute visual identity and consistency.',
    badExample: 'Scattering 25 different hex codes across random components.',
    goodExample: 'Consolidate into 6-10 semantic tokens defined in contract.json.',
  },
  'color/pure-black-surface': {
    id: 'color/pure-black-surface',
    category: 'COLOR',
    title: 'Pure #000000 on Large Surfaces',
    deduction: '-2 pts',
    whyItMatters: 'Stark pure black (#000) causes OLED halation and feels artificial compared to warm darks.',
    badExample: 'body { background: #000000; }',
    goodExample: 'body { background: #09090b; } or oklch(0.18 0.02 240);',
  },
  'color/saturation-variance': {
    id: 'color/saturation-variance',
    category: 'COLOR',
    title: 'Excessive High-Saturation Colors',
    deduction: '-3 pts',
    whyItMatters: 'Competing neon colors fight for attention and fatigue the human eye.',
    badExample: 'Hot pink buttons + neon green pills + electric blue cards all in one viewport.',
    goodExample: 'Neutral surfaces with a single, calibrated high-chroma accent token.',
  },
  'space/off-grid': {
    id: 'space/off-grid',
    category: 'SPACE',
    title: 'Off-Grid Margins or Paddings',
    deduction: '-3 pts',
    whyItMatters: 'Spacing not aligned to a 4px/8px base grid creates subconscious misalignment.',
    badExample: 'padding: 13px 27px; margin-top: 15px;',
    goodExample: 'padding: 16px 24px; margin-top: 16px;',
  },
  'rhythm/uniform-section-padding': {
    id: 'rhythm/uniform-section-padding',
    category: 'RHYTHM',
    title: 'Uniform Section Padding Slop Tell',
    deduction: '-4 pts',
    whyItMatters: 'Applying identical 100px padding to every section makes sites feel like cookie-cutter templates.',
    badExample: 'section { padding: 100px 20px; } everywhere.',
    goodExample: 'Vary padding by section importance: hero 96px, features 64px, CTA 48px.',
  },
  'hierarchy/h1-not-largest': {
    id: 'hierarchy/h1-not-largest',
    category: 'HIERARCHY',
    title: 'h1 Heading Not Largest',
    deduction: '-3 pts',
    whyItMatters: 'The main page title must possess the highest visual prominence.',
    badExample: 'h1 { font-size: 24px; } h2 { font-size: 32px; }',
    goodExample: 'h1 { font-size: 48px; } h2 { font-size: 28px; }',
  },
  'motion/no-transition': {
    id: 'motion/no-transition',
    category: 'MOTION',
    title: 'Interactive Elements Without Transition',
    deduction: '-3 pts',
    whyItMatters: 'Instant state jumps feel harsh and unpolished compared to natural easing.',
    badExample: 'button:hover { background: #4338ca; } /* instant jump */',
    goodExample: 'button { transition: background-color 0.18s ease; }',
  },
  'motion/missing-prefers-reduced-motion': {
    id: 'motion/missing-prefers-reduced-motion',
    category: 'MOTION',
    title: 'Missing prefers-reduced-motion Media Query',
    deduction: '-3 pts',
    whyItMatters: 'Failing to honor vestibular motion reduction preferences causes physical discomfort.',
    badExample: 'CSS animations declared without any @media (prefers-reduced-motion).',
    goodExample: '@media (prefers-reduced-motion: reduce) { * { transition-duration: 0.01ms !important; } }',
  },
  'a11y/focus-visible': {
    id: 'a11y/focus-visible',
    category: 'A11Y',
    title: 'Stripped Outline Without :focus-visible',
    deduction: 'HARD FAIL',
    whyItMatters: 'Removing focus outlines traps keyboard and assistive technology users.',
    badExample: '* { outline: none; }',
    goodExample: ':focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }',
  },
  'a11y/tap-target-size': {
    id: 'a11y/tap-target-size',
    category: 'A11Y',
    title: 'Interactive Tap Target < 44×44px',
    deduction: 'HARD FAIL',
    whyItMatters: 'Small buttons cause mis-taps on touch devices.',
    badExample: 'button { padding: 4px 8px; font-size: 11px; height: 24px; }',
    goodExample: 'button { min-height: 44px; min-width: 44px; padding: 10px 18px; }',
  },
  'a11y/missing-alt-text': {
    id: 'a11y/missing-alt-text',
    category: 'A11Y',
    title: 'Missing Image Alt Attribute',
    deduction: 'HARD FAIL',
    whyItMatters: 'Images without alt attributes prevent screen readers from conveying content.',
    badExample: '<img src="hero.png">',
    goodExample: '<img src="hero.png" alt="Aomori mountain ridges at dawn">',
  },
  'a11y/icon-button-missing-aria': {
    id: 'a11y/icon-button-missing-aria',
    category: 'A11Y',
    title: 'Icon-Only Button Missing Aria Label',
    deduction: 'HARD FAIL',
    whyItMatters: 'Buttons containing only icons are completely silent to screen readers without aria-label.',
    badExample: '<button><svg ...></button>',
    goodExample: '<button aria-label="Toggle playback"><svg ...></button>',
  },
  'responsive/horizontal-overflow': {
    id: 'responsive/horizontal-overflow',
    category: 'RESPONSIVE',
    title: 'Mobile Horizontal Scroll Overflow at 390px',
    deduction: '-6 pts',
    whyItMatters: 'Horizontal scrollbars break mobile viewport usability.',
    badExample: '.grid { width: 600px; } on mobile screens.',
    goodExample: '.grid { width: 100%; max-width: 100%; grid-template-columns: 1fr; }',
  },
  'slop/inter-roboto-default': {
    id: 'slop/inter-roboto-default',
    category: 'SLOP',
    title: 'Inter/Roboto Default Without Display Face',
    deduction: '-8 pts',
    whyItMatters: 'Using Inter or Roboto everywhere without a distinctive display face is the #1 tell of generic AI slop.',
    badExample: '* { font-family: "Inter", sans-serif; }',
    goodExample: 'Pair body Inter with a striking serif (Newsreader, Charter) or mono (Space Mono).',
  },
  'slop/purple-blue-gradient': {
    id: 'slop/purple-blue-gradient',
    category: 'SLOP',
    title: 'Purple-to-Blue Gradient Hero',
    deduction: '-8 pts',
    whyItMatters: 'The generic purple/indigo/pink gradient hero is an overused cliché from 2021 SaaS mockups.',
    badExample: 'background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);',
    goodExample: 'Use deep warm neutrals, photographic plates, or monochromatic editorial surfaces.',
  },
  'slop/centered-hero-3-cards': {
    id: 'slop/centered-hero-3-cards',
    category: 'SLOP',
    title: 'Centered Hero + Exactly 3 Equal Feature Cards',
    deduction: '-8 pts',
    whyItMatters: 'The centered hero leading into 3 equal cards is the defining layout trope of template slop.',
    badExample: 'text-align: center; hero followed by grid-template-columns: repeat(3, 1fr);',
    goodExample: 'Asymmetric 7fr/5fr hero, staggered editorial spread, or dense telemetry grid.',
  },
  'slop/emoji-icons': {
    id: 'slop/emoji-icons',
    category: 'SLOP',
    title: 'Raw Emoji Used as Feature Icons',
    deduction: '-8 pts',
    whyItMatters: 'Using 🚀, ⚡️, 🔒 as feature icons looks like a hasty hackathon prototype, not production UI.',
    badExample: '<div class="card-icon">⚡️</div><h3>Lightning Fast</h3>',
    goodExample: 'Use clean inline SVGs, geometric marks, or typographic numeral indicators.',
  },
  'slop/uniform-radius': {
    id: 'slop/uniform-radius',
    category: 'SLOP',
    title: 'Uniform Border-Radius Everywhere',
    deduction: '-8 pts',
    whyItMatters: 'Putting 8px border-radius on every badge, button, card, and modal destroys spatial hierarchy.',
    badExample: 'border-radius: 8px; on every single component.',
    goodExample: 'Strict 0px Swiss borders or mathematically nested radii (e.g. outer 12px, inner 8px).',
  },
  'slop/drop-shadow-everywhere': {
    id: 'slop/drop-shadow-everywhere',
    category: 'SLOP',
    title: 'Diffuse Drop Shadows on Every Surface',
    deduction: '-8 pts',
    whyItMatters: 'Slapping box-shadow on every element creates muddy, ungrounded surfaces.',
    badExample: 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); on all cards and buttons.',
    goodExample: 'Define surface boundaries with crisp 1px borders or subtle contrast shifts.',
  },
  'slop/generic-cta-pair': {
    id: 'slop/generic-cta-pair',
    category: 'SLOP',
    title: 'Generic "Get Started" / "Learn More" CTA',
    deduction: '-8 pts',
    whyItMatters: 'Generic CTAs fail to communicate domain value.',
    badExample: '<button>Get Started Free</button> <button>Learn More</button>',
    goodExample: '<button>Deploy Cluster</button> <button>Explore Telemetry</button>',
  },
  'slop/gray-on-gray': {
    id: 'slop/gray-on-gray',
    category: 'SLOP',
    title: 'Muted Gray-on-Gray Text',
    deduction: '-8 pts',
    whyItMatters: 'Tailwind slate-500 (#64748b) text on white or dark surfaces produces washed-out, lifeless UI.',
    badExample: 'color: #64748b; background: white;',
    goodExample: 'color: #1e293b; or high-contrast ink neutrals.',
  },
};

export function explainRule(ruleKey: string): string {
  const normalized = ruleKey.trim().toLowerCase();

  // Exact ID match
  if (ruleDocs[ruleKey]) {
    const doc = ruleDocs[ruleKey];
    return formatRuleDoc(doc);
  }

  // Partial or category match
  for (const [id, doc] of Object.entries(ruleDocs)) {
    if (id.toLowerCase().includes(normalized) || doc.category.toLowerCase() === normalized) {
      return formatRuleDoc(doc);
    }
  }

  return `Rule "${ruleKey}" not found in auteur-ui lint catalog. Available rules:\n` +
    Object.keys(ruleDocs).map((k) => `  - ${k}`).join('\n');
}

function formatRuleDoc(doc: RuleDoc): string {
  return `
================================================================================
 auteur-ui Lint Rule: ${doc.id} [${doc.category}]
================================================================================
Title      : ${doc.title}
Deduction  : ${doc.deduction}

Why It Matters:
  ${doc.whyItMatters}

Bad Example:
  ${doc.badExample}

Recommended Fix:
  ${doc.goodExample}
================================================================================
`;
}

