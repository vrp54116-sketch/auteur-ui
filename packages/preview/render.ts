import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { Direction, TaskBrief } from './types.js';
import { resolveTaskType, renderSubjectTemplate } from './templates.js';
import { Look, LookSchema } from '../schema/look.js';

// Embedded fallback definitions for all 5 curated looks to guarantee graceful degradation
const DEFAULT_LOOKS: Record<string, Look> = {
  'kinetic-pop': {
    id: 'kinetic-pop',
    name: 'Kinetic Pop',
    description: 'High-chroma playful UI with oversized geometric display type and spring physics.',
    type: { display: 'Syne', text: 'Plus Jakarta Sans', mono: 'Space Mono', scale: 1.414, opticalSizing: false },
    palette: {
      id: 'kinetic-electric',
      mode: 'light',
      tokens: {
        bg: 'oklch(0.97 0.015 285)',
        surface: 'oklch(1.0 0 0)',
        border: 'oklch(0.15 0.02 285)',
        fg: 'oklch(0.12 0.02 285)',
        fgMuted: 'oklch(0.40 0.03 285)',
        accent: 'oklch(0.68 0.26 350)',
      },
    },
    space: { base: 8, rhythm: 'bouncy' },
    radius: { strategy: 'soft', values: { none: '0px', sm: '8px', md: '16px', lg: '24px', full: '9999px' } },
    motion: { personality: 'playful', ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)', dur: [200, 400, 600], stagger: 50 },
    sound: { kit: 'bubble-pop', events: ['pop', 'swoosh', 'tap'], volume: 0.35, enabled: true },
    layout: { grid: 'overlap-asymmetric', asymmetry: 0.65 },
    forbid: ['monochrome-palettes', 'linear-easing', 'subtle-low-contrast-text', 'sharp-0px-radius', 'whispering-headers'],
    version: '0.1.0',
  },
  'swiss-utility': {
    id: 'swiss-utility',
    name: 'Swiss Utility',
    description: 'High-density functionalist design with neutral grotesk and sharp 0px corners.',
    type: { display: 'Inter', text: 'Inter', mono: 'Space Mono', scale: 1.2, opticalSizing: false },
    palette: {
      id: 'swiss-mono-light',
      mode: 'light',
      tokens: {
        bg: 'oklch(0.985 0.002 90)',
        surface: 'oklch(0.95 0.003 90)',
        border: 'oklch(0.2 0.005 90)',
        fg: 'oklch(0.12 0.005 90)',
        fgMuted: 'oklch(0.42 0.008 90)',
        accent: 'oklch(0.58 0.23 28)',
      },
    },
    space: { base: 4, rhythm: 'dense' },
    radius: { strategy: 'sharp', values: { none: '0px', sm: '0px', md: '0px', lg: '0px', full: '0px' } },
    motion: { personality: 'restrained', ease: 'linear', dur: [80, 150, 250], stagger: 15 },
    sound: { kit: 'minimal-click', events: ['click'], volume: 0.1, enabled: false },
    layout: { grid: 'baseline-dense', asymmetry: 0.1 },
    forbid: ['border-radius (>0px)', 'drop-shadows', 'gradient-fills', 'serif-fonts', 'centered-copy'],
    version: '0.1.0',
  },
  'nocturne-editorial': {
    id: 'nocturne-editorial',
    name: 'Nocturne Editorial',
    description: 'Warm dark publication design with optical text sizing and restrained cadence.',
    type: { display: 'Newsreader', text: 'Source Serif 4', mono: 'JetBrains Mono', scale: 1.333, opticalSizing: true },
    palette: {
      id: 'nocturne-warm-dark',
      mode: 'dark',
      tokens: {
        bg: 'oklch(0.18 0.012 60)',
        surface: 'oklch(0.24 0.015 60)',
        border: 'oklch(0.38 0.018 60)',
        fg: 'oklch(0.93 0.01 75)',
        fgMuted: 'oklch(0.72 0.015 70)',
        accent: 'oklch(0.75 0.14 75)',
      },
    },
    space: { base: 4, rhythm: 'proportional' },
    radius: { strategy: 'mixed', values: { none: '0px', sm: '2px', md: '4px', lg: '8px', full: '9999px' } },
    motion: { personality: 'editorial', ease: 'cubic-bezier(0.16, 1, 0.3, 1)', dur: [150, 300, 500], stagger: 40 },
    sound: { kit: 'warm-thud', events: ['select', 'open'], volume: 0.15, enabled: false },
    layout: { grid: 'golden-column', asymmetry: 0.38 },
    forbid: ['pure-black-0-0-0', 'neon-saturated-hues', 'sharp-transitions', 'sans-serif-body', 'dense-micro-padding'],
    version: '0.1.0',
  },
  'terminal-luxe': {
    id: 'terminal-luxe',
    name: 'Terminal Luxe',
    description: 'Monospaced CRT phosphor aesthetic with amber tones and precision grid lines.',
    type: { display: 'JetBrains Mono', text: 'JetBrains Mono', mono: 'JetBrains Mono', scale: 1.25, opticalSizing: false },
    palette: {
      id: 'terminal-amber-crt',
      mode: 'dark',
      tokens: {
        bg: 'oklch(0.12 0.008 70)',
        surface: 'oklch(0.18 0.012 70)',
        border: 'oklch(0.32 0.02 70)',
        fg: 'oklch(0.91 0.03 75)',
        fgMuted: 'oklch(0.65 0.03 75)',
        accent: 'oklch(0.78 0.18 70)',
      },
    },
    space: { base: 4, rhythm: 'strict-step' },
    radius: { strategy: 'sharp', values: { none: '0px', sm: '0px', md: '2px', lg: '2px', full: '0px' } },
    motion: { personality: 'restrained', ease: 'steps(4, jump-end)', dur: [60, 120, 200], stagger: 20 },
    sound: { kit: 'mechanical-switch', events: ['keypress', 'toggle'], volume: 0.2, enabled: true },
    layout: { grid: 'character-cell', asymmetry: 0.0 },
    forbid: ['variable-proportional-fonts', 'soft-large-radii', 'spring-physics', 'fuzzy-shadows', 'gradient-fills'],
    version: '0.1.0',
  },
  'paper-editorial': {
    id: 'paper-editorial',
    name: 'Paper Editorial',
    description: 'Tactile cream monograph with generous margins and high-contrast serifs.',
    type: { display: 'Cormorant Garamond', text: 'EB Garamond', mono: 'Space Mono', scale: 1.333, opticalSizing: true },
    palette: {
      id: 'paper-cream-linen',
      mode: 'light',
      tokens: {
        bg: 'oklch(0.97 0.012 85)',
        surface: 'oklch(0.99 0.005 85)',
        border: 'oklch(0.40 0.01 80)',
        fg: 'oklch(0.15 0.01 75)',
        fgMuted: 'oklch(0.48 0.015 75)',
        accent: 'oklch(0.55 0.17 45)',
      },
    },
    space: { base: 8, rhythm: 'book-spread' },
    radius: { strategy: 'sharp', values: { none: '0px', sm: '0px', md: '0px', lg: '2px', full: '9999px' } },
    motion: { personality: 'editorial', ease: 'cubic-bezier(0.25, 1, 0.5, 1)', dur: [180, 350, 600], stagger: 60 },
    sound: { kit: 'paper-rustle', events: ['page-turn', 'unfold'], volume: 0.1, enabled: false },
    layout: { grid: 'asymmetric-spread', asymmetry: 0.42 },
    forbid: ['dark-mode-default', 'saturated-neon-fills', 'pill-rounded-buttons', 'bouncy-springs', 'system-sans-body'],
    version: '0.1.0',
  },
};

/**
 * Resolves a Look definition by id, checking disk first then falling back to embedded defaults.
 */
export function resolveLook(lookId: string): Look {
  // Check disk
  try {
    const cwd = process.cwd();
    const diskPath = join(cwd, 'looks', lookId, 'look.json');
    if (existsSync(diskPath)) {
      const raw = readFileSync(diskPath, 'utf-8');
      return LookSchema.parse(JSON.parse(raw));
    }
  } catch {
    // Disk read failed, fallback to memory
  }

  const fallback = DEFAULT_LOOKS[lookId];
  if (fallback) return fallback;

  // Unknown look id fallback
  console.warn(`[auteur-ui] Unknown look "${lookId}", falling back to "swiss-utility".`);
  return DEFAULT_LOOKS['swiss-utility'];
}

function getFontFallback(fontName: string): string {
  const lower = fontName.toLowerCase();
  if (lower.includes('newsreader') || lower.includes('serif') || lower.includes('garamond')) {
    return "Georgia, 'Times New Roman', Cambria, serif";
  }
  if (lower.includes('mono')) {
    return "'SF Mono', Monaco, Menlo, Consolas, monospace";
  }
  return "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
}

function lookToCssVars(look: Look): string {
  const p = look.palette.tokens;
  const r = look.radius.values;
  const m = look.motion;
  const s = look.space;
  const t = look.type;

  const fontDisplayFallback = getFontFallback(t.display);
  const fontTextFallback = getFontFallback(t.text);
  const fontMonoFallback = t.mono ? getFontFallback(t.mono) : 'monospace';

  return `
    --color-bg: ${p.bg};
    --color-surface: ${p.surface};
    --color-border: ${p.border};
    --color-fg: ${p.fg};
    --color-fg-muted: ${p.fgMuted};
    --color-accent: ${p.accent};
    --font-display: '${t.display}', ${fontDisplayFallback};
    --font-text: '${t.text}', ${fontTextFallback};
    --font-mono: '${t.mono || 'JetBrains Mono'}', ${fontMonoFallback};
    --type-scale: ${t.scale};
    --radius-none: ${r.none ?? '0px'};
    --radius-sm: ${r.sm ?? '0px'};
    --radius-md: ${r.md ?? '0px'};
    --radius-lg: ${r.lg ?? '0px'};
    --radius-full: ${r.full ?? '9999px'};
    --space-base: ${s.base}px;
    --motion-ease: ${m.ease};
    --motion-dur-fast: ${m.dur[0]}ms;
    --motion-dur-normal: ${m.dur[1]}ms;
    --motion-dur-slow: ${m.dur[2]}ms;
    --motion-stagger: ${m.stagger}ms;
  `.replace(/\s+/g, ' ').trim();
}

/**
 * Renders 2-5 directions into a single, self-contained HTML preview document.
 * Contains ZERO LLM calls.
 */
export function renderDirections(directions: Direction[], task: TaskBrief): string {
  if (!directions || directions.length === 0) {
    throw new Error('renderDirections requires at least 1 direction (typically 2-5).');
  }

  const taskType = resolveTaskType(task.type || task.prompt || task.id);
  const taskTitle = task.title || task.id || 'Task Preview';
  const taskPrompt = task.prompt || `Designing UI directions for ${taskType} experience`;
  const count = directions.length;

  const panelsHtml = directions.map((dir, idx) => {
    const num = idx + 1;
    const look = resolveLook(dir.look);
    const cssVars = lookToCssVars(look);
    const subjectHtml = renderSubjectTemplate(taskType, dir);

    return `
      <section
        class="direction-panel"
        id="panel-${dir.id}"
        data-index="${num}"
        data-direction-id="${dir.id}"
        data-look="${look.id}"
        data-personality="${look.motion.personality}"
        data-sound-kit="${look.sound.kit}"
        data-sound-vol="${look.sound.volume}"
        style="${cssVars}"
        tabindex="0"
        aria-label="Direction ${num}: ${dir.headline}"
        onclick="selectPanel(${num}, '${dir.id}')"
      >
        <!-- Panel Header -->
        <div class="panel-header">
          <div class="panel-header-top">
            <span class="panel-badge-num">${num}</span>
            <div class="panel-look-info">
              <span class="panel-look-tag">${look.name}</span>
              <span class="panel-look-mode">${look.palette.mode}</span>
            </div>
          </div>
          <div class="panel-mood">“${escapeHtml(dir.mood)}”</div>
        </div>

        <!-- Subject Component Template (Identical markup across panels) -->
        <div class="panel-subject-stage">
          ${subjectHtml}
        </div>

        <!-- Panel Footer -->
        <div class="panel-footer">
          <div class="panel-id-display">
            <span class="panel-id-label">Direction ID</span>
            <code class="panel-id-code">${dir.id}</code>
          </div>
          <button
            class="panel-select-trigger"
            type="button"
            onclick="event.stopPropagation(); selectPanel(${num}, '${dir.id}')"
          >
            Select [${num}]
          </button>
        </div>
      </section>
    `;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>auteur-ui preview • ${escapeHtml(taskTitle)}</title>

  <!-- Google Fonts (Preview only, dev-time, permissive SIL OFL licenses) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600&family=Space+Mono:wght@400;700&family=Syne:wght@600;700;800&display=swap"
    rel="stylesheet"
    onerror="console.warn('[auteur-ui] External fonts unreachable or offline; falling back to documented local system stacks.')"
  >

  <style>
    /* Global Base Reset & Host Styles */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    :root {
      --host-bg: oklch(0.14 0.01 260);
      --host-surface: oklch(0.20 0.012 260);
      --host-border: oklch(0.30 0.015 260);
      --host-fg: oklch(0.96 0.005 260);
      --host-fg-muted: oklch(0.68 0.015 260);
      --host-accent: oklch(0.72 0.18 160);
      --font-host-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      --font-host-mono: 'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace;
    }

    body {
      background-color: var(--host-bg);
      color: var(--host-fg);
      font-family: var(--font-host-sans);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* Host App Header */
    .host-header {
      background-color: var(--host-surface);
      border-bottom: 1px solid var(--host-border);
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      position: sticky;
      top: 0;
      z-index: 50;
      backdrop-filter: blur(12px);
    }

    .host-branding {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .host-logo-badge {
      font-family: var(--font-host-mono);
      font-size: 11px;
      font-weight: 700;
      background: var(--host-accent);
      color: #000;
      padding: 3px 8px;
      border-radius: 4px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .host-title-group h1 {
      font-size: 16px;
      font-weight: 600;
      color: var(--host-fg);
    }

    .host-title-group p {
      font-size: 12px;
      color: var(--host-fg-muted);
    }

    .host-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .sound-toggle-btn {
      background: transparent;
      border: 1px solid var(--host-border);
      color: var(--host-fg);
      font-family: var(--font-host-mono);
      font-size: 12px;
      padding: 6px 14px;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 150ms ease;
    }

    .sound-toggle-btn:hover {
      background: var(--host-surface);
      border-color: var(--host-fg-muted);
    }

    .sound-toggle-btn.active {
      border-color: var(--host-accent);
      color: var(--host-accent);
      background: rgba(0, 255, 180, 0.05);
    }

    .host-key-hint {
      font-family: var(--font-host-mono);
      font-size: 11px;
      color: var(--host-fg-muted);
      background: rgba(255, 255, 255, 0.04);
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid var(--host-border);
    }

    /* Main Showcase Stage */
    .preview-stage {
      flex: 1;
      padding: 24px;
      display: grid;
      grid-template-columns: repeat(${count}, minmax(320px, 1fr));
      gap: 24px;
      overflow-x: auto;
      max-width: 100%;
    }

    @media (max-width: 1100px) {
      .preview-stage {
        grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
      }
    }

    /* Direction Panel Container */
    .direction-panel {
      background-color: var(--color-bg);
      color: var(--color-fg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      cursor: pointer;
      position: relative;
      outline: none;
      transition: transform var(--motion-dur-normal) var(--motion-ease),
                  box-shadow var(--motion-dur-normal) var(--motion-ease),
                  border-color var(--motion-dur-fast) var(--motion-ease);
      animation: panelIn var(--motion-dur-normal) var(--motion-ease) both;
    }

    @keyframes panelIn {
      from {
        opacity: 0;
        transform: translateY(16px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .direction-panel:focus-visible {
      box-shadow: 0 0 0 3px var(--color-accent);
    }

    /* Personality-based Hover Motion */
    .direction-panel[data-personality="restrained"]:hover {
      transform: translateY(0px);
      border-color: var(--color-accent);
    }

    .direction-panel[data-personality="editorial"]:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
    }

    .direction-panel[data-personality="kinetic"]:hover {
      transform: translateY(-5px);
      box-shadow: 0 14px 34px rgba(0, 0, 0, 0.16);
    }

    .direction-panel[data-personality="playful"]:hover {
      transform: translateY(-6px) scale(1.012);
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.20);
    }

    .direction-panel.is-selected {
      border-color: var(--color-accent) !important;
      box-shadow: 0 0 0 3px var(--color-accent), 0 12px 32px rgba(0, 0, 0, 0.25) !important;
    }

    /* Panel Header */
    .panel-header {
      padding: 16px;
      border-bottom: 1px solid var(--color-border);
      background-color: var(--color-surface);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .panel-header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .panel-badge-num {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      background-color: var(--color-accent);
      color: var(--color-bg);
      font-family: var(--font-mono);
      font-weight: 700;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    }

    .panel-look-info {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .panel-look-tag {
      font-family: var(--font-display);
      font-size: 13px;
      font-weight: 600;
      color: var(--color-fg);
    }

    .panel-look-mode {
      font-family: var(--font-mono);
      font-size: 10px;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: var(--radius-none);
      background-color: var(--color-bg);
      border: 1px solid var(--color-border);
      color: var(--color-fg-muted);
    }

    .panel-mood {
      font-family: var(--font-text);
      font-size: 12px;
      font-style: italic;
      color: var(--color-fg-muted);
      line-height: 1.4;
    }

    /* Stage Area for Subject Template */
    .panel-subject-stage {
      flex: 1;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      font-family: var(--font-text);
    }

    /* Panel Footer */
    .panel-footer {
      padding: 12px 16px;
      border-top: 1px solid var(--color-border);
      background-color: var(--color-surface);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .panel-id-display {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .panel-id-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-fg-muted);
      font-family: var(--font-mono);
    }

    .panel-id-code {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--color-fg);
      background: var(--color-bg);
      padding: 2px 6px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border);
    }

    .panel-select-trigger {
      background-color: var(--color-accent);
      color: var(--color-bg);
      border: 1px solid transparent;
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: filter var(--motion-dur-fast) var(--motion-ease),
                  transform var(--motion-dur-fast) var(--motion-ease);
    }

    .panel-select-trigger:hover {
      filter: brightness(1.1);
      transform: scale(1.03);
    }

    /* Host Persistent Footer */
    .host-footer {
      background-color: var(--host-surface);
      border-top: 1px solid var(--host-border);
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: var(--font-host-mono);
      font-size: 12px;
      color: var(--host-fg-muted);
      position: sticky;
      bottom: 0;
      z-index: 40;
    }

    .host-reply-prompt {
      color: var(--host-fg);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .host-kbd-badge {
      background: var(--host-bg);
      border: 1px solid var(--host-border);
      color: var(--host-accent);
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
    }

    /* Floating Toast */
    .toast-banner {
      position: fixed;
      bottom: 64px;
      left: 50%;
      transform: translateX(-50%) translateY(30px);
      background: var(--host-surface);
      border: 1px solid var(--host-accent);
      color: var(--host-fg);
      padding: 10px 20px;
      border-radius: 8px;
      font-family: var(--font-host-mono);
      font-size: 12px;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
      opacity: 0;
      pointer-events: none;
      transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 100;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .toast-banner.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    /* ======================================================== */
    /* Subject Template Common Component Styles               */
    /* (Controlled entirely by injected CSS custom properties) */
    /* ======================================================== */

    .font-mono {
      font-family: var(--font-mono) !important;
    }

    .btn-action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 8px 16px;
      border-radius: var(--radius-sm);
      font-family: var(--font-text);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: transform var(--motion-dur-fast) var(--motion-ease),
                  filter var(--motion-dur-fast) var(--motion-ease);
    }

    .btn-action:hover {
      filter: brightness(1.1);
      transform: scale(1.02);
    }

    .btn-action.primary {
      background-color: var(--color-accent);
      color: var(--color-bg);
    }

    .btn-action.secondary {
      background-color: var(--color-surface);
      color: var(--color-fg);
      border-color: var(--color-border);
    }

    /* Template 1: Music App */
    .template-music {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .music-player-bar {
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .player-left {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .player-thumb {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-sm);
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-accent);
      flex-shrink: 0;
    }

    .player-meta {
      min-width: 0;
    }

    .player-title {
      font-family: var(--font-display);
      font-size: 14px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .player-artist {
      font-size: 11px;
      color: var(--color-fg-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .player-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      flex: 1;
      max-width: 280px;
    }

    .player-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .player-btn-icon {
      background: transparent;
      border: none;
      color: var(--color-fg-muted);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      transition: color var(--motion-dur-fast) var(--motion-ease);
    }

    .player-btn-icon:hover {
      color: var(--color-fg);
    }

    .player-play-btn {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-full);
      background-color: var(--color-accent);
      color: var(--color-bg);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform var(--motion-dur-fast) var(--motion-ease);
    }

    .player-play-btn:hover {
      transform: scale(1.08);
    }

    .player-scrubber {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .player-time {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--color-fg-muted);
    }

    .player-progress-track {
      flex: 1;
      height: 4px;
      background: var(--color-bg);
      border-radius: var(--radius-full);
      overflow: hidden;
      border: 1px solid var(--color-border);
    }

    .player-progress-fill {
      height: 100%;
      background: var(--color-accent);
      border-radius: var(--radius-full);
    }

    .music-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .section-title {
      font-family: var(--font-display);
      font-size: 14px;
      font-weight: 600;
    }

    .section-badge {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--color-fg-muted);
    }

    .track-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .track-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 10px;
      border-radius: var(--radius-sm);
      border: 1px solid transparent;
      background: var(--color-surface);
      font-size: 12px;
      transition: background var(--motion-dur-fast) var(--motion-ease);
    }

    .track-row:hover {
      border-color: var(--color-border);
      background: var(--color-bg);
    }

    .track-row.active {
      border-color: var(--color-accent);
    }

    .track-num {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--color-fg-muted);
      width: 20px;
    }

    .track-info {
      flex: 1;
      min-width: 0;
    }

    .track-name {
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .track-sub {
      font-size: 10px;
      color: var(--color-fg-muted);
    }

    .track-album {
      font-size: 11px;
      color: var(--color-fg-muted);
    }

    .track-duration {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--color-fg-muted);
    }

    .album-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .album-card {
      display: flex;
      flex-direction: column;
      gap: 6px;
      transition: transform var(--motion-dur-fast) var(--motion-ease);
    }

    .album-card:hover {
      transform: translateY(-2px);
    }

    .album-cover {
      aspect-ratio: 1;
      border-radius: var(--radius-md);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: flex-end;
      padding: 6px;
    }

    .cover-pattern {
      position: absolute;
      inset: 0;
      opacity: 0.2;
      background: radial-gradient(circle at center, var(--color-accent) 0%, transparent 70%);
    }

    .cover-tag {
      font-family: var(--font-mono);
      font-size: 9px;
      padding: 1px 4px;
      border-radius: var(--radius-none);
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      color: var(--color-accent);
      z-index: 2;
    }

    .album-title {
      font-family: var(--font-display);
      font-size: 12px;
      font-weight: 600;
      line-height: 1.2;
    }

    .album-meta {
      font-size: 10px;
      color: var(--color-fg-muted);
    }

    /* Template 2: Dashboard */
    .template-dashboard {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .stat-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .stat-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stat-label {
      font-size: 11px;
      color: var(--color-fg-muted);
      text-transform: uppercase;
      font-family: var(--font-mono);
    }

    .stat-value {
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 700;
      color: var(--color-fg);
    }

    .stat-delta {
      font-size: 11px;
      font-family: var(--font-mono);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .stat-delta.positive {
      color: var(--color-accent);
    }

    .stat-delta.neutral {
      color: var(--color-fg-muted);
    }

    .chart-box {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .chart-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .chart-title {
      font-family: var(--font-display);
      font-size: 14px;
      font-weight: 600;
    }

    .chart-sub {
      font-size: 11px;
      color: var(--color-fg-muted);
    }

    .chart-svg-wrap {
      width: 100%;
      height: 90px;
    }

    .chart-svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    .chart-axis {
      display: flex;
      justify-content: space-between;
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--color-fg-muted);
      border-top: 1px solid var(--color-border);
      padding-top: 4px;
    }

    .table-box {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      overflow: hidden;
      font-size: 11px;
    }

    .table-header-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
      padding: 8px 10px;
      background: var(--color-surface);
      font-family: var(--font-mono);
      color: var(--color-fg-muted);
      text-transform: uppercase;
      font-size: 10px;
      border-bottom: 1px solid var(--color-border);
    }

    .table-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
      padding: 8px 10px;
      align-items: center;
      border-bottom: 1px solid var(--color-border);
      background: var(--color-bg);
      transition: background var(--motion-dur-fast) var(--motion-ease);
    }

    .table-row:last-child {
      border-bottom: none;
    }

    .table-row:hover {
      background: var(--color-surface);
    }

    .method-tag {
      font-family: var(--font-mono);
      font-size: 9px;
      font-weight: 700;
      padding: 1px 4px;
      border-radius: var(--radius-sm);
    }

    .method-tag.post {
      background: rgba(255, 140, 0, 0.15);
      color: #ff9d00;
    }

    .method-tag.get {
      background: rgba(0, 200, 100, 0.15);
      color: #00d26a;
    }

    .status-pill.ok {
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--color-accent);
    }

    /* Template 3: Landing Page */
    .template-landing {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .landing-hero {
      padding: 16px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .hero-kicker {
      font-family: var(--font-mono);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-accent);
    }

    .hero-title {
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 700;
      line-height: 1.2;
    }

    .hero-sub {
      font-size: 12px;
      color: var(--color-fg-muted);
      line-height: 1.5;
    }

    .hero-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
    }

    .feature-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .feature-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .feature-icon {
      color: var(--color-accent);
    }

    .feature-title {
      font-family: var(--font-display);
      font-size: 12px;
      font-weight: 600;
    }

    .feature-text {
      font-size: 11px;
      color: var(--color-fg-muted);
      line-height: 1.4;
    }

    .terminal-block {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      overflow: hidden;
    }

    .terminal-bar {
      padding: 6px 10px;
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .terminal-dots {
      display: flex;
      gap: 4px;
    }

    .terminal-dots span {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--color-border);
    }

    .terminal-title {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--color-fg-muted);
    }

    .terminal-code {
      padding: 10px;
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--color-fg);
      background: var(--color-bg);
      overflow-x: auto;
    }

    /* Template 4: Editorial Journal */
    .template-editorial {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .editorial-header {
      border-bottom: 1px solid var(--color-border);
      padding-bottom: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .editorial-kicker {
      font-family: var(--font-mono);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-accent);
    }

    .editorial-title {
      font-family: var(--font-display);
      font-size: 22px;
      font-weight: 700;
      line-height: 1.15;
    }

    .editorial-sub {
      font-size: 13px;
      font-style: italic;
      color: var(--color-fg-muted);
      line-height: 1.4;
    }

    .editorial-meta {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--color-fg-muted);
      display: flex;
      gap: 6px;
      margin-top: 4px;
    }

    .pull-quote {
      border-left: 2px solid var(--color-accent);
      padding: 8px 12px;
      background: var(--color-surface);
      border-radius: var(--radius-none);
      display: flex;
      gap: 8px;
    }

    .quote-mark {
      font-family: var(--font-display);
      font-size: 24px;
      color: var(--color-accent);
      line-height: 1;
    }

    .quote-text {
      font-family: var(--font-display);
      font-size: 13px;
      font-style: italic;
      line-height: 1.4;
    }

    .editorial-body {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      font-size: 12px;
      line-height: 1.5;
      color: var(--color-fg);
    }

    .dropcap {
      float: left;
      font-family: var(--font-display);
      font-size: 32px;
      line-height: 0.8;
      padding-right: 6px;
      padding-top: 2px;
      color: var(--color-accent);
    }

    .editorial-plate {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .plate-inner {
      height: 70px;
      background: var(--color-surface);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .plate-grid-lines {
      position: absolute;
      inset: 0;
      opacity: 0.15;
      background-image: linear-gradient(var(--color-border) 1px, transparent 1px),
                        linear-gradient(90deg, var(--color-border) 1px, transparent 1px);
      background-size: 12px 12px;
    }

    .plate-badge {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.1em;
      color: var(--color-fg-muted);
      z-index: 2;
    }

    .plate-caption {
      padding: 8px 12px;
      background: var(--color-bg);
      border-top: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-size: 11px;
      color: var(--color-fg-muted);
    }
  </style>
</head>
<body>

  <!-- Host App Header -->
  <header class="host-header">
    <div class="host-branding">
      <span class="host-logo-badge">auteur-ui</span>
      <div class="host-title-group">
        <h1>${escapeHtml(taskTitle)}</h1>
        <p>${escapeHtml(taskPrompt)}</p>
      </div>
    </div>
    <div class="host-actions">
      <button id="sound-toggle" class="sound-toggle-btn" type="button" onclick="toggleSound()">
        <span id="sound-icon">🔇</span>
        <span id="sound-label">Sound: Off</span>
      </button>
      <span class="host-key-hint">Press 1–${count} to select</span>
    </div>
  </header>

  <!-- Showcase Panels Stage -->
  <main class="preview-stage">
    ${panelsHtml}
  </main>

  <!-- Host Sticky Footer -->
  <footer class="host-footer">
    <div class="host-reply-prompt">
      <span>Reply with <span class="host-kbd-badge">1–${count}</span> to select a direction.</span>
    </div>
    <div class="host-controls-guide">
      <span>Keyboard numbers <span class="host-kbd-badge">1</span>–<span class="host-kbd-badge">${count}</span> highlight & copy direction ID</span>
    </div>
  </footer>

  <!-- Toast Notification -->
  <div id="toast" class="toast-banner">
    <span id="toast-msg">Direction selected</span>
  </div>

  <script>
    // State
    let soundEnabled = false;
    let audioCtx = null;
    let toastTimeout = null;

    function getAudioContext() {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
        }
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    }

    function toggleSound() {
      soundEnabled = !soundEnabled;
      const btn = document.getElementById('sound-toggle');
      const icon = document.getElementById('sound-icon');
      const label = document.getElementById('sound-label');

      if (soundEnabled) {
        btn.classList.add('active');
        icon.textContent = '🔊';
        label.textContent = 'Sound: On';
        getAudioContext();
        playSound('bubble-pop', 0.2);
        showToast('Sound enabled: synthesized WebAudio blips active');
      } else {
        btn.classList.remove('active');
        icon.textContent = '🔇';
        label.textContent = 'Sound: Off';
        showToast('Sound muted');
      }
    }

    function playSound(kit, volume) {
      if (!soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const vol = ctx.createGain();
      const targetVol = (typeof volume === 'number' && !isNaN(volume)) ? volume : 0.2;
      vol.gain.setValueAtTime(targetVol * 0.4, now);
      vol.connect(ctx.destination);

      switch (kit) {
        case 'bubble-pop': {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);
          vol.gain.setValueAtTime(targetVol * 0.5, now);
          vol.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
          osc.connect(vol);
          osc.start(now);
          osc.stop(now + 0.06);
          break;
        }
        case 'minimal-click': {
          const osc = ctx.createOscillator();
          osc.type = 'square';
          osc.frequency.setValueAtTime(1200, now);
          osc.frequency.exponentialRampToValueAtTime(300, now + 0.008);
          vol.gain.setValueAtTime(targetVol * 0.4, now);
          vol.gain.exponentialRampToValueAtTime(0.001, now + 0.012);
          osc.connect(vol);
          osc.start(now);
          osc.stop(now + 0.012);
          break;
        }
        case 'warm-thud': {
          const osc = ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.exponentialRampToValueAtTime(45, now + 0.07);
          vol.gain.setValueAtTime(targetVol * 0.5, now);
          vol.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.connect(vol);
          osc.start(now);
          osc.stop(now + 0.08);
          break;
        }
        case 'mechanical-switch': {
          const osc = ctx.createOscillator();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(2400, now);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.015);
          vol.gain.setValueAtTime(targetVol * 0.35, now);
          vol.gain.exponentialRampToValueAtTime(0.001, now + 0.018);
          osc.connect(vol);
          osc.start(now);
          osc.stop(now + 0.018);
          break;
        }
        case 'paper-rustle':
        default: {
          const bufferSize = Math.floor(ctx.sampleRate * 0.05);
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(800, now);
          vol.gain.setValueAtTime(targetVol * 0.3, now);
          vol.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          noise.connect(filter);
          filter.connect(vol);
          noise.start(now);
          noise.stop(now + 0.05);
          break;
        }
      }
    }

    function showToast(message) {
      const toast = document.getElementById('toast');
      const msg = document.getElementById('toast-msg');
      msg.textContent = message;
      toast.classList.add('show');
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
      }, 2500);
    }

    function selectPanel(index, id) {
      const panels = document.querySelectorAll('.direction-panel');
      let targetPanel = null;

      panels.forEach((p) => {
        const pIdx = parseInt(p.getAttribute('data-index'), 10);
        if (pIdx === index) {
          p.classList.add('is-selected');
          targetPanel = p;
          p.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          p.classList.remove('is-selected');
        }
      });

      if (targetPanel) {
        const kit = targetPanel.getAttribute('data-sound-kit');
        const vol = parseFloat(targetPanel.getAttribute('data-sound-vol') || '0.2');
        playSound(kit, vol);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(id).then(() => {
          showToast('Selected [' + index + '] (' + id + ') — ID copied! Reply with ' + index + ' in prompt.');
        }).catch(() => {
          showToast('Selected [' + index + '] (' + id + ') — Reply with ' + index + ' in prompt.');
        });
      } else {
        showToast('Selected [' + index + '] (' + id + ') — Reply with ' + index + ' in prompt.');
      }
    }

    // Keyboard navigation: 1-5
    document.addEventListener('keydown', (e) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      const key = e.key;
      if (['1', '2', '3', '4', '5'].includes(key)) {
        const idx = parseInt(key, 10);
        const panel = document.querySelector('.direction-panel[data-index="' + idx + '"]');
        if (panel) {
          const id = panel.getAttribute('data-direction-id');
          selectPanel(idx, id);
        }
      }
    });

    // Offline Font Resilience verification
    if (window.FontFaceSet && document.fonts) {
      document.fonts.ready.catch((err) => {
        console.warn('[auteur-ui] External fonts failed to load; using local system font stack.', err);
      });
    }
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
