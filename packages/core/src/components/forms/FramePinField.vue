<script setup lang="ts">
import FrameTextField from "./FrameTextField.vue";
import { PinInputRoot, PinInputInput } from "reka-ui";
import "./shared/controls.css";

withDefaults(defineProps<{modelValue:string[];length?:number;disabled?:boolean;label?:string;mask?:boolean;otp?:boolean}>(),{length:6}); const emit=defineEmits<{"update:modelValue":[value:string[]]}>();
</script>
<template><PinInputRoot class="frame-pin-input" :model-value="modelValue" :disabled="disabled" :mask="mask" :otp="otp" :aria-label="label" @update:model-value="emit('update:modelValue', ($event ?? []).map(String))"><PinInputInput v-for="i in length" :key="i" :index="i-1" as-child><FrameTextField class="frame-pin-entry" :aria-label="`${label ?? 'Code'} ${i}`" /></PinInputInput></PinInputRoot></template>
