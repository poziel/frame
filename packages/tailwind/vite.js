import tailwind from '@tailwindcss/vite';
import {FrameTailwindSources} from './src/frameTailwindSources.js';

/**
 * Creates independent source-injection and Tailwind compiler plugins for Vite.
 * @param {Parameters<typeof tailwind>[0]} [options] - Upstream compiler options.
 */
export default function frameTailwind(options) {
  return [new FrameTailwindSources(), ...tailwind(options)];
}
