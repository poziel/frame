<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import { regionIcon } from "../frame/layoutIcons";
import { useFrame } from "../frame/createFrame";
import QuickInput from "./CommandPalette.vue";
import VisibilityIndicator from "./VisibilityIndicator.vue";
import AppIcon from "./AppIcon.vue";
const props = defineProps<{ fullscreen: boolean; fullscreenAvailable: boolean }>();
const emit = defineEmits<{ close: []; fullscreen: [] }>();
const frame = useFrame();
const list = ref<HTMLElement>();
const selected = ref("menu");
const options = computed(() => {
  const l = frame.layout;
  return [
    ...(frame.features.navigation ? [{ id: "navigation", label: "Back and Forward", checked: l.navigationVisible, run: () => { l.navigationVisible = !l.navigationVisible; } }] : []),
    { id: "menu", label: "Menu Bar", checked: l.menuBarVisible, group: "Visibility", run: () => { l.menuBarVisible = !l.menuBarVisible; } },
    { id: "activity", label: "Activity Bar", checked: l.activityBarVisible, run: () => { l.activityBarVisible = !l.activityBarVisible; } },
    { id: "primary", label: "Primary Side Bar", checked: l.primarySidebarVisible, shortcut: "Ctrl+B", run: frame.toggleSidePanel },
    { id: "secondary", label: "Secondary Side Bar", checked: l.secondarySidebarVisible, shortcut: "Ctrl+Alt+B", run: frame.toggleSecondaryPanel },
    { id: "panel", label: "Panel", checked: l.panelVisible, shortcut: "Ctrl+J", run: frame.toggleBottomPanel },
    { id: "banner", label: "Banner", checked: l.bannerVisible, disabled: !frame.workspaceBanner.value, run: frame.toggleWorkspaceBanner },
    { id: "status", label: "Status Bar", checked: l.statusBarVisible, run: () => { l.statusBarVisible = !l.statusBarVisible; } },
    ...(["left", "right"] as const).map((value, index) => ({ id: `side-${value}`, label: value === "left" ? "Left" : "Right", checked: l.primarySide === value, radio: true, separator: index === 0, group: index === 0 ? "Primary Side Bar Position" : undefined, run: () => { l.primarySide = value; } })),
    ...(["left", "right", "center", "justify"] as const).map((value, index) => ({ id: `panel-${value}`, label: value[0]!.toUpperCase() + value.slice(1), checked: l.panelAlignment === value, radio: true, separator: index === 0, group: index === 0 ? "Panel Alignment" : undefined, run: () => { l.panelAlignment = value; } })),
    ...(["left", "right", "center", "justify"] as const).map((value, index) => ({ id: `banner-${value}`, label: value[0]!.toUpperCase() + value.slice(1), checked: l.bannerAlignment === value, radio: true, separator: index === 0, group: index === 0 ? "Banner Alignment" : undefined, run: () => { l.bannerAlignment = value; } })),
    ...(["top", "center"] as const).map((value, index) => ({ id: `quick-${value}`, label: value === "top" ? "Top" : "Center", checked: l.quickInputPosition === value, radio: true, separator: index === 0, group: index === 0 ? "Quick Input Position" : undefined, run: () => { l.quickInputPosition = value; } })),
    ...(["default", "compact"] as const).map((value, index) => ({ id: `density-${value}`, label: value === "default" ? "Default" : "Compact", checked: l.density === value, radio: true, separator: index === 0, group: index === 0 ? "Layout Density" : undefined, run: () => { l.density = value; } })),
    { id: "fullscreen", label: "Full Screen", checked: props.fullscreen, shortcut: "F11", separator: true, group: "Modes", disabled: !props.fullscreenAvailable, run: () => emit("fullscreen") },
    { id: "zen", label: "Zen Mode", checked: l.zenMode, run: () => frame.setZenMode(!l.zenMode) },
    { id: "centered", label: "Centered Layout", checked: l.centered, run: () => { l.centered = !l.centered; } },
  ];
});
function optionIcon(id: string) {
  if (id === "navigation") return "arrow-both";
  if (id === "primary") return regionIcon("primary", frame.layout.primarySidebarVisible, frame.layout.primarySide);
  if (id === "secondary") return regionIcon("secondary", frame.layout.secondarySidebarVisible, frame.layout.primarySide);
  if (id === "panel") return regionIcon("panel", frame.layout.panelVisible, frame.layout.primarySide);
  const fixed: Record<string, string> = { menu: "layout-menubar", activity: "layout-activitybar-left", primary: "layout-sidebar-left", secondary: "layout-sidebar-right", panel: "layout-panel", banner: "layout-panel", status: "layout-statusbar", fullscreen: "screen-full", zen: "target", centered: "layout-centered", "side-left": "layout-sidebar-left", "side-right": "layout-sidebar-right", "quick-top": "arrow-up", "quick-center": "layout-centered" };
  if (id.startsWith("panel-") || id.startsWith("banner-")) return `layout-panel-${id.split("-")[1]}`;
  if (id.startsWith("density-")) return `layout-${id}`;
  return fixed[id] ?? "layout";
}
async function keydown(event: KeyboardEvent) {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
  event.preventDefault(); event.stopPropagation();
  const choices = options.value.filter(option => !("disabled" in option && option.disabled));
  const current = choices.findIndex(option => option.id === selected.value);
  const index = event.key === "Home" ? 0 : event.key === "End" ? choices.length - 1 : (current + (event.key === "ArrowDown" ? 1 : -1) + choices.length) % choices.length;
  selected.value = choices[index]?.id ?? "menu";
  await nextTick();
  list.value?.querySelector<HTMLButtonElement>(`[data-option="${selected.value}"]`)?.focus();
}
onMounted(async () => { await nextTick(); list.value?.querySelector<HTMLButtonElement>("button")?.focus(); });
</script>
<template>
  <QuickInput :items="[]" title="Customize Layout" placeholder="" :searchable="false" :position="frame.layout.quickInputPosition" @close="emit('close')">
    <template #header-actions><button class="icon-button" aria-label="Reset layout" @click="frame.executeCommand('frame.layout.reset')"><svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><path d="M3 2v5h5M3 7a5 5 0 1 1 1 6" /></svg></button></template>
    <template #content>
      <div ref="list" class="layout-options" role="menu" aria-label="Layout options" @keydown="keydown">
        <template v-for="option in options" :key="option.id">
          <div v-if="'separator' in option && option.separator" role="separator" class="layout-separator" />
          <button :data-option="option.id" :role="'radio' in option && option.radio ? 'menuitemradio' : 'menuitemcheckbox'"
            :aria-checked="option.checked" :disabled="'disabled' in option && option.disabled" :tabindex="selected === option.id ? 0 : -1"
            :class="{ selected: selected === option.id }" @focus="selected = option.id" @pointermove="selected = option.id" @click="option.run()">
            <span class="layout-option-icon"><AppIcon :name="optionIcon(option.id)" :size="14" /></span>
            <span>{{ option.label }}</span><AppIcon v-if="option.checked" name="check" :size="13" class="layout-option-check" />
            <span class="layout-option-spacer" /><kbd v-if="'shortcut' in option">{{ option.shortcut }}</kbd><VisibilityIndicator v-if="['menu', 'activity', 'primary', 'secondary', 'panel', 'status', 'banner'].includes(option.id)" :visible="option.checked"/><small v-if="'group' in option">{{ option.group }}</small>
          </button>
        </template>
      </div>
    </template>
  </QuickInput>
</template>

