<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import {useFrame} from '../../framework/useFrame';
import { settingCommandId } from '../../framework/settings/settingsCommands';
import type {SettingDefinition, SettingValue} from '../../framework/settings/setting';
import type {FrameMenuItem} from '../navigation/generalMenu';
import SettingControl from './SettingControl.vue';
import FrameDropdownMenu from '../navigation/FrameDropdownMenu.vue';
import FrameIconButton from '../actions/FrameIconButton.vue';
const props = defineProps<{ setting: SettingDefinition }>();
const emit = defineEmits<{ update: [id: string, value: SettingValue] }>();
const frame = useFrame();
const menuOpen = ref(false);
const row = ref<HTMLElement>();
const ownedFocus = ref(false);
function owns(target: EventTarget | null) {
  if (!(target instanceof Node) || !row.value) return false;
  if (row.value.contains(target)) return true;
  return [...row.value.querySelectorAll<HTMLElement>('[aria-controls],[aria-owns]')].some(control =>
    [control.getAttribute('aria-controls'), control.getAttribute('aria-owns')].some(ids =>
      ids?.split(/\s+/).some(id => row.value!.ownerDocument.getElementById(id)?.contains(target)),
    ),
  );
}
function trackFocus(event: Event) { ownedFocus.value = owns(event.target); }
onMounted(() => {
  const document = row.value!.ownerDocument;
  ownedFocus.value = owns(document.activeElement);
  document.addEventListener('focusin', trackFocus, true);
  document.addEventListener('pointerdown', trackFocus, true);
});
onBeforeUnmount(() => {
  const document = row.value?.ownerDocument;
  document?.removeEventListener('focusin', trackFocus, true);
  document?.removeEventListener('pointerdown', trackFocus, true);
});
function focusRow(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (target.closest('button,input,textarea,select,a,label,[role="button"],[role="checkbox"],[role="slider"],[contenteditable="true"]')) return;
  (event.currentTarget as HTMLElement).focus({ preventScroll: true });
}
function choose(item: FrameMenuItem) { if (item.type !== 'separator' && item.command) void frame.commands.execute(item.command); }
const actions = computed(() => [
  { id: 'reset', label: 'Reset Setting' }, { id: 'id', label: 'Copy Setting ID' },
  { id: 'json', label: 'Copy Setting as JSON' }, { id: 'url', label: 'Copy Setting as URL' },
].map(item => ({ ...item, command: settingCommandId(props.setting.id, item.id) })));
</script>
<template>
  <div ref="row" class="settings-field-row" :class="{ modified: frame.settings.isModified(setting.id), 'menu-open': menuOpen, 'owned-focus': ownedFocus }" tabindex="-1" role="group" :aria-label="setting.label" @click="focusRow" :data-setting-id="setting.id">
    <span v-if="frame.settings.isModified(setting.id)" class="settings-modified-bar" aria-label="Modified setting" />
    <SettingControl :setting="setting" :model-value="frame.settings.read(setting.id) ?? setting.default" @update:model-value="emit('update', setting.id, $event)" />
    <div class="settings-field-actions"><FrameDropdownMenu v-model:open="menuOpen" :items="actions" :label="`Actions for ${setting.label}`" @select="choose">
      <template #trigger><FrameIconButton icon="gear" :label="`More Actions for ${setting.label}`" /></template>
    </FrameDropdownMenu></div>
  </div>
</template>
<style scoped>
.settings-field-row{position:relative;padding:var(--frame-settings-field-padding,10px 12px);margin-block:0 var(--frame-settings-field-gap,6px);margin-inline:calc(-1 * var(--frame-settings-field-inline-inset,12px) - 1px);border:1px solid transparent;border-radius:var(--frame-radius-medium);min-width:0;outline:none}
.settings-field-row:hover,.settings-field-row:focus-within,.settings-field-row.menu-open,.settings-field-row.owned-focus{background:var(--frame-settings-field-hover-background,var(--frame-list-hover-background))}
.settings-field-row:focus-within,.settings-field-row.menu-open,.settings-field-row.owned-focus{border-color:var(--frame-accent)}
.settings-modified-bar{position:absolute;inset-block:var(--frame-settings-modified-inset,8px);inset-inline-start:calc(-1 * (var(--frame-settings-modified-gap,4px) + var(--frame-settings-modified-width,2px) + 1px));width:var(--frame-settings-modified-width,2px);background:var(--frame-settings-modified-border,var(--frame-accent));border-radius:var(--frame-radius-small,2px);pointer-events:none}
.settings-field-actions{position:absolute;inset-inline-end:var(--frame-settings-field-action-inset,10px);inset-block-start:var(--frame-settings-field-action-top,10px);opacity:0}
.settings-field-row:hover .settings-field-actions,.settings-field-row:focus-within .settings-field-actions,.settings-field-row.menu-open .settings-field-actions,.settings-field-row.owned-focus .settings-field-actions{opacity:1}
.settings-field-row :deep(.setting-field){margin:0;max-width:none;gap:var(--frame-settings-control-gap,6px)}
.settings-field-row :deep(.setting-label){padding-inline-end:var(--frame-settings-field-action-space,36px);line-height:var(--frame-settings-field-title-line-height,26px);max-width:100%;box-sizing:border-box}
.settings-field-row :deep(.setting-description){margin:0;line-height:var(--frame-settings-description-line-height,1.5);white-space:normal;overflow-wrap:anywhere}
.settings-field-row :deep(.frame-check-control){border:1px solid var(--frame-control-border);background:var(--frame-control-background,var(--frame-surface))}
.settings-field-row :deep(.frame-check-control[data-state=checked]){background:var(--frame-accent);border-color:var(--frame-accent);color:var(--frame-accent-foreground)}
@media(hover:none){.settings-field-actions{opacity:1}}
</style>
