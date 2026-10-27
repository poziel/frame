<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue';
import { useFrame, FrameButton, FrameTextField, FrameSelect, FrameCheckbox, FrameNumberField } from '@frame/core';
import { playgroundOptions } from '../layouts/playgroundOptions';
import DockSample from './DockSample.vue';
const frame = useFrame();
const anchors = ['workspace','primarySidebar','secondarySidebar','panel','primaryViewBar','secondaryViewBar','panelViewBar','navigationBar','statusBar'] as const;
const edges = ['top','right','bottom','left'] as const;
const placements = ['inside','outside','overlay'] as const;
const appearances = ['none','basic','padded'] as const;
const appearanceOptions = playgroundOptions(appearances);
const paddings = ['normal','small','none'] as const;
const anchorOptions = playgroundOptions(anchors), edgeOptions = playgroundOptions(edges), placementOptions = playgroundOptions(placements), paddingOptions = playgroundOptions(paddings);
const sideOptions = playgroundOptions(['left', 'right']), barOptions = playgroundOptions(['default', 'top', 'bottom']), densityOptions = playgroundOptions(['default', 'compact']);
type Definition = Parameters<typeof frame.docks.register>[0];
const form = reactive({label:'My dock',anchor:'workspace' as Definition['anchor'],edge:'bottom' as Definition['edge'],placement:'outside' as Definition['placement'],appearance:'padded' as NonNullable<Definition['appearance']>,padding:'normal' as NonNullable<Definition['padding']>,width:'',height:'',visible:true,order:0});
const owned = ref<string[]>([]);
const cleanups = new Map<string, () => void>();
const entries = computed(() => frame.docks.items.value.filter(item => owned.value.includes(item.id)));
let sequence = 0;
const error = ref('');
function createDock() {
  if (!form.label.trim() || !Number.isFinite(form.order)) {error.value='Enter a label and a finite order value.';return;}
  const width = form.width === '' ? undefined : Number(form.width);
  const height = form.height === '' ? undefined : Number(form.height);
  if ([width,height].some(value => value !== undefined && (!Number.isFinite(value) || value <= 0))) {error.value='Dimensions must be positive pixel values, or empty for automatic sizing.';return;}
  error.value='';
  let id: string;
  do {id=`docs.dock.${++sequence}`;} while(frame.docks.get(id));
  cleanups.set(id,frame.docks.register({ ...form,id,component:DockSample,props:{label:form.label},width,height }));
  owned.value.push(id);
}
function remove(id:string){cleanups.get(id)?.();cleanups.delete(id);owned.value=owned.value.filter(value=>value!==id);}
function update(
  id:string,
  key:'anchor'|'edge'|'placement'|'padding'|'appearance',
  value:string
){frame.docks.update(id,{[key]:value} as Partial<Definition>);}
const visibilityKeys = {primarySidebar:'primarySidebarVisible',secondarySidebar:'secondarySidebarVisible',panel:'panelVisible',primaryViewBar:'primaryViewBarVisible',secondaryViewBar:'secondaryViewBarVisible',panelViewBar:'panelViewBarVisible',navigationBar:'navigationVisible',statusBar:'statusBarVisible'} as const;
const controllableAnchors = anchors.filter((
  anchor
): anchor is keyof typeof visibilityKeys => anchor !== 'workspace');
function anchorVisible(anchor: keyof typeof visibilityKeys) {return anchor === 'navigationBar' ? frame.navigationBar.visible.value : frame.layout[visibilityKeys[anchor]];}
function setAnchorVisible(anchor: keyof typeof visibilityKeys, value:boolean) {if(anchor==='navigationBar')frame.navigationBar.setVisible(value);else frame.layout[visibilityKeys[anchor]]=value;}
onBeforeUnmount(()=>{cleanups.forEach(cleanup=>cleanup());cleanups.clear();});
</script>
<template>
  <main class="dock-playground">
    <h1>Docks Playground</h1>
    <p>Attach independent Vue content to any shell edge. Edit a dock’s draft or count, then hide it or move its anchor to check that its state survives.</p>
    <form class="dock-controls" @submit.prevent="createDock">
      <label>Label<FrameTextField v-model="form.label" required /></label>
      <label>Anchor<FrameSelect v-model="form.anchor" label="Anchor" :options="anchorOptions" /></label>
      <label>Edge<FrameSelect v-model="form.edge" label="Edge" :options="edgeOptions" /></label>
      <label>Placement<FrameSelect v-model="form.placement" label="Placement" :options="placementOptions" /></label>
      <label>Appearance<FrameSelect v-model="form.appearance" label="Appearance" :options="appearanceOptions" /></label>
      <label>Padding<FrameSelect v-model="form.padding" label="Padding" :options="paddingOptions" /></label>
      <label>Width (px)<FrameTextField v-model="form.width" type="number" min="1" placeholder="Automatic" /></label>
      <label>Height (px)<FrameTextField v-model="form.height" type="number" min="1" placeholder="Automatic" /></label>
      <label>Order<FrameNumberField v-model="form.order" label="Order" :step="1" /></label>
      <FrameCheckbox v-model="form.visible" label="Initially Visible" />
      <FrameButton type="submit" variant="primary">Create Dock</FrameButton>
      <p v-if="error" role="alert">{{ error }}</p>
    </form>
    <h2>Registered docks</h2>
    <p v-if="!entries.length">Create a dock above to begin. Docks created here are removed when this page unmounts.</p>
    <article v-for="entry in entries" :key="entry.id" class="dock-entry">
      <strong>{{ entry.label }}</strong><code>{{ entry.id }}</code>
      <label>Anchor<FrameSelect :model-value="entry.anchor" :label="`${entry.label} Anchor`" :options="anchorOptions" @update:model-value="update(entry.id,'anchor',$event)" /></label>
      <label>Edge<FrameSelect :model-value="entry.edge" :label="`${entry.label} Edge`" :options="edgeOptions" @update:model-value="update(entry.id,'edge',$event)" /></label>
      <label>Placement<FrameSelect :model-value="entry.placement" :label="`${entry.label} Placement`" :options="placementOptions" @update:model-value="update(entry.id,'placement',$event)" /></label>
      <label>Appearance<FrameSelect :model-value="entry.appearance" :label="`${entry.label} Appearance`" :options="appearanceOptions" @update:model-value="update(entry.id,'appearance',$event)" /></label>
      <label>Padding<FrameSelect :model-value="entry.padding ?? 'normal'" :label="`${entry.label} Padding`" :options="paddingOptions" @update:model-value="update(entry.id,'padding',$event)" /></label>
      <FrameButton variant="secondary" @click="frame.docks.toggle(entry.id)">{{ entry.visible ? 'Hide' : 'Show' }}</FrameButton>
      <FrameButton variant="secondary" @click="remove(entry.id)">Delete</FrameButton>
      <small>{{ frame.docks.resolve(entry.id) }}</small>
    </article>
    <h2>Anchor controls</h2>
    <div class="dock-controls">
      <fieldset v-for="anchor in controllableAnchors" :key="anchor"><legend>{{ anchor }}</legend>
        <FrameCheckbox :model-value="anchorVisible(anchor)" :label="`${anchor} Visible`" @update:model-value="setAnchorVisible(anchor,$event)" />
        <FrameCheckbox :model-value="frame.features.isAvailable(anchor)" :label="`${anchor} Available`" @update:model-value="frame.features.setAvailable(anchor,$event)" />
      </fieldset>
    </div>
    <h2>Move the shell</h2>
    <div class="dock-controls">
      <label>Primary Side<FrameSelect v-model="frame.layout.primarySide" label="Primary Side" :options="sideOptions" /></label>
      <label>Primary View Bar<FrameSelect :model-value="frame.primaryViewBar.position.value" label="Primary View Bar" :options="barOptions" @update:model-value="frame.primaryViewBar.setPosition($event as 'default'|'top'|'bottom')" /></label>
      <label>Panel<FrameSelect v-model="frame.layout.panelPosition" label="Panel" :options="edgeOptions" /></label>
      <label>Navigation<FrameSelect :model-value="frame.navigationBar.position.value" label="Navigation" :options="edgeOptions" @update:model-value="frame.navigationBar.setPosition($event as 'top'|'right'|'bottom'|'left')" /></label>
      <label>Density<FrameSelect v-model="frame.layout.density" label="Density" :options="densityOptions" /></label>
    </div>
  </main>
</template>
<style scoped>
.dock-playground{padding:var(--frame-spacing-large,24px);color:var(--frame-text);max-width:1200px;margin:auto;overflow:auto;height:100%;box-sizing:border-box}.dock-controls,.dock-entry{display:flex;flex-wrap:wrap;gap:var(--frame-spacing-small,12px);align-items:end;margin-block:16px}.dock-entry{padding:12px;border:1px solid var(--frame-border-color);border-radius:var(--frame-radius-medium)}label{display:grid;gap:4px;min-width:130px;font-size:var(--frame-font-size-body)}.dock-controls :deep(.frame-select),.dock-entry :deep(.frame-select){width:100%}small{flex-basis:100%;overflow-wrap:anywhere}fieldset{border:1px solid var(--frame-border-color);display:grid;gap:8px;padding:12px}h1,h2{font-weight:600}p{line-height:1.5}
</style>
