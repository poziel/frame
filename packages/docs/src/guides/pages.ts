export const guidePages = [
 {id:'overview',title:'What is Frame?',summary:'An application framework for building a workbench around your Vue views.',icon:'home'},
 {id:'getting-started',title:'Getting started',summary:'Create an instance, render the shell, and add your first view.',icon:'rocket'},
 {id:'how-it-works',title:'How Frame works',summary:'Understand the root instance, shell, views, components, and optional packages.',icon:'layers'},
] as const;
export type GuidePageId = typeof guidePages[number]['id'];
export function isGuidePageId(value:string):value is GuidePageId { return guidePages.some(page=>page.id===value); }
