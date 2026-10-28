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
  margin: var(--frame-settings-settings-tree-margin, 0);
  padding: var(--frame-settings-settings-tree-padding, 0);
}

.frame-settings .settings-tree .settings-tree {
  padding-left: var(
    --frame-settings-settings-tree-settings-tree-padding-left,
    16px
  );
}

.frame-modal .settings-category {
  display: flex;
  align-items: center;
  gap: var(--frame-modal-settings-category-gap, 3px);
  width: var(--frame-modal-settings-category-width, 100%);
  padding: var(--frame-modal-settings-category-padding, 5px 6px);
  text-align: left;
  min-height: var(--frame-modal-settings-category-min-height, 28px);
  background: var(--frame-modal-settings-category-background, transparent);
  color: var(--frame-modal-settings-category-color, #a5adb1);
}

.frame-modal .settings-category:hover {
  background: var(
    --frame-modal-settings-category-hover-background,
    transparent
  );
  color: var(--frame-modal-settings-category-hover-color, #d4d4d4);
}

.frame-modal .settings-category.selected {
  background: var(
    --frame-modal-settings-category-selected-background,
    transparent
  );
  color: var(--frame-modal-settings-category-selected-color, #eee);
  font-weight: var(--frame-modal-settings-category-selected-font-weight, 600);
}

.settings-category > .frame-icon,
.settings-category > .settings-disclosure-spacer {
  width: var(--frame-settings-category-frame-icon-width, 16px);
  flex: 0 0 16px;
}
</style>
