import {serializeUsage} from './documentation/demoState';
import {generalCases} from './documentation/generalFixtures';
import type {ComponentContract,FeatureExample} from './documentation/types';
import type {ComponentExample} from './componentCatalog';
import { coreComponentSource } from './componentGroups';
export const generalFamilies = [
 ['accordion','Accordion'],
 ['aspect-ratio','AspectRatio'],
 ['avatar','Avatar'],
 ['collapsible','Collapsible'],
 ['pagination','Pagination'],
 ['progress','Progress'],
 ['scroll-area','ScrollArea'],
 ['separator','Separator'],
 ['tabs','Tabs'],
 ['stepper','Stepper'],
 ['toolbar','Toolbar'],
 ['tree','Tree'],
 ['splitter','Splitter'],
 ['navigation-menu','NavigationMenu'],
 ['menubar','Menubar'],
 ['dialog','Dialog'],
 ['alert-dialog','AlertDialog'],
 ['drawer','Drawer'],
 ['popover','Popover'],
 ['hover-card','HoverCard'],
 ['dropdown-menu','DropdownMenu'],
 ['context-menu','ContextMenu'],
 ['toast','Toast'],
] as const;
export const generalExamples:ComponentExample[]=generalFamilies.map((
  [id,name]
)=>({id:'general-'+id,title:name.replace(/([a-z])([A-Z])/g,'$1 $2'),group:['dialog','alert-dialog','drawer','popover','hover-card','dropdown-menu','context-menu','toast'].includes(id)?'Overlays':'General',description:'A themed '+name.replace(/([a-z])([A-Z])/g,'$1 $2').toLowerCase()+' powered by Reka UI.'+(['Drawer','Tree'].includes(name)?' This Reka primitive is Alpha.':''),usage:'Use this standalone control inside application-owned views. The host supplies content and handles domain actions.',code:serializeUsage({name:'Frame'+name,source:coreComponentSource('Frame'+name),props:Object.keys(generalCases['Frame'+name]?.[0]?.values??{}).map(name=>({name,type:'unknown',control:'json',default:{kind:'omitted'},description:'',references:[]})),emits:[],slots:[],methods:[],forwardsAttrs:true},generalCases['Frame'+name]?.[0]?.values??{},generalCases['Frame'+name]?.[0]?.slots??{}),properties:Object.entries(generalCases['Frame'+name]?.[0]?.values??{}).map((
  [name,value]
)=>({name,type:Array.isArray(value)?'array':value===null?'number | null':typeof value,description:'Configured in this example. See the API tab for the complete inherited contract and defaults.'}))}));

export function generalFeatures(
  name:string,
  contract:ComponentContract
):FeatureExample[]|undefined {
 return generalCases[name]?.map((item, index)=>({id:'task-'+index,title:item.title,description:item.description,variant:'default',values:item.values,slots:item.slots??{},code:serializeUsage(contract,item.values,item.slots??{})}));
}
