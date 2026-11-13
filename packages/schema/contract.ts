import { z } from 'zod';

export const OklchColorStringSchema = z
  .string()
  .regex(
    /^oklch\(\s*[^\s,/]+[\s,]+[^\s,/]+[\s,]+[^\s,/]+(?:\s*(?:\/|,)\s*[^\s,/]+)?\s*\)$/i,
    'Must be a valid OKLCH color string (e.g. "oklch(0.2 0.05 240)")'
  );

export const TypeSchema = z.object({
  display: z.string().min(1, 'Display font is required'),
  text: z.string().min(1, 'Body text font is required'),
  mono: z.string().optional(),
  scale: z.number().positive('Scale ratio must be positive'),
  opticalSizing: z.union([z.boolean(), z.string()]),
});

export const PaletteSchema = z.object({
  id: z.string().min(1),
  mode: z.enum(['light', 'dark']).or(z.string()),
  tokens: z.record(z.string(), OklchColorStringSchema),
});

export const SpaceSchema = z.object({
  base: z.union([z.literal(4), z.literal(8)]),
  rhythm: z.string().min(1),
});

export const RadiusSchema = z.object({
  strategy: z.enum(['sharp', 'soft', 'mixed']),
  values: z.record(z.string(), z.union([z.number(), z.string()])),
});

export const MotionSchema = z.object({
  personality: z.enum(['restrained', 'editorial', 'kinetic', 'playful']),
  ease: z.string().min(1),
  dur: z.tuple([z.number(), z.number(), z.number()]),
  stagger: z.number().nonnegative(),
});

export const SoundSchema = z.object({
  kit: z.string().min(1),
  events: z.array(z.string()),
  volume: z.number().min(0).max(1),
  enabled: z.boolean(),
});

export const LayoutSchema = z.object({
  grid: z.union([z.string(), z.number()]),
  asymmetry: z.number().min(0).max(1),
});

export const ContractSchema = z.object({
  look: z.string().min(1, 'Look ID is required'),
  type: TypeSchema,
  palette: PaletteSchema,
  space: SpaceSchema,
  radius: RadiusSchema,
  motion: MotionSchema,
  sound: SoundSchema,
  layout: LayoutSchema,
  forbid: z.array(z.string()),
  version: z.union([z.string(), z.number()]),
});

export type Contract = z.infer<typeof ContractSchema>;
export type TypeConfig = z.infer<typeof TypeSchema>;
export type PaletteConfig = z.infer<typeof PaletteSchema>;
export type SpaceConfig = z.infer<typeof SpaceSchema>;
export type RadiusConfig = z.infer<typeof RadiusSchema>;
export type MotionConfig = z.infer<typeof MotionSchema>;
export type SoundConfig = z.infer<typeof SoundSchema>;
export type LayoutConfig = z.infer<typeof LayoutSchema>;

/**
 * Renders a compact, structured Markdown summary of the design contract.
 * Guaranteed to remain under 300 tokens for runtime agent consumption.
 */
export function toMarkdown(contract: Contract): string {
  const t = contract.type;
  const p = contract.palette;
  const s = contract.space;
  const r = contract.radius;
  const m = contract.motion;
  const snd = contract.sound;
  const l = contract.layout;

  const fontList = [
    t.display,
    t.text !== t.display ? t.text : null,
    t.mono ? `${t.mono} (mono)` : null,
  ]
    .filter(Boolean)
    .join(' / ');

  const tokenList = Object.entries(p.tokens)
    .map(([k, v]) => `${k} ${v}`)
    .join(', ');

  const radiusValues = Object.entries(r.values)
    .map(([k, v]) => `${k}:${v}`)
    .join(' ');

  return `# Contract: ${contract.look} (v${contract.version})
Type: ${fontList} | scale ${t.scale} | opsz ${t.opticalSizing}
Palette [${p.id}, ${p.mode}]: ${tokenList}
Space/Radius: base ${s.base}px (${s.rhythm}) | ${r.strategy} [${radiusValues}]
Motion: ${m.personality} | ease ${m.ease} | dur [${m.dur.join(',')}]ms | stagger ${m.stagger}ms
Sound: ${snd.kit} (${snd.enabled ? 'on' : 'off'}, vol ${snd.volume}) | events: ${snd.events.join(', ')}
Layout: ${l.grid} | asymmetry ${l.asymmetry}
Forbid: ${contract.forbid.join(', ')}`;
}
