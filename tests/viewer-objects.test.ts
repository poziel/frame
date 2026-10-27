import {expect, spyOn, test} from 'bun:test';
import {ViewerController} from '../packages/core/src/modules/viewer/controllers/viewerController';

test('viewer classes preserve text, SVG source, and unsupported binary behavior', async () => {
  const viewer = new ViewerController();
  const {load, dispose} = viewer;
  try {
    await load({source: new Blob(['Hello']), name: 'notes.txt'});
    expect(viewer.type.value?.kind).toBe('text');
    expect(viewer.text.value).toBe('Hello');
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"/>';
    viewer.sourceMode.value = true;
    await load({source: new Blob([svg]), name: 'drawing.svg'});
    expect(viewer.sourceMode.value).toBe(false);
    expect(viewer.type.value?.hasSource).toBe(true);
    expect(viewer.blob.value?.type).toBe('image/svg+xml');
    expect(viewer.text.value).toBe(svg);
    await load({source: new Blob([new Uint8Array([0, 1, 2])])});
    expect(viewer.type.value?.kind).toBe('unsupported');
    expect(viewer.text.value).toBe('');
    expect(viewer.busy.value).toBe(false);
  } finally {
    dispose();
  }
});

test('superseding a fetch aborts it and ignores late successful results', async () => {
  let resolve!: (response: Response) => void;
  let signal: AbortSignal | undefined;
  const fetch = spyOn(globalThis, 'fetch').mockImplementation(
    (_url, options) => {
      signal = options?.signal ?? undefined;
      return new Promise<Response>((done) => {
        resolve = done;
      });
    }
  );
  const viewer = new ViewerController();
  try {
    const pending = viewer.load({source: 'https://example.test/old.txt'});
    await viewer.load({source: new Blob(['new']), name: 'new.txt'});
    const current = viewer.url.value;
    expect(signal?.aborted).toBe(true);
    resolve(new Response('old'));
    await pending;
    expect(viewer.text.value).toBe('new');
    expect(viewer.url.value).toBe(current);
  } finally {
    viewer.dispose();
    fetch.mockRestore();
  }
});

test('superseded failures do not replace current content or emit errors', async () => {
  let reject!: (error: unknown) => void;
  const errors: unknown[] = [];
  const fetch = spyOn(globalThis, 'fetch').mockImplementation(
    () =>
      new Promise<Response>((_resolve, fail) => {
        reject = fail;
      })
  );
  const viewer = new ViewerController({onError: (error) => errors.push(error)});
  try {
    const pending = viewer.load({source: 'https://example.test/old'});
    await viewer.load({source: new Blob(['current']), name: 'current.txt'});
    reject(new Error('old failure'));
    await pending;
    expect(errors).toEqual([]);
    expect(viewer.failure.value).toBe('');
    expect(viewer.text.value).toBe('current');
  } finally {
    viewer.dispose();
    fetch.mockRestore();
  }
});

test('file limits apply to supplied bytes and declared response lengths', async () => {
  const errors: unknown[] = [];
  const viewer = new ViewerController({onError: (error) => errors.push(error)});
  const fetch = spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response('body', {headers: {'content-length': '20'}})
  );
  try {
    await viewer.load({source: new Blob(['oversize'])}, 2);
    expect(viewer.failure.value).toBe('File exceeds the viewer size limit.');
    await viewer.load({source: 'https://example.test/file'}, 2);
    expect(errors).toHaveLength(2);
    expect(viewer.blob.value).toBeUndefined();
    expect(viewer.url.value).toBe('');
    expect(viewer.busy.value).toBe(false);
  } finally {
    viewer.dispose();
    fetch.mockRestore();
  }
});

test('unlabelled streamed downloads cancel as soon as their byte limit is crossed', async () => {
  let cancelled = 0;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array([1, 2, 3]));
    },
    cancel() {
      cancelled++;
    },
  });
  const fetch = spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(stream)
  );
  const viewer = new ViewerController();
  try {
    await viewer.load({source: 'https://example.test/stream'}, 2);
    expect(cancelled).toBe(1);
    expect(stream.locked).toBe(false);
    expect(viewer.failure.value).toBe('File exceeds the viewer size limit.');
  } finally {
    viewer.dispose();
    fetch.mockRestore();
  }
});

test('owned URLs and videos are released once without affecting another viewer', async () => {
  const calls: string[] = [];
  const video = {
    pause: () => calls.push('pause'),
    removeAttribute: (name: string) => calls.push(name),
    load: () => calls.push('load'),
  } as unknown as HTMLVideoElement;
  const viewer = new ViewerController({video: () => video});
  const other = new ViewerController();
  const revoke = spyOn(URL, 'revokeObjectURL');
  try {
    await viewer.load({source: new Blob(['first']), name: 'first.txt'});
    await other.load({source: new Blob(['other']), name: 'other.txt'});
    const first = viewer.url.value;
    const second = other.url.value;
    viewer.dispose();
    viewer.dispose();
    expect(revoke).toHaveBeenCalledTimes(1);
    expect(revoke).toHaveBeenCalledWith(first);
    expect(calls).toEqual(['pause', 'src', 'load']);
    expect(other.text.value).toBe('other');
    expect(other.url.value).toBe(second);
    await viewer.load({source: new Blob(['ignored']), name: 'ignored.txt'});
    expect(viewer.text.value).toBe('first');
  } finally {
    viewer.dispose();
    other.dispose();
    revoke.mockRestore();
  }
});

test('disposing a pending read suppresses errors and prevents late URL allocation', async () => {
  let resolve!: (response: Response) => void;
  const errors: unknown[] = [];
  const fetch = spyOn(globalThis, 'fetch').mockImplementation(
    () =>
      new Promise<Response>((done) => {
        resolve = done;
      })
  );
  const create = spyOn(URL, 'createObjectURL');
  const viewer = new ViewerController({onError: (error) => errors.push(error)});
  try {
    const pending = viewer.load({source: 'https://example.test/file.txt'});
    viewer.dispose();
    resolve(new Response('late'));
    await pending;
    expect(create).not.toHaveBeenCalled();
    expect(errors).toEqual([]);
    expect(viewer.type.value).toBeUndefined();
  } finally {
    viewer.dispose();
    create.mockRestore();
    fetch.mockRestore();
  }
});
