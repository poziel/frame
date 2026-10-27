import {expect, test} from 'bun:test';
import {effectScope} from 'vue';
import {Frame} from '../packages/core/src/framework/frame';

const component = {render: () => null};

test('modal activation and disposal cancel only their owning picker requests', async () => {
  const first = new Frame();
  const second = new Frame();
  try {
    const firstRequest = first.showQuickPick([{id: 'first', label: 'First'}]);
    const secondRequest = second.showQuickPick([
      {id: 'second', label: 'Second'},
    ]);
    const {openModal} = first;
    openModal({id: 'dialog', label: 'Dialog', component});
    expect(await firstRequest).toBeUndefined();
    expect(first.quickInput.value).toBeNull();
    expect(second.quickInput.value?.items?.[0]?.id).toBe('second');
    second.dispose();
    expect(await secondRequest).toBeUndefined();
    expect(first.modals.map((modal) => modal.id)).toEqual(['dialog']);
  } finally {
    first.dispose();
    second.dispose();
  }
});

test('extracted layout observers survive caller scope cleanup and stop on disposal', () => {
  const caller = effectScope();
  const frame = caller.run(() => new Frame())!;
  try {
    caller.stop();
    frame.layout.panelVisible = true;
    frame.layout.maximizedRegion = 'bottom';
    frame.layout.panelVisible = false;
    expect(frame.layout.maximizedRegion).toBeNull();
    frame.layout.panelVisible = true;
    frame.dispose();
    frame.layout.maximizedRegion = 'bottom';
    frame.layout.panelVisible = false;
    expect(frame.layout.maximizedRegion).toBe('bottom');
  } finally {
    frame.dispose();
    caller.stop();
  }
});

test('preference launchers retain independent targets and apply workspace availability', () => {
  const frame = new Frame();
  try {
    expect(frame.openSettingsInTab()).toBe(true);
    expect(frame.settingsTarget.value).toBe('tab');
    expect(frame.keybindingsTarget.value).toBe('modal');
    expect(frame.settingsRequest.value).toBe(1);
    expect(frame.keybindingsRequest.value).toBe(0);
    frame.openKeybindingsInModal();
    expect(frame.keybindingsRequest.value).toBe(1);
    frame.features.disable('workspace');
    expect(frame.openSettingsInTab()).toBe(false);
    expect(frame.openKeybindingsInTab()).toBe(false);
    expect(frame.settingsRequest.value).toBe(1);
    expect(frame.openSettingsInModal()).toBe(true);
    expect(frame.settingsRequest.value).toBe(2);
  } finally {
    frame.dispose();
  }
});
