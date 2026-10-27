import {componentExamples} from '../componentCatalog';
import {serializeUsage} from './demoState';
import type {ComponentContract,FeatureExample} from './types';
interface Case {id:string;title:string;description:string;values:Record<string,unknown>;slots?:Record<string,string>}
const cases:Record<string,Case[]>={
 'quick-input':[
  {id:'pick-command',title:'Find and choose a command',description:'Search command labels and details, then use the arrow keys and Enter to accept an enabled command. The host receives its stable ID.',values:{title:'Choose a command',placeholder:'Find a command…',items:[{id:'open',label:'Open workspace',detail:'Choose a workspace folder'},{id:'save',label:'Save all files',shortcut:'Ctrl+Shift+S'},{id:'unavailable',label:'Connect remote',disabled:true}]}},
  {id:'choose-file',title:'Search a centered file picker',description:'Center the same searched list when choosing a file is the main task. Matching details help distinguish files with similar names.',values:{title:'Open file',position:'center',items:[{id:'src-app',label:'App.vue',detail:'src/App.vue'},{id:'test-app',label:'App.test.ts',detail:'tests/App.test.ts'},{id:'readme',label:'README.md',detail:'Project documentation'}]}},
  {id:'custom-item',title:'Present richer item content',description:'The item slot receives each item and its active state. This example keeps the live label and detail while adding a consistent visual prefix.',values:{title:'Choose a workspace',items:[{id:'design',label:'Design system',detail:'Shared interface components'},{id:'app',label:'Application',detail:'Product workspace'}]},slots:{item:'→ '}},
 ],
 'quick-panel':[
  {id:'workspace-summary',title:'Review a workspace summary',description:'Use a quick panel for application content that is not a searched list. The host owns the content and closes the panel in response to close.',values:{title:'Workspace summary'},slots:{default:'Design system workspace · 12 active projects · Last saved just now.'}},
  {id:'header-action',title:'Add a panel header action',description:'Place an explicit Done action in the header-actions slot while leaving the content body available for application-owned information.',values:{title:'Review changes'},slots:{default:'All source files are saved. Review the changes before continuing.','header-actions':'Done'}},
  {id:'centered-summary',title:'Center a focused information panel',description:'Center custom content when the panel deserves the user’s attention without adding an unrelated search field or item model.',values:{title:'Build summary',position:'center'},slots:{default:'Build completed successfully. 24 modules checked, no errors.','header-actions':'Close summary'}},
 ],
 buttons:[
  {id:'primary-action',title:'Emphasize the next step',description:'A primary action gives the next step in a form or workflow clear visual emphasis.',values:{variant:'primary',icon:'check'},slots:{default:'Create project'}},
  {id:'secondary-action',title:'Offer a secondary action',description:'Keep an alternative action available without giving it the same emphasis as the primary step.',values:{variant:'secondary'},slots:{default:'Save draft'}},
  {id:'quiet-action',title:'Keep a utility action quiet',description:'A ghost button fits frequent utility actions inside toolbars and content views.',values:{variant:'ghost',icon:'refresh'},slots:{default:'Refresh preview'}},
 ],
 'icon-buttons':[
  {id:'toolbar-save',title:'Fit a save action into a toolbar',description:'The icon remains compact while the accessible label and tooltip identify its purpose.',values:{label:'Save project',icon:'save',shortcut:'Ctrl+S'}},
  {id:'inspect-history',title:'Explain a history action on hover',description:'A custom tooltip provides more context than the short accessible button label.',values:{label:'History',icon:'history',tooltip:'Review recent workspace changes',tooltipPlacement:'right'}},
  {id:'larger-action',title:'Make a prominent icon action',description:'Choose the button and icon sizes independently when an action needs more room.',values:{label:'Add workspace',icon:'add',size:36,iconSize:22}},
 ],
 'text-input':[
  {id:'workspace-name',title:'Name a workspace',description:'A controlled text input updates the host string while retaining standard native input attributes.',values:{modelValue:'Design workspace',type:'text',placeholder:'Workspace name'}},
  {id:'filter-files',title:'Filter a file list',description:'Search input semantics identify a query field; the host decides how its string filters application data.',values:{modelValue:'',type:'search',placeholder:'Filter files…'}},
  {id:'numeric-limit',title:'Enter a numeric limit',description:'Number input emits a numeric value for entered numbers; an empty field remains available for host validation.',values:{modelValue:25,type:'number',placeholder:'Maximum results'}},
 ],
 checkbox:[
  {id:'include-archived',title:'Include archived results',description:'A single checkbox adds an independent boolean filter to a search form.',values:{modelValue:false,label:'Include archived projects'}},
  {id:'remember-session',title:'Review a remembered preference',description:'Start from a stored true value and let the user change the preference directly.',values:{modelValue:true,label:'Remember this workspace'}},
 ],
 slider:[
  {id:'preview-volume',title:'Adjust preview volume',description:'A continuous bounded range offers a quick adjustment when exact text entry is unnecessary.',values:{modelValue:60,min:0,max:100,step:1}},
  {id:'zoom-level',title:'Step through zoom levels',description:'A step of 25 keeps the selection aligned with the zoom increments offered by the application.',values:{modelValue:100,min:50,max:200,step:25}},
  {id:'fractional-value',title:'Refine a fractional setting',description:'Small numeric steps support adjustments that need finer precision than whole values.',values:{modelValue:0.5,min:0,max:1,step:0.05}},
 ],
 'text-area':[
  {id:'release-notes',title:'Write release notes',description:'A multiline string keeps line breaks intact while the host decides when to persist the draft.',values:{modelValue:'Changes in this release:\n• Faster workspace search\n• Improved keyboard navigation',rows:5,placeholder:'Describe the release'}},
  {id:'review-comment',title:'Start a review comment',description:'An empty textarea with a focused prompt helps the user add longer feedback.',values:{modelValue:'',rows:3,placeholder:'What should change before this is approved?'}},
 ],
 'setting-controls':[
  {id:'autosave-interval',title:'Edit a numeric preference',description:'Metadata chooses a numeric input while the host owns the preference value and persistence.',values:{setting:{id:'autosave',label:'Autosave interval',type:'number',default:30,min:5,max:300,step:5,description:'Seconds between automatic saves.'},modelValue:30}},
  {id:'save-policy',title:'Describe a choice preference',description:'Select metadata includes labels, values and explanatory option descriptions.',values:{setting:{id:'save-mode',label:'Save policy',type:'select',default:'manual',options:[{value:'manual',label:'Manual',description:'Save when requested.'},{value:'automatic',label:'Automatic',description:'Save as you work.'}]},modelValue:'manual'}},
  {id:'notes',title:'Store a multiline preference',description:'The same setting contract can request a textarea for an application-owned notes preference.',values:{setting:{id:'notes',label:'Workspace notes',type:'textarea',default:'',placeholder:'Add workspace notes'},modelValue:'Keep this workspace focused.'}},
 ],
 icons:[
  {id:'file-icon',title:'Identify a source file',description:'Use a bundled icon beside content without loading a separate icon library in the host.',values:{name:'file-code',size:20}},
  {id:'action-icon',title:'Mark an application action',description:'A small action icon aligns with compact toolbar content. Supply the surrounding action’s accessible name separately.',values:{name:'refresh',size:16}},
  {id:'explicit-pack',title:'Choose an icon collection explicitly',description:'An explicit collection prefix keeps icon selection deliberate when several collections share a name.',values:{name:'home',pack:'codicon',size:24}},
 ],
 'code-block':[
  {id:'read-source',title:'Read a source example',description:'Syntax highlighting and displayed line numbers make a read-only source excerpt easier to inspect.',values:{code:'export function greet(name: string) {\n  return `Hello, ${name}`;\n}',language:'typescript',lineNumbers:true,label:'Greeting source'}},
  {id:'review-lines',title:'Emphasize lines in a review',description:'Highlighted lines use displayed numbers, including a start-line offset from a larger source file.',values:{code:'const enabled = true;\nconst retries = 3;\nstart({ enabled, retries });',language:'typescript',lineNumbers:true,startLine:40,highlightedLines:[41],label:'Configuration excerpt'}},
  {id:'wrap-config',title:'Fit a long configuration value',description:'Wrapping keeps a long example within its content region without altering the source copied by the toolbar.',values:{code:'{"workspace":"design-system","description":"A workspace shared by the interface and application teams"}',language:'json',wrap:true,copyable:true,label:'Workspace configuration'}},
 ],
 loader:[
  {id:'inline-status',title:'Indicate a background task',description:'A compact indicator communicates ongoing work while the surrounding view remains interactive.',values:{variant:'ring',size:24,label:'Saving project'}},
  {id:'large-progress',title:'Make an operation easier to notice',description:'A larger animation works in an empty region that is waiting for application data.',values:{variant:'tailspin',size:40,label:'Loading workspace'}},
  {id:'quiet-motion',title:'Present a paused indicator',description:'A speed of zero pauses the animation while retaining the accessible loading label.',values:{variant:'ring',size:32,speed:0,label:'Waiting for connection'}},
 ],
 loading:[
  {id:'load-region',title:'Load one content region',description:'The active overlay blocks this region while keeping its mounted content and component state intact.',values:{active:true,text:'Loading workspace',variant:'ring'},slots:{default:'Workspace content remains mounted.'}},
  {id:'ready-region',title:'Reveal completed content',description:'Clear active when the host operation finishes. The original mounted content becomes interactive again.',values:{active:false,text:'Loading workspace'},slots:{default:'Workspace is ready.'}},
  {id:'text-status',title:'Use text without an animation',description:'A text-only status can explain a wait when an animated indicator is unnecessary.',values:{active:true,showLoader:false,text:'Waiting for a response…'},slots:{default:'Application content'}},
 ],
 'color-picker':[
  {id:'project-accent',title:'Choose a project accent',description:'Open the compact swatch to adjust a host-owned hex color through the area, hue slider and text field.',values:{modelValue:'#0078d4'}},
  {id:'stored-color',title:'Review a saved project color',description:'The trigger displays the stored color before the user opens the editor to change it.',values:{modelValue:'#16a34a'}},
 ],
};
export function coreFeatures(
  id:string,
  contract:ComponentContract
):FeatureExample[]|undefined {
 const features:FeatureExample[]|undefined=cases[id]?.map(item=>{const slots=item.slots??{};return {...item,slots,variant:item.id,code:serializeUsage(contract,item.values,slots)};});
 if(features&&['loader','code-block','loading','text-input','text-area','checkbox','slider','color-picker'].includes(id)){
  const original=componentExamples.find(example=>example.id===id)!;
  const title=({loader:'Explore all 44 loader variants','code-block':'Compare syntax themes',loading:'Control a loading region','text-input':'Try native text editing','text-area':'Use a multiline field',checkbox:'Change a boolean preference',slider:'Adjust a range interactively','color-picker':'Open a project color editor'} as Record<string,string>)[id]!;
  features.unshift({id:'original-playground',title,description:original.usage,variant:'default',code:original.code} as FeatureExample);
 }
 return features;
}
