import { createNotificationHistory, NotificationPanel, NotificationIndicator } from "@frame/extras";
import { h } from "vue";
import { createFrame, FrameShell, FrameIcon, addCollection, FrameMenu, FrameModal, FrameSettings, SettingControl, FrameNotifications, FrameIconButton, ResizablePane, FrameButton, FrameTextInput, FrameCheckbox, FrameSelect, ComponentShowcase, FrameSlider, FrameColorPicker, FrameTextArea, SelectOption, SelectSeparator, type SelectItem, type FrameMenuItem } from "@frame/core";

// Compile against the built package exports, rather than reaching into src/.
import { FrameLoader, FrameLoading, frameLoaderVariants, type FrameLoaderVariant, type FrameLoadingProps, type FrameLoadingTextPosition } from "@frame/core";
const loaderVariant: FrameLoaderVariant = "pinwheel";
const position: FrameLoadingTextPosition = "above";
const loadingProps: FrameLoadingProps = { active: true, variant: "newtons-cradle", text: "Preparing…", textPosition: position, showLoader: true, showText: true, bgOpacity: .2, strokeLength: .3 };
void [h(FrameLoader, { variant: loaderVariant, size: 24 }), h(FrameLoading, loadingProps, () => "Content"), frameLoaderVariants];
export function consumerFixture() {
  const frame = createFrame({ settings: true, notifications: true });
  const history = createNotificationHistory(frame);
  void [NotificationPanel, NotificationIndicator, history];
  frame.registerSettingsSection({ id: "general", title: "General", settings: [{ id: "general.name", label: "Name", type: "text", default: "Artoria" }] });
  frame.notify({ title: "Ready", severity: "success", details: "Workspace is available" });
  void [FrameSettings, SettingControl, FrameNotifications];
  const button = h(FrameIconButton, { label: "Open", icon: "folder-opened", hoverHighlight: false, iconRatio: .6, tooltipPlacement: "right", onClick: () => {} });
  const split = h(ResizablePane, { axis: "x", modelValue: 210, min: 140, minSecond: 180 }, { first: () => "Navigation", second: () => "Content" });
  void [button, split, FrameButton, FrameTextInput, FrameCheckbox, ComponentShowcase];
  const grouped: SelectItem[] = [new SelectOption({ value: "one", label: "One" }), new SelectSeparator("group"), new SelectOption({ value: "two", label: "Two" })];
  void [FrameSlider, FrameColorPicker, FrameTextArea, grouped];
  const select = h(FrameSelect, { modelValue: "one", label: "Choice", options: [{ value: "one", label: "One" }] }); void select;
  frame.registerActivityAction({ id: "home", label: "Home", run: frame.resetWorkspace });
  const icon = h(FrameIcon, { pack: "codicon", name: "layout-panel-justify", size: 16 });
  void icon; void addCollection;
  const menu: FrameMenuItem[] = [
    { id: "group", label: "Views", children: [{ id: "panel", label: "Panel", checked: true, command: "app.panel" }] },
    { id: "divider", type: "separator" },
    { id: "unavailable", label: "Unavailable", disabled: true },
  ];
  frame.layout.primarySide = "right";
  frame.registerSecondaryTab({ id: "app.details", label: "Details", component: { render: () => null } });
  frame.registerView({ id: "app.menu", label: "Menu", children: [{ id: "app.child", label: "Child", component: { render: () => null }, padded: false }] }, "primary");
  frame.registerBanner({ id: "app.banner", label: "Review", component: { render: () => null } });
  const modal = frame.openModal({ id: "app.modal", title: "Properties", component: { render: () => null } });
  modal.close();
  frame.layout.bannerAlignment = "justify";
  frame.splitWorkspace("right", frame.workspace.initialPaneId, { label: "Preview", component: { render: () => null } });
  frame.registerCommand({ id: "app.panel", label: "Panel", run() {} });
  return { component: h(FrameShell, { frame, titleText: "Artoria", showSearch: false, menuItems: menu }), menuComponent: FrameMenu, modalComponent: FrameModal };
}

