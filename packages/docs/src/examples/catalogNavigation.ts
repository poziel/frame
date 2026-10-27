import { componentExamples, type ComponentExample } from './componentCatalog';
import contracts from './documentation/contracts.json';
import { componentGroupOrder, componentGroupForSource } from './componentGroups';
const order=componentGroupOrder;
export function categoryFor(example:ComponentExample) {
 if(['ai-prompt','ai-conversation','ai-history','ai-chat','ai-view'].includes(example.id))return 'AI';
 if(example.group==='Modules')return 'Modules';
 if(example.id==='notification-panel')return 'Feedback';
 const source=(contracts.pageSources as Record<string,string[]>)[example.id]?.[0];
 return source ? componentGroupForSource(source) : 'General';
}
export function catalogGroups(features=false, query='', category='all') {
 const q=query.trim().toLocaleLowerCase();
 const entries=componentExamples.filter(item=>(item.group==='Modules')===features).filter(item=>category==='all'||categoryFor(item)===category).filter(item=>{
  const names=(contracts.pageSources as Record<string,string[]>)[item.id]?.map(source=>(contracts.contracts as Record<string,{name:string}>)[source]?.name).join(' ')??'';
  return `${item.id} ${item.title} ${item.description} ${names}`.toLocaleLowerCase().includes(q);
 });
 return [...new Set(entries.map(categoryFor))].sort((a, b)=>(order.indexOf(a)<0?order.length:order.indexOf(a))-(order.indexOf(b)<0?order.length:order.indexOf(b))).map(title=>({title,items:entries.filter(item=>categoryFor(item)===title).sort((
   a,
   b
 )=>a.title.localeCompare(b.title,'en',{sensitivity:'base',numeric:true}))}));
}
export const componentCategories=catalogGroups().map(group=>({value:group.title,label:group.title}));
