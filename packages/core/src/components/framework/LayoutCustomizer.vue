<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import { regionIcon } from "../../framework/layout/layoutIcons";
import {useFrame} from '../../framework/useFrame';
import FrameQuickPanel from "./FrameQuickPanel.vue";
import FrameIconButton from "../actions/FrameIconButton.vue";
import VisibilityIndicator from "./VisibilityIndicator.vue";
import AppIcon from "./AppIcon.vue";
const props = defineProps<{ fullscreen: boolean; fullscreenAvailable: boolean }>();
const emit = defineEmits<{ close: []; fullscreen: [] }>();
const frame = useFrame();
const list = ref<HTMLElement>();
const selected = ref("menu");
const optionLabel = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
const options = computed(() => {
  const l = frame.layout;
  const option = (
    id: string,
    label: string,
    command: string,
    checked: boolean,
    group?: string,
    radio = false,
    separator = false
  ) => ({ id, label, command, checked, group, radio, separator, disabled: !frame.commands.isEnabled(command), run: () => frame.commands.execute(command) });
  return [
    option('menu', 'Menu Bar', 'frame.layout.menuBarVisible', l.menuBarVisible, 'Visibility'),
    option('navigation-bar', 'Navigation Bar', 'frame.navigationBar.toggle', frame.navigationBar.visible.value),
    option('primary-view-bar', 'Primary View Bar', 'frame.primaryViewBar.toggle', l.primaryViewBarVisible),
    option('primary', 'Primary Sidebar', 'frame.sidebar.toggle', l.primarySidebarVisible),
    option('secondary-view-bar', 'Secondary View Bar', 'frame.secondaryViewBar.toggle', l.secondaryViewBarVisible),
    option('secondary', 'Secondary Sidebar', 'frame.secondary.toggle', l.secondarySidebarVisible),
    option('panel-view-bar', 'Panel View Bar', 'frame.panelViewBar.toggle', l.panelViewBarVisible),
    option('panel', 'Panel', 'frame.panel.toggle', l.panelVisible),
    option('banner', 'Banner', 'frame.banner.toggle', l.bannerVisible),
    option('status', 'Status Bar', 'frame.layout.statusBarVisible', l.statusBarVisible),
    option('navigation', 'Back and Forward', 'frame.layout.navigationVisible', l.navigationVisible),
    ...(['top','bottom','left','right'] as const).map((value, i)=>option('nav-position-'+value, optionLabel(value), 'frame.navigationBar.position.'+value, frame.navigationBar.position.value===value, i===0?'Navigation Bar Position':undefined,true,i===0)),
    ...(['primaryViewBar','secondaryViewBar','panelViewBar','navigationBar'] as const).flatMap(name=>{
      const bar=frame[name]; const prefix=name==='primaryViewBar'?'primary-view-bar':name==='secondaryViewBar'?'secondary-view-bar':name==='panelViewBar'?'panel':'nav';
      const label=name==='primaryViewBar'?'Primary View Bar':name==='secondaryViewBar'?'Secondary View Bar':name==='panelViewBar'?'Panel View Bar':'Navigation Bar';
      return [
        ...(('allowDisplayChange' in bar && !bar.allowDisplayChange ? [] : ['icons','text','both'] as const)).map((
          value,
          i
        )=>option(prefix+'-display-'+value,value==='icons'?'Icons Only':value==='text'?'Text Only':'Icons and Text','frame.'+name+'.display.'+value,bar.display.value===value,i===0?label+' Display':undefined,true,i===0)),
        ...(('allowSizeChange' in bar && !bar.allowSizeChange ? [] : ['default','compact'] as const)).map((
          value,
          i
        )=>option(prefix+'-size-'+value,value==='default'?'Default':'Compact','frame.'+name+'.size.'+value,bar.size.value===value,i===0?label+' Size':undefined,true,i===0)),
      ];
    }),
    ...(['primaryViewBar','secondaryViewBar'] as const).flatMap(name=>(['default','top','bottom','hidden'] as const).map((
      value,
      i
    )=>option((name==='primaryViewBar'?'primary':'secondary')+'-view-bar-position-'+value,optionLabel(value),'frame.'+name+'.position.'+value,frame[name].position.value===value,i===0?(name==='primaryViewBar'?'Primary':'Secondary')+' View Bar Position':undefined,true,i===0))),
    ...(['left','right'] as const).map((value, i)=>option('side-'+value,optionLabel(value),'frame.layout.primary.'+value,l.primarySide===value,i===0?'Primary Sidebar Side':undefined,true,i===0)),
    ...(['top','bottom','left','right'] as const).map((value, i)=>option('panel-position-'+value,optionLabel(value),'frame.layout.panel.position.'+value,l.panelPosition===value,i===0?'Panel Position':undefined,true,i===0)),
    ...(['left','right','center','justify'] as const).map((value, i)=>option('panel-'+value,optionLabel(value),'frame.layout.panel.'+value,l.panelAlignment===value,i===0?'Panel Alignment':undefined,true,i===0)),
    ...(['left','right','center','justify'] as const).map((value, i)=>option('banner-'+value,optionLabel(value),'frame.layout.banner.'+value,l.bannerAlignment===value,i===0?'Banner Alignment':undefined,true,i===0)),
    ...(['top','center'] as const).map((value, i)=>option('quick-'+value,optionLabel(value),'frame.layout.quick.'+value,l.quickInputPosition===value,i===0?'Quick Pick / Panel Position':undefined,true,i===0)),
    ...(['default','compact'] as const).map((value, i)=>option('density-'+value,optionLabel(value),'frame.layout.density.'+value,l.density===value,i===0?'Layout Density':undefined,true,i===0)),
    option('fullscreen','Full Screen','frame.fullscreen',props.fullscreen,'Modes',false,true),
    option('zen','Zen Mode','frame.zen.toggle',l.zenMode),
    option('centered','Centered Layout','frame.layout.centered',l.centered),
  ].filter(item=>frame.commands.isVisible(item.command)).map(item=>({...item,shortcut:frame.commands.get(item.command)?.shortcut}));
});
function optionIcon(id: string) {
  if(id.startsWith("panel-position-")){const position=id.slice(15);return position==="bottom"?"layout-panel":`layout-panel-${position}`;}
  if(id.includes("view-bar-position-")){const value=id.split("view-bar-position-")[1];return value==="top"?"layout-panel-top":value==="bottom"?"layout-panel":"layout-activitybar-left";}
  if(id.includes("view-bar-size-"))return id.endsWith("compact")?"layout-density-compact":"layout-density-default";
  if (id === "navigation") return "arrow-both";
  if (id === "primary") return regionIcon("primary", frame.layout.primarySidebarVisible, frame.layout.primarySide);
  if (id === "secondary") return regionIcon("secondary", frame.layout.secondarySidebarVisible, frame.layout.primarySide);
  if (id === "panel") return regionIcon("panel", frame.layout.panelVisible, frame.layout.primarySide);
  const fixed: Record<string, string> = { menu: "layout-menubar", "primary-view-bar": "layout-activitybar-left", "secondary-view-bar": "layout-activitybar-right", primary: "layout-sidebar-left", secondary: "layout-sidebar-right", panel: "layout-panel", banner: "layout-panel", status: "layout-statusbar", fullscreen: "screen-full", zen: "target", centered: "layout-centered", "side-left": "layout-sidebar-left", "side-right": "layout-sidebar-right", "quick-top": "arrow-up", "quick-center": "layout-centered" };
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
  <FrameQuickPanel title="Customize Layout" :position="frame.layout.quickInputPosition" @close="emit('close')">
    <template #header-actions><FrameIconButton label="Reset layout" icon="refresh" @click="frame.executeCommand('frame.layout.reset')" /></template>
    <template #default>
      <div ref="list" class="layout-options" role="menu" aria-label="Layout options" @keydown="keydown">
        <template v-for="option in options" :key="option.id">
          <div v-if="'separator' in option && option.separator" role="separator" class="layout-separator" />
          <button :data-quick-autofocus="option.id === 'menu' ? '' : undefined" :data-option="option.id" :role="'radio' in option && option.radio ? 'menuitemradio' : 'menuitemcheckbox'"
            :aria-checked="option.checked" :disabled="'disabled' in option && option.disabled" :tabindex="selected === option.id ? 0 : -1"
            :class="{ selected: selected === option.id }" @focus="selected = option.id" @pointermove="selected = option.id" @click="option.run()">
            <span class="layout-option-icon"><AppIcon :name="optionIcon(option.id)" :size="14" /></span>
            <span>{{ option.label }}</span><AppIcon v-if="option.checked" name="check" :size="13" class="layout-option-check" />
            <span class="layout-option-spacer" /><kbd v-if="option.shortcut">{{ option.shortcut }}</kbd><VisibilityIndicator v-if="['menu', 'navigation-bar','panel-view-bar', 'primary-view-bar','secondary-view-bar', 'primary', 'secondary', 'panel', 'status', 'banner'].includes(option.id)" :visible="option.checked"/><small v-if="'group' in option">{{ option.group }}</small>
          </button>
        </template>
      </div>
    </template>
  </FrameQuickPanel>
</template>

