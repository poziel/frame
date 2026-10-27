/**
 * Validates the portable external-link protocols supported by Frame adapters.
 * Native hosts may apply additional restrictions before opening a URL.
 *
 * @throws If the URL is invalid or its protocol is unsupported.
 */
export function assertExternalUrl(url: string): void {
  if (!['https:', 'http:', 'mailto:'].includes(new URL(url).protocol)) {
    throw new Error('Unsupported external URL protocol');
  }
}
