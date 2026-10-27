import { describe, expect, test } from 'bun:test';
import { detectViewerType, isViewerText, sniffViewerType, viewerFileName } from '../packages/core/src/modules/viewer/services/viewer';

describe('portable viewer file detection', () => {
  test('unlabelled blobs use common image, SVG, PDF, and video signatures', () => {
    expect(sniffViewerType(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]))?.kind).toBe('image');
    expect(sniffViewerType(new TextEncoder().encode('<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"/>'))?.hasSource).toBe(true);
    expect(sniffViewerType(new TextEncoder().encode('%PDF-1.4'))?.kind).toBe('pdf');
    expect(sniffViewerType(new Uint8Array([0, 0, 0, 20, 102, 116, 121, 112, 105, 115, 111, 109]))?.kind).toBe('video');
    expect(sniffViewerType(new Uint8Array([0, 1, 2]))).toBeUndefined();
  });
  test('SVG opens as an image with XML source', () => {
    expect(detectViewerType('drawing.SVG')).toEqual({ kind: 'image', language: 'xml', hasSource: true });
    expect(detectViewerType('download', 'image/svg+xml; charset=utf-8').hasSource).toBe(true);
  });
  test('routes documents and media, leaving Office formats unsupported', () => {
    for (const [name, kind] of [['paper.pdf', 'pdf'], ['movie.webm', 'video'], ['picture.png', 'image'], ['notes.txt', 'text'], ['report.docx', 'unsupported'], ['sheet.xlsx', 'unsupported'], ['slides.pptx', 'unsupported']])
      expect(detectViewerType(name!).kind).toBe(kind);
  });
  test('programming files retain language and allow host override', () => {
    expect(detectViewerType('main.rs').language).toBe('rust');
    expect(detectViewerType('component.vue').language).toBe('vue');
    expect(detectViewerType('script', '', 'python')).toEqual({ kind: 'code', language: 'python', hasSource: false });
    expect(detectViewerType('data', 'application/json').language).toBe('json');
  });
  test('gets names from files and URLs, respecting explicit metadata', () => {
    expect(viewerFileName({ source: new File(['hello'], 'hello.txt') })).toBe('hello.txt');
    expect(viewerFileName({ source: 'https://example.org/a%20b.svg?token=secret#page' })).toBe('a b.svg');
    expect(viewerFileName({ source: new Blob(), name: 'given.txt' })).toBe('given.txt');
  });
  test('unknown binary content is not treated as plain text', () => {
    expect(isViewerText(new Uint8Array([0, 1, 2]))).toBe(false);
    expect(isViewerText(new Uint8Array([255, 254]))).toBe(false);
    expect(isViewerText(new TextEncoder().encode('Hello\n世界'))).toBe(true);
  });
});
