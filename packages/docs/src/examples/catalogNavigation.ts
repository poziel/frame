import { componentExamples, type ComponentExample } from './componentCatalog';
import contracts from './documentation/contracts.json';
const order=['Actions','Form controls','Display','Overlays','Navigation','Layout','Workspace','Colors','Dates and times','Features'];
const legacyFirst=['text-input','text-area','checkbox','select','slider','setting-controls'];
export function categoryFor(example:ComponentExample) {return example.id==='color-picker'?'Colors':example.group==='Forms'?'Form controls':example.group;}
export function catalogGroups(features=false,query='',category='all') {
 const q=query.trim().toLocaleLowerCase();
 const entries=componentExamples.filter(item=>(item.group==='Features')===features).filter(item=>category==='all'||categoryFor(item)===category).filter(item=>{
  const names=(contracts.pageSources as Record<string,string[]>)[item.id]?.map(source=>(contracts.contracts as Record<string,{name:string}>)[source]?.name).join(' ')??'';
  return `${item.id} ${item.title} ${item.description} ${names}`.toLocaleLowerCase().includes(q);
 });
 return [...new Set(entries.map(categoryFor))].sort((a,b)=>(order.indexOf(a)<0?order.length:order.indexOf(a))-(order.indexOf(b)<0?order.length:order.indexOf(b))).map(title=>({title,items:entries.filter(item=>categoryFor(item)===title).sort((a,b)=>{const first=legacyFirst.indexOf(a.id),second=legacyFirst.indexOf(b.id);return(first<0?100:first)-(second<0?100:second);})}));
}
export const componentCategories=catalogGroups().map(group=>({value:group.title,label:group.title}));
