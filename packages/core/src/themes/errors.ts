export class FrameThemeError extends Error {
  constructor(public readonly path: string, reason: string) {
    super(`${path}: ${reason}`); this.name = 'FrameThemeError';
  }
}
export function themeError(path: string, reason: string): never { throw new FrameThemeError(path, reason); }
export function themeObject(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) themeError(path, 'expected a plain object');
  return value as Record<string, unknown>;
}
