<script setup lang="ts">
import { ref } from "vue";
import { Primitive } from "reka-ui";
import FrameIcon from "./FrameIcon.vue";
withDefaults(defineProps<{ variant?: "ghost" | "primary" | "secondary"; label?: string; icon?: string; disabled?: boolean; type?: "button" | "submit" | "reset" }>(), { variant: "ghost", type: "button" });
const emit = defineEmits<{ click: [event: MouseEvent] }>();
const element = ref<HTMLButtonElement>();
defineExpose({ element, focus: () => element.value?.focus() });
</script>
<template><Primitive as-child><button ref="element" class="frame-button" :class="variant" :type="type" :disabled="disabled" @click="emit('click', $event)"><FrameIcon v-if="icon" :name="icon" :size="16"/><slot>{{ label }}</slot></button></Primitive></template>
