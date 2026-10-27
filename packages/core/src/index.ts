export type {
  FrameModule,
  FrameModuleInstallation,
} from './framework/configuration/moduleRegistry';
export {Frame, createFrame} from './framework/frame';

export type {FrameNavigationLocation} from './framework/views/shellNavigation';
export type {FramePickerRequest} from './framework/commands/quickInputController';
export {useFrame} from './framework/useFrame';
export {dockAnchors} from './framework/layout/docks';
export type {
  Dock,
  DockDefinition,
  DockUpdate,
  DockAnchor,
  DockEdge,
  DockPlacement,
  DockAppearance,
  DockController,
} from './framework/layout/docks';
export type {
  CommandHookEvent,
  CommandHookListener,
} from './framework/commands/commandRegistry';
export {
  defineTheme,
  parseTheme,
  parseThemeFile,
  FrameThemeError,
} from './themes/theme';
export type {
  FrameTheme,
  FrameThemeFile,
  FrameThemeDefinition,
  FrameTokenTree,
  FrameThemeFormat,
  ParseThemeOptions,
  FrameThemeTokens,
  FrameThemeTokenName,
} from './themes/theme';
export {themeFormats} from './themes/parsing/documentFormats';
export type {FrameTokenPath} from './themes/tokens/tokenCatalog';
export {FrameThemeController} from './themes/runtime/frameThemeController';
export {themeTokens} from './themes/tokens/tokenCatalog';
export type {
  StatusController,
  StatusItemDefinition,
  StatusItem,
  StatusItemUpdate,
  StatusOptions,
  StatusSide,
  StatusMessage,
  StatusMessageOptions,
  StatusSeverity,
} from './framework/views/status';
export type {CommandOptions} from './framework/commands/command';
export type {
  ViewContentSlot,
  PanelDefinition,
  SidePanelDefinition,
} from './framework/views/shellViewContainer';
export type {
  QuickPickItem,
  QuickPickOptions,
} from './components/framework/quickPick';
export {default as FrameShell} from './components/framework/FrameShell.vue';
export {default as FrameTooltip} from './components/overlays/FrameTooltip.vue';
export {default as FrameQuickPick} from './components/framework/FrameQuickPick.vue';
export {default as FrameQuickPanel} from './components/framework/FrameQuickPanel.vue';
export {default as BottomPanel} from './components/framework/BottomPanel.vue';
export {default as SidePanel} from './components/framework/SidePanel.vue';

export {default as ViewBar} from './components/framework/ViewBar.vue';
/** @deprecated Use FrameDropdownMenu; retained for existing anchored-menu consumers. */
export {default as FrameMenu} from './components/navigation/AnchoredMenu.vue';
export type {FrameMenuItem} from './components/navigation/generalMenu';
export type {
  LayoutState,
  PanelAlignment,
  PanelPosition,
} from './framework/layout/layout';
export {default as ResizeHandle} from './components/layout/ResizeHandle.vue';

export {default as ContextMenu} from './components/navigation/ContextMenu.vue';
export {default as PanelActions} from './components/framework/PanelActions.vue';
export {default as VisibilityIndicator} from './components/framework/VisibilityIndicator.vue';
export type {
  PanelAction,
  ViewRegion,
} from './framework/views/shellViewContainer';
export type {ToolbarAction} from './framework/views/toolbar';

export {default as PanelSections} from './components/framework/PanelSections.vue';

export {default as WorkspacePanes} from './components/framework/WorkspacePanes.vue';

export type {WorkspaceBannerDefinition} from './framework/workspace/workspaceBanner';
export type {
  WorkspacePaneContent,
  WorkspacePane,
  WorkspaceNode,
  WorkspaceSplitDirection,
} from './framework/workspace/workspaceTypes';

export {default as ViewSections} from './components/framework/ViewSections.vue';
export type {MenuDefinition} from './framework/views/shellViewContainer';

export {default as FrameModal} from './components/framework/FrameModal.vue';
export type {ViewDefinition} from './framework/views/shellViewContainer';

export type {BannerDefinition} from './framework/workspace/workspaceBanner';
export type {ModalDefinition} from './components/framework/modal';

export {default as FrameIcon} from './components/data-display/FrameIcon.vue';
export {addIcon, addCollection} from '@iconify/vue';

export {default as FrameSettings} from './components/framework/FrameSettings.vue';
export {default as SettingControl} from './components/framework/SettingControl.vue';
export {default as FrameNotifications} from './components/feedback/FrameNotifications.vue';
export type {
  SettingDefinition,
  SettingValue,
} from './framework/settings/setting';
export type {SettingsSection} from './framework/settings/settings';
export type {
  FrameNotification,
  NotificationAction,
  NotificationSeverity,
  NotificationOptions,
} from './framework/views/notifications';
export type {FrameOptions} from './framework/frame';

export {default as FrameIconButton} from './components/actions/FrameIconButton.vue';
export {default as ResizablePane} from './components/layout/ResizablePane.vue';

export {default as FrameButton} from './components/actions/FrameButton.vue';
export {default as FrameTextField} from './components/forms/FrameTextField.vue';
export {default as FrameCheckbox} from './components/forms/FrameCheckbox.vue';
export {default as FrameSelect} from './components/forms/FrameSelect.vue';
export {default as ComponentShowcase} from './components/framework/ComponentShowcase.vue';
export type {
  NavigationItem,
  NavigationActionItem,
  NavigationLinkItem,
  NavigationDropdownItem,
  NavigationSeparatorItem,
} from './framework/views/navigationItems';
export type {
  NavigationBarOptions,
  NavigationBarPosition,
  NavigationBarJustification,
} from './framework/views/navigationBar';
export type {
  PanelViewBarOptions,
  PanelViewBarController,
} from './framework/views/panelViewBar';

export {default as FrameSlider} from './components/forms/FrameSlider.vue';
export {default as FrameColorPicker} from './components/forms/colors/FrameColorPicker.vue';
export {default as FrameTextArea} from './components/forms/FrameTextArea.vue';
export {SelectItem} from './components/forms/shared/selectItem';
export {SelectOption} from './components/forms/shared/selectOption';
export {SelectSeparator} from './components/forms/shared/selectSeparator';
export {default as FrameLoader} from './components/feedback/FrameLoader.vue';
export {default as FrameLoading} from './components/feedback/FrameLoading.vue';
export {frameLoaderVariants} from './components/feedback/loading';
export type {
  FrameLoaderVariant,
  FrameLoaderProps,
  FrameLoadingProps,
  FrameLoadingTextPosition,
} from './components/feedback/loading';
export type {OverlayBounds} from './components/overlays/overlays';
export {default as FrameCodeBlock} from './components/data-display/FrameCodeBlock.vue';
export {
  CodeBlockTheme,
  codeBlockThemes,
  codeBlockThemeOptions,
} from './components/data-display/codeThemes';
export async function loadCodeHighlight(
  language: string,
  theme: import('./components/data-display/codeThemes').CodeBlockTheme
) {
  return (
    await import('./components/data-display/codeHighlight')
  ).loadCodeHighlight(language, theme);
}
export type {FrameCodeBlockProps} from './components/data-display/codeBlock';

export {default as FrameCombobox} from './components/forms/FrameCombobox.vue';
export {default as FrameEditable} from './components/forms/FrameEditable.vue';
export {default as FrameListbox} from './components/forms/FrameListbox.vue';
export {default as FrameNumberField} from './components/forms/FrameNumberField.vue';
export {default as FrameLabel} from './components/forms/FrameLabel.vue';
export {default as FramePinField} from './components/forms/FramePinField.vue';
export {default as FrameRadioGroup} from './components/forms/FrameRadioGroup.vue';
export {default as FrameSwitch} from './components/forms/FrameSwitch.vue';
export {default as FrameTagField} from './components/forms/FrameTagField.vue';
export {default as FrameToggle} from './components/actions/FrameToggle.vue';
export {default as FrameToggleGroup} from './components/actions/FrameToggleGroup.vue';
export {default as FrameCheckboxGroup} from './components/forms/FrameCheckboxGroup.vue';
export {default as FrameCalendar} from './components/forms/dates-and-times/FrameCalendar.vue';
export {default as FrameRangeCalendar} from './components/forms/dates-and-times/FrameRangeCalendar.vue';
export {default as FrameDateField} from './components/forms/dates-and-times/FrameDateField.vue';
export {default as FrameDatePicker} from './components/forms/dates-and-times/FrameDatePicker.vue';
export {default as FrameDateRangeField} from './components/forms/dates-and-times/FrameDateRangeField.vue';
export {default as FrameDateRangePicker} from './components/forms/dates-and-times/FrameDateRangePicker.vue';
export {default as FrameTimeField} from './components/forms/dates-and-times/FrameTimeField.vue';
export {default as FrameTimeRangeField} from './components/forms/dates-and-times/FrameTimeRangeField.vue';
export {default as FrameMonthPicker} from './components/forms/dates-and-times/FrameMonthPicker.vue';
export {default as FrameMonthRangePicker} from './components/forms/dates-and-times/FrameMonthRangePicker.vue';
export {default as FrameYearPicker} from './components/forms/dates-and-times/FrameYearPicker.vue';
export {default as FrameYearRangePicker} from './components/forms/dates-and-times/FrameYearRangePicker.vue';
export {default as FrameAutocomplete} from './components/forms/FrameAutocomplete.vue';
export {default as FrameField} from './components/forms/FrameField.vue';
export {default as FrameForm} from './components/forms/FrameForm.vue';
export {default as FrameRating} from './components/forms/FrameRating.vue';
export {default as FrameTagGroup} from './components/forms/FrameTagGroup.vue';
export {default as FrameColorArea} from './components/forms/colors/FrameColorArea.vue';
export {default as FrameColorField} from './components/forms/colors/FrameColorField.vue';
export {default as FrameColorSlider} from './components/forms/colors/FrameColorSlider.vue';
export {default as FrameColorSwatch} from './components/forms/colors/FrameColorSwatch.vue';
export {default as FrameColorSwatchPicker} from './components/forms/colors/FrameColorSwatchPicker.vue';
export {
  CalendarDate,
  CalendarDateTime,
  ZonedDateTime,
  Time,
  parseDate,
  parseDateTime,
  parseTime,
  parseZonedDateTime,
  today,
  getLocalTimeZone,
} from './components/forms/shared/dates';
export type {
  DateValue,
  DateRange,
  TimeValue,
  TimeRange,
} from './components/forms/shared/dates';

// Standalone Reka General primitives; shell services remain Frame-owned.
export {default as FrameAccordion} from './components/layout/FrameAccordion.vue';
export {default as FrameAspectRatio} from './components/layout/FrameAspectRatio.vue';
export {default as FrameAvatar} from './components/data-display/FrameAvatar.vue';
export {default as FrameCollapsible} from './components/layout/FrameCollapsible.vue';
export {default as FramePagination} from './components/navigation/FramePagination.vue';
export {default as FrameProgress} from './components/feedback/FrameProgress.vue';
export {default as FrameScrollArea} from './components/layout/FrameScrollArea.vue';
export {default as FrameSeparator} from './components/layout/FrameSeparator.vue';
export {default as FrameTabs} from './components/navigation/FrameTabs.vue';
export {default as FrameStepper} from './components/navigation/FrameStepper.vue';
export {default as FrameToolbar} from './components/actions/FrameToolbar.vue';
export {default as FrameTree} from './components/data-display/FrameTree.vue';
export {default as FrameSplitter} from './components/layout/FrameSplitter.vue';
export {default as FrameNavigationMenu} from './components/navigation/FrameNavigationMenu.vue';
export {default as FrameMenubar} from './components/navigation/FrameMenubar.vue';
export {default as FrameDialog} from './components/overlays/FrameDialog.vue';
export {default as FrameAlertDialog} from './components/overlays/FrameAlertDialog.vue';
export {default as FrameDrawer} from './components/overlays/FrameDrawer.vue';
export {default as FramePopover} from './components/overlays/FramePopover.vue';
export {default as FrameHoverCard} from './components/overlays/FrameHoverCard.vue';
export {default as FrameDropdownMenu} from './components/navigation/FrameDropdownMenu.vue';
export {default as FrameContextMenu} from './components/navigation/FrameContextMenu.vue';
export {default as FrameToast} from './components/feedback/FrameToast.vue';
export type {
  FrameAccordionProps,
  FrameAccordionItem,
} from './components/layout/FrameAccordion.vue';
export type {FrameTabItem} from './components/navigation/tabsTypes';
export type {FrameStepItem} from './components/navigation/stepperTypes';
export type {FrameToolbarItem} from './components/actions/toolbarTypes';
export type {FrameTreeItem} from './components/data-display/treeTypes';
export type {FrameSplitPanel} from './components/layout/splitterTypes';
export type {FrameNavigationItem} from './components/navigation/navigationMenuTypes';
export type {
  FrameMenubarAction,
  FrameMenubarItem,
} from './components/navigation/menubarTypes';
export type {FrameGeneralMenuItem} from './components/navigation/generalMenu';

export type {
  ViewBarPosition,
  ViewBarSize,
  ViewBarDisplay,
  ViewBadge,
  PrimaryViewBarOptions,
  ViewItem,
  PrimaryViewBarController,
} from './framework/views/primaryViewBar';
export type {
  ToolbarControl,
  ToolbarOptions,
  ToolbarButton,
  ToolbarItemId,
  ToolbarPlacement,
} from './framework/views/toolbar';

export type {ToolbarActionFeature} from './framework/views/toolbar';

export type {
  SecondaryViewBarOptions,
  SecondaryViewBarDisplay,
  SecondaryViewBarSize,
  SecondaryViewBarItem,
  SecondaryViewBarController,
} from './framework/views/secondaryViewBar';

export type {
  PanelOptions,
  PanelDisplay,
  PanelController,
} from './framework/views/panel';

export type {BarDisplay, BarSize} from './framework/layout/barTypes';

export type * from './framework/workspace/workspaceTypes';

export type {
  BarSeparator,
  BarSeparatorOptions,
} from './framework/layout/barSeparators';

export {
  HostController,
  createBrowserHost,
  assertExternalUrl,
} from './framework/configuration/host';
export type {
  FrameHost,
  HostWindow,
  HostWindowState,
  HostCleanup,
  HostFile,
  HostFileOptions,
  HostFiles,
  HostExternal,
} from './framework/configuration/host';

export {CommandRegistry} from './framework/commands/commandRegistry';
export {CommandPrefixes} from './framework/commands/commandPrefixes';
export type {CommandPrefix} from './framework/commands/commandPrefixes';
export {FeatureRegistry} from './framework/features/featureRegistry';
export {ShellPresentation} from './framework/views/shellPresentation';
export {ShellViewContainer} from './framework/views/shellViewContainer';
export type {FeatureController} from './framework/features/feature';
export type {PresentationController} from './framework/views/shellPresentation';
export type {ViewContainerController} from './framework/views/shellViewContainer';
export type {ModalOptions} from './components/framework/modal';

export {default as FrameFileUpload} from './components/forms/FrameFileUpload.vue';
export {default as FrameFileDropZone} from './components/forms/FrameFileDropZone.vue';
export type {
  FileUploadOptions,
  FileRejection,
  FileSelection,
} from './components/forms/shared/files';

export type {Color as FrameColor} from 'reka-ui';
export type {NavigationOptions} from './framework/views/navigation';

export {default as FrameHsvRectangle} from './components/forms/colors/FrameHsvRectangle.vue';
export {default as FrameHsvWheel} from './components/forms/colors/FrameHsvWheel.vue';
export {default as FrameVhsCircle} from './components/forms/colors/FrameVhsCircle.vue';

export {default as FrameFieldGroup} from './components/forms/FrameFieldGroup.vue';

export {default as FrameScrubField} from './components/forms/FrameScrubField.vue';

export {default as FrameReorderList} from './components/layout/FrameReorderList.vue';

export {default as FrameKeybindings} from './components/framework/FrameKeybindings.vue';

export type {
  SettingsOptions,
  SettingsStorage,
  SettingsEditorDefinition,
  SettingsCopyFormat,
} from './framework/settings/settingsTypes';
export {
  SettingsFileStorage,
  createSettingsFileStorage,
  type SettingsWritableFile,
  type SettingsFileHandle,
} from './framework/settings/settingsFileStorage';

export {default as FrameDragPreview} from './components/overlays/FrameDragPreview.vue';

export {default as FrameControlTooltip} from './components/overlays/FrameControlTooltip.vue';
export type {ControlTooltipProps} from './components/forms/shared/tooltip';

export {
  Permission,
  PermissionRegistry,
} from './framework/permissions/permissions';
export type {
  PermissionOptions,
  PermissionSource,
} from './framework/permissions/permissions';

export {Command} from './framework/commands/command';
export type {CommandRegistration} from './framework/commands/command';
export {CommandCenter} from './framework/commands/commandCenter';
export type {CommandCenterSubmenuOptions} from './framework/commands/commandCenter';

export {Feature} from './framework/features/feature';

export {default as FrameKeycap} from './components/data-display/FrameKeycap.vue';
export type {SettingComponentProps} from './framework/settings/setting';

export type {
  PermissionMode,
  PermissionState,
  PermissionSnapshot,
} from './framework/permissions/permissionState';
export type {CommandState} from './framework/commands/command';
export type {FeatureState} from './framework/features/feature';

export {Notifier} from './framework/configuration/notifier';
export type {
  NotificationCallback,
  SubscriptionId,
  StateChange,
} from './framework/configuration/notifier';

export {Settings} from './framework/settings/settings';
export {Setting} from './framework/settings/setting';

export {BrowserHost} from './framework/configuration/browserHost';
export {
  HostWindowController,
  type HostWindowAction,
  type HostWindowCommand,
} from './framework/configuration/hostWindowController';

export {Layout} from './framework/layout/layout';
export {DockRegistry} from './framework/layout/docks';

export {Workspace} from './framework/workspace/workspace';
