import contracts from './contracts.json';
import themes from './themes.json';
import serviceContracts from './services.json';
import { componentExamples } from '../componentCatalog';
import { variantsFor } from '../exampleVariants';
import { exampleValue, serializeUsage } from './demoState';
import type { ComponentContract, ComponentDocumentation, FeatureExample, ThemeClass, ThemeToken } from './types';
const sources=contracts.pageSources as Record<string,string[]>;
const surfaces=contracts.contracts as unknown as Record<string,ComponentContract>;
const styling=themes as Record<string,{classes:ThemeClass[];tokens:ThemeToken[]}>;
export const componentDocumentation:Record<string,ComponentDocumentation> = Object.fromEntries(componentExamples.map(example=>{
 const components=sources[example.id]!.map(source=>surfaces[source]!);const main=components[0]!;
 const baseline=Object.fromEntries(main.props.filter(p=>p.default.kind==='required'||p.name==='modelValue'||p.name==='label').map(p=>[p.name,exampleValue(p,main.name)]));
 const slots=Object.fromEntries(main.slots.filter(slot=>['default','first','second'].includes(slot.name)).map(slot=>[slot.name,slot.name==='default'?'Example content':slot.name+' pane']));
 const variants=variantsFor(example.id);
 const features:FeatureExample[]=variants.length>1?variants.map(item=>({id:item.id,title:item.label,description:item.id==='default'?example.usage:item.id==='plain'?'Omit descriptions for a compact list.':item.id==='separators'?'Separate groups without introducing selectable values.':'Unavailable choices are skipped by pointer and keyboard selection.',variant:item.id,code:item.code||example.code})): [{id:'basic',title:'Basic usage',description:example.usage,variant:'default',code:example.code}];
 if(features.length===1){
  const disabled=main.props.find(p=>p.name==='disabled');const variant=main.props.find(p=>(p.options?.length??0)>1);const configurable=disabled??variant??main.props.find(p=>p.default.kind!=='required'&&['text','number','boolean'].includes(p.control));
  const values={...baseline,...(configurable?{[configurable.name]:disabled?true:configurable.options?.[1]??exampleValue(configurable)}:{})};
  if(main.name==='FrameIcon')values.pack='codicon';
  if(main.name==='Terminal'){delete values.sessionId;values.label='Local terminal';}
  features.push({id:'configured',title:disabled?'Disabled state':variant?'Visual variants':'Composition and configuration',description:configurable?`Set ${configurable.name} explicitly to override its default. The interactive demo exposes every public property.`:'Compose this API with application-owned content. Use the actions in this example to inspect the behavior.',variant:'configured',code:serializeUsage(main,values,slots),...{values}});
 }
 const simple=!['terminal','ai-chat','code-editor','settings','notifications','notification-panel','quick-input','banner','workspace','views','activity-actions','navigation','select'].includes(example.id);
 if(simple){features[0]!.values=baseline;features[0]!.code=serializeUsage(main,baseline,slots);}
 const service=(serviceContracts as unknown as Record<string,ComponentContract>)[example.id];
 if(service)components.push(service);
 const relevant=sources[example.id]!.flatMap(source=>styling[source]?.tokens??[]);
 return [example.id,{id:example.id,components,features,classes:[...new Map(sources[example.id]!.flatMap(source=>styling[source]?.classes??[]).map(item=>[item.name,item])).values()],tokens:[...new Map(relevant.map(item=>[item.name,item])).values()],demoId:example.id}];
}));
