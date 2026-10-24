/** A single insertion boundary shared by both neighboring items. */
export function nearestBarGap<T extends {center:number}>(gaps:readonly T[],coordinate:number):T|undefined {
 return gaps.reduce<T|undefined>((nearest,gap)=>!nearest||Math.abs(gap.center-coordinate)<Math.abs(nearest.center-coordinate)?gap:nearest,undefined);
}
export function barGapAt(root:HTMLElement,axis:'x'|'y',coordinate:number) {
 const gaps=Array.from(root.querySelectorAll<HTMLElement>('[data-bar-drop-before]')).map(element=>{
  const box=element.getBoundingClientRect();
  return {element,before:element.dataset.barDropBefore||undefined,box,center:axis==='x'?box.left+box.width/2:box.top+box.height/2};
 });
 return nearestBarGap(gaps,coordinate);
}
export function barGapMarker(gap:NonNullable<ReturnType<typeof barGapAt>>,axis:'x'|'y') {
 return axis==='x'?{kind:'insert' as const,left:gap.center-1,top:gap.box.top,width:2,height:gap.box.height}:{kind:'insert' as const,left:gap.box.left,top:gap.center-1,width:gap.box.width,height:2};
}
