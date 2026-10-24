import {computed,shallowReactive,shallowRef} from 'vue';
export interface BarSeparator {id:string;before?:string;allowRemove?:boolean}
export interface BarSeparatorOptions {allowAddSeparator?:boolean;separators?:readonly BarSeparator[]}
/** Bar-local presentation items never register content or activate views. */
export function createBarSeparators(options:BarSeparatorOptions,hasView:(id:string)=>boolean,canMove:()=>boolean=()=>true){
 const entries=shallowReactive<BarSeparator[]>([]),owners=new Map<string,symbol>();const disposed=shallowRef(false);let serial=0;
 function registerSeparator(input:BarSeparator){
  if(disposed.value)throw new Error('Frame is disposed');
  if(!input.id||entries.some(item=>item.id===input.id)||hasView(input.id))throw new Error(`Duplicate separator: ${input.id}`);
  const entry=Object.freeze({...input}),owner=Symbol();entries.push(entry);owners.set(entry.id,owner);
  return ()=>{if(owners.get(entry.id)!==owner)return;const index=entries.findIndex(item=>item.id===entry.id);if(index>=0)entries.splice(index,1);owners.delete(entry.id);};
 }
 function addSeparator(before?:string){
  if(disposed.value||!options.allowAddSeparator||before!==undefined&&!hasView(before))return undefined;
  let id:string;do{id=`separator-${++serial}`;}while(hasView(id)||entries.some(item=>item.id===id));
  registerSeparator({id,before,allowRemove:true});return id;
 }
 function removeSeparator(id:string){const at=entries.findIndex(item=>item.id===id);if(disposed.value||at<0||!entries[at]!.allowRemove)return false;owners.delete(id);entries.splice(at,1);return true;}
 function moveSeparator(id:string,before?:string){const at=entries.findIndex(item=>item.id===id);if(disposed.value||!canMove()||at<0||before!==undefined&&!hasView(before))return false;entries[at]=Object.freeze({...entries[at]!,before});return true;}
 for(const entry of options.separators??[])registerSeparator(entry);
 return {canMoveSeparators:computed(()=>!disposed.value&&canMove()),allowAddSeparator:computed(()=>!disposed.value&&!!options.allowAddSeparator),separators:computed<readonly BarSeparator[]>(()=>Object.freeze([...entries])),registerSeparator,addSeparator,removeSeparator,moveSeparator,disposeSeparators(){disposed.value=true;owners.clear();entries.splice(0);}};
}
