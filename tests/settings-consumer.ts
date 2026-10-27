import {
  createFrame,
  Settings,
  Setting,
  SettingsFileStorage,
  createSettingsFileStorage,
  type SettingsFileHandle,
} from '@frame/core';

const frame = createFrame();
const settings: Settings = frame.settings;
const item: Setting | undefined = settings.get('editor.fontSize');
item?.set(18);
item?.reset();
void item?.copy('json');
const current: string | number | boolean | undefined = item?.value;
void current;
if (item) {
  // @ts-expect-error Field IDs belong to their registration.
  item.id = 'replacement';
  // @ts-expect-error Settings values are scalar.
  item.set({value: 18});
  // @ts-expect-error Copy formats have a closed typed contract.
  void item.copy('xml');
}
const file: SettingsFileHandle = {
  async getFile() {
    return {
      async text() {
        return '{}';
      },
    };
  },
  async createWritable() {
    return {async write(_json: string) {}, async close() {}};
  },
};
const storage: SettingsFileStorage = createSettingsFileStorage(file);
const standalone = new Settings({storage});
standalone.dispose();
frame.dispose();
