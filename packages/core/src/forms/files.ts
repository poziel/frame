export interface FileUploadOptions {
  accept?: string;
  multiple?: boolean;
  /** Maximum bytes per file. */
  maxSize?: number;
  /** Maximum accepted files per selection. */
  maxFiles?: number;
}
export interface FileRejection {
  file: File;
  code: 'type' | 'size' | 'count';
  message: string;
}
export interface FileSelection {
  accepted: File[];
  rejected: FileRejection[];
}
export function validateFiles(files: readonly File[], options: FileUploadOptions = {}): FileSelection {
  const accepted: File[] = [], rejected: FileRejection[] = [];
  const rules = (options.accept ?? '').split(',').map(rule => rule.trim().toLowerCase()).filter(Boolean);
  const limit = options.multiple ? Math.max(0, Math.floor(options.maxFiles ?? Infinity)) : Math.min(1, Math.max(0, Math.floor(options.maxFiles ?? 1)));
  for (const file of files) {
    const type = file.type.toLowerCase().split(';')[0]!.trim(), name = file.name.toLowerCase();
    let code: FileRejection['code'] | undefined;
    if (rules.length && !rules.some(rule => rule.startsWith('.') ? name.endsWith(rule) : rule.endsWith('/*') ? type.startsWith(rule.slice(0, -1)) : type === rule)) code = 'type';
    else if (options.maxSize !== undefined && file.size > options.maxSize) code = 'size';
    else if (accepted.length >= limit) code = 'count';
    if (code) rejected.push({ file, code, message: code === 'type' ? `${file.name}: file type is not accepted.` : code === 'size' ? `${file.name}: file exceeds the size limit.` : `${file.name}: file count limit reached.` });
    else accepted.push(file);
  }
  return { accepted, rejected };
}
