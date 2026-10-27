import type {HostExternal} from './host';
import {assertExternalUrl} from './externalUrl';

/** Opens validated external links using the browser's normal popup policy. */
export class BrowserHostExternal implements HostExternal {

  /**
   * Opens a supported URL without granting the new tab access to its opener.
   *
   * @throws If the protocol is unsupported or no browser window is available.
   */
  async openUrl(url: string): Promise<void> {
    assertExternalUrl(url);
    if (typeof window === 'undefined') {
      throw new Error('Opening URLs requires a browser window');
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
