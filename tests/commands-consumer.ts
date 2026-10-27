import {
  Notifier,
  createFrame,
  FrameKeycap,
  type SettingComponentProps,
  type PresentationController,
  type ViewContainerController,
  type CommandPrefix,
} from '@frame/core';

const customField: SettingComponentProps = {
  setting: {
    id: 'custom',
    label: 'Custom',
    description: 'A composed setting.',
    type: 'text',
    default: '',
  },
  modelValue: '',
  inputId: 'custom-field',
};
void customField;
void FrameKeycap;
import {editorModule} from '@frame/core/modules/editor';

const frame = createFrame({features: {secondarySidebar: false}});
frame.commands.register({
  id: 'contextual.save',
  label: 'Contextual save',
  source: 'Editor',
  shortcut: 'Ctrl+S',
  when: () => true,
  run() {},
});
frame.commands.setKeybinding('contextual.save', 'Ctrl+Shift+S');
const overrides: Readonly<Record<string, string | null>> =
  frame.commands.getKeybindings();
void overrides;
frame.commands.resetKeybinding('contextual.save');
frame.openKeybindings();
frame.openSettingsInTab();
frame.openSettingsJSON();
frame.openSetting('editor.fontSize');
const json: string = frame.settings.toJSON();
frame.settings.applyJSON(json);
void frame.settings.load();
void frame.settings.flush();
const removeSettingsEditor = frame.settings.registerEditor({
  component: {render: () => null},
});
removeSettingsEditor();
const withEditor = frame.use(editorModule);
withEditor.editor.create().focus();
const chained = withEditor.use({
  id: 'consumer.example',
  key: 'example',
  install: () => ({capability: {value: 1}}),
});
const value: number = chained.example.value;
void value;
chained.editor.create().layout();
frame.registerSettingsSection({id: 'app', title: 'Application'});
frame.settings.register(
  {
    id: 'app.custom',
    title: 'Custom',
    component: {render: () => null},
    props: {compact: true},
  },
  'app'
);
const stopCloseHook = frame.commands.hook(
  'frame.workspace.tab.close',
  (event) => {
    const id: string = event.id;
    void id;
  }
);
const stopCommandHooks = frame.commands.hook(async (event) => {
  await Promise.resolve(event.label);
});
stopCloseHook();
stopCommandHooks();
const controllers: readonly PresentationController[] = [
  frame.primarySidebar,
  frame.secondarySidebar,
  frame.panel,
  frame.primaryViewBar,
  frame.secondaryViewBar,
  frame.panelViewBar,
];
controllers.forEach((controller) => {
  controller.disable();
  controller.enable();
  controller.setAvailable(false);
  void controller.available;
  void controller.visible.value;
});
const views: ViewContainerController = frame.secondarySidebar;
views.register({
  id: 'details',
  label: 'Details',
  component: {render: () => null},
});
views.open('details');
views.close();
views.select('details');
const category: CommandPrefix = {prefix: '!', label: 'Artwork'};
const removeCategory = frame.commands.prefixes.register(category);
const remove = frame.commands.register({
  id: 'save',
  label: 'Save',
  feature: 'documents',
  quickInput: '!',
  enabled: () => true,
  run() {},
});
frame.commands.disable('save');
frame.commands.enable('save');
frame.commands.setAvailable('save', false);
frame.features.setAvailable('documents', false);
void frame.commands.execute('save');
void frame.commands.get('save');
void frame.commands.list();
void frame.commands.isAvailable('save');
void frame.commands.isEnabled('save');
remove();
removeCategory();
frame.dispose();

// Live objects retain discoverable class methods in emitted public declarations.
const editPermission = frame.permissions.register<{readOnly: boolean}>({
  id: 'document.edit',
  allowed: (document) => !document.readOnly,
});
editPermission.disable('Read-only session');
frame.permissions['document.edit'].reset();
const allowed: boolean = editPermission.check({readOnly: false}).allowed;
void allowed;
const black = frame.commands.register({
  id: 'canvas.background.black',
  label: 'Black',
  commandCenter: false,
  requires: ['document.edit'],
  context: () => ({readOnly: false}),
  run() {},
});
frame.commands.get(black.id)?.disable();
frame.commands
  .list()
  .find((command) => command.id === black.id)
  ?.enable();
frame.commands['canvas.background.black'].enable();
const backgroundPage = frame.commandCenter.register({
  id: 'canvas.background',
  label: 'Change background',
  searchable: false,
  items: [
    black,
    {id: 'separator', type: 'separator', label: 'Other'},
    {
      id: 'custom',
      type: 'submenu',
      label: 'Custom',
      items: [
        {
          id: 'white',
          label: 'White',
          description: 'Solid',
          sectionLabel: 'colors',
          run() {},
        },
      ],
    },
  ],
});
const feature = frame.features.register({id: 'artwork.edit'});
frame.features['artwork.edit'].disable();
feature.enable();
feature.unregister();
backgroundPage.unregister();
black.unregister();
editPermission.unregister();

const settingsMode: 'form' | 'json' = frame.settings.mode.value;
void settingsMode;
frame.settings.json.draft.value = '{}';
void frame.settings.json.dirty.value;
void frame.settings.json.save();
frame.settings.showForm();

// State notifications use one typed event and opaque cancellation IDs.
const contextualPermission = frame.permissions.register<{readOnly: boolean}>({
  id: 'consumer.notifications.edit',
  allowed: (target) => !target.readOnly,
});
const permissionState: import('@frame/core').PermissionState = {
  mode: 'automatic',
  reason: undefined,
  active: true,
};
void permissionState;
const onPermissionChange: import('@frame/core').NotificationCallback<
  import('@frame/core').StateChange<import('@frame/core').PermissionSnapshot>
> = ({current, previous}) => {
  const allowed: boolean = current.allowed;
  const wasActive: boolean = previous.active;
  void allowed;
  void wasActive;
  // @ts-expect-error Notification snapshots cannot be mutated by consumers.
  current.allowed = false;
};
const permissionId: import('@frame/core').SubscriptionId =
  contextualPermission.subscribe(onPermissionChange, {readOnly: false});
// @ts-expect-error Contextual permissions require a typed subscription target.
contextualPermission.subscribe(onPermissionChange);
// @ts-expect-error A contextual permission rejects unrelated targets.
contextualPermission.subscribeOnce(onPermissionChange, {missing: true});
contextualPermission.unsubscribe(permissionId);
const observedCommand = frame.commands.register({
  id: 'consumer.notifications.command',
  label: 'Observed command',
  run() {},
});
const commandId = observedCommand.subscribe(({current}) => {
  const enabled: boolean = current.enabled;
  void enabled;
});
observedCommand.unsubscribe(commandId);
observedCommand.unregister();
const observedFeature = frame.features.register({
  id: 'consumer.notifications.feature',
});
const featureId = observedFeature.subscribeOnce(({current}) => {
  const available: boolean = current.available;
  void available;
});
observedFeature.unsubscribe(featureId);
observedFeature.unregister();
contextualPermission.unregister();

const notifier = new Notifier<{previous: number; current: number}>();
const notificationId = notifier.subscribeOnce((event) => {
  const value: number = event.current;
  void value;
});
notifier.invoke({previous: 1, current: 2});
// @ts-expect-error Invocation requires the notifier's exact event payload.
notifier.invoke({current: 'wrong'});
notifier.unsubscribe(notificationId);
const noPayload = new Notifier();
noPayload.subscribe(() => {});
noPayload.invoke();
