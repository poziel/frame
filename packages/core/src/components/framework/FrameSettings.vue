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

<style lang="scss">
.frame-settings {
  display: grid;
  grid-template-columns: minmax(140px, 210px) minmax(0, 1fr);
  /* Height for .frame-settings. @token --frame-settings-height */
  --_frame-default-settings-height-b3d3edc7f1: 100%;
  height: var(
    --frame-settings-height,
    var(--_frame-default-settings-height-b3d3edc7f1)
  );
  /* Minimum height for .frame-settings. @token --frame-settings-min-height */
  --_frame-default-settings-min-height-058d160f74: 0;
  min-height: var(
    --frame-settings-min-height,
    var(--_frame-default-settings-min-height-058d160f74)
  );
}

.frame-settings .settings-navigation {
  overflow: auto;
  /* Internal spacing for .frame-settings .settings-navigation. @token --frame-settings-settings-navigation-padding */
  --_frame-default-settings-settings-navigation-padding-5a0c822a8f: 18px 8px;
  padding: var(
    --frame-settings-settings-navigation-padding,
    var(--_frame-default-settings-settings-navigation-padding-5a0c822a8f)
  );
  /* Neutral divider color for content boundaries, tracks, and structural separators. @token --frame-line @context */
  border-right: 1px solid var(--frame-line);
}

.frame-settings .settings-content {
  overflow: auto;
  /* Internal spacing for .frame-settings .settings-content. @token --frame-settings-settings-content-padding */
  --_frame-default-settings-settings-content-padding-15e66111f9: 24px 30px;
  padding: var(
    --frame-settings-settings-content-padding,
    var(--_frame-default-settings-settings-content-padding-15e66111f9)
  );
  /* Minimum width for .frame-settings .settings-content. @token --frame-settings-settings-content-min-width */
  --_frame-default-settings-settings-content-min-width-54ddd06392: 0;
  min-width: var(
    --frame-settings-settings-content-min-width,
    var(--_frame-default-settings-settings-content-min-width-54ddd06392)
  );
}

.settings-content h2 {
  /* Text size for .settings-content h2. @token --frame-settings-content-h2-font-size */
  --_frame-default-settings-content-h2-font-size-d5b7a2a005: 24px;
  font-size: var(
    --frame-settings-content-h2-font-size,
    var(--_frame-default-settings-content-h2-font-size-d5b7a2a005)
  );
  /* Text weight for .settings-content h2. @token --frame-settings-content-h2-font-weight */
  --_frame-default-settings-content-h2-font-weight-3a477e2709: 600;
  font-weight: var(
    --frame-settings-content-h2-font-weight,
    var(--_frame-default-settings-content-h2-font-weight-3a477e2709)
  );
  /* Outer spacing for .settings-content h2. @token --frame-settings-content-h2-margin */
  --_frame-default-settings-content-h2-margin-10c09bb11a: 0 0 24px;
  margin: var(
    --frame-settings-content-h2-margin,
    var(--_frame-default-settings-content-h2-margin-10c09bb11a)
  );
}

@media (max-width: 600px) {
  .frame-settings {
    grid-template-columns: 135px minmax(0, 1fr);
  }
  .frame-settings .settings-content {
    /* Internal spacing for .frame-settings .settings-content. @token --frame-settings-settings-content-padding-2 */
    --_frame-default-settings-settings-content-padding-2-2b44e15cd3: 18px 14px;
    padding: var(
      --frame-settings-settings-content-padding-2,
      var(--_frame-default-settings-settings-content-padding-2-2b44e15cd3)
    );
  }
}

.frame-settings .settings-navigation,
.frame-settings .settings-content {
  /* Height for .frame-settings .settings-navigation, .frame-settings .settings-content. @token --frame-settings-settings-navigation-height */
  --_frame-default-settings-settings-navigation-height-683dd344fc: 100%;
  height: var(
    --frame-settings-settings-navigation-height,
    var(--_frame-default-settings-settings-navigation-height-683dd344fc)
  );
}

.frame-settings .settings-navigation {
  /* Internal spacing for .frame-settings .settings-navigation. @token --frame-settings-settings-navigation-padding-2 */
  --_frame-default-settings-settings-navigation-padding-2-d6f17509e5: 18px 14px;
  padding: var(
    --frame-settings-settings-navigation-padding-2,
    var(--_frame-default-settings-settings-navigation-padding-2-d6f17509e5)
  );
}
</style>
