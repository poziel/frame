<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import {useFrame} from '../../framework/useFrame';
import ResizablePane from '../layout/ResizablePane.vue';
import SettingsField from './SettingsField.vue';
import SettingsNavigation from './SettingsNavigation.vue';

const frame = useFrame();
const selected = frame.settings.selected;
const navigationWidth = ref(210);
watch(
  frame.settings.allSections,
  (sections) => {
    if (!sections.some((section) => section.id === selected.value))
      selected.value = sections[0]?.id ?? '';
  },
  {immediate: true}
);
const section = computed(() =>
  frame.settings.allSections.value.find((item) => item.id === selected.value)
);
const error = ref('');
const query = computed(() => frame.settings.search.value.trim().toLowerCase());
const displayed = computed(() =>
  query.value
    ? frame.settings.allSections.value
        .map((item) => ({
          ...item,
          settings: item.settings?.filter(
            (field) =>
              field.visible !== false &&
              [item.title, field.id, field.label, field.description ?? '']
                .join(' ')
                .toLowerCase()
                .includes(query.value)
          ),
        }))
        .filter(
          (item) =>
            item.settings?.length ||
            (item.component && item.title.toLowerCase().includes(query.value))
        )
    : section.value
      ? [section.value]
      : []
);
function update(id: string, value: string | boolean | number) {
  try {
    error.value = frame.settings.set(id, value)
      ? ''
      : 'This value is not valid for the setting.';
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : String(reason);
  }
}
</script>
<template>
  <div class="frame-settings-surface"
    ><p v-if="frame.settings.error.value" role="alert">{{
      frame.settings.error.value
    }}</p
    ><ResizablePane
      v-model="navigationWidth"
      class="frame-settings"
      :min="140"
      :max="400"
      :min-second="180"
      label="Resize settings categories"
      ><template #first
        ><nav class="settings-navigation" aria-label="Settings categories"
          ><SettingsNavigation
            :sections="frame.settings.sections"
            :selected="selected"
            @select="
              selected = $event;
              error = '';
              frame.settings.search.value = '';
            " /></nav></template
      ><template #second
        ><section
          class="settings-content"
          :aria-label="section?.title ?? 'Application settings'"
          ><template v-for="group in displayed" :key="group.id"
            ><h2>{{ group.title }}</h2
            ><p v-if="group.description" class="setting-description">{{
              group.description
            }}</p
            ><p v-if="error" role="alert">{{ error }}</p
            ><SettingsField
              v-for="setting in group.settings?.filter(
                (field) => field.visible !== false
              )"
              :key="setting.id"
              :setting="setting"
              @update="update"
            /><slot :section="group" :settings="frame.settings"
              ><component
                :is="group.component"
                v-if="group.component"
                v-bind="group.props" /></slot
            ><p
              v-if="!group.settings?.length && !group.component"
              class="setting-description"
              >Choose a category to view its settings.</p
            ></template
          ><p
            v-if="!displayed.length"
            class="setting-description"
            role="status"
            >{{
              query
                ? 'No matching settings.'
                : 'No application settings are available.'
            }}</p
          ></section
        ></template
      ></ResizablePane
    ></div
  >
</template>
<style lang="scss" scoped>
.frame-settings-surface {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.frame-settings-surface > .frame-settings {
  flex: 1;
  min-height: 0;
}
.settings-content > h2 {
  margin-block: 0 var(--frame-settings-group-title-gap, 6px);
}
.settings-content > .setting-description {
  margin: 0 0 var(--frame-settings-group-description-gap, 12px);
  line-height: var(--frame-settings-description-line-height, 1.5);
  white-space: normal;
  overflow-wrap: anywhere;
}
</style>

<style lang="scss">
.frame-settings {
  display: grid;
  grid-template-columns: minmax(140px, 210px) minmax(0, 1fr);
  height: var(--frame-settings-height, 100%);
  min-height: var(--frame-settings-min-height, 0);
}

.frame-settings .settings-navigation {
  overflow: auto;
  padding: var(--frame-settings-settings-navigation-padding, 18px 8px);
  border-right: 1px solid var(--frame-line);
}

.frame-settings .settings-content {
  overflow: auto;
  padding: var(--frame-settings-settings-content-padding, 24px 30px);
  min-width: var(--frame-settings-settings-content-min-width, 0);
}

.settings-content h2 {
  font-size: var(--frame-settings-content-h2-font-size, 24px);
  font-weight: var(--frame-settings-content-h2-font-weight, 600);
  margin: var(--frame-settings-content-h2-margin, 0 0 24px);
}

@media (max-width: 600px) {
  .frame-settings {
    grid-template-columns: 135px minmax(0, 1fr);
  }
  .frame-settings .settings-content {
    padding: var(--frame-settings-settings-content-padding-2, 18px 14px);
  }
}

.frame-settings .settings-navigation,
.frame-settings .settings-content {
  height: var(--frame-settings-settings-navigation-height, 100%);
}

.frame-settings .settings-navigation {
  padding: var(--frame-settings-settings-navigation-padding-2, 18px 14px);
}
</style>
