/** Public kebab-case variants mapped to the LDRS module exports. */
export const frameLoaderNames = {
  ring: 'ring',
  'ring-2': 'ring2',
  tailspin: 'tailspin',
  'line-spinner': 'lineSpinner',
  squircle: 'squircle',
  square: 'square',
  reuleaux: 'reuleaux',
  'tail-chase': 'tailChase',
  'dot-spinner': 'dotSpinner',
  spiral: 'spiral',
  bouncy: 'bouncy',
  treadmill: 'treadmill',
  'bouncy-arc': 'bouncyArc',
  waveform: 'waveform',
  hatch: 'hatch',
  hourglass: 'hourglass',
  zoomies: 'zoomies',
  'line-wobble': 'lineWobble',
  infinity: 'infinity',
  trefoil: 'trefoil',
  cardio: 'cardio',
  helix: 'helix',
  grid: 'grid',
  quantum: 'quantum',
  wobble: 'wobble',
  orbit: 'orbit',
  'chaotic-orbit': 'chaoticOrbit',
  superballs: 'superballs',
  trio: 'trio',
  momentum: 'momentum',
  'dot-wave': 'dotWave',
  leapfrog: 'leapfrog',
  'newtons-cradle': 'newtonsCradle',
  'dot-stream': 'dotStream',
  'dot-pulse': 'dotPulse',
  metronome: 'metronome',
  jelly: 'jelly',
  'jelly-triangle': 'jellyTriangle',
  mirage: 'mirage',
  ping: 'ping',
  pulsar: 'pulsar',
  ripples: 'ripples',
  miyagi: 'miyagi',
  pinwheel: 'pinwheel',
} as const satisfies Record<string, keyof typeof import('ldrs')>;

export type FrameLoaderVariant = keyof typeof frameLoaderNames;

export const frameLoaderVariants = Object.keys(
  frameLoaderNames
) as readonly FrameLoaderVariant[];

export interface FrameLoaderProps {

  /** Loader animation rendered from the supported LDRS variants. */
  variant?: FrameLoaderVariant;

  /** Largest dimension in pixels. */
  size?: number;

  /** CSS color applied to the loader animation. */
  color?: string;

  /** Animation loop duration in seconds; 0 pauses the animation. */
  speed?: number;

  /** Stroke width for line-based variants. */
  stroke?: number;

  /** Track length as a fraction from 0 to 1, for supported styles. */
  strokeLength?: number;

  /** Background track opacity from 0 to 1, for supported styles. */
  bgOpacity?: number;

  /** Accessible loading status label. */
  label?: string;

  /** Use when a surrounding loading region supplies its own status. */
  decorative?: boolean;
}

export type FrameLoadingTextPosition = 'above' | 'below' | 'left' | 'right';

export interface FrameLoadingProps extends Omit<
  FrameLoaderProps,
  'decorative'
> {

  /** Displays the overlay while retaining and disabling interaction with the underlying content. */
  active: boolean;

  /** Visible message; falls back to label or Loading…. Empty string hides the message. */
  text?: string;

  /** Placement of the message relative to the loader animation. */
  textPosition?: FrameLoadingTextPosition;

  /** Displays the animation area of the default overlay. */
  showLoader?: boolean;

  /** Displays the message area of the default overlay. */
  showText?: boolean;
}
