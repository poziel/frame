import ts from 'typescript';
import {createHash} from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, relative } from 'node:path';
const root = resolve(import.meta.dir, '../../..');
const core = 'packages/core/src/components/';
const extra = 'packages/extras/src/';
export const pageSources: Record<string, string[]> = {
  buttons: [core+'FrameButton.vue'], 'icon-buttons':[core+'FrameIconButton.vue'],
  'text-input':[core+'FrameTextInput.vue'], checkbox:[core+'FrameCheckbox.vue'], select:[core+'FrameSelect.vue'],
  slider:[core+'FrameSlider.vue'], 'color-picker':[core+'FrameColorPicker.vue'], 'text-area':[core+'FrameTextArea.vue'],
  'setting-controls':[core+'SettingControl.vue'], icons:[core+'FrameIcon.vue'], tooltips:[core+'FrameTooltip.vue'],
  menus:[core+'FrameMenu.vue'], 'context-menu':[core+'ContextMenu.vue'], 'resizable-panes':[core+'ResizablePane.vue'],
  'resize-handle':[core+'ResizeHandle.vue'], modals:[core+'FrameModal.vue'], settings:[core+'FrameSettings.vue'],
  notifications:[core+'FrameNotifications.vue'], 'notification-panel':[extra+'NotificationPanel.vue',extra+'NotificationIndicator.vue'],
  'quick-input':[core+'CommandPalette.vue'], banner:[core+'FrameShell.vue'], workspace:[core+'WorkspacePanes.vue'],
  views:[core+'SidePanel.vue',core+'ViewSections.vue'], 'activity-actions':[core+'ActivityRail.vue'], navigation:[core+'FrameShell.vue'],
  loader:[core+'FrameLoader.vue'], loading:[core+'FrameLoading.vue'], 'code-block':[core+'FrameCodeBlock.vue'],
  'code-editor':[extra+'CodeEditor.vue'], terminal:[extra+'Terminal.vue',extra+'TerminalView.vue'], 'ai-chat':[extra+'AIChat.vue'],
};
const files = [...new Set(Object.values(pageSources).flat())];
const script = (file: string) => readFileSync(file,'utf8').match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1] ?? '';
const options: ts.CompilerOptions = { target: ts.ScriptTarget.ES2020, module:ts.ModuleKind.ESNext, moduleResolution:ts.ModuleResolutionKind.Bundler, strict:true, skipLibCheck:true, baseUrl:root, paths:{'@frame/core':['packages/core/src/frame/index.ts']} };
const host = ts.createCompilerHost(options);
const originalRead = host.readFile.bind(host), originalExists = host.fileExists.bind(host);
host.fileExists = file => file.endsWith('.vue.ts') ? existsSync(file.slice(0,-3)) : originalExists(file);
host.readFile = file => file.endsWith('.vue.ts') ? script(file.slice(0,-3)) : originalRead(file);
const program = ts.createProgram(files.map(file => resolve(root,file)+'.ts'),options,host);
const checker = program.getTypeChecker();
const descriptions: Record<string,string> = {
 modelValue:'Controlled value. Updates are emitted through update:modelValue; the application owns the value.',
 disabled:'Prevents user interaction while retaining the current value.', label:'Visible or accessible label for the control.',
 options:'Ordered selectable choices and separators. Only enabled choices can become selected values.',
 defaultValue:'Marks the default choice without changing the current selected value.',
 variant:'Selects the visual variant.', size:'Rendered size in pixels; string sizes retain their CSS unit.',
 name:'Icon name, optionally including its Iconify collection prefix.', pack:'Iconify collection prefix; overrides the prefix in name.',
 icon:'Optional leading icon; provide an accessible label for icon-only actions.',
 type:'Native input/button behavior.', placeholder:'Hint displayed when the field is empty.',
 min:'Minimum accepted or displayed value.', max:'Maximum accepted or displayed value.', step:'Increment used by the control.',
 text:'Text displayed by the component.', title:'Visible heading.', items:'Ordered application-owned entries.',
 placement:'Preferred overlay placement; the component fits content to available space.',
 anchor:'Real HTMLElement used to position the overlay and restore focus.',
 children:'Nested application-owned contributions.', frame:'Frame instance coordinating this presentation.',
 history:'Optional history store from createNotificationHistory, independent of active notifications.',
 terminal:'Application-owned terminal controller. Dispose it according to its ownership rules.',
 chat:'Application-owned chat controller. Requests start only when explicitly sent.',
 editor:'Optional editor controller. A controller can attach to only one editor surface at a time.',
 language:'Syntax language identifier.', theme:'Supported editor or syntax-highlighting theme.',
 code:'Source text displayed without changing its contents.', rows:'Initial visible textarea row count.',
 bottom:'Distance in pixels from the presentation boundary bottom.',
 active:'Shows the loading presentation while retaining the mounted content.',
 showLoader:'Shows the loader animation.', showText:'Shows supporting loading text.',
 decorative:'Omits the loader from the accessible name when surrounding content already describes it.',
 speed:'Animation loop duration in seconds; zero pauses animation.',
 profile:'Detected shell profile identifier or name. Shell creation requires explicit activation.',
 cwd:'Initial working directory for a new terminal session.', sessionId:'Attaches to an existing terminal session instead of creating another one.',
 readOnly:'Disables editing. When omitted, nested editor options can provide the value.',
 copyable:'Shows the copy action for the displayed source.', wrap:'Wraps source lines in the available width.',
 actions:'Application-owned header actions.', textPosition:'Placement of loading text relative to its animation.',
};
function describe(name:string, symbol?:ts.Symbol) {
 const comment = symbol ? ts.displayPartsToString(symbol.getDocumentationComment(checker)) : '';
 return comment || descriptions[name] || `${name.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase())} configuration for this component; see its Features examples for usage.`;
}
const unquote=(text:string)=>text.replace(/^['"]|['"]$/g,'');
const contracts: Record<string,unknown> = {};
for (const file of files) {
 const source = program.getSourceFile(resolve(root,file)+'.ts')!;
 let propsType:ts.TypeNode|undefined, defaults:ts.ObjectLiteralExpression|undefined, emitsType:ts.TypeNode|undefined, slotsType:ts.TypeNode|undefined, expose:ts.ObjectLiteralExpression|undefined;
 function walk(node:ts.Node) {
  if(ts.isCallExpression(node)) {
   const name=node.expression.getText(source);
   if(name==='defineProps') propsType=node.typeArguments?.[0];
   if(name==='withDefaults' && node.arguments[1] && ts.isObjectLiteralExpression(node.arguments[1])) defaults=node.arguments[1];
   if(name==='defineEmits') emitsType=node.typeArguments?.[0];
   if(name==='defineSlots') slotsType=node.typeArguments?.[0];
   if(name==='defineExpose' && node.arguments[0] && ts.isObjectLiteralExpression(node.arguments[0])) expose=node.arguments[0];
  }
  ts.forEachChild(node,walk);
 }
 walk(source);
 const defaultMap=new Map<string,string>();
 for(const field of defaults?.properties ?? []) if(ts.isPropertyAssignment(field)) defaultMap.set(unquote(field.name.getText(source)),field.initializer.getText(source));
 const props=propsType ? checker.getPropertiesOfType(checker.getTypeFromTypeNode(propsType)).map(symbol=>{
  const decl=symbol.valueDeclaration ?? symbol.declarations?.[0]!;
  const type=checker.getTypeOfSymbolAtLocation(symbol,decl);
  const display=(decl as ts.PropertySignature).type?.getText() ?? checker.typeToString(type,undefined,ts.TypeFormatFlags.NoTruncation);
  const optional=!!(symbol.flags & ts.SymbolFlags.Optional);
  const textDefault=defaultMap.get(symbol.name);
  const branches=type.isUnion()?type.types:[type];
  const choices=branches.filter(t=>t.isStringLiteral()).map(t=>(t as ts.StringLiteralType).value);
  const isBoolean=branches.some(t=>!!(t.flags&(ts.TypeFlags.Boolean|ts.TypeFlags.BooleanLiteral)));
  const isNumber=branches.some(t=>!!(t.flags&(ts.TypeFlags.Number|ts.TypeFlags.NumberLiteral)));
  const isText=branches.some(t=>!!(t.flags&ts.TypeFlags.String)) || choices.length>0;
  const fixture=(/Controller|HTMLElement|\bFrame\b|Component|NotificationHistory/.test(display) || display.includes('=>'))&&!isText;
  let value:unknown = !optional ? {kind:'required'} : isBoolean ? {kind:'literal',value:'false'} : {kind:'omitted'};
  if(textDefault!==undefined) value=textDefault==='undefined'?{kind:'omitted'}:/^['"\d-]|^(true|false|null)$/.test(textDefault)?{kind:'literal',value:textDefault}:textDefault.startsWith('() =>')?{kind:'literal',value:textDefault.replace(/^\(\) =>\s*/,'')}:{kind:'derived',expression:textDefault};
  return {name:symbol.name,type:display,default:value,description:symbol.name==='options'&&file.endsWith('CodeEditor.vue')?'Nested Monaco editor and model options. Direct readOnly and label props take precedence.':symbol.name==='iconSize'?'Explicit icon size in pixels. When omitted, size is multiplied by iconRatio.':describe(symbol.name,symbol),options:choices.length?choices:undefined,control:fixture?'fixture':isBoolean&&!isText?'boolean':isNumber&&!isText?'number':isText?'text':'json',references:[...new Set(display.match(/\b[A-Z][A-Za-z0-9]+\b/g)??[])].filter(n=>!['Promise','MouseEvent','KeyboardEvent','HTMLElement','Component'].includes(n))};
 }):[];
 const callable=(node:ts.TypeNode|undefined,slot=false)=>node?checker.getPropertiesOfType(checker.getTypeFromTypeNode(node)).map(symbol=>{
  const declaration=symbol.declarations?.[0]!;
  const value=checker.getTypeOfSymbolAtLocation(symbol,declaration);
  const signature=value.getCallSignatures()[0];
  return {name:symbol.name,parameters:!slot && ts.isPropertySignature(declaration) && declaration.type ? declaration.type.getText().replace(/^\[|\]$/g,'') : signature?signature.parameters.map(p=>`${p.name}: ${checker.typeToString(checker.getTypeOfSymbolAtLocation(p,declaration),undefined,ts.TypeFormatFlags.NoTruncation)}`).join(', '):checker.typeToString(value),returns:slot?'VNodeChild':'void',description:slot?`Content rendered in the ${symbol.name} slot.`:symbol.name==='update:modelValue'?'Emitted when the user changes the controlled value.':`Emitted on ${symbol.name.replace(/([A-Z])/g,' $1').toLowerCase()}.`};
 }):[];
 const emits=callable(emitsType), slots=callable(slotsType,true);
 const full=readFileSync(resolve(root,file),'utf8');
 for(const match of full.matchAll(/<slot\b([^>]*?)(?:\/>|>)/g)) {
  const name=match[1]!.match(/\bname=['"]([^'"]+)['"]/)?.[1]??'default';
  if(!slots.some(slot=>slot.name===name)) slots.push({name,parameters:[...match[1]!.matchAll(/:([\w-]+)=/g)].map(m=>`${m[1]}: unknown`).join(', '),returns:'VNodeChild',description:`Content rendered in the ${name} slot.`});
 }
 const slotParameters:Record<string,Record<string,string>>={FrameTooltip:{default:'describedby: string | undefined'},FrameShell:{default:'pane: WorkspacePane','workspace-pane':'pane: WorkspacePane',overlays:'bounds: OverlayBounds, target: HTMLElement | undefined'},AIChat:{'message-actions':'message: ChatMessage'}};
 const componentName=file.split('/').pop()!.replace('.vue','');
 for(const slot of slots)if(slotParameters[componentName]?.[slot.name])slot.parameters=slotParameters[componentName]![slot.name]!;
 const methods=(expose?.properties??[]).map(field=>{
  const name=field.name?unquote(field.name.getText(source)):'exposed';
  const type=ts.isPropertyAssignment(field)?checker.getTypeAtLocation(field.initializer):checker.getTypeAtLocation(field);const signature=type.getCallSignatures()[0];
  const text=field.getText(source);
  return {name,kind:signature?'method':'property',parameters:signature?signature.parameters.map(p=>p.name+': '+checker.typeToString(checker.getTypeOfSymbolAtLocation(p,field))).join(', '):'',returns:signature?checker.typeToString(signature.getReturnType()):text.includes('=>')?'void':checker.typeToString(type),description:name==='focus'?'Focuses the rendered control.':`Exposed ${name} API. Available through the mounted component ref.`};
 });
 contracts[file]={name:file.split('/').pop()!.replace('.vue',''),source:file,sourceHash:createHash('sha256').update(full).digest('hex'),props,emits,slots,methods,forwardsAttrs:full.includes('$attrs') || !full.includes('inheritAttrs: false')};
}
const serviceSpecs:Record<string,{name:string;type:string;source:string;returns:string}>={
 notifications:{name:'frame.notify',type:'NotificationOptions',source:'packages/core/src/types.ts',returns:'{ id: string; close: () => void }'},
 modals:{name:'frame.openModal',type:'ModalDefinition',source:'packages/core/src/types.ts',returns:'{ id: string; close: () => void }'},
 settings:{name:'frame.registerSettingsSection',type:'SettingsSection',source:'packages/core/src/types.ts',returns:'() => void'},
 banner:{name:'frame.registerBanner',type:'WorkspaceBannerDefinition',source:'packages/core/src/types.ts',returns:'() => void'},
 workspace:{name:'frame.setWorkspacePane',type:'WorkspacePaneContent',source:'packages/core/src/types.ts',returns:'void'},
 views:{name:'frame.registerView',type:'SidePanelDefinition',source:'packages/core/src/types.ts',returns:'() => void'},
 'activity-actions':{name:'frame.registerActivityAction',type:'ActivityAction',source:'packages/core/src/types.ts',returns:'() => void'},
 'quick-input':{name:'frame.showQuickPick',type:'QuickPickOptions',source:'packages/core/src/types.ts',returns:'Promise<QuickPickItem | undefined>'},
};
const services:Record<string,unknown>={};
for(const [id,spec] of Object.entries(serviceSpecs)){
 const sf=program.getSourceFile(resolve(root,spec.source));if(!sf)throw new Error('Missing service source: '+spec.source);
 const node=sf.statements.find(node=>(ts.isInterfaceDeclaration(node)||ts.isTypeAliasDeclaration(node))&&node.name.text===spec.type);if(!node)throw new Error('Missing service contract: '+spec.type);
 const props=checker.getPropertiesOfType(checker.getTypeAtLocation(node)).map(symbol=>{
  const decl=symbol.valueDeclaration??symbol.declarations![0]!;const display=(decl as ts.PropertySignature).type?.getText()??'unknown';const type=checker.getTypeOfSymbolAtLocation(symbol,decl);const branches=type.isUnion()?type.types:[type];const choices=branches.filter(t=>t.isStringLiteral()).map(t=>(t as ts.StringLiteralType).value);
  const fixture=/Component|NotificationAction/.test(display)||display.includes('=>');
  let value:unknown=symbol.flags&ts.SymbolFlags.Optional?{kind:'omitted'}:{kind:'required'};
  if(id==='notifications'&&symbol.name==='duration')value={kind:'literal',value:'5000'};
  if(id==='notifications'&&symbol.name==='severity')value={kind:'literal',value:'"info"'};
  return {name:symbol.name,type:display,default:value,description:describe(symbol.name,symbol),options:choices.length?choices:undefined,control:fixture?'fixture':display==='boolean'?'boolean':display==='number'?'number':display==='string'||choices.length?'text':'json',references:[...new Set(display.match(/\b[A-Z][A-Za-z0-9]+\b/g)??[])]};
 });
 if(id==='views')props.push({name:'region',type:'ViewRegion',default:{kind:'required'},description:'Shell region in which to register the view.',options:['primary','secondary','bottom'],control:'text',references:['ViewRegion']});
 const parameters=id==='views'?'input: SidePanelDefinition, region: ViewRegion':id==='workspace'?'id: string, content: WorkspacePaneContent':id==='quick-input'?'items: readonly QuickPickItem[], options?: QuickPickOptions':`options: ${spec.type}`;
 services[id]={name:spec.name,source:spec.source,props,emits:[],slots:[],forwardsAttrs:false,methods:[{name:spec.name,kind:'method',parameters,returns:spec.returns,description:'Call this public Frame API with application-owned configuration.'}]};
}
writeFileSync(resolve(root,'packages/docs/src/examples/documentation/services.json'),JSON.stringify(services,null,2)+'\n');
const referenced=new Set<string>();
for(const spec of Object.values(serviceSpecs))referenced.add(spec.type);
for(const contract of [...Object.values(contracts),...Object.values(services)] as {props:{references:string[]}[]}[])for(const prop of contract.props)for(const name of prop.references)referenced.add(name);
const references:Record<string,unknown>={};
for(const sf of program.getSourceFiles()){
 const path=relative(root,sf.fileName).replace(/\\/g,'/');
 if(!path.startsWith('packages/core/src/')&&!path.startsWith('packages/extras/src/'))continue;
 for(const node of sf.statements){
  if(!(ts.isInterfaceDeclaration(node)||ts.isTypeAliasDeclaration(node)||ts.isEnumDeclaration(node))||!referenced.has(node.name.text))continue;
  const name=node.name.text;const props=ts.isInterfaceDeclaration(node)?node.members.filter(ts.isPropertySignature).map(member=>({name:member.name.getText(sf),type:member.type?.getText(sf)??'unknown',description:describe(member.name.getText(sf)),...(member.questionToken?{}:{})})):[];
  references[name]={description:`Public ${ts.isInterfaceDeclaration(node)?'interface':ts.isEnumDeclaration(node)?'enum':'type'} declared in ${path}.`,usage:`Import ${name} from ${path.includes('/extras/')?'@frame/extras':'@frame/core'}. The definition below is the source contract; optional fields may be omitted.`,code:node.getText(sf),properties:props,package:path.includes('/extras/')?'@frame/extras':'@frame/core'};
 }
}
writeFileSync(resolve(root,'packages/docs/src/examples/documentation/references.json'),JSON.stringify(references,null,2)+'\n');
const output=resolve(root,'packages/docs/src/examples/documentation/contracts.json');
writeFileSync(output,JSON.stringify({pageSources,contracts},null,2)+'\n');
console.log(`Extracted ${files.length} component contracts`);
