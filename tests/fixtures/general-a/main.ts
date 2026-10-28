import {createApp, defineComponent, h, ref} from 'vue';
import FrameAccordion from '../../../packages/core/src/components/layout/FrameAccordion.vue';
import FrameAspectRatio from '../../../packages/core/src/components/layout/FrameAspectRatio.vue';
import FrameAvatar from '../../../packages/core/src/components/data-display/FrameAvatar.vue';
import FrameCollapsible from '../../../packages/core/src/components/layout/FrameCollapsible.vue';
import FramePagination from '../../../packages/core/src/components/navigation/FramePagination.vue';
import FrameProgress from '../../../packages/core/src/components/feedback/FrameProgress.vue';
import FrameScrollArea from '../../../packages/core/src/components/layout/FrameScrollArea.vue';
import FrameSeparator from '../../../packages/core/src/components/layout/FrameSeparator.vue';
import '../../../packages/core/src/styles/index.scss';

createApp(
  defineComponent({
    setup() {
      const selected = ref<string | string[] | undefined>('one'),
        opened = ref(false),
        page = ref(1),
        progress = ref<number | null>(40);
      return () =>
        h('main', {style: {width: '480px', padding: '20px'}}, [
          h(FrameAccordion, {
            items: [
              {
                value: 'one',
                title: 'First section',
                description: 'First content',
              },
              {
                value: 'two',
                title: 'Second section',
                description: 'Second content',
              },
              {value: 'locked', title: 'Locked section', disabled: true},
            ],
            collapsible: true,
            modelValue: selected.value,
            'onUpdate:modelValue': (value: string | string[] | undefined) =>
              (selected.value = value),
          }),
          h('output', {id: 'accordion-state'}, String(selected.value)),
          h(
            'button',
            {id: 'open-first', onClick: () => (selected.value = 'one')},
            'Open first'
          ),
          h(
            FrameCollapsible,
            {
              label: 'Show details',
              open: opened.value,
              'onUpdate:open': (value: boolean) => (opened.value = value),
            },
            {default: () => h('p', 'Details body')}
          ),
          h('output', {id: 'open-state'}, String(opened.value)),
          h(FramePagination, {
            total: 100,
            itemsPerPage: 10,
            page: page.value,
            'onUpdate:page': (value: number) => (page.value = value),
          }),
          h('output', {id: 'page-state'}, String(page.value)),
          h(FramePagination, {
            id: 'disabled-pagination',
            total: 20,
            itemsPerPage: 10,
            disabled: true,
          }),
          h(FrameProgress, {
            'aria-label': 'Upload',
            modelValue: progress.value,
          }),
          h(
            'button',
            {id: 'indeterminate', onClick: () => (progress.value = null)},
            'Indeterminate'
          ),
          h(FrameAvatar, {
            fallback: 'JD',
            alt: 'Jane Doe',
            src: 'data:image/png;base64,broken',
          }),
          h(
            FrameAspectRatio,
            {ratio: 2, id: 'ratio'},
            {default: () => h('span', 'Media preview')}
          ),
          h(
            FrameScrollArea,
            {
              viewportLabel: 'History',
              type: 'always',
              style: {height: '120px'},
            },
            {
              default: () =>
                Array.from({length: 40}, (_, i) =>
                  h('p', `History item ${i + 1}`)
                ),
            }
          ),
          h(FrameSeparator, {'aria-label': 'Sections'}),
          h(FrameSeparator, {decorative: true, id: 'decorative'}),
        ]);
    },
  })
).mount('#app');
