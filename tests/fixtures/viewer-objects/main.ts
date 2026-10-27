import {createApp, h, ref, shallowRef} from 'vue';
import {
  UniversalViewer,
  UniversalViewerContent,
  type ViewerFile,
} from '@frame/core/modules/viewer';
import {viewerSamplePdf} from '../../../packages/docs/src/examples/viewerSamples';

const file = shallowRef<ViewerFile>({
  source: new Blob(['Initial text']),
  name: 'notes.txt',
});
const independent: ViewerFile = {
  source: new Blob(['Independent viewer']),
  name: 'other.txt',
};
const shown = ref(true);
const open = ref(false);
const maxBytes = ref<number>();
const errors: unknown[] = [];

/** Selects local, deterministic sources without requesting a backend. */
function select(kind: string): void {
  maxBytes.value = undefined;
  if (kind === 'pdf') file.value = {source: viewerSamplePdf()};
  else if (kind === 'svg')
    file.value = {
      source: new Blob([
        '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" onload="window.viewerExecuted = true"><rect width="40" height="40" fill="red"/></svg>',
      ]),
      name: 'drawing.svg',
    };
  else if (kind === 'html')
    file.value = {
      source: new Blob(['<script>window.viewerExecuted = true</script>']),
      name: 'unsafe.html',
    };
  else if (kind === 'binary')
    file.value = {
      source: new Blob([new Uint8Array([0, 1, 2])]),
      name: 'unknown.bin',
    };
  else if (kind === 'large') {
    maxBytes.value = 2;
    file.value = {source: new Blob(['oversized']), name: 'large.txt'};
  } else file.value = {source: new Blob(['Updated text']), name: 'updated.txt'};
}

const app = createApp({
  setup: () => () =>
    h('main', [
      shown.value &&
        h(UniversalViewerContent, {
          id: 'primary',
          file: file.value,
          maxBytes: maxBytes.value,
          style: {height: '500px'},
          onError: (error: unknown) => errors.push(error),
        }),
      h(UniversalViewerContent, {id: 'independent', file: independent}),
      h(UniversalViewer, {
        file: file.value,
        open: open.value,
        'onUpdate:open': (value: boolean) => {
          open.value = value;
        },
        onError: (error: unknown) => errors.push(error),
      }),
    ]),
});
Object.assign(window, {
  viewerFixture: {
    file,
    shown,
    open,
    maxBytes,
    errors,
    select,
    unmount: () => app.unmount(),
  },
});
app.mount('#app');
