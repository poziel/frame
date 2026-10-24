import { computed, reactive, shallowRef } from 'vue';
import { createNavigationItems, type NavigationItem, type NavigationServices } from './navigationItems';
import type { BarDisplay, BarSize } from './barTypes';
export type NavigationBarPosition = 'top' | 'bottom' | 'left' | 'right';
export type NavigationBarJustification = 'left' | 'center' | 'right';
export interface NavigationBarOptions { allowAddSeparator?: boolean; collapsed?: boolean; visible?: boolean; justification?: NavigationBarJustification; position?: NavigationBarPosition; display?: BarDisplay; size?: BarSize; hidden?: readonly string[]; hiddenBadges?: readonly string[] }
export function createNavigationBar(options: boolean | NavigationBarOptions | undefined, services: NavigationServices, available: () => boolean = () => true) {
  const initial = typeof options === 'object' ? options : {};
  const registry = createNavigationItems(services);
  let serial=0;
  const state = reactive({ collapsed: initial.collapsed ?? false, justification: initial.justification ?? 'left', visible: available() && options !== undefined && options !== false && (initial.visible ?? true), position: initial.position ?? 'top', display: initial.display ?? 'icons', size: initial.size ?? 'default' });
  const defaults = { ...state }; const disposed = shallowRef(false);
  function register(item: NavigationItem) {
    const remove = registry.register(item);
    function initialize(entry:NavigationItem){if(initial.hidden?.includes(entry.id))registry.setItemVisible(entry.id,false);if(initial.hiddenBadges?.includes(entry.id))registry.setBadgeVisible(entry.id,false);if(entry.type==='dropdown')entry.items.forEach(initialize);}
    initialize(item);return remove;
  }
  function setVisible(value: boolean) { if (disposed.value) return false; state.visible = value && available(); return true; }
  function setPosition(value: NavigationBarPosition) { if (disposed.value || !['top','bottom','left','right'].includes(value)) return false; state.position = value; return true; }
  function setDisplay(value: BarDisplay) { if (disposed.value || !['icons','text','both'].includes(value)) return false; state.display = value; return true; }
  function setSize(value: BarSize) { if (disposed.value || !['default','compact'].includes(value)) return false; state.size = value; return true; }
  function setJustification(value: NavigationBarJustification) { if (disposed.value || !['left','center','right'].includes(value)) return false; state.justification = value; return true; }
  const canCollapse=computed(()=>!disposed.value&&['left','right'].includes(state.position)&&state.display==='both');
  function setCollapsed(value:boolean){if(disposed.value)return false;state.collapsed=value;return true;}
  function addSeparator(before?:string){if(disposed.value||!initial.allowAddSeparator||before!==undefined&&!registry.items.value.some(item=>item.id===before))return undefined;let id:string;do{id=`separator-${++serial}`;}while(registry.find(id));register({id,type:'separator',allowRemove:true});registry.moveItem(id,before);return id;}
  return { allowAddSeparator:computed(()=>!disposed.value&&!!initial.allowAddSeparator),addSeparator,collapsed:computed(()=>state.collapsed),canCollapse,setCollapsed, justification: computed(() => state.justification), setJustification, ...registry, register, visible: computed(() => available() && state.visible), position: computed(() => state.position), display: computed(() => state.display), effectiveDisplay: computed(() => canCollapse.value&&state.collapsed?'icons':state.display), size: computed(() => state.size), setVisible, setPosition, setDisplay, setSize, resetPresentation() { if (!disposed.value) { Object.assign(state, defaults); state.visible = state.visible && available(); } }, dispose() { disposed.value = true; state.visible = false; registry.dispose(); } };
}
