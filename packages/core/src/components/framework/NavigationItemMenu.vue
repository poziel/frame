<script setup lang="ts">
import {computed} from 'vue';
import {DropdownMenuItem,DropdownMenuSeparator,DropdownMenuSub,DropdownMenuSubTrigger,DropdownMenuSubContent,DropdownMenuPortal} from 'reka-ui';
import {useFrame} from '../../framework/useFrame';
import {normalizeNavigationItems,type NavigationItem,type NavigationLinkItem} from '../../framework/views/navigationItems';
import {useOverlayBoundary} from '../overlays/overlays';
import BarItemContent from './BarItemContent.vue';
const props=defineProps<{items:readonly NavigationItem[];anchor?:HTMLElement}>();
const frame=useFrame(),bar=frame.navigationBar;
const {target}=useOverlayBoundary(()=>props.anchor);
const entries=computed(()=>normalizeNavigationItems(props.items,id=>!!bar.getItemState(id)?.visible));
function badge(id:string){const state=bar.getItemState(id);return state?.badgeVisible?state.badge:undefined;}
function link(event:MouseEvent, item:NavigationLinkItem){if(!bar.enabled(item.id)){event.preventDefault();return;}if(item.onNavigate&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey&&event.button===0){event.preventDefault();void bar.activate(item.id);}}
// Reka synthesizes an unmodified click for Enter. Preserve the browser's modifier handling first.
function linkKey(event:KeyboardEvent, item:NavigationLinkItem){if(event.key==='Enter'&&(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)){event.stopImmediatePropagation();if(!bar.enabled(item.id))event.preventDefault();}}
</script>
<template><template v-for="item in entries" :key="item.id">
 <DropdownMenuSeparator v-if="item.type==='separator'" class="menu-separator"/>
 <DropdownMenuSub v-else-if="item.type==='dropdown'"><DropdownMenuSubTrigger :disabled="!bar.enabled(item.id)" class="navigation-menu-item" :text-value="item.label"><BarItemContent :label="item.label" :icon="item.icon" :badge="badge(item.id)" display="both"/><span aria-hidden="true">›</span></DropdownMenuSubTrigger><DropdownMenuPortal :to="target"><DropdownMenuSubContent class="frame-menu navigation-menu" :aria-label="item.label" :side-offset="4" :collision-padding="8"><NavigationItemMenu :items="item.items" :anchor="anchor"/></DropdownMenuSubContent></DropdownMenuPortal></DropdownMenuSub>
 <DropdownMenuItem v-else-if="item.type==='link'" as-child :disabled="!bar.enabled(item.id)" :text-value="item.label"><a class="navigation-menu-item" :href="item.href" :target="item.target" :rel="item.rel??(item.target==='_blank'?'noopener noreferrer':undefined)" :aria-current="(typeof item.active==='function'?item.active():item.active)?'page':undefined" @keydown.capture="linkKey($event,item)" @auxclick="link($event,item)" @click="link($event,item)"><BarItemContent :label="item.label" :icon="item.icon" :badge="badge(item.id)" display="both"/></a></DropdownMenuItem>
 <DropdownMenuItem v-else class="navigation-menu-item" :disabled="!bar.enabled(item.id)" :text-value="item.label" @select="bar.activate(item.id)"><BarItemContent :label="item.label" :icon="item.icon" :badge="badge(item.id)" display="both"/></DropdownMenuItem>
</template></template>
