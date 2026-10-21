export { createFrame, useFrame } from "./createFrame";
export type { Frame } from "./createFrame";
export type { Command, PanelDefinition, SidePanelDefinition, QuickPickItem, QuickPickOptions } from "../types";
export { default as FrameShell } from "../components/FrameShell.vue";
export { default as FrameTooltip } from "../components/FrameTooltip.vue";
export { default as QuickInput } from "../components/CommandPalette.vue";
export { default as BottomPanel } from "../components/BottomPanel.vue";
export { default as SidePanel } from "../components/SidePanel.vue";

export { default as ActivityRail } from "../components/ActivityRail.vue";
export { default as FrameMenu } from "../components/FrameMenu.vue";
export type { FrameMenuItem } from "../types";
export type { LayoutState, PanelAlignment } from "./layout";
export { default as ResizeHandle } from "../components/ResizeHandle.vue";

export { default as ContextMenu } from "../components/ContextMenu.vue";
export { default as PanelActions } from "../components/PanelActions.vue";
export { default as VisibilityIndicator } from "../components/VisibilityIndicator.vue";
export type { PanelAction, ToolbarAction, ViewRegion } from "../types";

export { default as PanelSections } from "../components/PanelSections.vue";

export { default as WorkspacePanes } from "../components/WorkspacePanes.vue";
export type { WorkspaceBannerDefinition, WorkspacePaneContent, WorkspacePane, WorkspaceNode, WorkspaceSplitDirection } from "../types";

export { default as ViewSections } from "../components/ViewSections.vue";
export type { MenuDefinition } from "../types";

export { default as FrameModal } from "../components/FrameModal.vue";
export type { ViewDefinition, BannerDefinition, ModalDefinition } from "../types";

export { default as FrameIcon } from "../components/FrameIcon.vue";
export { addIcon, addCollection } from "@iconify/vue";

export { default as FrameSettings } from "../components/FrameSettings.vue";
export { default as SettingControl } from "../components/SettingControl.vue";
export { default as NotificationCenter } from "../components/NotificationCenter.vue";
export type { SettingDefinition, SettingValue, SettingsSection, FrameNotification, NotificationSeverity, NotificationOptions, FrameOptions } from "../types";

export { default as FrameIconButton } from "../components/FrameIconButton.vue";
export { default as ResizablePane } from "../components/ResizablePane.vue";

export { default as FrameButton } from "../components/FrameButton.vue";
export { default as FrameTextInput } from "../components/FrameTextInput.vue";
export { default as FrameCheckbox } from "../components/FrameCheckbox.vue";
export { default as FrameSelect } from "../components/FrameSelect.vue";
export { default as ComponentShowcase } from "../components/ComponentShowcase.vue";
export type { ActivityAction } from "../types";

export { default as FrameSlider } from "../components/FrameSlider.vue";
export { default as FrameColorPicker } from "../components/FrameColorPicker.vue";
export { default as FrameTextArea } from "../components/FrameTextArea.vue";
export { SelectItem, SelectOption, SelectSeparator } from "../types";
