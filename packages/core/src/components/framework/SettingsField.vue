<script setup lang="ts">
import {computed, ref, onMounted, onBeforeUnmount} from 'vue';
import {useFrame} from '../../framework/useFrame';
import {settingCommandId} from '../../framework/settings/settingsCommands';
import type {
  SettingDefinition,
  SettingValue,
} from '../../framework/settings/setting';
import type {FrameMenuItem} from '../navigation/generalMenu';
import SettingControl from './SettingControl.vue';
import FrameDropdownMenu from '../navigation/FrameDropdownMenu.vue';
import FrameIconButton from '../actions/FrameIconButton.vue';

const props = defineProps<{setting: SettingDefinition}>();
const emit = defineEmits<{update: [id: string, value: SettingValue]}>();
const frame = useFrame();
const menuOpen = ref(false);
const row = ref<HTMLElement>();
const ownedFocus = ref(false);
function owns(target: EventTarget | null) {
  if (!(target instanceof Node) || !row.value) return false;
  if (row.value.contains(target)) return true;
  return [
    ...row.value.querySelectorAll<HTMLElement>('[aria-controls],[aria-owns]'),
  ].some((control) =>
    [
      control.getAttribute('aria-controls'),
      control.getAttribute('aria-owns'),
    ].some((ids) =>
      ids
        ?.split(/\s+/)
        .some((id) =>
          row.value!.ownerDocument.getElementById(id)?.contains(target)
        )
    )
  );
}
function trackFocus(event: Event) {
  ownedFocus.value = owns(event.target);
}
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
  if (
    target.closest(
      'button,input,textarea,select,a,label,[role="button"],[role="checkbox"],[role="slider"],[contenteditable="true"]'
    )
  )
    return;
  (event.currentTarget as HTMLElement).focus({preventScroll: true});
}
function choose(item: FrameMenuItem) {
  if (item.type !== 'separator' && item.command)
    void frame.commands.execute(item.command);
}
const actions = computed(() =>
  [
    {id: 'reset', label: 'Reset Setting'},
    {id: 'id', label: 'Copy Setting ID'},
    {id: 'json', label: 'Copy Setting as JSON'},
    {id: 'url', label: 'Copy Setting as URL'},
  ].map((item) => ({
    ...item,
    command: settingCommandId(props.setting.id, item.id),
  }))
);
</script>
<template>
  <div
    ref="row"
    class="settings-field-row"
    :class="{
      modified: frame.settings.isModified(setting.id),
      'menu-open': menuOpen,
      'owned-focus': ownedFocus,
    }"
    tabindex="-1"
    role="group"
    :aria-label="setting.label"
    @click="focusRow"
    :data-setting-id="setting.id"
  >
    <span
      v-if="frame.settings.isModified(setting.id)"
      class="settings-modified-bar"
      aria-label="Modified setting"
    />
    <SettingControl
      :setting="setting"
      :model-value="frame.settings.read(setting.id) ?? setting.default"
      @update:model-value="emit('update', setting.id, $event)"
    />
    <div class="settings-field-actions"
      ><FrameDropdownMenu
        v-model:open="menuOpen"
        :items="actions"
        :label="`Actions for ${setting.label}`"
        @select="choose"
      >
        <template #trigger
          ><FrameIconButton
            icon="gear"
            :label="`More Actions for ${setting.label}`"
        /></template> </FrameDropdownMenu
    ></div>
  </div>
</template>
<style lang="scss" scoped>
.settings-field-row {
  position: relative;
  /* Internal spacing for .settings-field-row. @token --frame-settings-field-padding */
  --_frame-default-settings-field-padding-c395d74736: 10px 12px;
  padding: var(
    --frame-settings-field-padding,
    var(--_frame-default-settings-field-padding-c395d74736)
  );
  /* Value of margin-block for .settings-field-row. @token --frame-settings-field-gap */
  --_frame-default-settings-field-gap-45777b6bf5: 6px;
  margin-block: 0
    var(
      --frame-settings-field-gap,
      var(--_frame-default-settings-field-gap-45777b6bf5)
    );
  /* Value of margin-inline for .settings-field-row. @token --frame-settings-field-inline-inset */
  --_frame-default-settings-field-inline-inset-3378ff4371: 12px;
  margin-inline: calc(
    -1 *
      var(
        --frame-settings-field-inline-inset,
        var(--_frame-default-settings-field-inline-inset-3378ff4371)
      ) -
      1px
  );
  border: 1px solid transparent;
  /* Medium shared corner radius used by ordinary controls. @token --frame-radius-medium @context */
  border-radius: var(--frame-radius-medium);
  min-width: 0;
  outline: none;
}
.settings-field-row:hover,
.settings-field-row:focus-within,
.settings-field-row.menu-open,
.settings-field-row.owned-focus {
  /* Background for .settings-field-row:hover, .settings-field-row:focus-within, .settings-field-row.menu-open, .settings-field-row.owned-focus. @token --frame-settings-field-hover-background */
  --_frame-default-settings-field-hover-background-aca162f780: var(
    --frame-list-hover-background
  );
  background: var(
    --frame-settings-field-hover-background,
    var(--_frame-default-settings-field-hover-background-aca162f780)
  );
}
.settings-field-row:focus-within,
.settings-field-row.menu-open,
.settings-field-row.owned-focus {
  /* Shared interaction color for keyboard focus, active actions, and accent-filled controls. @token --frame-accent @context */
  border-color: var(--frame-accent);
}
.settings-modified-bar {
  position: absolute;
  /* Value of inset-block for .settings-modified-bar. @token --frame-settings-modified-inset */
  --_frame-default-settings-modified-inset-e2216865c6: 8px;
  inset-block: var(
    --frame-settings-modified-inset,
    var(--_frame-default-settings-modified-inset-e2216865c6)
  );
  /* Value of inset-inline-start for .settings-modified-bar. @token --frame-settings-modified-gap */
  --_frame-default-settings-modified-gap-e114143f94: 4px;
  /* Value of inset-inline-start for .settings-modified-bar. @token --frame-settings-modified-width */
  --_frame-default-settings-modified-width-6c0513ae7b: 2px;
  inset-inline-start: calc(
    -1 *
      (
        var(
            --frame-settings-modified-gap,
            var(--_frame-default-settings-modified-gap-e114143f94)
          ) +
          var(
            --frame-settings-modified-width,
            var(--_frame-default-settings-modified-width-6c0513ae7b)
          ) +
          1px
      )
  );
  /* Width for .settings-modified-bar. @token --frame-settings-modified-width */
  --_frame-default-settings-modified-width-b67a874693: 2px;
  width: var(
    --frame-settings-modified-width,
    var(--_frame-default-settings-modified-width-b67a874693)
  );
  /* Background for .settings-modified-bar. @token --frame-settings-modified-border */
  --_frame-default-settings-modified-border-fc00eb25d7: var(--frame-accent);
  background: var(
    --frame-settings-modified-border,
    var(--_frame-default-settings-modified-border-fc00eb25d7)
  );
  /* Corner radius for .settings-modified-bar. @token --frame-radius-small */
  --_frame-default-radius-small-b1006bb6d0: 2px;
  border-radius: var(
    --frame-radius-small,
    var(--_frame-default-radius-small-b1006bb6d0)
  );
  pointer-events: none;
}
.settings-field-actions {
  position: absolute;
  /* Value of inset-inline-end for .settings-field-actions. @token --frame-settings-field-action-inset */
  --_frame-default-settings-field-action-inset-a24b21f35e: 10px;
  inset-inline-end: var(
    --frame-settings-field-action-inset,
    var(--_frame-default-settings-field-action-inset-a24b21f35e)
  );
  /* Value of inset-block-start for .settings-field-actions. @token --frame-settings-field-action-top */
  --_frame-default-settings-field-action-top-2e0e42c403: 10px;
  inset-block-start: var(
    --frame-settings-field-action-top,
    var(--_frame-default-settings-field-action-top-2e0e42c403)
  );
  opacity: 0;
}
.settings-field-row:hover .settings-field-actions,
.settings-field-row:focus-within .settings-field-actions,
.settings-field-row.menu-open .settings-field-actions,
.settings-field-row.owned-focus .settings-field-actions {
  opacity: 1;
}
.settings-field-row :deep(.setting-field) {
  margin: 0;
  max-width: none;
  /* Space between children for .settings-field-row :deep(.setting-field). @token --frame-settings-control-gap */
  --_frame-default-settings-control-gap-7900a7372f: 6px;
  gap: var(
    --frame-settings-control-gap,
    var(--_frame-default-settings-control-gap-7900a7372f)
  );
}
.settings-field-row :deep(.setting-label) {
  /* Value of padding-inline-end for .settings-field-row :deep(.setting-label). @token --frame-settings-field-action-space */
  --_frame-default-settings-field-action-space-325849bd45: 36px;
  padding-inline-end: var(
    --frame-settings-field-action-space,
    var(--_frame-default-settings-field-action-space-325849bd45)
  );
  /* Text line height for .settings-field-row :deep(.setting-label). @token --frame-settings-field-title-line-height */
  --_frame-default-settings-field-title-line-height-d0ea02c658: 26px;
  line-height: var(
    --frame-settings-field-title-line-height,
    var(--_frame-default-settings-field-title-line-height-d0ea02c658)
  );
  max-width: 100%;
  box-sizing: border-box;
}
.settings-field-row :deep(.setting-description) {
  margin: 0;
  /* Text line height for .settings-field-row :deep(.setting-description). @token --frame-settings-description-line-height */
  --_frame-default-settings-description-line-height-ecf6e8f952: 1.5;
  line-height: var(
    --frame-settings-description-line-height,
    var(--_frame-default-settings-description-line-height-ecf6e8f952)
  );
  white-space: normal;
  overflow-wrap: anywhere;
}
.settings-field-row :deep(.frame-check-control) {
  /* Resting border color of form controls, independently overridable from menu borders. @token --frame-control-border @context */
  border: 1px solid var(--frame-control-border); /* Background for .settings-field-row :deep(.frame-check-control). @token --frame-control-background */
  --_frame-default-control-background-da7f1b6e0b: var(--frame-surface);
  background: var(
    --frame-control-background,
    var(--_frame-default-control-background-da7f1b6e0b)
  );
}
.settings-field-row :deep(.frame-check-control[data-state='checked']) {
  /* Shared interaction color for keyboard focus, active actions, and accent-filled controls. @token --frame-accent @context */
  background: var(--frame-accent);
  border-color: var(--frame-accent);
  /* Readable text and icon foreground on accent-filled surfaces. @token --frame-accent-foreground @context */
  color: var(--frame-accent-foreground);
}
@media (hover: none) {
  .settings-field-actions {
    opacity: 1;
  }
}
</style>
