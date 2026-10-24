export interface DragPoint {x:number;y:number}
const owners=new WeakMap<HTMLElement,()=>void>();
/** One gesture lifecycle for views, navigation items, and presentation separators. */
export function startPointerDrag(event:PointerEvent,handlers:{scope?:HTMLElement;move:(point:DragPoint)=>void;drop:(point:DragPoint)=>void;end:()=>void}):()=>void {
 if(event.button!==0)return ()=>{};
 if(handlers.scope)owners.get(handlers.scope)?.();
 let active=false,ended=false,point={x:event.clientX,y:event.clientY};
 const bus=window;
 function update(next:PointerEvent){
  if(next.pointerId!==event.pointerId)return;
  point={x:next.clientX,y:next.clientY};
  if(!active&&Math.hypot(point.x-event.clientX,point.y-event.clientY)<5)return;
  if(!active){active=true;handlers.scope?.classList?.add('frame-item-dragging');}
  next.preventDefault();handlers.move(point);
 }
 function refresh(){if(active)handlers.move(point);}
 function suppressGestureClick(released:boolean){
  let timer:ReturnType<typeof setTimeout>|undefined;
  function cleanup(){clearTimeout(timer);bus.removeEventListener('click',suppress,true);bus.removeEventListener('pointerup',release);bus.removeEventListener('pointerdown',cleanup);bus.removeEventListener('pointercancel',cleanup);bus.removeEventListener('blur',cleanup);}
  function suppress(next:Event){next.preventDefault();next.stopPropagation();cleanup();}
  function release(next:PointerEvent){if(next.pointerId===event.pointerId)timer=setTimeout(cleanup,0);}
  bus.addEventListener('click',suppress,{capture:true});bus.addEventListener('pointerup',release);bus.addEventListener('pointerdown',cleanup);bus.addEventListener('pointercancel',cleanup);bus.addEventListener('blur',cleanup);
  if(released)timer=setTimeout(cleanup,0);
 }
 function finish(next:PointerEvent){
  if(next.pointerId!==event.pointerId)return;
  try{if(active){point={x:next.clientX,y:next.clientY};handlers.move(point);handlers.drop(point);}}finally{stop(true);}
 }
 function key(next:KeyboardEvent){if(next.key==='Escape'){next.preventDefault();next.stopPropagation();cancel();}}
 function pointerCancel(next:PointerEvent){if(next.pointerId===event.pointerId)stop(true);}
 function cancel(){stop(false);}
 function stop(released:boolean){
  if(ended)return;ended=true;
  if(active)suppressGestureClick(released);
  if(handlers.scope&&owners.get(handlers.scope)===cancel){handlers.scope.classList?.remove('frame-item-dragging');owners.delete(handlers.scope);}
  bus.removeEventListener('pointermove',update);bus.removeEventListener('pointerup',finish);bus.removeEventListener('pointercancel',pointerCancel);bus.removeEventListener('keydown',key);bus.removeEventListener('blur',cancel);bus.removeEventListener('scroll',refresh,true);bus.removeEventListener('resize',refresh);handlers.end();
 }
 if(handlers.scope)owners.set(handlers.scope,cancel);
 bus.addEventListener('pointermove',update,{passive:false});bus.addEventListener('pointerup',finish);bus.addEventListener('pointercancel',pointerCancel);bus.addEventListener('keydown',key);bus.addEventListener('blur',cancel);bus.addEventListener('scroll',refresh,true);bus.addEventListener('resize',refresh);
 return cancel;
}
