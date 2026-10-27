import {realpathSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

/** @typedef {import('vite').Plugin} VitePlugin */

/**
 * Owns one Vite build's application source root and Frame stylesheet identity.
 *
 * Only Frame's resolved utility stylesheet receives the source directive.
 * Instances remain independent across builds, and transformed directives retain
 * JSON escaping for paths containing spaces or special characters.
 *
 * @implements {VitePlugin}
 */
export class FrameTailwindSources {

  /** Stable Vite plugin name used for ordering and diagnostics. */
  name = 'frame-tailwind-sources';

  /** Runs source injection before the Tailwind compiler. @type {'pre'} */
  enforce = 'pre';

  /** Canonical Frame stylesheet path with portable separators. */
  #stylesheet;

  /** Current consuming project root. @type {string | undefined} */
  #root;

  /** Resolves package resources without registering runtime Frame behavior. */
  constructor() {
    this.#stylesheet = realpathSync(
      fileURLToPath(new URL('../style.css', import.meta.url))
    ).replaceAll('\\', '/');
    this.configResolved = this.configResolved.bind(this);
    this.transform = this.transform.bind(this);
  }

  /**
   * Records this build's root after Vite resolves its configuration.
   * @param {import('vite').ResolvedConfig} config - Consuming Vite configuration.
   */
  configResolved(config) {
    this.#root = config.root.replaceAll('\\', '/');
  }

  /**
   * Adds application scanning only to the canonical Frame stylesheet.
   * @param {string} code - Stylesheet source before Tailwind compilation.
   * @param {string} id - Vite resource path, possibly including a query suffix.
   */
  transform(code, id) {
    const path = id.split('?')[0];
    let resolved;
    try {
      resolved = realpathSync(path).replaceAll('\\', '/');
    } catch {
      return;
    }
    if (resolved !== this.#stylesheet) return;
    return {
      code: `${code}\n@source ${JSON.stringify(this.#root)};\n`,
      map: null,
    };
  }
}
