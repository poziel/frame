<script setup lang="ts">
import {ref} from 'vue';
import FrameButton from '../actions/FrameButton.vue';

withDefaults(
  defineProps<{
    eyebrow?: string;
    title: string;
    description: string;
    usage: string;
    code: string;
    showPreview?: boolean;
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

<style lang="scss">
.component-showcase {
  width: var(--frame-component-showcase-width, 100%);
  max-width: var(--frame-component-showcase-max-width, 960px);
  margin: var(--frame-component-showcase-margin, 0 auto);
  padding: var(--frame-component-showcase-padding, 36px 36px 48px);
  flex: 0 0 auto;
  font-size: var(--frame-component-showcase-font-size, 13px);
  line-height: var(--frame-component-showcase-line-height, 1.6);
}
.component-showcase h1 {
  font-size: var(--frame-component-showcase-h1-font-size, 30px);
  line-height: var(--frame-component-showcase-h1-line-height, 1.2);
  font-weight: var(--frame-component-showcase-h1-font-weight, 500);
  margin: var(--frame-component-showcase-h1-margin, 5px 0 14px);
}
.component-showcase header > p:last-child,
.showcase-section > p {
  color: var(--frame-component-showcase-header-p-last-child-color, #a5adb1);
}
.showcase-eyebrow {
  color: var(--frame-showcase-eyebrow-color, #8e9496);
  letter-spacing: var(--frame-showcase-eyebrow-letter-spacing, 1.4px);
  font-size: var(--frame-showcase-eyebrow-font-size, 10px);
}
.showcase-section {
  margin-top: var(--frame-showcase-section-margin-top, 30px);
}
.showcase-section h2 {
  margin: var(--frame-showcase-section-h2-margin, 0 0 12px);
  font-size: var(--frame-showcase-section-h2-font-size, 16px);
  font-weight: var(--frame-showcase-section-h2-font-weight, 500);
}
.showcase-section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--frame-showcase-section-heading-gap, 10px);
  margin-bottom: var(--frame-showcase-section-heading-margin-bottom, 12px);
}
.showcase-section-heading h2 {
  margin: var(--frame-showcase-section-heading-h2-margin, 0);
}
.showcase-preview {
  border: 1px solid var(--frame-line);
  border-radius: var(
    --frame-showcase-preview-border-radius,
    var(--frame-radius-large)
  );
  padding: var(--frame-showcase-preview-padding, 22px);
  min-width: var(--frame-showcase-preview-min-width, 0);
  background: var(--frame-surface);
}
.showcase-feedback {
  min-height: var(--frame-showcase-feedback-min-height, 25px);
  padding: var(--frame-showcase-feedback-padding, 8px 0);
  color: var(--frame-muted);
  font-size: var(--frame-showcase-feedback-font-size, 11px);
}
.showcase-section table {
  width: var(--frame-showcase-section-table-width, 100%);
  border-collapse: collapse;
  font-size: var(--frame-showcase-section-table-font-size, 12px);
  margin-top: var(--frame-showcase-section-table-margin-top, 18px);
}
.showcase-section :is(th, td) {
  text-align: left;
  padding: var(--frame-showcase-section-is-th-padding, 9px 10px);
  border-bottom: 1px solid var(--frame-line);
  vertical-align: top;
}
.showcase-section td:first-child {
  width: var(--frame-showcase-section-td-first-child-width, 32%);
  white-space: nowrap;
}
.showcase-section pre {
  overflow: auto;
  padding: var(--frame-showcase-section-pre-padding, 18px);
  margin: var(--frame-showcase-section-pre-margin, 0);
  background: var(--frame-showcase-section-pre-background, #17191a);
  border: 1px solid var(--frame-line);
  border-radius: var(
    --frame-showcase-section-pre-border-radius,
    var(--frame-radius-medium)
  );
  font-size: var(--frame-showcase-section-pre-font-size, 12px);
  line-height: var(--frame-showcase-section-pre-line-height, 1.7);
}
.showcase-section code {
  font-family: var(
    --frame-showcase-section-code-font-family,
    Consolas,
    monospace
  );
}
@media (max-width: 700px) {
  .component-showcase {
    padding: var(--frame-component-showcase-padding-2, 24px 18px);
  }
  .showcase-preview {
    padding: var(--frame-showcase-preview-padding-2, 14px);
  }
}
</style>
