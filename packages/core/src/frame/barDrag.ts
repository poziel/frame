import {reactive} from 'vue';
import {barGapAt,barGapMarker} from './barInsertion';
import {startPointerDrag} from './pointerDrag';
export function createBarDrag(options:{list?:()=>HTMLElement|undefined;exists:(id:string)=>boolean;move:(id:string,before?:string)=>unknown;start?:()=>void;focus?:(id:string)=>void}){
 const state=reactive({active:false,id:'',x:0,y:0,marker:null as ReturnType<typeof barGapMarker>|null,before:undefined as string|undefined});
 let stop:(()=>void)|undefined;
 function begin(event:PointerEvent,id:string){
  if(event.button!==0||!options.exists(id))return;
  const source=event.currentTarget as HTMLElement,list=options.list?.()??source.closest<HTMLElement>('.bar-drop-list');if(!list)return;
  stop?.();const axis=list.dataset.barAxis==='x'?'x':'y';
  stop=startPointerDrag(event,{scope:source.closest<HTMLElement>('.workbench')??undefined,
   move(point){if(!state.active)options.start?.();state.active=true;state.id=id;state.x=point.x;state.y=point.y;const box=list.getBoundingClientRect();const inside=point.x>=box.left&&point.x<=box.right&&point.y>=box.top&&point.y<=box.bottom;
    const gap=inside&&barGapAt(list,axis,axis==='x'?point.x:point.y);state.before=gap?gap.before:undefined;state.marker=gap?barGapMarker(gap,axis):null;},
   drop(){if(state.marker&&options.exists(id)){options.move(id,state.before);options.focus?.(id);}},
   end(){state.active=false;state.id='';state.marker=null;state.before=undefined;stop=undefined;},
  });
 }
 return {state,begin,cancel:()=>stop?.()};
}
