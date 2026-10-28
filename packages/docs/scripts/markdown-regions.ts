import MarkdownIt from 'markdown-it';

/** Replaces only explicit generated regions, leaving fenced examples intact. */
export function updateGeneratedRegions(
  source: string,
  render: (kind: string, id: string) => string
): string {
  const lines = source.replaceAll('\r\n', '\n').split('\n');
  const ignored = new Set<number>();
  for (const token of new MarkdownIt().parse(source, {})) {
    if ((token.type === 'fence' || token.type === 'code_block') && token.map) {
      for (let line = token.map[0]; line < token.map[1]; line++)
        ignored.add(line);
    }
  }
  const regions: {start: number; end: number; text: string}[] = [];
  let open: {line: number; kind: string; id: string} | undefined;
  const seen = new Set<string>();
  for (let line = 0; line < lines.length; line++) {
    if (ignored.has(line)) continue;
    const text = lines[line]!.trim();
    if (text.startsWith('<!-- frame:generated')) {
      const match = text.match(
        /^<!-- frame:generated (api|styles|type)="([\w.-]+)" -->$/
      );
      if (!match || open)
        throw new Error(`Invalid generated region at line ${line + 1}`);
      const key = `${match[1]}:${match[2]}`;
      if (seen.has(key)) throw new Error(`Duplicate generated region: ${key}`);
      seen.add(key);
      open = {line, kind: match[1]!, id: match[2]!};
    } else if (text === '<!-- /frame:generated -->') {
      if (!open)
        throw new Error(
          `Unexpected generated closing marker at line ${line + 1}`
        );
      regions.push({
        start: open.line + 1,
        end: line,
        text: render(open.kind, open.id).trim(),
      });
      open = undefined;
    }
  }
  if (open)
    throw new Error(`Unclosed generated region at line ${open.line + 1}`);
  for (const region of regions.reverse())
    lines.splice(region.start, region.end - region.start, '', region.text, '');
  return lines.join('\n');
}
