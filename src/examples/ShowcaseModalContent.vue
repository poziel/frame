<script setup lang="ts">
import { ref } from "vue";
import FrameTextInput from "../components/FrameTextInput.vue";
import FrameButton from "../components/FrameButton.vue";
import { useFrame } from "../frame/createFrame";
const frame = useFrame(); const value = ref<string | number>("");
</script>
<template><div class="showcase-modal-content"><h2>A modal with your own content</h2><p>Drag the header, resize an edge, maximize, or press Escape. Background content stays inactive until you close this dialog.</p><label for="modal-example-note">Try a note</label><FrameTextInput id="modal-example-note" v-model="value" placeholder="This state belongs to the modal…"/><FrameButton variant="primary" @click="frame.closeModal()">Done</FrameButton></div></template>
