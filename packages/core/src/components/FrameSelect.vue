<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { SelectRoot, SelectTrigger, SelectPortal, SelectContent, SelectViewport, SelectItem, SelectItemText, SelectSeparator } from "reka-ui";
import { isSelectOption } from "../frame/select";
import type { SelectItem as ChoiceItem } from "../types";
import { useOverlayBoundary } from "../frame/overlays";
import { encodeChoiceValue, decodeChoiceValue } from "../forms/controls";
import FrameIcon from "./FrameIcon.vue";
import OverlayScrollbars from "./OverlayScrollbars.vue";
import "../forms/controls.css";
defineOptions({inheritAttrs:false});
const props=withDefaults(defineProps<{modelValue:string;name?:string;form?:string;required?:boolean;options:readonly ChoiceItem[];label?:string;disabled?:boolean;defaultValue?:string}>(),{label:"Select an option"});
const emit=defineEmits<{"update:modelValue":[value:string]}>();
const viewport=ref<InstanceType<typeof SelectViewport>>();
const popup=computed<HTMLElement | undefined>(()=>viewport.value?.$el?.parentElement ?? undefined);
const trigger=ref<InstanceType<typeof SelectTrigger>>(), open=ref(false), description=ref<string>();
const {target,bounds}=useOverlayBoundary(()=>trigger.value?.$el);
const selected=computed(()=>props.options.find(option=>isSelectOption(option)&&option.value===props.modelValue));
const descriptions=computed(()=>props.options.filter(isSelectOption).map(option=>option.description).filter((value):value is string=>!!value));
const boundary=computed(()=>typeof document==='undefined'?undefined: typeof target.value==='string'?undefined:target.value);
watch(bounds,()=>{open.value=false;});
watch(open,value=>{if(value) description.value=selected.value && isSelectOption(selected.value) ? selected.value.description : undefined;});
</script>
<template><SelectRoot name="" :required="required" v-model:open="open" :model-value="encodeChoiceValue(modelValue)" :disabled="disabled" @update:model-value="emit('update:modelValue',decodeChoiceValue(String($event)))"><SelectTrigger ref="trigger" v-bind="$attrs" class="frame-select" :aria-label="label"><span>{{selected && isSelectOption(selected) ? selected.label : 'Select…'}}</span><FrameIcon name="chevron-down" :size="16"/></SelectTrigger><SelectPortal :to="target"><SelectContent as-child position="popper" class="frame-select-popup frame-reka-select-popup frame-select-content" :collision-boundary="boundary" :collision-padding="8" :style="{maxWidth:`${Math.max(0,bounds.width-16)}px`,maxHeight:`min(${Math.max(0,bounds.height-16)}px, var(--reka-select-content-available-height))`}"><div><SelectViewport ref="viewport" class="frame-select-options"><template v-for="(option,index) in options" :key="isSelectOption(option)?option.value:option.id ?? index"><SelectSeparator v-if="!isSelectOption(option)" class="frame-select-separator"/><SelectItem v-else class="frame-reka-select-item" :value="encodeChoiceValue(option.value)" :disabled="option.disabled" :text-value="option.label" @focus="description=option.description" @pointermove="description=option.description"><SelectItemText>{{option.label}}</SelectItemText><small v-if="option.detail">{{option.detail}}</small><small v-if="option.value===defaultValue" class="select-default">default</small></SelectItem></template></SelectViewport><div v-if="descriptions.length" class="frame-select-description"><span v-for="text in descriptions" :key="text" class="frame-select-description-measure" aria-hidden="true">{{text}}</span><span>{{description}}</span></div></div></SelectContent><OverlayScrollbars v-if="open && popup" :root="popup"/></SelectPortal></SelectRoot><input v-if="name" type="hidden" :name="name" :form="form" :value="modelValue" :disabled="disabled"/><input v-if="required" class="frame-control-validation" type="text" aria-hidden="true" tabindex="-1" :value="modelValue" :disabled="disabled" :form="form" required @invalid.prevent="trigger?.$el?.focus()"/></template>
