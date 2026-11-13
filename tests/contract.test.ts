import { describe, it, expect } from 'vitest';
import { encode } from 'gpt-tokenizer';
import {
  ContractSchema,
  toMarkdown,
  Contract,
} from '../packages/schema/contract.js';

describe('Contract Schema & toMarkdown', () => {
  const sampleContract: Contract = {
    look: 'nocturne-editorial',
    version: '0.1.0',
    type: {
      display: 'Newsreader',
      text: 'Source Serif 4',
      mono: 'JetBrains Mono',
      scale: 1.333,
      opticalSizing: true,
    },
    palette: {
      id: 'nocturne-dark',
      mode: 'dark',
      tokens: {
        bg: 'oklch(0.18 0.02 45)',
        surface: 'oklch(0.24 0.025 45)',
        border: 'oklch(0.35 0.025 45)',
        fg: 'oklch(0.94 0.02 65)',
        fgMuted: 'oklch(0.72 0.03 60)',
        accent: 'oklch(0.75 0.14 55)',
      },
    },
    space: {
      base: 4,
      rhythm: 'print',
    },
    radius: {
      strategy: 'mixed',
      values: {
        none: '0px',
        sm: '2px',
        md: '4px',
        lg: '8px',
        full: '9999px',
      },
    },
    motion: {
      personality: 'editorial',
      ease: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
      dur: [180, 360, 720],
      stagger: 35,
    },
    sound: {
      kit: 'mechanical-silent',
      events: ['open', 'close'],
      volume: 0.15,
      enabled: false,
    },
    layout: {
      grid: '12-col',
      asymmetry: 0.35,
    },
    forbid: [
      'pure-black (#000000)',
      'neon-gradients',
      'pill-buttons',
      'symmetrical-3-column-cards',
    ],
  };

  it('validates a complete contract schema successfully', () => {
    const parsed = ContractSchema.parse(sampleContract);
    expect(parsed.look).toBe('nocturne-editorial');
    expect(parsed.space.base).toBe(4);
    expect(parsed.motion.dur).toHaveLength(3);
  });

  it('rejects an invalid contract with malformed OKLCH or invalid space base', () => {
    const invalidContract = {
      ...sampleContract,
      space: { base: 12, rhythm: 'dense' }, // base must be 4 | 8
    };
    expect(() => ContractSchema.parse(invalidContract)).toThrow();

    const badColorContract = {
      ...sampleContract,
      palette: {
        ...sampleContract.palette,
        tokens: { bg: '#123456' }, // must be OKLCH string
      },
    };
    expect(() => ContractSchema.parse(badColorContract)).toThrow();
  });

  it('renders a concise markdown summary and strictly respects the <= 300 token budget', () => {
    const md = toMarkdown(sampleContract);
    expect(md).toContain('# Contract: nocturne-editorial');
    expect(md).toContain('Palette [nocturne-dark, dark]');

    const tokenCount = encode(md).length;
    // Non-negotiable invariant: contract summary <= 300 tokens
    expect(tokenCount).toBeLessThanOrEqual(300);
  });
});

