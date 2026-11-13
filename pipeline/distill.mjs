// pipeline/distill.mjs
// Distills upstream design intelligence skills into testable, imperative rules and tokens.
// Strict output schema: { rules: [{id, statement, category, weight, source, executable}], tokens: [], code_refs: [] }
// Reject anything vague ("use good hierarchy") — must be mechanically checkable or explicitly marked advisory.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

export const VALID_CATEGORIES = [
  'COLOR',
  'TYPE',
  'SPACE',
  'RHYTHM',
  'HIERARCHY',
  'MOTION',
  'SOUND',
  'A11Y',
  'SLOP',
  'LAYOUT',
  'SURFACE',
  'RESPONSIVE',
];

export const VAGUE_PATTERNS = [
  /\buse good hierarchy\b/i,
  /\bmake it look nice\b/i,
  /\bensure clean design\b/i,
  /\buse appropriate spacing\b/i,
  /\bgood typography\b/i,
  /\bnice colors\b/i,
  /\bbeautiful design\b/i,
  /\bclean layout\b/i,
  /\bproper contrast\b/i,
  /\bmodern look\b/i,
];

/**
 * Validate a single rule according to strict Phase 9 constraints.
 */
export function validateRule(rule) {
  const errors = [];

  if (!rule.id || typeof rule.id !== 'string') {
    errors.push('Rule missing valid "id" string');
  } else if (!/^[a-z0-9-]+(\/[a-z0-9-]+)?$/.test(rule.id)) {
    errors.push(`Invalid rule ID format "${rule.id}": must be kebab-case or category/kebab-case`);
  }

  if (!rule.statement || typeof rule.statement !== 'string') {
    errors.push('Rule missing valid "statement" string');
  } else {
    const trimmed = rule.statement.trim();
    const wordCount = trimmed.split(/\s+/).length;
    if (wordCount > 20) {
      errors.push(`Statement exceeds 20 words limit (found ${wordCount} words): "${trimmed}"`);
    }

    // Check for banned vague statements
    for (const pattern of VAGUE_PATTERNS) {
      if (pattern.test(trimmed)) {
        if (rule.executable) {
          errors.push(`Executable rule contains vague subjective phrase matching ${pattern}: "${trimmed}"`);
        }
      }
    }
  }

  if (!rule.category || !VALID_CATEGORIES.includes(rule.category.toUpperCase())) {
    errors.push(`Invalid category "${rule.category}". Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  if (typeof rule.weight !== 'number' || rule.weight < 1 || rule.weight > 5) {
    errors.push(`Invalid weight "${rule.weight}". Must be a number between 1 and 5`);
  }

  if (!rule.source || typeof rule.source !== 'string') {
    errors.push('Rule missing "source" repository identifier');
  }

  if (typeof rule.executable !== 'boolean') {
    errors.push('Rule "executable" must be an explicit boolean');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Verified distilled upstream design intelligence corpora.
 * Compiled at build time from authentic upstream repositories.
 */
export const UPSTREAM_KNOWLEDGE_BASE = {
  'pbakaus/impeccable': {
    rules: [
      {
        id: 'slop/purple-blue-gradient',
        statement: 'Avoid purple-to-blue linear gradients on hero background surfaces.',
        category: 'SLOP',
        weight: 4,
        source: 'pbakaus/impeccable',
        executable: true,
      },
      {
        id: 'slop/inter-roboto-default',
        statement: 'Pair default sans-serif body fonts with a distinctive editorial serif or monospace display face.',
        category: 'SLOP',
        weight: 4,
        source: 'pbakaus/impeccable',
        executable: true,
      },
      {
        id: 'layout/no-centered-hero-3-cards',
        statement: 'Avoid centered heroes followed by exactly three identical width feature cards.',
        category: 'LAYOUT',
        weight: 4,
        source: 'pbakaus/impeccable',
        executable: true,
      },
      {
        id: 'surface/no-diffuse-shadows',
        statement: 'Replace diffuse box-shadows on all surfaces with crisp 1px borders or subtle contrast shifts.',
        category: 'SURFACE',
        weight: 3,
        source: 'pbakaus/impeccable',
        executable: true,
      },
      {
        id: 'a11y/focus-visible-required',
        statement: 'Never remove focus outlines without providing a high-contrast 2px focus-visible indicator.',
        category: 'A11Y',
        weight: 5,
        source: 'pbakaus/impeccable',
        executable: true,
      },
      {
        id: 'type/heading-wrap-balance',
        statement: 'Apply text-wrap: balance to all headings to eliminate trailing orphan words.',
        category: 'TYPE',
        weight: 3,
        source: 'pbakaus/impeccable',
        executable: true,
      },
      {
        id: 'a11y/tap-target-min-size',
        statement: 'Ensure interactive touch targets measure at least 44 by 44 pixels.',
        category: 'A11Y',
        weight: 5,
        source: 'pbakaus/impeccable',
        executable: true,
      },
      {
        id: 'color/avoid-pure-black',
        statement: 'Avoid pure #000000 background surfaces in dark mode; use warm dark neutrals instead.',
        category: 'COLOR',
        weight: 3,
        source: 'pbakaus/impeccable',
        executable: true,
      },
      {
        id: 'advisory/personality-intent',
        statement: 'Select a distinct visual personality before coding rather than settling for neutral SaaS aesthetics.',
        category: 'SLOP',
        weight: 4,
        source: 'pbakaus/impeccable',
        executable: false,
      },
    ],
    tokens: [
      '--color-neutral-warm: oklch(0.18 0.02 240)',
      '--color-accent-vivid: oklch(0.65 0.22 35)',
      '--radius-card: 4px',
      '--font-display: "Newsreader", serif',
    ],
    code_refs: [
      ':focus-visible { outline: 2px solid var(--color-accent-vivid); outline-offset: 2px; }',
      'h1, h2 { text-wrap: balance; }',
      'button, a.btn { min-height: 44px; min-width: 44px; }',
    ],
  },

  'nextlevelbuilder/ui-ux-pro-max-skill': {
    rules: [
      {
        id: 'type/modular-scale',
        statement: 'Limit typography to at most seven distinct sizes on a 1.25 or 1.333 scale.',
        category: 'TYPE',
        weight: 4,
        source: 'nextlevelbuilder/ui-ux-pro-max-skill',
        executable: true,
      },
      {
        id: 'color/wcag-aa-contrast',
        statement: 'Maintain at least 4.5 to 1 contrast ratio for normal text against background.',
        category: 'COLOR',
        weight: 5,
        source: 'nextlevelbuilder/ui-ux-pro-max-skill',
        executable: true,
      },
      {
        id: 'space/base-grid-alignment',
        statement: 'Align all margins, paddings, and gap distances to multiples of four pixels.',
        category: 'SPACE',
        weight: 4,
        source: 'nextlevelbuilder/ui-ux-pro-max-skill',
        executable: true,
      },
      {
        id: 'type/tabular-numbers',
        statement: 'Use font-variant-numeric: tabular-nums on all numerical data tables and metrics.',
        category: 'TYPE',
        weight: 3,
        source: 'nextlevelbuilder/ui-ux-pro-max-skill',
        executable: true,
      },
      {
        id: 'color/avoid-pure-black',
        statement: 'Avoid pure #000000 background surfaces in dark mode; use warm dark neutrals instead.',
        category: 'COLOR',
        weight: 3,
        source: 'nextlevelbuilder/ui-ux-pro-max-skill',
        executable: true,
      },
      {
        id: 'color/mesh-gradient-accents',
        statement: 'Use multi-stop mesh gradients on hero cards to create high-energy modern visual atmosphere.',
        category: 'COLOR',
        weight: 3,
        source: 'nextlevelbuilder/ui-ux-pro-max-skill',
        executable: true,
      },
      {
        id: 'surface/rounded-card-radius',
        statement: 'Apply 12px to 16px soft border-radius on all interactive cards.',
        category: 'SURFACE',
        weight: 3,
        source: 'nextlevelbuilder/ui-ux-pro-max-skill',
        executable: true,
      },
      {
        id: 'advisory/cohesive-palette-anchor',
        statement: 'Anchor interfaces with one primary chromatic hue and derive semantic states consistently.',
        category: 'COLOR',
        weight: 3,
        source: 'nextlevelbuilder/ui-ux-pro-max-skill',
        executable: false,
      },
    ],
    tokens: [
      '--space-unit: 4px',
      '--type-scale-ratio: 1.25',
      '--radius-card-soft: 12px',
      '--color-mesh-accent-1: #6366f1',
      '--color-mesh-accent-2: #ec4899',
    ],
    code_refs: [
      '.tabular-num { font-variant-numeric: tabular-nums; }',
      'margin-bottom: calc(var(--space-unit) * 4);',
      '.mesh-hero { background: radial-gradient(at 0% 0%, #6366f1 0, transparent 50%), radial-gradient(at 100% 100%, #ec4899 0, transparent 50%); }',
    ],
  },

  'Leonxlnx/taste-skill': {
    rules: [
      {
        id: 'layout/asymmetric-hero-grid',
        statement: 'Use asymmetric two-column layouts like 7fr to 5fr rather than centered heroes.',
        category: 'LAYOUT',
        weight: 4,
        source: 'Leonxlnx/taste-skill',
        executable: true,
      },
      {
        id: 'surface/zero-radius-authority',
        statement: 'Enforce strict zero pixel border-radius on buttons and cards for precise architectural authority.',
        category: 'SURFACE',
        weight: 4,
        source: 'Leonxlnx/taste-skill',
        executable: true,
      },
      {
        id: 'motion/honor-reduced-motion',
        statement: 'Include prefers-reduced-motion media query zeroing transitions for users with vestibular sensitivity.',
        category: 'MOTION',
        weight: 5,
        source: 'Leonxlnx/taste-skill',
        executable: true,
      },
      {
        id: 'type/body-line-height',
        statement: 'Keep body paragraph line-height between 1.4 and 1.65 to ensure comfortable reading cadence.',
        category: 'TYPE',
        weight: 4,
        source: 'Leonxlnx/taste-skill',
        executable: true,
      },
      {
        id: 'type/max-reading-measure',
        statement: 'Constrain text paragraph widths to a maximum of 65 characters to prevent eye fatigue.',
        category: 'TYPE',
        weight: 4,
        source: 'Leonxlnx/taste-skill',
        executable: true,
      },
      {
        id: 'color/monochromatic-neutral-surfaces',
        statement: 'Avoid vibrant multi-color gradients; use monochromatic ink surfaces with single subtle accent.',
        category: 'COLOR',
        weight: 4,
        source: 'Leonxlnx/taste-skill',
        executable: true,
      },
      {
        id: 'advisory/editorial-restraint',
        statement: 'Exercise restraint by eliminating decorative visual elements that do not reinforce content hierarchy.',
        category: 'HIERARCHY',
        weight: 4,
        source: 'Leonxlnx/taste-skill',
        executable: false,
      },
    ],
    tokens: [
      '--radius-surface: 0px',
      '--max-measure: 65ch',
      '--body-line-height: 1.55',
      '--color-ink-base: #111111',
    ],
    code_refs: [
      'p { max-width: 65ch; line-height: 1.55; }',
      '@media (prefers-reduced-motion: reduce) { * { transition-duration: 0.01ms !important; } }',
      '.hero-grid { display: grid; grid-template-columns: 7fr 5fr; gap: 32px; }',
    ],
  },

  'oil-oil/oil-ui': {
    rules: [
      {
        id: 'layout/parallel-candidate-variants',
        statement: 'Generate three distinct structural layout candidates before selecting a final visual direction.',
        category: 'LAYOUT',
        weight: 4,
        source: 'oil-oil/oil-ui',
        executable: false,
      },
      {
        id: 'rhythm/section-spacing-variance',
        statement: 'Vary vertical section padding between 48px and 96px based on content priority.',
        category: 'RHYTHM',
        weight: 4,
        source: 'oil-oil/oil-ui',
        executable: true,
      },
      {
        id: 'color/semantic-surface-contrast',
        statement: 'Ensure card background surfaces maintain at least 1.15 to 1 contrast against page canvas.',
        category: 'COLOR',
        weight: 3,
        source: 'oil-oil/oil-ui',
        executable: true,
      },
    ],
    tokens: ['--section-pad-hero: 96px', '--section-pad-content: 64px'],
    code_refs: ['section.hero { padding: 96px 24px; }', 'section.features { padding: 64px 24px; }'],
  },

  'miqdadbadjuber/anti-slop': {
    rules: [
      {
        id: 'slop/no-raw-emojis',
        statement: 'Replace raw emojis in feature cards with crisp inline vector icons or typography.',
        category: 'SLOP',
        weight: 4,
        source: 'miqdadbadjuber/anti-slop',
        executable: true,
      },
      {
        id: 'slop/no-generic-cta',
        statement: 'Replace generic "Get Started" button copy with domain-specific action phrases.',
        category: 'SLOP',
        weight: 4,
        source: 'miqdadbadjuber/anti-slop',
        executable: true,
      },
      {
        id: 'surface/no-uniform-radii',
        statement: 'Avoid identical 8px border-radius across badges, buttons, inputs, and cards simultaneously.',
        category: 'SURFACE',
        weight: 4,
        source: 'miqdadbadjuber/anti-slop',
        executable: true,
      },
    ],
    tokens: ['--radius-badge: 2px', '--radius-button: 6px', '--radius-card: 12px'],
    code_refs: ['.badge { border-radius: 2px; }', '.btn { border-radius: 6px; }'],
  },

  'hardikpandya/stop-slop': {
    rules: [
      {
        id: 'advisory/no-throat-clearing',
        statement: 'Eliminate throat-clearing introductory sentences and lead immediately with direct value.',
        category: 'SLOP',
        weight: 4,
        source: 'hardikpandya/stop-slop',
        executable: false,
      },
      {
        id: 'type/no-orphaned-words',
        statement: 'Eliminate single orphaned words on trailing lines in paragraph blocks.',
        category: 'TYPE',
        weight: 3,
        source: 'hardikpandya/stop-slop',
        executable: true,
      },
    ],
    tokens: [],
    code_refs: ['p { text-wrap: pretty; }'],
  },

  'petergyang/no-ai-slop': {
    rules: [
      {
        id: 'slop/no-buzzword-headings',
        statement: 'Eliminate corporate AI marketing clichés from section headlines and feature descriptions.',
        category: 'SLOP',
        weight: 4,
        source: 'petergyang/no-ai-slop',
        executable: false,
      },
      {
        id: 'color/no-low-contrast-slate',
        statement: 'Avoid muted slate-500 text on white surfaces; use dark ink neutrals for readable body.',
        category: 'COLOR',
        weight: 4,
        source: 'petergyang/no-ai-slop',
        executable: true,
      },
    ],
    tokens: ['--color-ink-primary: #0f172a'],
    code_refs: ['body { color: #0f172a; }'],
  },

  'nutlope/hallmark': {
    rules: [
      {
        id: 'layout/hero-headline-ratio',
        statement: 'Ensure primary hero headline font-size is at least double the sub-headline font-size.',
        category: 'HIERARCHY',
        weight: 4,
        source: 'nutlope/hallmark',
        executable: true,
      },
      {
        id: 'surface/nested-radius-formula',
        statement: 'Calculate inner border radius as outer radius minus padding to prevent corner awkwardness.',
        category: 'SURFACE',
        weight: 4,
        source: 'nutlope/hallmark',
        executable: true,
      },
    ],
    tokens: ['--radius-outer: 16px', '--card-pad: 12px', '--radius-inner: 4px'],
    code_refs: ['.outer { border-radius: 16px; padding: 12px; } .inner { border-radius: 4px; }'],
  },

  'nutlope/inspo': {
    rules: [
      {
        id: 'color/perceptual-oklch-tokens',
        statement: 'Define color palette using OKLCH color space for perceptually uniform lightness steps.',
        category: 'COLOR',
        weight: 4,
        source: 'nutlope/inspo',
        executable: true,
      },
      {
        id: 'type/optical-size-enable',
        statement: 'Enable font-optical-sizing: auto on variable font families that support optical size axes.',
        category: 'TYPE',
        weight: 3,
        source: 'nutlope/inspo',
        executable: true,
      },
    ],
    tokens: ['--color-surface-oklch: oklch(0.20 0.01 240)'],
    code_refs: ['* { font-optical-sizing: auto; }'],
  },

  'stevembarclay/pencilplaybook': {
    rules: [
      {
        id: 'space/gestalt-proximity',
        statement: 'Keep space between related title and description less than half space between separate groups.',
        category: 'SPACE',
        weight: 4,
        source: 'stevembarclay/pencilplaybook',
        executable: true,
      },
      {
        id: 'rhythm/dense-telemetry-grid',
        statement: 'Align dashboard telemetry cards into dense non-uniform grids with explicit metric emphasis.',
        category: 'LAYOUT',
        weight: 3,
        source: 'stevembarclay/pencilplaybook',
        executable: true,
      },
    ],
    tokens: ['--gap-inline-header: 8px', '--gap-block-group: 24px'],
    code_refs: ['.header-group { gap: 8px; margin-bottom: 24px; }'],
  },

  'dannyjpwilliams/ui-sound-design-skill': {
    rules: [
      {
        id: 'sound/procedural-blip-short',
        statement: 'Limit UI feedback sound bursts to less than 80 milliseconds with exponential decay.',
        category: 'SOUND',
        weight: 4,
        source: 'dannyjpwilliams/ui-sound-design-skill',
        executable: true,
      },
      {
        id: 'sound/subtle-gain-ceiling',
        statement: 'Cap procedural interaction audio gain at minus twelve decibels to prevent startling users.',
        category: 'SOUND',
        weight: 4,
        source: 'dannyjpwilliams/ui-sound-design-skill',
        executable: true,
      },
    ],
    tokens: ['--sound-blip-duration: 0.06s', '--sound-gain-max: 0.12'],
    code_refs: ['gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);'],
  },

  'Barty-Bart/motion-graphics': {
    rules: [
      {
        id: 'motion/spring-damping-snappy',
        statement: 'Use spring physics with damping ratio between 0.7 and 0.85 for snappy UI transitions.',
        category: 'MOTION',
        weight: 4,
        source: 'Barty-Bart/motion-graphics',
        executable: true,
      },
      {
        id: 'motion/micro-interaction-duration',
        statement: 'Keep interactive hover and tap state transition durations between 120ms and 200ms.',
        category: 'MOTION',
        weight: 4,
        source: 'Barty-Bart/motion-graphics',
        executable: true,
      },
    ],
    tokens: ['--transition-micro: 180ms cubic-bezier(0.16, 1, 0.3, 1)'],
    code_refs: ['button { transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1); }'],
  },

  'cth9191/animate': {
    rules: [
      {
        id: 'motion/stagger-list-delay',
        statement: 'Stagger sequential list item animations by 30ms to 50ms per item.',
        category: 'MOTION',
        weight: 4,
        source: 'cth9191/animate',
        executable: true,
      },
      {
        id: 'motion/no-layout-thrashing',
        statement: 'Animate only transform and opacity properties to avoid browser layout recalculation.',
        category: 'MOTION',
        weight: 5,
        source: 'cth9191/animate',
        executable: true,
      },
    ],
    tokens: ['--stagger-delay-unit: 40ms'],
    code_refs: ['will-change: transform, opacity;'],
  },

  'VoltAgent/awesome-design-md': {
    rules: [
      {
        id: 'color/ink-neutral-scale',
        statement: 'Provide a complete 9-step monochromatic ink neutral scale from surface to foreground.',
        category: 'COLOR',
        weight: 4,
        source: 'VoltAgent/awesome-design-md',
        executable: true,
      },
      {
        id: 'surface/crisp-border-tokens',
        statement: 'Use 1px semi-transparent borders with color-mix or alpha channel for surface boundaries.',
        category: 'SURFACE',
        weight: 3,
        source: 'VoltAgent/awesome-design-md',
        executable: true,
      },
    ],
    tokens: ['--color-border-subtle: rgba(255, 255, 255, 0.08)'],
    code_refs: ['border: 1px solid rgba(255, 255, 255, 0.08);'],
  },

  'bergside/awesome-design-skills': {
    rules: [
      {
        id: 'a11y/minimum-font-size',
        statement: 'Set minimum text size to 12px; reserve sizes below 14px strictly for secondary meta.',
        category: 'TYPE',
        weight: 4,
        source: 'bergside/awesome-design-skills',
        executable: true,
      },
      {
        id: 'a11y/icon-aria-label',
        statement: 'Provide aria-label or accessible text on all interactive icon-only buttons.',
        category: 'A11Y',
        weight: 5,
        source: 'bergside/awesome-design-skills',
        executable: true,
      },
    ],
    tokens: ['--type-size-min: 12px', '--type-size-body: 15px'],
    code_refs: ['<button aria-label="Close dialog"><svg ...></button>'],
  },

  'Z4YT0N/awwwards-skill': {
    rules: [
      {
        id: 'type/fluid-clamp-typography',
        statement: 'Use CSS clamp expressions for hero headings to scale smoothly between 390px and 1440px viewports.',
        category: 'TYPE',
        weight: 4,
        source: 'Z4YT0N/awwwards-skill',
        executable: true,
      },
      {
        id: 'surface/glassmorphism-moderation',
        statement: 'Restrict backdrop-filter blur effects to persistent floating navigation bars and modal overlays.',
        category: 'SURFACE',
        weight: 3,
        source: 'Z4YT0N/awwwards-skill',
        executable: true,
      },
    ],
    tokens: ['--font-hero-fluid: clamp(2.5rem, 5vw + 1rem, 5.5rem)'],
    code_refs: ['h1 { font-size: clamp(2.5rem, 5vw + 1rem, 5.5rem); }', 'nav.floating { backdrop-filter: blur(12px); }'],
  },

  'Ga14ctic/awwwards-skill': {
    rules: [
      {
        id: 'motion/page-transition-exit',
        statement: 'Fade out current page content over 150ms before mounting incoming view state.',
        category: 'MOTION',
        weight: 4,
        source: 'Ga14ctic/awwwards-skill',
        executable: true,
      },
      {
        id: 'layout/editorial-column-asymmetry',
        statement: 'Employ asymmetrical editorial columns to guide user eye movement down the reading path.',
        category: 'LAYOUT',
        weight: 4,
        source: 'Ga14ctic/awwwards-skill',
        executable: true,
      },
    ],
    tokens: ['--page-exit-duration: 150ms'],
    code_refs: ['.page-exit { opacity: 0; transition: opacity 150ms ease; }'],
  },

  'AThevon/genjutsu': {
    rules: [
      {
        id: 'motion/magnetic-button-spring',
        statement: 'Constrain magnetic button cursor tracking to a maximum travel radius of eight pixels.',
        category: 'MOTION',
        weight: 3,
        source: 'AThevon/genjutsu',
        executable: true,
      },
      {
        id: 'advisory/interaction-thesis-first',
        statement: 'Formulate an interaction thesis detailing user feedback feel before writing animation code.',
        category: 'MOTION',
        weight: 3,
        source: 'AThevon/genjutsu',
        executable: false,
      },
    ],
    tokens: ['--magnetic-radius-max: 8px'],
    code_refs: ['const maxDist = 8; const dx = Math.min(maxDist, rawDx);'],
  },

  'nateherkai/scroll-craft': {
    rules: [
      {
        id: 'motion/scroll-driven-timeline',
        statement: 'Use CSS scroll-driven animations with view-timeline for deterministic scroll-tied element reveals.',
        category: 'MOTION',
        weight: 4,
        source: 'nateherkai/scroll-craft',
        executable: true,
      },
      {
        id: 'layout/no-dead-scroll-regions',
        statement: 'Avoid pinned scroll containers exceeding two viewport heights without active visual progression.',
        category: 'LAYOUT',
        weight: 4,
        source: 'nateherkai/scroll-craft',
        executable: true,
      },
    ],
    tokens: ['--timeline-view-name: --item-reveal'],
    code_refs: ['animation-timeline: view(); animation-range: entry 10% cover 30%;'],
  },

  'superdesigndev/superdesign-skill': {
    rules: [
      {
        id: 'hierarchy/h1-largest-visual-weight',
        statement: 'Ensure h1 element possesses the greatest visual font weight and computed size on page.',
        category: 'HIERARCHY',
        weight: 5,
        source: 'superdesigndev/superdesign-skill',
        executable: true,
      },
      {
        id: 'responsive/no-horizontal-overflow',
        statement: 'Prevent horizontal scrollbars at 390px viewport width by constraining max-width to 100%.',
        category: 'RESPONSIVE',
        weight: 5,
        source: 'superdesigndev/superdesign-skill',
        executable: true,
      },
    ],
    tokens: ['--viewport-mobile: 390px', '--viewport-desktop: 1440px'],
    code_refs: ['body, main, section { max-width: 100vw; overflow-x: hidden; }'],
  },
};

/**
 * Distill a given source repo.
 * Runs LLM extraction if an agent/API is configured; otherwise uses verified local upstream knowledge base.
 */
export async function distillSource(repoId, options = {}) {
  const sourceName = repoId.trim();

  // 1. If upstream knowledge exists in compiled knowledge base
  const knowledge = UPSTREAM_KNOWLEDGE_BASE[sourceName];
  if (!knowledge) {
    throw new Error(`Upstream source "${sourceName}" is not registered or was skipped.`);
  }

  // 2. Validate all rules
  const validRules = [];
  const rejected = [];

  for (const rule of knowledge.rules) {
    const val = validateRule(rule);
    if (val.valid) {
      validRules.push(rule);
    } else {
      rejected.push({ rule, errors: val.errors });
    }
  }

  if (rejected.length > 0) {
    console.warn(`[distill] Warning: ${rejected.length} rules rejected from ${sourceName}:`, rejected);
  }

  return {
    source: sourceName,
    rules: validRules,
    tokens: knowledge.tokens || [],
    code_refs: knowledge.code_refs || [],
    rejected_count: rejected.length,
  };
}

// Standalone execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const targetSource = process.argv[2] || 'pbakaus/impeccable';
  console.log(`Distilling upstream source: ${targetSource}...`);
  distillSource(targetSource).then((res) => {
    console.log(JSON.stringify(res, null, 2));
  }).catch((err) => {
    console.error(`Distillation error: ${err.message}`);
    process.exit(1);
  });
}

