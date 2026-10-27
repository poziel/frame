import type {HostFile, HostFileOptions, HostFiles} from './host';

/**
 * Creates a temporary browser file input for each explicit selection request.
 * Each request releases its input and listeners on selection, cancellation, or
 * opening failure. The caller owns the selected File objects after completion.
 */
export class BrowserHostFiles implements HostFiles {

  /**
   * Requests file selection directly from a user interaction.
   *
   * @returns Selected browser files, or an empty array on cancellation.
   * @throws If no document exists or opening the browser picker fails.
   */
  pick(options: HostFileOptions = {}): Promise<readonly HostFile[]> {
    return new Promise((resolve, reject) => {
      if (typeof document === 'undefined') {
        reject(new Error('File selection requires a browser document'));
        return;
      }
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = options.multiple ?? false;
      input.accept = options.accept ?? '';
      input.style.display = 'none';
      const cleanup = () => {
        input.removeEventListener('change', changed);
        input.removeEventListener('cancel', cancelled);
        input.remove();
      };
      const finish = (files: readonly HostFile[]) => {
        cleanup();
        resolve(files);
      };
      const changed = () =>
        finish(
          Array.from(input.files ?? [], (file) => ({name: file.name, file}))
        );
      const cancelled = () => finish([]);
      input.addEventListener('change', changed, {once: true});
      input.addEventListener('cancel', cancelled, {once: true});
      document.body.appendChild(input);
      try {
        input.click();
      } catch (error) {
        cleanup();
        reject(error);
      }
    });
  }
}
