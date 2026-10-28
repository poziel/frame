<script setup lang="ts">
import {ref} from 'vue';
import FrameButton from '../actions/FrameButton.vue';

withDefaults(
  defineProps<{
    /** Optional introductory text displayed above the showcase title. */
    eyebrow?: string;
    /** Visible heading and accessible name for this presentation. */
    title: string;
    /** Supporting text displayed below the title. */
    description: string;
    /** Explanation displayed in the showcase usage section. */
    usage: string;
    /** Code sample displayed verbatim and copied by the Copy code action. */
    code: string;
    /** Whether the live preview section is displayed; defaults to true. */
    showPreview?: boolean;
    /** Optional property reference rows rendered in the usage table. */
    properties?: readonly {
      name: string;
      description: string;
      type?: string;
      reference?: string;
    }[];
  }>(),
  {showPreview: true}
);
const copied = ref('');
async function copy(code: string) {
  try {
    await navigator.clipboard.writeText(code);
    copied.value = 'Copied';
  } catch {
    copied.value = 'Select the example text to copy it.';
  }
}
defineSlots<{
  /** Interactive preview content. */ default?(): unknown;
  /** Navigation content below the introduction. */ navigation?(): unknown;
  /** Controls above the interactive preview. */ controls?(): unknown;
  /** Live feedback below the preview. */ feedback?(): unknown;
  /** Replaces a property row's type display. */ 'property-type'?(
    props: {
    property: {
      name: string;
      description: string;
      type?: string;
      reference?: string;
    };
  }
  ): unknown;
}>();
</script>
<template>
  <article class="component-showcase"
    ><header
      ><p v-if="eyebrow" class="showcase-eyebrow">{{ eyebrow }}</p
      ><h1>{{ title }}</h1
      ><p>{{ description }}</p></header
    ><slot name="navigation" /><section
      v-if="showPreview !== false"
      aria-label="Live preview"
      class="showcase-section"
      ><div class="showcase-section-heading"
        ><h2>Try it</h2><slot name="controls" /></div
      ><div class="showcase-preview"><slot /></div
      ><div class="showcase-feedback" aria-live="polite"
        ><slot name="feedback" /></div></section
    ><section class="showcase-section"
      ><h2>How it works</h2><p>{{ usage }}</p
      ><table v-if="properties?.length"
        ><thead
          ><tr><th>Property / API</th><th>Type</th><th>Behavior</th></tr></thead
        ><tbody
          ><tr v-for="property in properties" :key="property.name"
            ><td
              ><code>{{ property.name }}</code></td
            ><td
              ><slot name="property-type" :property="property"
                ><code>{{ property.type }}</code></slot
              ></td
            ><td>{{ property.description }}</td></tr
          ></tbody
        ></table
      ></section
    ><section class="showcase-section"
      ><div class="showcase-section-heading"
        ><h2>Code example</h2
        ><FrameButton @click="copy(code)">Copy code</FrameButton></div
      >><pre><code>{{ code }}</code></pre
      ><p role="status">{{ copied }}</p></section
    ></article
  >
</template>
