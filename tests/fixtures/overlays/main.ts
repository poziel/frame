import { createApp, defineComponent, h, ref } from "vue";
import { createFrame, FrameShell, FrameButton, FrameSelect, FrameMenu, FrameTooltip, ContextMenu } from "@frame/core";

const frame = createFrame();
const externalAnchor = ref<HTMLElement>(), externalMenu = ref(false);
frame.layout.primarySidebarVisible = false;
frame.layout.secondarySidebarVisible = false;
frame.layout.panelVisible = false;
frame.registerSidePanel({ id: "drag-sample", label: "Drag sample", component: { render: () => "Sample view" } });
const options = Array.from({ length: 50 }, (_, i) => ({ value: String(i), label: `Choice ${i + 1}`, description: `Details for choice ${i + 1}` }));
const menuItems = [{ id: "nested", label: "Nested choices", children: Array.from({ length: 50 }, (
  _,
  i
) => ({ id: `nested-${i}`, label: `Nested ${i + 1}` })) }, ...Array.from({ length: 50 }, (
  _,
  i
) => ({ id: `item-${i}`, label: `Action ${i + 1}` }))];
const ModalContent = defineComponent({
  setup() {
    const choice = ref("0");
    return () => h("div", { style: "display:flex;flex-direction:column;justify-content:space-between;height:100%;padding:12px;box-sizing:border-box" }, [
      h(FrameTooltip, { text: "Modal header tooltip", placement: "top" }, () => h(FrameButton, {}, () => "Modal tooltip")),
      h(FrameSelect, { modelValue: choice.value, options, label: "Modal choice", "onUpdate:modelValue": (
        value: string
      ) => { choice.value = value; } }),
    ]);
  },
});
const Content = defineComponent({
  setup() {
    const choice = ref("0"), menu = ref(false), trigger = ref<{ element?: HTMLButtonElement }>();
    return () => h("div", { class: "test-controls" }, [
      h("div", { style: "position:absolute;top:0;left:0;right:0;display:flex;flex-wrap:wrap;gap:4px" }, [
        h(FrameButton, { onClick: () => { frame.layout.density = frame.layout.density === "compact" ? "default" : "compact"; } }, () => "Toggle density"),
        h("button", { onClick: (event: MouseEvent) => { externalAnchor.value = event.currentTarget as HTMLElement; externalMenu.value = true; } }, "External menu"),
        h(FrameButton, { onClick: () => { frame.layout.statusBarVisible = !frame.layout.statusBarVisible; } }, () => "Toggle status"),
        h(FrameButton, { onClick: () => { frame.layout.quickInputPosition = "center"; frame.openCommands(); } }, () => "Centered quick input"),
        h(FrameButton, { onClick: () => frame.openModal({ id: "overlay-test", title: "Boundary modal", component: ModalContent, width: 900, height: 700, maximized: true }) }, () => "Open modal"),
        h(FrameButton, { onClick: () => { for (let i = 0; i < 10; i++) frame.notify({ title: `Notice ${i + 1}`, details: "Notification detail".repeat(8), duration: 0 }); } }, () => "Notify"),
        h(FrameTooltip, { text: "Top edge tooltip", placement: "top" }, () => h(FrameButton, {}, () => "Top tooltip")),
        h(FrameSelect, { modelValue: choice.value, options, label: "Top choice", "onUpdate:modelValue": (
          value: string
        ) => { choice.value = value; } }),
      ]),
      h("div", { style: "position:absolute;bottom:0;left:0;right:0;display:flex;gap:4px" }, [
        h(FrameButton, { ref: trigger, onClick: () => { menu.value = !menu.value; } }, () => "Tall menu"),
        h(FrameTooltip, { text: "Bottom edge tooltip", placement: "bottom" }, () => h(FrameButton, {}, () => "Bottom tooltip")),
        h(FrameSelect, { modelValue: choice.value, options, label: "Bottom choice", "onUpdate:modelValue": (
          value: string
        ) => { choice.value = value; } }),
      ]),
      menu.value && trigger.value?.element ? h(FrameMenu, { anchor: trigger.value.element, items: menuItems, label: "Tall menu", onClose: () => { menu.value = false; } }) : null,
      h(ContextMenu, { items: menuItems, label: "Boundary context" }, () => h("div", { id: "context-target", style: "position:absolute;top:50%;left:0;width:100%;height:30px" }, "Context target")),
    ]);
  },
});
frame.setWorkspacePane(frame.workspace.initialPaneId, { label: "Boundary controls", component: Content });
createApp({ render: () => h("div", [h(FrameShell, { frame, showSearch: false }, { overlays: () => h("div", { id: "custom-overlay", style: "position:fixed;inset:0;pointer-events:none;z-index:-1" }) }), externalMenu.value && externalAnchor.value ? h(FrameMenu, { anchor: externalAnchor.value, items: menuItems, label: "External menu", onClose: () => { externalMenu.value = false; } }) : null]) }).mount("#app");
