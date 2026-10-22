import { test, expect } from 'bun:test';
import { decodeChoiceValue, encodeChoiceValue } from '../packages/core/src/forms/controls';
test('select encoding preserves empty and sentinel-like host values', () => { for (const value of ['', 'frame:', 'a', '😀']) expect(decodeChoiceValue(encodeChoiceValue(value))).toBe(value); expect(encodeChoiceValue('')).not.toBe(''); });
