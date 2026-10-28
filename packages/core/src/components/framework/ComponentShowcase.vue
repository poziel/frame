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

<style lang="scss">
.component-showcase {
  /* Width for .component-showcase. @token --frame-component-showcase-width */
  --_frame-default-component-showcase-width-fc74a4ac4c: 100%;
  width: var(
    --frame-component-showcase-width,
    var(--_frame-default-component-showcase-width-fc74a4ac4c)
  ); /* Maximum width for .component-showcase. @token --frame-component-showcase-max-width */
  --_frame-default-component-showcase-max-width-ba2a4c4c33: 960px;
  max-width: var(
    --frame-component-showcase-max-width,
    var(--_frame-default-component-showcase-max-width-ba2a4c4c33)
  ); /* Outer spacing for .component-showcase. @token --frame-component-showcase-margin */
  --_frame-default-component-showcase-margin-88eadda4f9: 0 auto;
  margin: var(
    --frame-component-showcase-margin,
    var(--_frame-default-component-showcase-margin-88eadda4f9)
  ); /* Internal spacing for .component-showcase. @token --frame-component-showcase-padding */
  --_frame-default-component-showcase-padding-6081234589: 36px 36px 48px;
  padding: var(
    --frame-component-showcase-padding,
    var(--_frame-default-component-showcase-padding-6081234589)
  );
  flex: 0 0 auto;
  /* Text size for .component-showcase. @token --frame-component-showcase-font-size */
  --_frame-default-component-showcase-font-size-971c31f278: 13px;
  font-size: var(
    --frame-component-showcase-font-size,
    var(--_frame-default-component-showcase-font-size-971c31f278)
  ); /* Text line height for .component-showcase. @token --frame-component-showcase-line-height */
  --_frame-default-component-showcase-line-height-a55e6ad009: 1.6;
  line-height: var(
    --frame-component-showcase-line-height,
    var(--_frame-default-component-showcase-line-height-a55e6ad009)
  );
}
.component-showcase h1 {
  /* Text size for .component-showcase h1. @token --frame-component-showcase-h1-font-size */
  --_frame-default-component-showcase-h1-font-size-fa20c35476: 30px;
  font-size: var(
    --frame-component-showcase-h1-font-size,
    var(--_frame-default-component-showcase-h1-font-size-fa20c35476)
  ); /* Text line height for .component-showcase h1. @token --frame-component-showcase-h1-line-height */
  --_frame-default-component-showcase-h1-line-height-2e517cea94: 1.2;
  line-height: var(
    --frame-component-showcase-h1-line-height,
    var(--_frame-default-component-showcase-h1-line-height-2e517cea94)
  ); /* Text weight for .component-showcase h1. @token --frame-component-showcase-h1-font-weight */
  --_frame-default-component-showcase-h1-font-weight-0e90d4039f: 500;
  font-weight: var(
    --frame-component-showcase-h1-font-weight,
    var(--_frame-default-component-showcase-h1-font-weight-0e90d4039f)
  ); /* Outer spacing for .component-showcase h1. @token --frame-component-showcase-h1-margin */
  --_frame-default-component-showcase-h1-margin-9da0dab6fc: 5px 0 14px;
  margin: var(
    --frame-component-showcase-h1-margin,
    var(--_frame-default-component-showcase-h1-margin-9da0dab6fc)
  );
}
.component-showcase header > p:last-child,
.showcase-section > p {
  /* Foreground for .component-showcase header > p:last-child, .showcase-section > p. @token --frame-component-showcase-header-p-last-child-color */
  --_frame-default-component-showcase-header-p-last-child-color-ae33f39518: #a5adb1;
  color: var(
    --frame-component-showcase-header-p-last-child-color,
    var(
      --_frame-default-component-showcase-header-p-last-child-color-ae33f39518
    )
  );
}
.showcase-eyebrow {
  /* Foreground for .showcase-eyebrow. @token --frame-showcase-eyebrow-color */
  --_frame-default-showcase-eyebrow-color-b26386802e: #8e9496;
  color: var(
    --frame-showcase-eyebrow-color,
    var(--_frame-default-showcase-eyebrow-color-b26386802e)
  ); /* Letter spacing for .showcase-eyebrow. @token --frame-showcase-eyebrow-letter-spacing */
  --_frame-default-showcase-eyebrow-letter-spacing-736e4d77d7: 1.4px;
  letter-spacing: var(
    --frame-showcase-eyebrow-letter-spacing,
    var(--_frame-default-showcase-eyebrow-letter-spacing-736e4d77d7)
  ); /* Text size for .showcase-eyebrow. @token --frame-showcase-eyebrow-font-size */
  --_frame-default-showcase-eyebrow-font-size-f8a76e8476: 10px;
  font-size: var(
    --frame-showcase-eyebrow-font-size,
    var(--_frame-default-showcase-eyebrow-font-size-f8a76e8476)
  );
}
.showcase-section {
  /* Top outer spacing for .showcase-section. @token --frame-showcase-section-margin-top */
  --_frame-default-showcase-section-margin-top-814284f83d: 30px;
  margin-top: var(
    --frame-showcase-section-margin-top,
    var(--_frame-default-showcase-section-margin-top-814284f83d)
  );
}
.showcase-section h2 {
  /* Outer spacing for .showcase-section h2. @token --frame-showcase-section-h2-margin */
  --_frame-default-showcase-section-h2-margin-5164a02bcf: 0 0 12px;
  margin: var(
    --frame-showcase-section-h2-margin,
    var(--_frame-default-showcase-section-h2-margin-5164a02bcf)
  ); /* Text size for .showcase-section h2. @token --frame-showcase-section-h2-font-size */
  --_frame-default-showcase-section-h2-font-size-578c535dff: 16px;
  font-size: var(
    --frame-showcase-section-h2-font-size,
    var(--_frame-default-showcase-section-h2-font-size-578c535dff)
  ); /* Text weight for .showcase-section h2. @token --frame-showcase-section-h2-font-weight */
  --_frame-default-showcase-section-h2-font-weight-5ae61a3be4: 500;
  font-weight: var(
    --frame-showcase-section-h2-font-weight,
    var(--_frame-default-showcase-section-h2-font-weight-5ae61a3be4)
  );
}
.showcase-section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* Space between children for .showcase-section-heading. @token --frame-showcase-section-heading-gap */
  --_frame-default-showcase-section-heading-gap-05946b2187: 10px;
  gap: var(
    --frame-showcase-section-heading-gap,
    var(--_frame-default-showcase-section-heading-gap-05946b2187)
  ); /* Bottom outer spacing for .showcase-section-heading. @token --frame-showcase-section-heading-margin-bottom */
  --_frame-default-showcase-section-heading-margin-bottom-d51dc880da: 12px;
  margin-bottom: var(
    --frame-showcase-section-heading-margin-bottom,
    var(--_frame-default-showcase-section-heading-margin-bottom-d51dc880da)
  );
}
.showcase-section-heading h2 {
  /* Outer spacing for .showcase-section-heading h2. @token --frame-showcase-section-heading-h2-margin */
  --_frame-default-showcase-section-heading-h2-margin-eb83040838: 0;
  margin: var(
    --frame-showcase-section-heading-h2-margin,
    var(--_frame-default-showcase-section-heading-h2-margin-eb83040838)
  );
}
.showcase-preview {
  /* Neutral divider color for content boundaries, tracks, and structural separators. @token --frame-line @context */
  border: 1px solid var(--frame-line); /* Corner radius for .showcase-preview. @token --frame-showcase-preview-border-radius */
  --_frame-default-showcase-preview-border-radius-f28e8519f3: var(
    --frame-radius-large
  );
  /* Large shared corner radius used by panel and menu containers. @token --frame-radius-large @context */
  border-radius: var(
    --frame-showcase-preview-border-radius,
    var(--_frame-default-showcase-preview-border-radius-f28e8519f3)
  ); /* Internal spacing for .showcase-preview. @token --frame-showcase-preview-padding */
  --_frame-default-showcase-preview-padding-fe319a26f7: 22px;
  padding: var(
    --frame-showcase-preview-padding,
    var(--_frame-default-showcase-preview-padding-fe319a26f7)
  ); /* Minimum width for .showcase-preview. @token --frame-showcase-preview-min-width */
  --_frame-default-showcase-preview-min-width-f7d0bd8b95: 0;
  min-width: var(
    --frame-showcase-preview-min-width,
    var(--_frame-default-showcase-preview-min-width-f7d0bd8b95)
  ); /* Neutral raised surface behind grouped content and control compositions. @token --frame-surface @context */
  background: var(--frame-surface);
}
.showcase-feedback {
  /* Minimum height for .showcase-feedback. @token --frame-showcase-feedback-min-height */
  --_frame-default-showcase-feedback-min-height-5e403bc925: 25px;
  min-height: var(
    --frame-showcase-feedback-min-height,
    var(--_frame-default-showcase-feedback-min-height-5e403bc925)
  ); /* Internal spacing for .showcase-feedback. @token --frame-showcase-feedback-padding */
  --_frame-default-showcase-feedback-padding-1bef0b2a9b: 8px 0;
  padding: var(
    --frame-showcase-feedback-padding,
    var(--_frame-default-showcase-feedback-padding-1bef0b2a9b)
  ); /* Secondary foreground for descriptions, hints, and visually subordinate content. @token --frame-muted @context */
  color: var(
    --frame-muted
  ); /* Text size for .showcase-feedback. @token --frame-showcase-feedback-font-size */
  --_frame-default-showcase-feedback-font-size-e600c4faf0: 11px;
  font-size: var(
    --frame-showcase-feedback-font-size,
    var(--_frame-default-showcase-feedback-font-size-e600c4faf0)
  );
}
.showcase-section table {
  /* Width for .showcase-section table. @token --frame-showcase-section-table-width */
  --_frame-default-showcase-section-table-width-b554bf65f8: 100%;
  width: var(
    --frame-showcase-section-table-width,
    var(--_frame-default-showcase-section-table-width-b554bf65f8)
  );
  border-collapse: collapse;
  /* Text size for .showcase-section table. @token --frame-showcase-section-table-font-size */
  --_frame-default-showcase-section-table-font-size-1c64a1db8d: 12px;
  font-size: var(
    --frame-showcase-section-table-font-size,
    var(--_frame-default-showcase-section-table-font-size-1c64a1db8d)
  ); /* Top outer spacing for .showcase-section table. @token --frame-showcase-section-table-margin-top */
  --_frame-default-showcase-section-table-margin-top-e8e6f1fc16: 18px;
  margin-top: var(
    --frame-showcase-section-table-margin-top,
    var(--_frame-default-showcase-section-table-margin-top-e8e6f1fc16)
  );
}
.showcase-section :is(th, td) {
  text-align: left;
  /* Internal spacing for .showcase-section :is(th, td). @token --frame-showcase-section-is-th-padding */
  --_frame-default-showcase-section-is-th-padding-38f3aeccfa: 9px 10px;
  padding: var(
    --frame-showcase-section-is-th-padding,
    var(--_frame-default-showcase-section-is-th-padding-38f3aeccfa)
  ); /* Neutral divider color for content boundaries, tracks, and structural separators. @token --frame-line @context */
  border-bottom: 1px solid var(--frame-line);
  vertical-align: top;
}
.showcase-section td:first-child {
  /* Width for .showcase-section td:first-child. @token --frame-showcase-section-td-first-child-width */
  --_frame-default-showcase-section-td-first-child-width-d1a48eb975: 32%;
  width: var(
    --frame-showcase-section-td-first-child-width,
    var(--_frame-default-showcase-section-td-first-child-width-d1a48eb975)
  );
  white-space: nowrap;
}
.showcase-section pre {
  overflow: auto;
  /* Internal spacing for .showcase-section pre. @token --frame-showcase-section-pre-padding */
  --_frame-default-showcase-section-pre-padding-ef9c87e067: 18px;
  padding: var(
    --frame-showcase-section-pre-padding,
    var(--_frame-default-showcase-section-pre-padding-ef9c87e067)
  ); /* Outer spacing for .showcase-section pre. @token --frame-showcase-section-pre-margin */
  --_frame-default-showcase-section-pre-margin-570139d65b: 0;
  margin: var(
    --frame-showcase-section-pre-margin,
    var(--_frame-default-showcase-section-pre-margin-570139d65b)
  ); /* Background for .showcase-section pre. @token --frame-showcase-section-pre-background */
  --_frame-default-showcase-section-pre-background-77f1f57a7d: #17191a;
  background: var(
    --frame-showcase-section-pre-background,
    var(--_frame-default-showcase-section-pre-background-77f1f57a7d)
  ); /* Neutral divider color for content boundaries, tracks, and structural separators. @token --frame-line @context */
  border: 1px solid var(--frame-line); /* Corner radius for .showcase-section pre. @token --frame-showcase-section-pre-border-radius */
  --_frame-default-showcase-section-pre-border-radius-b0293d68e2: var(
    --frame-radius-medium
  );
  /* Medium shared corner radius used by ordinary controls. @token --frame-radius-medium @context */
  border-radius: var(
    --frame-showcase-section-pre-border-radius,
    var(--_frame-default-showcase-section-pre-border-radius-b0293d68e2)
  ); /* Text size for .showcase-section pre. @token --frame-showcase-section-pre-font-size */
  --_frame-default-showcase-section-pre-font-size-cd385a29a7: 12px;
  font-size: var(
    --frame-showcase-section-pre-font-size,
    var(--_frame-default-showcase-section-pre-font-size-cd385a29a7)
  ); /* Text line height for .showcase-section pre. @token --frame-showcase-section-pre-line-height */
  --_frame-default-showcase-section-pre-line-height-39606f4c77: 1.7;
  line-height: var(
    --frame-showcase-section-pre-line-height,
    var(--_frame-default-showcase-section-pre-line-height-39606f4c77)
  );
}
.showcase-section code {
  /* Font family for .showcase-section code. @token --frame-showcase-section-code-font-family */
  --_frame-default-showcase-section-code-font-family-b8984dc507:
    Consolas, monospace;
  font-family: var(
    --frame-showcase-section-code-font-family,
    var(--_frame-default-showcase-section-code-font-family-b8984dc507)
  );
}
@media (max-width: 700px) {
  .component-showcase {
    /* Internal spacing for .component-showcase. @token --frame-component-showcase-padding-2 */
    --_frame-default-component-showcase-padding-2-672e715886: 24px 18px;
    padding: var(
      --frame-component-showcase-padding-2,
      var(--_frame-default-component-showcase-padding-2-672e715886)
    );
  }
  .showcase-preview {
    /* Internal spacing for .showcase-preview. @token --frame-showcase-preview-padding-2 */
    --_frame-default-showcase-preview-padding-2-01f3cb4c9b: 14px;
    padding: var(
      --frame-showcase-preview-padding-2,
      var(--_frame-default-showcase-preview-padding-2-01f3cb4c9b)
    );
  }
}
</style>
