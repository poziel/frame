export function scrubValue(
  value:number,
  step:number,
  min:number|undefined,
  max:number|undefined
) {
  const [coefficient,exponent='0']=String(step).toLowerCase().split('e');
  const precision=Math.min(12,Math.max(0,(coefficient.split('.')[1]?.length??0)-Number(exponent)));
  const rounded=Number(value.toFixed(precision));
  return Math.max(min??-Infinity,Math.min(max??Infinity,rounded));
}

/** Bounded dragging follows the pointer across the visible value bar. */
export function scrubPosition(
  x:number,
  left:number,
  width:number,
  min:number,
  max:number,
  step:number
) {
  const ratio=Math.max(0,Math.min(1,(x-left)/Math.max(1,width)));
  return scrubValue(min+Math.round(ratio*(max-min)/step)*step,step,min,max);
}
