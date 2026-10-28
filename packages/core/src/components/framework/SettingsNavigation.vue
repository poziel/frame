<script setup lang="ts">
import {reactive} from 'vue';
import type {SettingsSection} from '../../framework/settings/settings';
import FrameIcon from '../data-display/FrameIcon.vue';

defineProps<{sections: readonly SettingsSection[]; selected: string}>();
const emit = defineEmits<{select: [id: string]}>();
const expanded = reactive<Record<string, boolean>>({});
</script>
<template>
  <ul class="settings-tree"
    ><li v-for="section in sections" :key="section.id"
      ><button
        class="settings-category"
        :class="{selected: selected === section.id}"
        :aria-current="selected === section.id ? 'page' : undefined"
        :aria-expanded="
          section.children?.length ? !!expanded[section.id] : undefined
        "
        @click="
          emit('select', section.id);
          section.children?.length &&
            (expanded[section.id] = !expanded[section.id]);
        "
        ><FrameIcon
          v-if="section.children?.length"
          :name="expanded[section.id] ? 'chevron-down' : 'chevron-right'"
        /><span v-else class="settings-disclosure-spacer" /><span>{{
          section.title
        }}</span></button
      ><SettingsNavigation
        v-if="section.children?.length"
        v-show="expanded[section.id]"
        :sections="section.children"
        :selected="selected"
        @select="emit('select', $event)" /></li
  ></ul>
</template>

<style lang="scss">
.frame-settings .settings-tree {
  list-style: none;
  /* Outer spacing for .frame-settings .settings-tree. @token --frame-settings-settings-tree-margin */
  --_frame-default-settings-settings-tree-margin-1c355249d1: 0;
  margin: var(
    --frame-settings-settings-tree-margin,
    var(--_frame-default-settings-settings-tree-margin-1c355249d1)
  );
  /* Internal spacing for .frame-settings .settings-tree. @token --frame-settings-settings-tree-padding */
  --_frame-default-settings-settings-tree-padding-92519e00a2: 0;
  padding: var(
    --frame-settings-settings-tree-padding,
    var(--_frame-default-settings-settings-tree-padding-92519e00a2)
  );
}

.frame-settings .settings-tree .settings-tree {
  /* Left internal spacing for .frame-settings .settings-tree .settings-tree. @token --frame-settings-settings-tree-settings-tree-padding-left */
  --_frame-default-settings-settings-tree-settings-tree-padding-left-f1776fe620: 16px;
  padding-left: var(
    --frame-settings-settings-tree-settings-tree-padding-left,
    var(
      --_frame-default-settings-settings-tree-settings-tree-padding-left-f1776fe620
    )
  );
}

.frame-modal .settings-category {
  display: flex;
  align-items: center;
  /* Space between children for .frame-modal .settings-category. @token --frame-modal-settings-category-gap */
  --_frame-default-modal-settings-category-gap-ca2f1e5928: 3px;
  gap: var(
    --frame-modal-settings-category-gap,
    var(--_frame-default-modal-settings-category-gap-ca2f1e5928)
  );
  /* Width for .frame-modal .settings-category. @token --frame-modal-settings-category-width */
  --_frame-default-modal-settings-category-width-e659e8053b: 100%;
  width: var(
    --frame-modal-settings-category-width,
    var(--_frame-default-modal-settings-category-width-e659e8053b)
  );
  /* Internal spacing for .frame-modal .settings-category. @token --frame-modal-settings-category-padding */
  --_frame-default-modal-settings-category-padding-0e58727b97: 5px 6px;
  padding: var(
    --frame-modal-settings-category-padding,
    var(--_frame-default-modal-settings-category-padding-0e58727b97)
  );
  text-align: left;
  /* Minimum height for .frame-modal .settings-category. @token --frame-modal-settings-category-min-height */
  --_frame-default-modal-settings-category-min-height-608bd70259: 28px;
  min-height: var(
    --frame-modal-settings-category-min-height,
    var(--_frame-default-modal-settings-category-min-height-608bd70259)
  );
  /* Background for .frame-modal .settings-category. @token --frame-modal-settings-category-background */
  --_frame-default-modal-settings-category-background-63dc1b4f14: transparent;
  background: var(
    --frame-modal-settings-category-background,
    var(--_frame-default-modal-settings-category-background-63dc1b4f14)
  );
  /* Foreground for .frame-modal .settings-category. @token --frame-modal-settings-category-color */
  --_frame-default-modal-settings-category-color-73b0b4e865: #a5adb1;
  color: var(
    --frame-modal-settings-category-color,
    var(--_frame-default-modal-settings-category-color-73b0b4e865)
  );
}

.frame-modal .settings-category:hover {
  /* Background for .frame-modal .settings-category:hover. @token --frame-modal-settings-category-hover-background */
  --_frame-default-modal-settings-category-hover-background-d551c6be2e: transparent;
  background: var(
    --frame-modal-settings-category-hover-background,
    var(--_frame-default-modal-settings-category-hover-background-d551c6be2e)
  );
  /* Foreground for .frame-modal .settings-category:hover. @token --frame-modal-settings-category-hover-color */
  --_frame-default-modal-settings-category-hover-color-8b72bd676e: #d4d4d4;
  color: var(
    --frame-modal-settings-category-hover-color,
    var(--_frame-default-modal-settings-category-hover-color-8b72bd676e)
  );
}

.frame-modal .settings-category.selected {
  /* Background for .frame-modal .settings-category.selected. @token --frame-modal-settings-category-selected-background */
  --_frame-default-modal-settings-category-selected-background-c6c3fd4528: transparent;
  background: var(
    --frame-modal-settings-category-selected-background,
    var(--_frame-default-modal-settings-category-selected-background-c6c3fd4528)
  );
  /* Foreground for .frame-modal .settings-category.selected. @token --frame-modal-settings-category-selected-color */
  --_frame-default-modal-settings-category-selected-color-2ca5538d18: #eee;
  color: var(
    --frame-modal-settings-category-selected-color,
    var(--_frame-default-modal-settings-category-selected-color-2ca5538d18)
  );
  /* Text weight for .frame-modal .settings-category.selected. @token --frame-modal-settings-category-selected-font-weight */
  --_frame-default-modal-settings-category-selected-font-weight-7db9f46cae: 600;
  font-weight: var(
    --frame-modal-settings-category-selected-font-weight,
    var(
      --_frame-default-modal-settings-category-selected-font-weight-7db9f46cae
    )
  );
}

.settings-category > .frame-icon,
.settings-category > .settings-disclosure-spacer {
  /* Width for .settings-category > .frame-icon, .settings-category > .settings-disclosure-spacer. @token --frame-settings-category-frame-icon-width */
  --_frame-default-settings-category-frame-icon-width-88786e7124: 16px;
  width: var(
    --frame-settings-category-frame-icon-width,
    var(--_frame-default-settings-category-frame-icon-width-88786e7124)
  );
  flex: 0 0 16px;
}
</style>
