import { ref } from 'vue';
import { validateFiles, type FileSelection, type FileUploadOptions } from './files';

export function useFilePicker(
  options: FileUploadOptions & { disabled?: boolean },
  selected: (result: FileSelection) => void
) {
  const input = ref<HTMLInputElement>();
  function receive(files: readonly File[]) {
    if (!options.disabled) selected(validateFiles(files, options));
  }
  function open() { if (!options.disabled) input.value?.click(); }
  function change(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files ?? []);
    target.value = '';
    if (files.length) receive(files);
  }
  return { input, open, receive, change };
}
