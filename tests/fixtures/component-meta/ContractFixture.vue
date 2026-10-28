<script setup lang="ts">
import {ref} from 'vue';
import type {InheritedProps} from './inherited';

const props = withDefaults(
  defineProps<
    InheritedProps & {
      /** Per-instance initial entries; factory must remain an expression. */
      entries?: string[];
      /** Contextual omission behavior. @defaultValue active theme */
      context?: string;
      /** Demonstrates a contradiction between a documented and declared default.
       * @defaultValue false
       */
      conflict?: boolean;
      /** Boolean casting must preserve a deliberate undefined default. */
      optionalBoolean?: boolean;
      /** A Boolean/string union still has Vue Boolean absence casting. */
      booleanOrString?: boolean | string;
      undescribed?: string;
    }
  >(),
  {entries: () => ['initial'], conflict: true, optionalBoolean: undefined}
);
defineEmits<{
  /** Updated text value. */
  (event: 'update:modelValue', value: string): void;
  /** Submission without a payload. */
  (event: 'submit'): void;
}>();
defineSlots<{
  /** Content receives the application-owned identifier. */
  default(props: {id: string}): unknown;
}>();
const element = ref<HTMLDivElement>();
/** Converts text or a number to its display string. */
function convert(value: string): string;
function convert(value: number): string;
function convert(value: string | number): string {
  return String(value);
}
defineExpose({
  /** Root element; undefined before mount and unwrapped on component refs. */
  element,
  convert,
});
</script>
<template>
  <div ref="element"><slot :id="props.id" /></div>
</template>
