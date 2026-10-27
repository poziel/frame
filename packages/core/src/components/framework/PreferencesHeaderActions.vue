<script setup lang="ts">
import {computed} from 'vue';
import {useFrame} from '../../framework/useFrame';
import FrameIconButton from '../actions/FrameIconButton.vue';

const props = defineProps<{
  kind: 'settings' | 'keybindings';
  inModal?: boolean;
}>();
const frame = useFrame();
const page = computed(() => frame[props.kind]);
const label = computed(() =>
  props.kind === 'settings' ? 'Settings' : 'Keyboard Shortcuts'
);
const canTab = computed(() =>
  props.kind === 'settings'
    ? frame.canOpenSettingsInTab.value
    : frame.canOpenKeybindingsInTab.value
);
function toggle() {
  if (page.value.mode.value === 'json') page.value.showForm();
  else if (props.kind === 'settings') frame.openSettingsJSON();
  else frame.openKeybindingsJSON();
}
function move() {
  if (props.kind === 'settings') {
    if (props.inModal) frame.openSettingsInTab();
    else frame.openSettingsInModal();
  } else if (props.inModal) frame.openKeybindingsInTab();
  else frame.openKeybindingsInModal();
}
</script>
<template>
  <FrameIconButton
    v-if="page.mode.value === 'json'"
    icon="save"
    label="Save"
    :disabled="!page.json.dirty.value || page.json.saving.value"
    @click="page.json.save()"
  />
  <FrameIconButton
    v-if="page.editor.value"
    :icon="page.mode.value === 'json' ? 'settings-gear' : 'go-to-file'"
    :label="`Open ${label} (${page.mode.value === 'json' ? 'UI' : 'JSON'})`"
    :disabled="page.json.saving.value"
    @click="toggle"
  />
  <FrameIconButton
    v-if="!inModal || canTab"
    :icon="inModal ? 'open-preview' : 'multiple-windows'"
    :label="`Open ${label} in ${inModal ? 'Editor Tab' : 'Modal'}`"
    :disabled="page.json.saving.value"
    @click="move"
  />
</template>
