import type {FrameMenuItem} from '../types';
/** Common edit actions; each bar appends its own placement and content actions. */
export function barContextActions(options:{allowAddSeparator:boolean;target?:{separator?:boolean;label:string;allowRemove?:boolean;badgeVisible?:boolean;earlier:boolean;later:boolean}}):FrameMenuItem[]{
 const items:FrameMenuItem[]=[],target=options.target;
 const divider=()=>{if(items.length&&items[items.length-1]?.type!=='separator')items.push({id:`edit-divider-${items.length}`,type:'separator'});};
 if(options.allowAddSeparator)items.push({id:'add-separator',label:'Add Separator'});
 if(target?.separator){if(target.allowRemove)items.push({id:'delete-separator',label:'Delete Separator'});divider();}
 else {divider();if(target)items.push({id:'hide',label:`Hide '${target.label}'`},{id:'badge',label:target.badgeVisible?'Hide Badge':'Show Badge'});}
 if(target)items.push({id:'earlier',label:'Move Earlier',disabled:!target.earlier},{id:'later',label:'Move Later',disabled:!target.later});
 divider();return items;
}
