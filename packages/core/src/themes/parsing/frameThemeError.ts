/**
 * Reports invalid theme metadata, token paths, values, or serialized documents.
 * The field path is retained separately so import UI can identify the failing
 * input while the message provides a readable explanation.
 */
export class FrameThemeError extends Error {

  /** Field or token path identifying the invalid input. */
  readonly path: string;

  /** Builds a path-qualified validation error without changing the input. */
  constructor(path: string, reason: string) {
    super(`${path}: ${reason}`);
    this.name = 'FrameThemeError';
    this.path = path;
  }
}

/** Throws a validation error identifying the failing field or token path. */
export function themeError(path: string, reason: string): never {
  throw new FrameThemeError(path, reason);
}
/** Requires a plain data object before reading untrusted theme properties. */
export function themeObject(
  value: unknown,
  path: string
): Record<string, unknown> {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    ![Object.prototype, null].includes(Object.getPrototypeOf(value))
  )
    themeError(path, 'expected a plain object');
  return value as Record<string, unknown>;
}
