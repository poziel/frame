<script setup lang="ts">
import { ToggleGroupRoot, ToggleGroupItem } from "reka-ui";
import "../forms/controls.css";
import type { SelectItem } from "../types";
import { isSelectOption } from "../frame/select";
defineProps<{modelValue:string | string[];options:readonly SelectItem[];disabled?:boolean;label?:string;multiple?:boolean;}>(); const emit=defineEmits<{"update:modelValue":[value:string | string[]]}>();
</script>
<template><ToggleGroupRoot class="frame-choice-group" :model-value="modelValue" :multiple="multiple" :disabled="disabled" :aria-label="label" @update:model-value="emit('update:modelValue', $event as string | string[])"><template v-for="(option,index) in options" :key="isSelectOption(option) ? option.value : option.id ?? index"><ToggleGroupItem v-if="isSelectOption(option)" :value="option.value" :disabled="disabled || option.disabled" class="frame-choice-item"><span>{{option.label}}</span><small v-if="option.detail">{{option.detail}}</small></ToggleGroupItem><div v-else role="separator" class="frame-select-separator"/></template></ToggleGroupRoot></template>
