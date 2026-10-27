import {expect, test} from 'bun:test';
import {FeatureRegistry} from '../packages/core/src/framework/features/featureRegistry';
import {ShellPresentation} from '../packages/core/src/framework/views/shellPresentation';
import {withPresentation} from '../packages/core/src/framework/views/withPresentation';

test('presentation adapter preserves identity, live descriptors, and owned visibility', () => {
  const features = new FeatureRegistry();
  let count = 0;
  const presentation = new ShellPresentation(
    features,
    'tools',
    () => true,
    () => {},
    () => {}
  );
  const combined = withPresentation(
    {
      visible: {value: false},
      get count() {
        return count;
      },
      setCount(value: number) {
        count = value;
        return true;
      },
    },
    presentation
  );
  expect(combined).toBe(presentation);
  expect(combined.visible.value).toBe(true);
  expect(combined.setCount(2)).toBe(true);
  expect(combined.count).toBe(2);
  features.setAvailable('tools', false);
  expect(combined.visible.value).toBe(false);
  expect(combined.setCount(3)).toBe(false);
  expect(combined.count).toBe(2);
  features.dispose();
});

test('presentation adapter blocks separator creation and resumes after feature restoration', () => {
  const features = new FeatureRegistry();
  let calls = 0;
  const presentation = new ShellPresentation(
    features,
    'tools',
    () => false,
    () => {},
    () => {}
  );
  const combined = withPresentation(
    {
      addSeparator() {
        calls++;
        return 'separator';
      },
    },
    presentation
  );
  features.setAvailable('tools', false);
  expect(combined.addSeparator()).toBeUndefined();
  expect(calls).toBe(0);
  features.setAvailable('tools', true);
  expect(combined.addSeparator()).toBe('separator');
  expect(calls).toBe(1);
  features.dispose();
});
