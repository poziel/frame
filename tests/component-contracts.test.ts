import {describe, expect, test} from 'bun:test';
import {resolve} from 'node:path';
import {createComponentExtractor} from '../packages/docs/scripts/component-contracts';

const root = resolve(import.meta.dir, '..');
const extract = createComponentExtractor(root);

describe('compiler-backed component contracts', () => {
  test('reads literal defaults, documented slots and unwrapped exposed refs', () => {
    const contract = extract(
      'packages/core/src/components/actions/FrameButton.vue'
    );
    expect(
      contract.props.find((prop) => prop.name === 'variant')?.default
    ).toEqual({kind: 'literal', value: '"ghost"'});
    expect(
      contract.props.find((prop) => prop.name === 'label')?.description
    ).toContain('fallback');
    expect(
      contract.slots.find((slot) => slot.name === 'default')?.description
    ).toContain('label');
    expect(
      contract.methods.find((method) => method.name === 'element')?.returns
    ).toBe('HTMLButtonElement | undefined');
    expect(contract.props.some((prop) => prop.name === 'ref')).toBe(false);
    expect(
      contract.emits.find((event) => event.name === 'click')?.description
    ).toContain('Native click');
    expect(
      contract.slots.find((slot) => slot.name === 'default')?.parameters
    ).toBe('');
  }, 30000);
  test('resolves inherited props and callable-form inherited events', () => {
    const contract = extract(
      'packages/core/src/components/layout/FrameAccordion.vue'
    );
    expect(
      contract.props.find((prop) => prop.name === 'collapsible')?.type
    ).toContain('boolean');
    expect(
      contract.emits.some((event) => event.name === 'update:modelValue')
    ).toBe(true);
    expect(
      contract.slots.find((slot) => slot.name === 'content')?.parameters
    ).toContain('FrameAccordionItem');
  });
  test('retains generic constraints and declared menu defaults', () => {
    const contract = extract(
      'packages/core/src/components/navigation/FrameDropdownMenu.vue'
    );
    expect(contract.props.find((prop) => prop.name === 'items')?.required).toBe(
      true
    );
    expect(
      contract.props.find((prop) => prop.name === 'modal')?.default
    ).toEqual({kind: 'literal', value: 'false'});
    expect(
      contract.emits.find((event) => event.name === 'select')?.parameters
    ).not.toContain('any');
    expect(
      contract.slots.find((slot) => slot.name === 'trigger')?.description
    ).toContain('Actions');
  });
  test('does not invent defaults or descriptions from imported primitives', () => {
    const contract = extract(
      'packages/core/src/components/forms/FrameSwitch.vue'
    );
    expect(contract.props.some((prop) => prop.name === 'defaultValue')).toBe(
      false
    );
    expect(
      contract.props.find((prop) => prop.name === 'disabled')?.default
    ).toEqual({kind: 'literal', value: 'false'});
    expect(
      contract.slots.find((slot) => slot.name === 'tooltip')?.description
    ).toContain('tooltip');
  });
});

const fixture = createComponentExtractor(
  root,
  'tests/fixtures/component-meta/tsconfig.json'
);
test('resolves inherited comments, factories, overloads and missing descriptions', () => {
  const contract = fixture('tests/fixtures/component-meta/ContractFixture.vue');
  expect(
    contract.props.find((prop) => prop.name === 'id')?.description
  ).toContain('Stable identifier');
  expect(
    contract.props.find((prop) => prop.name === 'entries')?.default.kind
  ).toBe('derived');
  expect(
    contract.props.find((prop) => prop.name === 'context')?.default
  ).toEqual({kind: 'derived', expression: 'active theme'});
  expect(
    contract.props.find((prop) => prop.name === 'undescribed')?.description
  ).toBe('');
  expect(
    contract.props.find((prop) => prop.name === 'disabled')?.default
  ).toEqual({kind: 'literal', value: 'false'});
  expect(
    contract.props.find((prop) => prop.name === 'optionalBoolean')?.default
  ).toEqual({kind: 'omitted'});
  expect(
    contract.props.find((prop) => prop.name === 'booleanOrString')?.default
  ).toEqual({kind: 'literal', value: 'false'});
  expect(contract.diagnostics).toContain('Missing description: undescribed');
  expect(contract.diagnostics).toContain(
    'Conflicting default: conflict (true / false)'
  );
  expect(
    contract.emits.find((event) => event.name === 'submit')?.description
  ).toContain('Submission');
  expect(
    contract.methods.find((method) => method.name === 'convert')?.parameters
  ).toContain('number');
  expect(
    contract.methods.find((method) => method.name === 'convert')?.parameters
  ).toContain('string');
}, 30000);
test('extracts supported destructuring defaults without executing setup', () => {
  const contract = fixture(
    'tests/fixtures/component-meta/DestructureFixture.vue'
  );
  expect(contract.props.find((prop) => prop.name === 'label')?.default).toEqual(
    {kind: 'literal', value: '"Hello"'}
  );
  expect(contract.props.find((prop) => prop.name === 'count')?.default).toEqual(
    {kind: 'literal', value: '2'}
  );
});

test('reviewed calendar documents verified forwarded defaults without changing runtime options', () => {
  const contract = extract(
    'packages/core/src/components/forms/dates-and-times/FrameCalendar.vue'
  );
  expect(
    contract.props.find((prop) => prop.name === 'numberOfMonths')?.default
  ).toEqual({kind: 'literal', value: '1'});
  expect(contract.props.find((prop) => prop.name === 'as')?.default).toEqual({
    kind: 'literal',
    value: '"div"',
  });
  expect(
    contract.props.find((prop) => prop.name === 'modelValue')?.default
  ).toEqual({kind: 'omitted'});
  expect(
    contract.slots.find((slot) => slot.name === 'footer')?.description
  ).toContain('calendar grid');
}, 30000);
test('reviewed file picker, text input, and loading contracts retain source descriptions and scopes', () => {
  const upload = extract(
    'packages/core/src/components/forms/FrameFileUpload.vue'
  );
  expect(
    upload.slots.find((slot) => slot.name === 'files')?.parameters
  ).toContain('remove');
  expect(
    upload.methods.find((method) => method.name === 'clear')?.description
  ).toContain('selection');
  const input = extract(
    'packages/core/src/components/forms/FrameTextField.vue'
  );
  expect(
    input.methods.find((method) => method.name === 'element')?.returns
  ).toBe('HTMLInputElement | undefined');
  expect(
    input.props.find((prop) => prop.name === 'type')?.description
  ).toContain('empty');
  const loading = extract(
    'packages/core/src/components/feedback/FrameLoading.vue'
  );
  expect(
    loading.slots.find((slot) => slot.name === 'default')?.description
  ).toContain('retained');
  expect(loading.props.find((prop) => prop.name === 'active')?.required).toBe(
    true
  );
});

test('recognizes optional imported callback aliases as fixture controls', () => {
  const contract = fixture('tests/fixtures/component-meta/ContractFixture.vue');
  expect(contract.props.find((prop) => prop.name === 'validate')?.control).toBe(
    'fixture'
  );
  const field = extract('packages/core/src/components/forms/FrameField.vue');
  expect(field.props.find((prop) => prop.name === 'validate')?.control).toBe(
    'fixture'
  );
});
