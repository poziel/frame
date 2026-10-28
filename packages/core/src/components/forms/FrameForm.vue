<script setup lang="ts">
import {computed, getCurrentInstance} from 'vue';
import {FormRoot, useForwardProps} from 'reka-ui';
import type {FormRootProps, FormRootEmits} from 'reka-ui';
import './styles/advanced.scss';

const props = defineProps<FormRootProps>();
const emit = defineEmits<FormRootEmits>();
const instance = getCurrentInstance();
const rootProps = useForwardProps(props);
const forwarded = computed(() => ({
  ...rootProps.value,
  onSubmit: (event: SubmitEvent) => emit('submit', event),
  ...(instance?.vnode.props?.onFormSubmit
    ? {
        onFormSubmit: (values: Record<string, unknown>, event: SubmitEvent) =>
          emit('formSubmit', values, event),
      }
    : {}),
}));

defineSlots<{
  /** Form fields and submission controls. */
  default?(): unknown;
}>();
</script>
<template>
  <FormRoot v-bind="forwarded" class="frame-form"><slot /></FormRoot>
</template>

<style lang="scss">
.frame-form {
  display: grid;
  /* Standard inset around content in panels, disclosures, and application surfaces. @token --frame-content-padding @context */
  gap: var(--frame-content-padding);
}
</style>
