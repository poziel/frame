<script setup lang="ts">
import { computed } from 'vue';
import { MenubarRoot, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator, useForwardProps } from 'reka-ui';
import type { MenubarRootProps } from 'reka-ui';
import type { FrameMenubarItem,FrameMenubarAction } from '../general-types';
import '../general-b.css';
const props=defineProps<MenubarRootProps & { items?:FrameMenubarItem[]; label?:string }>();
const emit=defineEmits<{'update:modelValue':[value:string];action:[item:FrameMenubarAction]}>();
const root=computed(()=>{const {items,label,...rest}=props;return rest;});
const forwarded=useForwardProps(root);
</script>
<template><MenubarRoot v-bind="forwarded" @update:model-value="emit('update:modelValue',String($event))" class="frame-menubar" :aria-label="label"><slot><MenubarMenu v-for="menu in items" :key="menu.value" :value="menu.value"><MenubarTrigger :disabled="menu.disabled" class="frame-menubar-trigger">{{menu.label}}</MenubarTrigger><MenubarContent class="frame-menubar-content" :side-offset="4"><slot name="content" :menu="menu"><template v-for="item in menu.items" :key="item.id"><MenubarSeparator v-if="item.separator" class="frame-menubar-separator"/><MenubarItem v-else :disabled="item.disabled" class="frame-menubar-item" @select="emit('action',item)"><span>{{item.label}}</span><kbd v-if="item.shortcut">{{item.shortcut}}</kbd></MenubarItem></template></slot></MenubarContent></MenubarMenu></slot></MenubarRoot></template>
