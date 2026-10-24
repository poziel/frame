import { expect, test } from "bun:test";
import { createFrame } from "../packages/core/src/frame/createFrame";
import { componentExamples } from "../packages/docs/src/examples/componentCatalog";
test('navigation actions are isolated and do not select a view',async()=>{
 const first=createFrame(),second=createFrame();let calls=0;
 first.registerView({id:'view',label:'View',component:{render:()=>null}},'primary');first.openView('view');
 const remove=first.registerNavigationItem({id:'home',type:'action',label:'Home',run:()=>{calls++;}});
 expect(second.navigationBar.items.value).toEqual([]);await first.navigationBar.activate('home');expect(calls).toBe(1);expect(first.state.activeSidePanel).toBe('view');
 expect(()=>first.registerNavigationItem({id:'home',type:'separator'})).toThrow();remove();first.dispose();second.dispose();
});
test("Home resets split workspace content while keeping sidebar views", () => {
  const frame = createFrame(); frame.registerView({ id: "catalog", label: "Components", component: { render: () => null } }, "primary");
  frame.setWorkspacePane(frame.workspace.initialPaneId, { label: "Example", component: { render: () => null } });
  const previous = frame.splitWorkspace("right"); frame.resetWorkspace();
  expect(frame.workspace.panes.value).toEqual([{ id: frame.workspace.initialPaneId, label: "Workspace" }]);
  expect(frame.workspace.root.value).toEqual({ type: "pane", id: frame.workspace.initialPaneId });
  expect(frame.workspace.activePane.value).toBe(frame.workspace.initialPaneId);
  expect(frame.sidePanels.value[0]?.id).toBe("catalog");
  expect(frame.splitWorkspace("down")).not.toBe(previous);
});
test("each catalog entry has a unique page, usage notes, a code example, and API guidance", () => {
  expect(new Set(componentExamples.map(item => item.id)).size).toBe(componentExamples.length);
  for (const example of componentExamples) { expect(example.title.length).toBeGreaterThan(0); expect(example.usage.length).toBeGreaterThan(0); expect(example.code.length).toBeGreaterThan(0); expect(example.properties.length).toBeGreaterThan(0); }
});
