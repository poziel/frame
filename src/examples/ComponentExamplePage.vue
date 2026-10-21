<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import ComponentShowcase from "../components/ComponentShowcase.vue";
import ComponentPreview from "./ComponentPreview.vue";
import { variantsFor } from "./exampleVariants";
import IconLibraryPage from "./IconLibraryPage.vue";
import { useFrame } from "../frame/createFrame";
import TypeLink from "./TypeLink.vue";
import { componentExamples } from "./componentCatalog";
const props = defineProps<{ componentId: string }>();
const frame = useFrame();
function openIcons(online: boolean) { frame.setWorkspacePane(frame.workspace.activePane.value, { label: online ? "Online icons" : "Included icons", component: IconLibraryPage, props: { online } }); }
const variant = ref("default");
const variants = computed(() => variantsFor(props.componentId));
const example = computed(() => componentExamples.find(item => item.id === props.componentId)!);
const page = ref<{ $el: HTMLElement }>();
const message = ref("Interact with the preview to see its current value or last action.");
watch(() => props.componentId, async () => { variant.value = "default"; await nextTick(); page.value?.$el.closest(".workspace-pane-content")?.scrollTo({ top: 0 }); message.value = "Interact with the preview to see its current value or last action."; });
function navigateTabs(event: KeyboardEvent) {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const items = variants.value;
  const current = items.findIndex(item => item.id === variant.value);
  const index = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (current + (event.key === "ArrowRight" ? 1 : -1) + items.length) % items.length;
  variant.value = items[index]!.id;
  (event.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('[role="tab"]')[index]?.focus();
}
</script>
<template><ComponentShowcase eyebrow="FRAME COMPONENTS" ref="page" v-if="example" :title="example.title" :description="example.description" :usage="example.usage" :code="variants.find(item => item.id === variant)?.code || example.code" :properties="example.properties"><template #navigation><nav v-if="componentId === 'icons'" class="example-type-links" aria-label="Icon libraries"><a href="#/icons/included" @click.prevent="openIcons(false)">See all included icons</a><a href="#/icons/online" @click.prevent="openIcons(true)">Load icons from the website</a></nav><nav v-if="variants.length > 1" class="example-tabs" role="tablist" aria-label="Examples" @keydown="navigateTabs"><button v-for="item in variants" :key="item.id" role="tab" :tabindex="variant === item.id ? 0 : -1" :aria-selected="variant === item.id" @click="variant = item.id">{{ item.label }}</button></nav><div class="example-type-links"><TypeLink v-if="componentId === 'select'" name="SelectItem"/><TypeLink v-if="componentId === 'menus' || componentId === 'context-menu'" name="FrameMenuItem"/><TypeLink v-if="componentId === 'setting-controls' || componentId === 'settings'" name="SettingDefinition"/></div></template><ComponentPreview :key="`${componentId}-${variant}`" :id="componentId" :variant="variant" @feedback="message = $event"/><template #property-type="{ property }"><TypeLink v-if="property.reference" :name="property.reference" :label="property.type"/><code v-else>{{ property.type }}</code></template><template #feedback>{{ message }}</template></ComponentShowcase></template>
