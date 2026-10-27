<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue';
import { FormRoot, useForwardProps } from 'reka-ui';
import type { FormRootProps, FormRootEmits } from 'reka-ui';
import './shared/advanced.css';
const props=defineProps<FormRootProps>();
const emit=defineEmits<FormRootEmits>();
const instance=getCurrentInstance();
const rootProps=useForwardProps(props);
const forwarded=computed(()=>({...rootProps.value,onSubmit:(event:SubmitEvent)=>emit('submit',event),...(instance?.vnode.props?.onFormSubmit ? {onFormSubmit:(
  values:Record<string,unknown>,
  event:SubmitEvent
)=>emit('formSubmit',values,event)}:{})}));
</script>
<template><FormRoot v-bind="forwarded" class="frame-form"><slot /></FormRoot></template>
