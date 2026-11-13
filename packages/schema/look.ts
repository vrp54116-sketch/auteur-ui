import { z } from 'zod';
import {
  TypeSchema,
  PaletteSchema,
  SpaceSchema,
  RadiusSchema,
  MotionSchema,
  SoundSchema,
  LayoutSchema,
  Contract,
} from './contract.js';

export const LookSchema = z.object({
  id: z.string().min(1, 'Look ID is required'),
  name: z.string().min(1, 'Look name is required'),
  description: z.string().min(1, 'Description is required'),
  type: TypeSchema,
  palette: PaletteSchema,
  space: SpaceSchema,
  radius: RadiusSchema,
  motion: MotionSchema,
  sound: SoundSchema,
  layout: LayoutSchema,
  forbid: z.array(z.string()),
  version: z.union([z.string(), z.number()]).optional(),
});

export type Look = z.infer<typeof LookSchema>;

/**
 * Manifest entry schema for looks/index.json
 */
export const LookManifestEntrySchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  description: z.string().min(1),
  tags: z.array(z.string()),
  bestFor: z.string().min(1),
});

export const LookManifestSchema = z.array(LookManifestEntrySchema);
export type LookManifest = z.infer<typeof LookManifestSchema>;
export type LookManifestEntry = z.infer<typeof LookManifestEntrySchema>;

/**
 * Converts a Look into an active runtime Contract (.auteur-ui/contract.json).
 */
export function toContract(look: Look, version: string | number = '0.1.0'): Contract {
  return {
    look: look.id,
    type: look.type,
    palette: look.palette,
    space: look.space,
    radius: look.radius,
    motion: look.motion,
    sound: look.sound,
    layout: look.layout,
    forbid: look.forbid,
    version: look.version ?? version,
  };
}
