export interface OklchColor {
  l: number; // 0 to 1
  c: number; // >= 0
  h: number; // 0 to 360 degrees
  alpha?: number; // 0 to 1
}

/**
 * Parses an OKLCH color string into its component values.
 * Supports syntax like:
 *   oklch(0.2 0.05 240)
 *   oklch(20% 0.05 240deg)
 *   oklch(0.2 0.05 240 / 0.8)
 *   oklch(0.5 0.1 none)
 */
export function parseOklch(input: string): OklchColor {
  const trimmed = input.trim();
  const match = trimmed.match(
    /^oklch\(\s*([^\s,/]+)[\s,]+([^\s,/]+)[\s,]+([^\s,/]+)(?:\s*(?:\/|,)\s*([^\s,/]+))?\s*\)$/i
  );

  if (!match) {
    throw new Error(`Invalid OKLCH color string: "${input}"`);
  }

  const [, rawL, rawC, rawH, rawA] = match;

  const l = rawL.endsWith('%') ? parseFloat(rawL) / 100 : parseFloat(rawL);
  const c = parseFloat(rawC);

  let h = 0;
  const hLower = rawH.toLowerCase();
  if (hLower !== 'none') {
    if (hLower.endsWith('deg')) {
      h = parseFloat(rawH);
    } else if (hLower.endsWith('rad')) {
      h = (parseFloat(rawH) * 180) / Math.PI;
    } else if (hLower.endsWith('turn')) {
      h = parseFloat(rawH) * 360;
    } else {
      h = parseFloat(rawH);
    }
    // Normalize hue to 0-360
    h = ((h % 360) + 360) % 360;
  }

  let alpha: number | undefined;
  if (rawA !== undefined) {
    alpha = rawA.endsWith('%') ? parseFloat(rawA) / 100 : parseFloat(rawA);
  }

  return { l, c, h, alpha };
}

/**
 * Converts an OKLCH color (L, C, H) to linear sRGB [r, g, b] clamped to [0, 1].
 * Uses standard Björn Ottosson OKLab matrix transforms.
 */
export function oklchToLinearSrgb(
  l: number,
  c: number,
  h: number
): [number, number, number] {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const lCube = l_ * l_ * l_;
  const mCube = m_ * m_ * m_;
  const sCube = s_ * s_ * s_;

  const rLinear = +4.0767416621 * lCube - 3.3077115913 * mCube + 0.2309699292 * sCube;
  const gLinear = -1.2684380046 * lCube + 2.6097574011 * mCube - 0.3413193965 * sCube;
  const bLinear = -0.0041960863 * lCube - 0.7034186147 * mCube + 1.707614701 * sCube;

  return [
    Math.max(0, Math.min(1, rLinear)),
    Math.max(0, Math.min(1, gLinear)),
    Math.max(0, Math.min(1, bLinear)),
  ];
}

/**
 * Computes WCAG 2.1 relative luminance Y from clamped linear sRGB components.
 * Formula: Y = 0.2126 * R + 0.7152 * G + 0.0722 * B
 */
export function relativeLuminance(rgbLinear: [number, number, number]): number {
  return 0.2126 * rgbLinear[0] + 0.7152 * rgbLinear[1] + 0.0722 * rgbLinear[2];
}

/**
 * Computes WCAG 2.1 contrast ratio between two colors (either OKLCH strings or pre-parsed/calculated luminances).
 * Contrast = (Y1 + 0.05) / (Y2 + 0.05) where Y1 >= Y2.
 * Range: 1:1 to 21:1.
 */
export function contrastRatio(
  color1: string | OklchColor | number,
  color2: string | OklchColor | number
): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const max = Math.max(lum1, lum2);
  const min = Math.min(lum1, lum2);

  return (max + 0.05) / (min + 0.05);
}

function getLuminance(c: string | OklchColor | number): number {
  if (typeof c === 'number') return c;
  const parsed = typeof c === 'string' ? parseOklch(c) : c;
  const rgbLinear = oklchToLinearSrgb(parsed.l, parsed.c, parsed.h);
  return relativeLuminance(rgbLinear);
}

/**
 * Evaluates whether a background / foreground color pair passes WCAG AA.
 * Normal text requires >= 4.5:1.
 * Large text (>= 18pt or >= 14pt bold) requires >= 3.0:1.
 */
export function passesWcagAa(
  bg: string | OklchColor,
  fg: string | OklchColor,
  isLargeText = false
): boolean {
  const ratio = contrastRatio(bg, fg);
  const threshold = isLargeText ? 3.0 : 4.5;
  return ratio >= threshold;
}
