/** Move stable IDs as one ordered block before an unselected ID, or to the end. */
export function reorderItems(
  order: readonly string[],
  ids: readonly string[],
  beforeId: string | null
): string[] {
 const moving=order.filter(id=>ids.includes(id));
 const rest=order.filter(id=>!ids.includes(id));
 if(beforeId!==null && !rest.includes(beforeId))return [...order];
 const at=beforeId===null?rest.length:rest.indexOf(beforeId);
 return [...rest.slice(0,at),...moving,...rest.slice(at)];
}
