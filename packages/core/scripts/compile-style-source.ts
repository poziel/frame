import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {parse} from '@vue/compiler-sfc';
import {compile, compileString} from 'sass';

/** Reads the CSS emitted by a maintained stylesheet or Vue style block. */
export function compileStyleSource(file: string): string {
  const [path, query] = file.split('?', 2);
  if (path!.endsWith('.scss')) return compile(path!).css;
  const source = readFileSync(path!, 'utf8');
  if (!path!.endsWith('.vue')) return source;
  const styles = parse(source, {filename: path!}).descriptor.styles;
  const index = query ? new URLSearchParams(query).get('index') : null;
  if (index !== null && (!/^\d+$/.test(index) || !styles[Number(index)])) {
    throw new Error(`Missing Vue style block ${index} in ${path}`);
  }
  return (index === null ? styles : [styles[Number(index)]!])
    .map((style) =>
      style.lang === 'scss'
        ? compileString(style.content, {url: pathToFileURL(path!)}).css
        : style.content
    )
    .join('\n');
}
