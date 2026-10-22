import {generalDemoValues} from './generalFixtures';
import { reactive } from 'vue';
import { isValidColor } from 'reka-ui';
import { dateModelKind, dateExample, hydrateDemoValue, serializeDemoValue } from './formsDemo';
import type { ApiProperty, ComponentContract } from './types';
export const fixtureNames = ['frame', 'history', 'terminal', 'chat', 'editor', 'anchor', 'component', 'callback', 'action', 'matcher', 'datePage', 'validator'] as const;
export function fixtureFor(property: ApiProperty): string {
 const t=property.type;if(/Matcher/.test(t))return 'matcher';if(property.name==='nextPage'||property.name==='prevPage')return 'datePage';if(/ValidateFn/.test(t))return 'validator';if(t==='NotificationAction')return 'action';
 return /NotificationHistory/.test(t)?'history':/TerminalController/.test(t)?'terminal':/AIChatController/.test(t)?'chat':/CodeEditorController/.test(t)?'editor':/HTMLElement/.test(t)?'anchor':/Component/.test(t)?'component':/\bFrame\b/.test(t)?'frame':'callback';
}
export function exampleValue(p:ApiProperty, componentName?:string):unknown {
 if(dateModelKind(componentName??'',p.name))return dateExample(componentName!,p.name);
 if(p.name==='options'&&componentName==='FrameAutocomplete')return ['Vue','Rust','TypeScript'];
 if(p.name==='items'&&componentName==='FrameTagGroup')return [{value:'first',label:'First tag'},{value:'second',label:'Second tag'}];
 if(p.name==='colors')return ['#0078d4','#16a34a','#e05252'];
 if(p.name==='channel')return 'hue';
 if(p.name==='xChannel')return 'saturation';
 if(p.name==='yChannel')return 'brightness';
 if(p.name==='modelValue'&&componentName?.startsWith('FrameColor'))return '#0078d4';
 if(p.name==='modelValue'&&['FramePinInput','FrameTagsInput','FrameCheckboxGroup'].includes(componentName??''))return [];
 if(p.control==='fixture') return '@'+fixtureFor(p);
 if(p.name==='options'&&p.type.includes('CodeEditor'))return {};
 if(p.name==='options')return [{value:'manual',label:'Manual'},{type:'separator',id:'remote'},{value:'automatic',label:'Automatic',description:'Save while working.'}];
 if(p.name==='items')return [{id:'first',label:'First choice'},{id:'second',label:'Second choice'}];
 if(p.name==='panels'||p.name==='tabs')return [{id:'docs-demo-view',label:'Sample view'}];
 if(p.name==='setting')return {id:'volume',label:'Volume',type:'range',default:50,min:0,max:100};
 if(p.name==='point')return {x:150,y:150};
 if(p.name==='highlightedLines')return [2];
 if(p.name==='actions'||p.name==='attachmentActions')return [];
 if(p.name==='options'&&p.type.includes('CodeEditor'))return {};
 if(p.name==='modelValue'&&componentName==='FrameColorPicker')return '#0078d4';
 if(p.name==='modelValue')return p.type.includes('boolean')?false:p.type.includes('number')&&!p.type.includes('string')?40:'manual';
 if(p.name==='id')return 'docs-api-example';
 if(p.name==='name')return componentName==='FrameIcon'?'home':'exampleField';
 if(p.name==='icon')return 'home';
 if(p.name==='as')return 'div';
 if(p.name==='locale')return 'en-US';
 if(p.name==='length')return 5;
 if(p.name==='numberOfMonths')return 2;
 if(p.name==='weekStartsOn')return 1;
 if(p.name==='code')return 'const message = "Hello Frame";\nconsole.log(message);';
 if(p.name==='active'&&componentName==='FrameLoading')return true;
 if(p.name==='activeId')return 'docs-demo-view';
 if(p.name==='viewId')return 'docs-demo-view';
 if(p.options?.length)return p.options[0];
 if(p.control==='boolean')return false;
 if(p.control==='number')return ['max','width','height'].includes(p.name)?300:p.name==='min'?0:24;
 if(p.control==='json')return p.type.includes('[]')?[]:{};
 return p.name==='type'?'button':p.name==='color'?'#0078d4':p.name==='language'?'typescript':p.name==='axis'?'x':p.name==='label'?'Example control':p.name==='title'?'Example dialog':p.name==='text'?'Helpful information':p.name==='placeholder'?'Enter a value…':'Example';
}
function validate(property:ApiProperty,value:unknown) {
 if(value===null&&/\bnull\b/.test(property.type))return true;
 if(property.type.includes('FrameTreeItem')&&['items','modelValue','defaultValue'].includes(property.name)){
  const item=(entry:unknown):boolean=>!!entry&&typeof entry==='object'&&'id'in entry&&typeof entry.id==='string'&&'label'in entry&&typeof entry.label==='string'&&(!('children'in entry)||Array.isArray(entry.children)&&entry.children.every(item));
  return Array.isArray(value)?value.every(item):property.name!=='items'&&item(value);
 }
 if(property.name==='items'&&property.type.includes('FrameAccordionItem'))return Array.isArray(value)&&value.every(item=>item&&typeof item==='object'&&typeof item.value==='string'&&typeof item.title==='string');
 if(property.name==='items'&&property.type.includes('FrameStepItem'))return Array.isArray(value)&&value.every(item=>item&&typeof item==='object'&&Number.isInteger(item.step)&&item.step>0&&typeof item.label==='string');
 if(property.name==='defaultValue'&&property.type.includes('string[]')&&Array.isArray(value))return value.every(item=>typeof item==='string');
 if(property.name==='modelValue'&&property.type.includes('[]')&&Array.isArray(value))return value.every(item=>typeof item==='string');
 if(property.control==='fixture')return typeof value==='string' && value==='@'+fixtureFor(property);
 if(property.control==='boolean')return typeof value==='boolean';
 if(property.control==='number')return typeof value==='number'&&Number.isFinite(value);
 if(property.options?.length)return typeof value==='string'&&property.options.includes(value);
 if(property.control==='text')return typeof value==='string'||(property.type.includes('number')&&typeof value==='number'&&Number.isFinite(value))||(property.type.includes('boolean')&&typeof value==='boolean');
 if(property.name==='modelValue'&&/^string\[\]/.test(property.type))return Array.isArray(value)&&value.every(item=>typeof item==='string');
 if(property.type.includes('[]')&&!property.type.includes('|')&&!Array.isArray(value))return false;
 if(property.name==='options'&&Array.isArray(value)&&property.type.includes('string'))return value.every(v=>typeof v==='string');
 if(property.name==='options'&&Array.isArray(value))return value.every(v=>v&&typeof v==='object'&&('type'in v&&v.type==='separator'?typeof v.id==='string':typeof v.value==='string'&&typeof v.label==='string'));
 if(property.name==='items'&&Array.isArray(value))return value.every(v=>v&&typeof v==='object'&&(typeof v.id==='string'||typeof v.value==='string')&&('type'in v&&v.type==='separator'||typeof v.label==='string'));
 if(property.name==='setting')return !!value&&typeof value==='object'&&['id','label','type','default'].every(key=>key in value);
 return value!==null&&typeof value==='object';
}
export function createDemoState(contract:ComponentContract, initial:Record<string,unknown>={}, options:{includeModel?:boolean}={}) {
 const required=Object.fromEntries(contract.props.filter(p=>p.default.kind==='required').map(p=>[p.name,exampleValue(p,contract.name)]));
 const formsModel=options.includeModel!==false&&contract.name.startsWith('Frame')&&contract.props.some(p=>p.name==='modelValue')&&(/Calendar|Date|Time|Month|Year|Color|Rating|Autocomplete|Editable|NumberField|PinInput|RadioGroup|CheckboxGroup|Switch|TagsInput|Toggle|Listbox|Combobox/.test(contract.name))?{modelValue:exampleValue(contract.props.find(p=>p.name==='modelValue')!,contract.name)}:{};
 const baseline={...required,...formsModel,...generalDemoValues(contract.name),...(contract.name==='frame.registerView'?{component:'@component',region:'secondary'}:{}),...initial};
 const values=reactive<Record<string,unknown>>({...baseline});const errors=reactive<Record<string,string>>({});let disposed=false;
 function set(name:string,input:unknown){
  if(disposed)return false;
  const property=contract.props.find(p=>p.name===name);if(!property)return false;
  if(input===undefined&&property.default.kind!=='required'){delete values[name];delete errors[name];return true;}
  let value=input;
  try{
   if((property.control==='json'||['modelValue','defaultValue'].includes(name)&&property.type.includes('[]')&&typeof input==='string'&&input.trimStart().startsWith('['))&&typeof input==='string')value=dateModelKind(contract.name,name)&&/^\d{2,4}[-:]/.test(input)?input:JSON.parse(input);
   if(property.control==='number'&&typeof input==='string') { if(!input.trim())throw Error('Enter a number.');value=Number(input); }
   if(contract.name.startsWith('FrameColor')&&['modelValue','defaultValue','color'].includes(name)&&typeof value==='string'&&!isValidColor(value))throw Error('Enter a valid CSS color.');
   if(dateModelKind(contract.name,name)){if(Array.isArray(value)&&!property.type.includes('[]'))throw Error('This property accepts one date/time value.');if(value&&typeof value==='object'&&!Array.isArray(value)&&'start'in value&&!/Range/.test(property.type))throw Error('This property accepts one date/time value.');hydrateDemoValue(contract.name,name,value);}else if(!validate(property,value))throw Error('Enter a valid '+property.type+' value.');
   values[name]=serializeDemoValue(value);delete errors[name];return true;
  }catch(error){errors[name]=error instanceof Error?error.message:String(error);return false;}
 }
 function reset(){for(const key of Object.keys(values))delete values[key];Object.assign(values,structuredClone(baseline));for(const key of Object.keys(errors))delete errors[key];}
 return {contract,values,props:values,errors,set,reset,dispose(){disposed=true;}};
}
export function serializeUsage(contract:ComponentContract, values:Record<string,unknown>, slots:Record<string,string>) {
 const extras=contract.source.includes('/features/');const imports=new Set([contract.name]);const lines:string[]=[];
 const attrs=Object.entries(values).map(([name,value])=>{
  const prop=contract.props.find(p=>p.name===name);if(!prop||value===undefined)return '';
  const attribute=name.replace(/[A-Z]/g,c=>'-'+c.toLowerCase());
  if(prop.control==='fixture'||value==='@'+fixtureFor(prop)&&prop.type.includes('Component')) {
   const fixture=fixtureFor(prop);const variable=fixture==='component'?'PreviewContent':fixture;
   if(fixture==='frame')lines.push('const frame = createFrame();');
   if(fixture==='history')lines.push('const history = createNotificationHistory(frame);');
   if(fixture==='terminal')lines.push('const terminal = createTerminal(); // Dispose on host teardown.');
   if(fixture==='editor')lines.push('const editor = createCodeEditor();');
   if(fixture==='chat')lines.push('const chat = createAIChat({ respond: async (_request, writer) => { writer.message("Local demo reply"); writer.complete(); } });');
   if(fixture==='anchor')lines.push('const anchor = ref<HTMLElement>(); // Bind ref="anchor" on the trigger.');
   if(fixture==='component')lines.push("const PreviewContent = () => h('p', 'Preview');");
   if(fixture==='action')lines.push('const action = { label: "Acknowledge", run: () => console.log("Acknowledged") };');
   if(fixture==='callback')lines.push('const callback = () => {};');
   if(fixture==='matcher')lines.push('const matcher = () => false;');
   if(fixture==='datePage')lines.push('const datePage = (value: { add: (duration: { months: number }) => unknown }) => value.add({ months: 1 });');
   if(fixture==='validator')lines.push('const validator = () => undefined;');
   return ':'+attribute+'="'+variable+'"';
  }
  const variable='demo'+name[0]!.toUpperCase()+name.slice(1);
  if(dateModelKind(contract.name,name)){
   const kind=dateModelKind(contract.name,name)!;const parseName=kind==='time'?'parseTime':typeof value==='string'&&value.includes('[')?'parseZonedDateTime':typeof value==='string'&&value.includes('T')?'parseDateTime':'parseDate';imports.add(parseName);
   imports.add('type '+(kind==='time'?(contract.name.includes('Range')?'TimeRange':'TimeValue'):(contract.name.includes('Range')?'DateRange':'DateValue')));
   const expression=(value:unknown):string=>Array.isArray(value)?'['+value.map(expression).join(', ')+']':value&&typeof value==='object'&&'start'in value?'{ start: '+expression((value as {start:unknown}).start)+', end: '+expression((value as {start:unknown;end?:unknown}).end)+' }':value===null||value===undefined?String(value):parseName+'('+JSON.stringify(value)+')';
   if(name==='modelValue'){lines.push('const '+variable+' = shallowRef<'+(kind==='time'?(contract.name.includes('Range')?'TimeRange':'TimeValue'):(contract.name.includes('Range')?'DateRange':'DateValue'))+(contract.name.includes('Range')?'':contract.props.some(p=>p.name==='multiple')?' | DateValue[]':'')+' | null>('+expression(value)+');');return 'v-model="'+variable+'"';}
   lines.push('const '+variable+' = '+expression(value)+';');return ':'+attribute+'="'+variable+'"';
  }
  if(name==='modelValue'){lines.push('const '+variable+' = ref('+JSON.stringify(value)+');');return 'v-model="'+variable+'"';}
  if(typeof value==='string')return ':'+attribute+'="'+JSON.stringify(value).replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'"';
  lines.push('const '+variable+' = '+JSON.stringify(value,null,2)+';');return ':'+attribute+'="'+variable+'"';
 }).filter(Boolean);
 const tag=contract.name;
 const escape=(value:string)=>value.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
 const content=Object.entries(slots).filter(([,v])=>v).map(([name,text])=>`  <template #${name}>${'<span v-text="'+escape(JSON.stringify(text))+'" />'}</template>`).join('\n');
 const fixtures=contract.props.filter(p=>(p.control==='fixture'||p.type.includes('Component')&&values[p.name]==='@component')&&values[p.name]!==undefined).map(fixtureFor);
 const extraImports=[...new Set(fixtures.flatMap(f=>f==='history'?['createNotificationHistory']:f==='terminal'?['createTerminal']:f==='chat'?['createAIChat']:f==='editor'?['createCodeEditor']:[]))];
 if(fixtures.includes('history')&&!fixtures.includes('frame'))lines.unshift('const frame = createFrame();');
 const coreImports=fixtures.includes('frame')||fixtures.includes('history')?['createFrame']:[];
 const service=contract.name.startsWith('frame.');
 const needsShell=service||['FrameSettings','FrameNotifications','WorkspacePanes','ViewSections','ActivityRail','FrameMenu','ContextMenu','FrameModal','NotificationPanel','FrameLoading','FrameTooltip','TerminalView'].includes(contract.name);
 if(needsShell){imports.add('FrameShell');if(!coreImports.includes('createFrame'))coreImports.push('createFrame');if(!lines.includes('const frame = createFrame();'))lines.unshift('const frame = createFrame();');}
 if(needsShell&&contract.name==='ViewSections')lines.push(`frame.registerSidePanel({ id: 'docs-demo-view', label: 'Example collection', children: [{ id: 'docs-demo-child', label: 'Section', component: { render: () => 'Example content' } }] });`);
 let markup=`<${tag} ${fixtures.includes('anchor')?'v-if="anchor" ':''}${attrs.join(' ')}${content?`>\n${content}\n</${tag}>`:' />'}`;
 if(contract.name==='FrameScrollArea'){markup=`<FrameScrollArea ${attrs.join(' ')}><pre style="margin: 0; font: inherit; white-space: pre;" v-text="${escape(JSON.stringify(slots.default??''))}" /></FrameScrollArea>`;}
 if(contract.name==='FrameToast'){imports.add('FrameButton');lines.push('const toastOpen = ref(false);');markup=`<FrameButton @click="toastOpen = true">Show notification</FrameButton>\n<FrameToast ${attrs.filter(attr=>!/^:(?:open|default-open)=/.test(attr)).join(' ')} v-model:open="toastOpen" />`;}
 if(contract.name==='FrameField'){lines.push("const fieldValue = ref('Project name');");markup=`<FrameField ${attrs.join(' ')}><FrameTextInput v-model="fieldValue" /></FrameField>`;imports.add('FrameTextInput');}
 if(contract.name==='FrameForm'){imports.add('FrameField');imports.add('FrameTextInput');imports.add('FrameButton');lines.push("const fieldValue = ref('Project name');",'const submitted = ref("");','function submit(values: Record<string, unknown>, event: SubmitEvent) { event.preventDefault(); submitted.value = JSON.stringify(values); }');markup=`<FrameForm ${attrs.join(' ')} @form-submit="submit"><FrameField name="projectName" label="Project name" required><FrameTextInput v-model="fieldValue" /></FrameField><FrameButton type="submit"><span v-text="${escape(JSON.stringify(slots.default||'Submit form'))}" /></FrameButton><p role="status">{{ submitted }}</p></FrameForm>`;}
 if(contract.name==='FrameLabel'){imports.add('FrameTextInput');lines.push("const fieldValue = ref('Project name');");const id=JSON.stringify(values.for??'project-name').replace(/"/g,'&quot;');markup=`<FrameLabel ${attrs.filter(attr=>!attr.startsWith(':for=')).join(' ')} :for="${id}">${content||'Project name'}</FrameLabel><FrameTextInput :id="${id}" v-model="fieldValue" />`;}
 if(contract.name==='FrameQuickInput'||contract.name==='FrameQuickPanel'){
  imports.add('FrameButton');lines.push('const quickOpen = ref(false);');
  const label=contract.name==='FrameQuickInput'?'Choose an item':'Open panel';
  let body=content;
  if(contract.name==='FrameQuickInput'){
   lines.push('const selected = ref("");','function acceptQuick(id: string) { selected.value = id; quickOpen.value = false; }');
   body=slots.item?`<template #item="{ item }"><div><span v-text="${escape(JSON.stringify(slots.item))}" /><strong>{{ item.label }}</strong><small>{{ item.detail }}</small></div></template>`:'';
  }else if(slots['header-actions'])body=Object.entries(slots).filter(([,value])=>value).map(([name,text])=>name==='header-actions'?`<template #header-actions><FrameButton @click="quickOpen = false"><span v-text="${escape(JSON.stringify(text))}" /></FrameButton></template>`:`<template #${name}><span v-text="${escape(JSON.stringify(text))}" /></template>`).join('\n');
  markup=`<FrameButton @click="quickOpen = true">${label}</FrameButton>\n<${tag} v-if="quickOpen" ${attrs.join(' ')} @close="quickOpen = false"${contract.name==='FrameQuickInput'?' @accept="acceptQuick"':''}>${body}</${tag}>${contract.name==='FrameQuickInput'?'\n<p role="status">{{ selected }}</p>':''}`;
 }
 if(fixtures.includes('anchor'))markup='<button ref="anchor" type="button">Menu trigger</button>\n'+markup;
 if(needsShell)markup=contract.name==='FrameNotifications'?`<FrameShell :frame="frame"><template #overlays>\n${markup}\n</template></FrameShell>`:`<FrameShell :frame="frame">\n${markup}\n</FrameShell>`;
 const cleanup=fixtures.filter(f=>['frame','history','terminal','chat'].includes(f));if(needsShell&&!cleanup.includes('frame'))cleanup.unshift('frame');
 if(cleanup.length)lines.push('onBeforeUnmount(() => { '+[...new Set(cleanup)].reverse().map(f=>f==='terminal'?'void terminal.dispose();':`${f}.dispose();`).join(' ')+' });');
 if(service){
  imports.delete(contract.name);imports.add('FrameShell');
  const valuesCode=Object.entries(values).filter(([name,value])=>value!==undefined&&!(contract.name==='frame.registerView'&&name==='region')).map(([name,value])=>JSON.stringify(name)+': '+(contract.props.find(prop=>prop.name===name)?.control==='fixture'?(fixtureFor(contract.props.find(prop=>prop.name===name)!)==='component'?'PreviewContent':fixtureFor(contract.props.find(prop=>prop.name===name)!)):JSON.stringify(value))).join(', ');
  let call=contract.name==='frame.registerView'?`serviceCleanup = frame.registerView({ ${valuesCode} }, ${JSON.stringify(values.region??'secondary')}); frame.openView(${JSON.stringify(values.id)});`:contract.name==='frame.setWorkspacePane'?`frame.setWorkspacePane(frame.workspace.activePane.value, { ${valuesCode} });`:contract.name==='frame.showQuickPick'?`void frame.showQuickPick([{ id: 'one', label: 'First' }, { id: 'two', label: 'Second' }], { ${valuesCode} });`:`${contract.name}({ ${valuesCode} });`;
  if(['frame.registerBanner','frame.registerSettingsSection','frame.registerActivityAction'].includes(contract.name)){call='serviceCleanup = '+call;if(contract.name==='frame.registerBanner')call+=' frame.openBanner();';if(contract.name==='frame.registerSettingsSection')call+=' frame.openSettings();';}
  lines.push('let serviceCleanup: (() => void) | undefined;');
  lines.push('onBeforeUnmount(() => serviceCleanup?.());');
  lines.push(`function runExample() { serviceCleanup?.(); serviceCleanup = undefined; ${call} }`);
  markup='<FrameShell :frame="frame"><button type="button" @click="runExample">Run '+contract.name+'</button></FrameShell>';
 }
 const componentImports=[...imports].filter(name=>!(extras&&name==='FrameShell'));
 if(extras&&needsShell)coreImports.push('FrameShell');
 return `<script setup lang="ts">\nimport { h, ref, shallowRef, onBeforeUnmount } from 'vue';\nimport { ${componentImports.join(', ')} } from '${extras?'@frame/features':'@frame/core'}';\n${coreImports.length?`import { ${[...new Set(coreImports)].join(', ')} } from '@frame/core';\n`:''}${extraImports.length?`import { ${extraImports.join(', ')} } from '@frame/features';\n`:''}${[...new Set(lines)].join('\n')}\n<`+`/script>\n<template>\n${markup}\n</template>`;

}
