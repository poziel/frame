import { showWorkspaceContent } from '../examples/workspaceContent';
import type { Frame } from '@frame/core';
import GuidePage from './GuidePage.vue';
import { guidePages, type GuidePageId } from './pages';
export const guidesViewId='demo.guides';
export function openGuide(
  frame:Frame,
  pageId:GuidePageId='overview',
  updateUrl=true
){
 const page=guidePages.find(item=>item.id===pageId)!;
 showWorkspaceContent(frame,{label:page.title,component:GuidePage,props:{pageId}});
 if(updateUrl)window.history.replaceState(null,'',window.location.pathname+window.location.search+'#/guide/'+pageId);
}
