export const guidePages = [
 {id:'overview',title:'What Is Frame?',summary:'An application framework for building a workbench around your Vue views.',icon:'home'},
 {id:'getting-started',title:'Getting Started',summary:'Create an instance, render the shell, and add your first view.',icon:'rocket'},
 {id:'how-it-works',title:'How Frame Works',summary:'Understand the root instance, shell, views, components, and optional packages.',icon:'layers'},
 {id:'hosts',title:'Host Integration',summary:'Use browser defaults or connect Tauri, Electron, and custom host services explicitly.',icon:'plug'},
] as const;
export type GuidePageId = typeof guidePages[number]['id'];
export function isGuidePageId(value:string):value is GuidePageId { return guidePages.some(page=>page.id===value); }
