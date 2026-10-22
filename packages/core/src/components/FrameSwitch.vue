<script setup lang="ts">
import { SwitchRoot, SwitchThumb, Label } from "reka-ui";
import "../forms/controls.css";
defineOptions({inheritAttrs:false});
withDefaults(defineProps<{modelValue?: boolean; disabled?: boolean; label?: string}>(), {modelValue:false});
const emit=defineEmits<{"update:modelValue":[value:boolean]}>();
</script>
<template><Label class="frame-form-inline"><SwitchRoot v-bind="$attrs" class="frame-switch" :model-value="modelValue" :disabled="disabled" @update:model-value="emit('update:modelValue',$event)"><SwitchThumb class="frame-switch-thumb"/></SwitchRoot><slot>{{label}}</slot></Label></template>
