export { createFrame, useFrame } from "./createFrame";
export type { CommandHookEvent, CommandHookListener } from './commands';
export { defineTheme, parseTheme, parseThemeFile, FrameThemeError } from '../themes/theme';
export type { FrameTheme, FrameThemeFile, FrameThemeDefinition, FrameTokenTree, FrameThemeFormat, ParseThemeOptions, FrameThemeTokens, FrameThemeTokenName } from '../themes/theme';
export { themeFormats } from '../themes/formats';
export type { FrameTokenPath } from '../themes/tokens';
export type { FrameThemeController } from '../themes/controller';
export { themeTokens } from '../themes/tokens';
export type { Frame } from "./createFrame";
export type { StatusController, StatusItemDefinition, StatusItem, StatusItemUpdate, StatusOptions, StatusSide, StatusMessage, StatusMessageOptions, StatusSeverity } from './status';
export type { Command, ViewContentSlot, PanelDefinition, SidePanelDefinition, QuickPickItem, QuickPickOptions } from "../types";
export { default as FrameShell } from "../components/FrameShell.vue";
export { default as FrameTooltip } from "../components/FrameTooltip.vue";
export { default as FrameQuickInput } from "../components/FrameQuickInput.vue";
export { default as FrameQuickPanel } from "../components/FrameQuickPanel.vue";
export { default as BottomPanel } from "../components/BottomPanel.vue";
export { default as SidePanel } from "../components/SidePanel.vue";

export { default as ViewBar } from "../components/ViewBar.vue";
/** @deprecated Use FrameDropdownMenu; retained for existing anchored-menu consumers. */
export { default as FrameMenu } from "../components/AnchoredMenu.vue";
export type { FrameMenuItem } from "../types";
export type { LayoutState, PanelAlignment, PanelPosition } from "./layout";
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
export { default as FrameNotifications } from "../components/FrameNotifications.vue";
export type { SettingDefinition, SettingValue, SettingsSection, FrameNotification, NotificationAction, NotificationSeverity, NotificationOptions, FrameOptions } from "../types";

export { default as FrameIconButton } from "../components/FrameIconButton.vue";
export { default as ResizablePane } from "../components/ResizablePane.vue";

export { default as FrameButton } from "../components/FrameButton.vue";
export { default as FrameTextInput } from "../components/FrameTextInput.vue";
export { default as FrameCheckbox } from "../components/FrameCheckbox.vue";
export { default as FrameSelect } from "../components/FrameSelect.vue";
export { default as ComponentShowcase } from "../components/ComponentShowcase.vue";
export type { NavigationItem, NavigationActionItem, NavigationLinkItem, NavigationDropdownItem, NavigationSeparatorItem, NavigationBarOptions, NavigationBarPosition, NavigationBarJustification, PanelViewBarOptions, PanelViewBarController } from "../types";

export { default as FrameSlider } from "../components/FrameSlider.vue";
export { default as FrameColorPicker } from "../components/FrameColorPicker.vue";
export { default as FrameTextArea } from "../components/FrameTextArea.vue";
export { SelectItem, SelectOption, SelectSeparator } from "../types";
export { default as FrameLoader } from "../components/FrameLoader.vue";
export { default as FrameLoading } from "../components/FrameLoading.vue";
export { frameLoaderVariants } from "./loading";
export type { FrameLoaderVariant, FrameLoaderProps, FrameLoadingProps, FrameLoadingTextPosition } from "./loading";
export type { OverlayBounds } from "./overlays";
export { default as FrameCodeBlock } from "../components/FrameCodeBlock.vue";
export { CodeBlockTheme, codeBlockThemes, codeBlockThemeOptions } from "./codeThemes";
export async function loadCodeHighlight(language: string, theme: import('./codeThemes').CodeBlockTheme) {
  return (await import('./codeHighlight')).loadCodeHighlight(language, theme);
}
export type { FrameCodeBlockProps } from "./codeBlock";

export { default as FrameCombobox } from '../components/FrameCombobox.vue';
export { default as FrameEditable } from '../components/FrameEditable.vue';
export { default as FrameListbox } from '../components/FrameListbox.vue';
export { default as FrameNumberField } from '../components/FrameNumberField.vue';
export { default as FrameLabel } from '../components/FrameLabel.vue';
export { default as FramePinInput } from '../components/FramePinInput.vue';
export { default as FrameRadioGroup } from '../components/FrameRadioGroup.vue';
export { default as FrameSwitch } from '../components/FrameSwitch.vue';
export { default as FrameTagsInput } from '../components/FrameTagsInput.vue';
export { default as FrameToggle } from '../components/FrameToggle.vue';
export { default as FrameToggleGroup } from '../components/FrameToggleGroup.vue';
export { default as FrameCheckboxGroup } from '../components/FrameCheckboxGroup.vue';
export { default as FrameCalendar } from '../components/FrameCalendar.vue';
export { default as FrameRangeCalendar } from '../components/FrameRangeCalendar.vue';
export { default as FrameDateField } from '../components/FrameDateField.vue';
export { default as FrameDatePicker } from '../components/FrameDatePicker.vue';
export { default as FrameDateRangeField } from '../components/FrameDateRangeField.vue';
export { default as FrameDateRangePicker } from '../components/FrameDateRangePicker.vue';
export { default as FrameTimeField } from '../components/FrameTimeField.vue';
export { default as FrameTimeRangeField } from '../components/FrameTimeRangeField.vue';
export { default as FrameMonthPicker } from '../components/FrameMonthPicker.vue';
export { default as FrameMonthRangePicker } from '../components/FrameMonthRangePicker.vue';
export { default as FrameYearPicker } from '../components/FrameYearPicker.vue';
export { default as FrameYearRangePicker } from '../components/FrameYearRangePicker.vue';
export { default as FrameAutocomplete } from '../components/FrameAutocomplete.vue';
export { default as FrameField } from '../components/FrameField.vue';
export { default as FrameForm } from '../components/FrameForm.vue';
export { default as FrameRating } from '../components/FrameRating.vue';
export { default as FrameTagGroup } from '../components/FrameTagGroup.vue';
export { default as FrameColorArea } from '../components/FrameColorArea.vue';
export { default as FrameColorField } from '../components/FrameColorField.vue';
export { default as FrameColorSlider } from '../components/FrameColorSlider.vue';
export { default as FrameColorSwatch } from '../components/FrameColorSwatch.vue';
export { default as FrameColorSwatchPicker } from '../components/FrameColorSwatchPicker.vue';
export { CalendarDate, CalendarDateTime, ZonedDateTime, Time, parseDate, parseDateTime, parseTime, parseZonedDateTime, today, getLocalTimeZone } from '../forms/dates';
export type { DateValue, DateRange, TimeValue, TimeRange } from '../forms/dates';

// Standalone Reka General primitives; shell services remain Frame-owned.
export { default as FrameAccordion } from '../components/FrameAccordion.vue';
export { default as FrameAspectRatio } from '../components/FrameAspectRatio.vue';
export { default as FrameAvatar } from '../components/FrameAvatar.vue';
export { default as FrameCollapsible } from '../components/FrameCollapsible.vue';
export { default as FramePagination } from '../components/FramePagination.vue';
export { default as FrameProgress } from '../components/FrameProgress.vue';
export { default as FrameScrollArea } from '../components/FrameScrollArea.vue';
export { default as FrameSeparator } from '../components/FrameSeparator.vue';
export { default as FrameTabs } from '../components/FrameTabs.vue';
export { default as FrameStepper } from '../components/FrameStepper.vue';
export { default as FrameToolbar } from '../components/FrameToolbar.vue';
export { default as FrameTree } from '../components/FrameTree.vue';
export { default as FrameSplitter } from '../components/FrameSplitter.vue';
export { default as FrameNavigationMenu } from '../components/FrameNavigationMenu.vue';
export { default as FrameMenubar } from '../components/FrameMenubar.vue';
export { default as FrameDialog } from '../components/FrameDialog.vue';
export { default as FrameAlertDialog } from '../components/FrameAlertDialog.vue';
export { default as FrameDrawer } from '../components/FrameDrawer.vue';
export { default as FramePopover } from '../components/FramePopover.vue';
export { default as FrameHoverCard } from '../components/FrameHoverCard.vue';
export { default as FrameDropdownMenu } from '../components/FrameDropdownMenu.vue';
export { default as FrameContextMenu } from '../components/FrameContextMenu.vue';
export { default as FrameToast } from '../components/FrameToast.vue';
export type { FrameAccordionProps, FrameAccordionItem } from '../components/FrameAccordion.vue';
export type * from '../general-types';
export type { FrameGeneralMenuItem } from '../components/generalMenu';

export type { ViewBarPosition, ViewBarSize, ViewBarDisplay,  ViewBadge, PrimaryViewBarOptions, ViewItem, PrimaryViewBarController } from "./primaryViewBar";
export type { ToolbarControl, ToolbarOptions, ToolbarButton, ToolbarItemId, ToolbarPlacement } from "./toolbar";

export type { ToolbarActionFeature } from '../types';

export type { SecondaryViewBarOptions, SecondaryViewBarDisplay, SecondaryViewBarSize, SecondaryViewBarItem, SecondaryViewBarController } from './secondaryViewBar';

export type { PanelOptions, PanelDisplay, PanelController } from './panel';

export type {BarDisplay,BarSize} from "./barTypes";

export type * from './workspaceTypes';

export type {BarSeparator,BarSeparatorOptions} from './barSeparators';

export { createBrowserHost, assertExternalUrl } from './host';
export type { FrameHost, HostWindow, HostWindowState, HostCleanup, HostFile, HostFileOptions, HostFiles, HostExternal } from './host';

export { CommandRegistry, CommandCategories } from './commands';
export type { CommandCategory } from './commands';
export { FeatureRegistry, ShellPresentation, ShellViewContainer } from './features';
export type { FeatureController, PresentationController, ViewContainerController } from './features';
export type { ModalOptions } from "../types";

export { default as FrameFileUpload } from '../components/FrameFileUpload.vue';
export { default as FrameFileDropZone } from '../components/FrameFileDropZone.vue';
export type { FileUploadOptions, FileRejection, FileSelection } from '../forms/files';
