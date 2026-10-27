import type {ViewerFile, ViewerType} from '../types/viewerTypes';

export type {
  ViewerSource,
  ViewerFile,
  ViewerKind,
  ViewerType,
} from '../types/viewerTypes';

/** Known extensions mapped to syntax languages without loading a renderer. */
const languages: Record<string, string> = {
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  jsx: 'jsx',
  ts: 'typescript',
  tsx: 'tsx',
  vue: 'vue',
  svelte: 'svelte',
  py: 'python',
  rs: 'rust',
  go: 'go',
  java: 'java',
  c: 'c',
  h: 'c',
  cpp: 'cpp',
  hpp: 'cpp',
  cs: 'csharp',
  rb: 'ruby',
  php: 'php',
  swift: 'swift',
  kt: 'kotlin',
  json: 'json',
  jsonc: 'jsonc',
  css: 'css',
  scss: 'scss',
  html: 'html',
  htm: 'html',
  xml: 'xml',
  svg: 'xml',
  md: 'markdown',
  mdx: 'mdx',
  yaml: 'yaml',
  yml: 'yaml',
  toml: 'toml',
  sql: 'sql',
  sh: 'bash',
  bash: 'bash',
  ps1: 'powershell',
  bat: 'bat',
  diff: 'diff',
  graphql: 'graphql',
  dockerfile: 'dockerfile',
  makefile: 'makefile',
  ini: 'ini',
  conf: 'ini',
  tex: 'latex',
};
/** Resolves a display name without retaining query strings or credentials. */
export function viewerFileName(file: ViewerFile): string {
  if (file.name) return file.name;
  if (typeof File !== 'undefined' && file.source instanceof File)
    return file.source.name;
  if (typeof file.source === 'string' || file.source instanceof URL) {
    try {
      return decodeURIComponent(
        new URL(String(file.source), 'https://viewer.invalid').pathname
          .split('/')
          .pop() || 'Document'
      );
    } catch {
      return 'Document';
    }
  }
  return 'Document';
}
/** Chooses a renderer from metadata without reading or executing source content. */
export function detectViewerType(
  name: string,
  mimeType = '',
  language?: string
): ViewerType {
  const mime = mimeType.split(';')[0]!.trim().toLowerCase();
  const extension = name.toLowerCase().split('.').pop()!;
  const resolved = language ?? languages[extension] ?? 'text';
  if (
    mime.startsWith('image/') ||
    /^(png|jpe?g|gif|webp|avif|bmp|ico|svg|tiff?|heic|heif)$/.test(extension)
  )
    return {
      kind: 'image',
      language: 'xml',
      hasSource: mime === 'image/svg+xml' || extension === 'svg',
    };
  if (mime === 'application/pdf' || extension === 'pdf')
    return {kind: 'pdf', language: 'text', hasSource: false};
  if (
    mime.startsWith('video/') ||
    /^(mp4|webm|ogv|ogg|mov|m4v|mkv|avi)$/.test(extension)
  )
    return {kind: 'video', language: 'text', hasSource: false};
  if (
    language ||
    languages[extension] ||
    /(?:json|javascript|typescript|xml|yaml)/.test(mime)
  )
    return {
      kind: 'code',
      language:
        resolved === 'text'
          ? mime.includes('json')
            ? 'json'
            : mime.includes('xml')
              ? 'xml'
              : 'javascript'
          : resolved,
      hasSource: false,
    };
  if (mime.startsWith('text/') || /^(txt|log|csv|tsv)$/.test(extension))
    return {kind: 'text', language: 'text', hasSource: false};
  return {kind: 'unsupported', language: 'text', hasSource: false};
}
/** Conservative fallback for unlabelled UTF-8 text; never renders it as HTML. */
export function isViewerText(bytes: Uint8Array): boolean {
  if (
    bytes.some(
      (byte) => byte === 0 || (byte < 32 && ![9, 10, 12, 13].includes(byte))
    )
  )
    return false;
  try {
    new TextDecoder('utf-8', {fatal: true}).decode(bytes, {stream: true});
    return true;
  } catch {
    return false;
  }
}

/** Identify common unlabelled blobs from a small prefix, without decoding binary as text. */
export function sniffViewerType(bytes: Uint8Array): ViewerType | undefined {
  const ascii = new TextDecoder().decode(bytes);
  const starts = (...signature: number[]) =>
    signature.every((byte, index) => bytes[index] === byte);
  if (ascii.startsWith('%PDF-'))
    return {kind: 'pdf', language: 'text', hasSource: false};
  if (
    starts(137, 80, 78, 71, 13, 10, 26, 10) ||
    starts(255, 216, 255) ||
    /^GIF8[79]a/.test(ascii) ||
    /^RIFF[\s\S]{4}WEBP/.test(ascii) ||
    starts(66, 77) ||
    starts(0, 0, 1, 0) ||
    starts(73, 73, 42, 0) ||
    starts(77, 77, 0, 42)
  )
    return {kind: 'image', language: 'text', hasSource: false};
  if (
    /^(?:\s|\uFEFF)*(?:<\?xml[\s\S]*?\?>\s*)?(?:<!--[\s\S]*?-->\s*)*<svg(?:\s|>)/i.test(
      ascii
    )
  )
    return {kind: 'image', language: 'xml', hasSource: true};
  if (ascii.slice(4, 8) === 'ftyp') {
    const image = /^(avif|avis|heic|heix|mif1)$/.test(ascii.slice(8, 12));
    return {
      kind: image ? 'image' : 'video',
      language: 'text',
      hasSource: false,
    };
  }
  if (isViewerText(bytes))
    return {kind: 'text', language: 'text', hasSource: false};
  return undefined;
}
