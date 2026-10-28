<script setup lang="ts">
import {computed} from 'vue';

const props = defineProps<{
  /** Shortcut split at plus signs into displayed keycaps; a trailing plus is retained as a key. */
  shortcut?: string;
}>();
const keys = computed(() => {
  if (!props.shortcut) return [];
  const parts = props.shortcut.split('+');
  if (props.shortcut.endsWith('+')) {
    parts.splice(-2);
    parts.push('+');
  }
  return parts.filter(Boolean);
});
</script>
<template>
  <span
    v-if="keys.length"
    class="frame-keycap"
    role="group"
    :aria-label="shortcut"
    ><template v-for="(key, index) in keys" :key="index"
      ><span v-if="index" class="frame-keycap-join" aria-hidden="true">+</span
      ><kbd aria-hidden="true">{{ key }}</kbd></template
    ></span
  >
</template>
<style lang="scss" scoped>
.frame-keycap {
  display: inline-flex;
  align-items: center;
  /* Space between children for .frame-keycap. @token --frame-keycap-gap */
  --_frame-default-keycap-gap-e865834973: 4px;
  gap: var(--frame-keycap-gap, var(--_frame-default-keycap-gap-e865834973));
  white-space: nowrap;
  /* Text size for .frame-keycap. @token --frame-keycap-font-size */
  --_frame-default-keycap-font-size-40d6726368: 11px;
  font-size: var(
    --frame-keycap-font-size,
    var(--_frame-default-keycap-font-size-40d6726368)
  );
  line-height: 1.4;
}
.frame-keycap kbd {
  display: inline-block;
  min-width: 1em;
  text-align: center;
  /* Internal spacing for .frame-keycap kbd. @token --frame-keycap-padding */
  --_frame-default-keycap-padding-b63cad8466: 0 6px;
  padding: var(
    --frame-keycap-padding,
    var(--_frame-default-keycap-padding-b63cad8466)
  );
  /* Border for .frame-keycap kbd. @token --frame-keycap-border */
  --_frame-default-keycap-border-8be8826211: #444444;
  border: 1px solid
    var(--frame-keycap-border, var(--_frame-default-keycap-border-8be8826211));
  /* Corner radius for .frame-keycap kbd. @token --frame-keycap-radius */
  --_frame-default-keycap-radius-58b7344d27: 3px;
  border-radius: var(
    --frame-keycap-radius,
    var(--_frame-default-keycap-radius-58b7344d27)
  );
  /* Background for .frame-keycap kbd. @token --frame-keycap-background */
  --_frame-default-keycap-background-6492751e48: #2d2d2d;
  background: var(
    --frame-keycap-background,
    var(--_frame-default-keycap-background-6492751e48)
  );
  /* Foreground for .frame-keycap kbd. @token --frame-keycap-color */
  --_frame-default-keycap-color-51a26e21d4: #cccccc;
  color: var(
    --frame-keycap-color,
    var(--_frame-default-keycap-color-51a26e21d4)
  );
  font-family: inherit;
  /* Elevation shadow for .frame-keycap kbd. @token --frame-keycap-shadow */
  --_frame-default-keycap-shadow-f9da20c71d: 0 1px 0 var(--frame-border-color);
  box-shadow: var(
    --frame-keycap-shadow,
    var(--_frame-default-keycap-shadow-f9da20c71d)
  );
}
.frame-keycap-join {
  /* Secondary foreground for descriptions, hints, and visually subordinate content. @token --frame-muted @context */
  color: var(--frame-muted);
}
</style>
