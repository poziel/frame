import { expect, test } from 'bun:test';
import { orientColorGradient } from '../packages/core/src/components/forms/shared/colorSlider';
test('channel gradients follow the axis, inversion, and direction without rotating alpha checks', () => {
  const gradient='linear-gradient(to right, transparent, red), linear-gradient(45deg, gray 25%, transparent 25%)';
  expect(orientColorGradient(gradient,'vertical')).toContain('to top');
  expect(orientColorGradient(gradient,'vertical',true)).toContain('to bottom');
  expect(orientColorGradient(gradient,'horizontal',false,'rtl')).toContain('to left');
  expect(orientColorGradient(gradient,'horizontal',true,'rtl')).toContain('to right');
  expect(orientColorGradient(gradient,'horizontal',true)).toContain('to left');
  expect(orientColorGradient(gradient,'vertical')).toContain('linear-gradient(45deg');
});
