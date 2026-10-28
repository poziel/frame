<script setup lang="ts">
import {computed, onBeforeUnmount, ref, watch} from 'vue';
import ComponentPreview from '../examples/ComponentPreview.vue';
import DemoSurface from '../examples/documentation/DemoSurface.vue';
import {createDemoState} from '../examples/documentation/demoState';
import {componentDocumentation} from '../examples/documentation/registry';
import previews from './previews.json';

/** Resolves only explicitly registered live-example IDs from Markdown. */
const props = defineProps<{id: string}>();
const pageId = computed(() => props.id.split('.')[0]!);
const featureId = computed(() => props.id.slice(pageId.value.length + 1));
const configuration = computed(
  () =>
    (
      previews as Record<
        string,
        Record<
          string,
          {
            variant: string;
            values?: Record<string, unknown>;
            slots?: Record<string, string>;
            preview: boolean;
          }
        >
      >
    )[pageId.value]?.[featureId.value]
);
const documentation = computed(() => componentDocumentation[pageId.value]);
const state = computed(() =>
  documentation.value
    ? createDemoState(
        documentation.value.components[0]!,
        configuration.value?.values ?? {},
        {includeModel: false}
      )
    : undefined
);
const activated = ref(pageId.value !== 'terminal');
watch(state, (_next, previous) => previous?.dispose());
onBeforeUnmount(() => state.value?.dispose());
</script>

<template>
  <div v-if="!configuration" role="alert"
    >Unknown documentation example: {{ id }}</div
  >
  <div
    v-else-if="configuration.preview"
    class="showcase-preview"
    :data-example-id="id"
  >
    <template v-if="!activated"
      ><p>Activate this example to create a terminal session.</p
      ><button type="button" @click="activated = true"
        >Activate terminal example</button
      ></template
    >
    <ComponentPreview
      v-else-if="!configuration.values"
      :id="pageId"
      :variant="configuration.variant"
    />
    <DemoSurface
      v-else-if="documentation && state"
      :contract="documentation.components[0]!"
      :values="state.props"
      :slot-values="
        configuration.slots ?? {
          default: 'Example content',
          first: 'First pane',
          second: 'Second pane',
        }
      "
      @update="state.set"
    />
  </div>
</template>
