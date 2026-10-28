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
defineSlots<{
  /** Replaces a section's generated settings controls while retaining its owning Frame controller. */ default?(
    props: {
    section: import('../../framework/settings/settings').SettingsSection;
    settings: import('../../framework/settings/settings').Settings;
  }
  ): unknown;
}>();
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
<style scoped>
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
  /* Value of margin-block for .settings-content > h2. @token --frame-settings-group-title-gap */
  --_frame-default-settings-group-title-gap-a51deb3aac: 6px;
  margin-block: 0
    var(
      --frame-settings-group-title-gap,
      var(--_frame-default-settings-group-title-gap-a51deb3aac)
    );
}
.settings-content > .setting-description {
  /* Outer spacing for .settings-content > .setting-description. @token --frame-settings-group-description-gap */
  --_frame-default-settings-group-description-gap-750f80c7ec: 12px;
  margin: 0 0
    var(
      --frame-settings-group-description-gap,
      var(--_frame-default-settings-group-description-gap-750f80c7ec)
    );
  /* Text line height for .settings-content > .setting-description. @token --frame-settings-description-line-height */
  --_frame-default-settings-description-line-height-bc3bd710e9: 1.5;
  line-height: var(
    --frame-settings-description-line-height,
    var(--_frame-default-settings-description-line-height-bc3bd710e9)
  );
  white-space: normal;
  overflow-wrap: anywhere;
}
</style>
