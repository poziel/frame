import {
  Frame,
  createFrame,
  FrameShell,
  type FrameModule,
  type FrameNavigationLocation,
} from '@frame/core';
import {h} from 'vue';

const first: Frame = new Frame({navigation: true});
const second: Frame = createFrame();
const extension: FrameModule<'example', {read(): number}> = {
  id: 'example',
  key: 'example',
  install: () => ({capability: {read: () => 42}}),
};
const extended = first.use(extension).use({
  id: 'other',
  key: 'other',
  install: () => ({capability: {label: 'ready'}}),
});
const value: number = extended.example.read();
const label: string = extended.other.label;
void [value, label];
void h(FrameShell, {frame: extended});
// @ts-expect-error Capabilities do not appear on other instances.
second.example.read();
// @ts-expect-error Module results remain typed through chained installation.
const invalid: string = extended.example.read();
void invalid;
const snapshot: FrameNavigationLocation = {
  panes: [],
  active: '',
  activeTabs: {},
  primary: '',
  secondary: '',
  bottom: '',
  primaryVisible: false,
  secondaryVisible: false,
  bottomVisible: false,
  collapsed: {},
};
void snapshot;
first.dragState.active = false;
// @ts-expect-error Public drag state retains its original precise type.
first.dragState.active = 'no';
first.dispose();
second.dispose();
