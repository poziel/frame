import { test, expect } from 'bun:test';
import { computed, reactive } from 'vue';
import {createFrame} from '../packages/core/src/framework/frame';

test('view presentation getters remain reactive without replacing the view or its layout', () => {
  const frame = createFrame(), other = createFrame();
  const state = reactive({ tool: 'Pencil', color: '#28a9f4' });
  const remove = frame.registerSidePanel({ id: 'tools', label: 'Tools', children: [{
    id: 'left', get label() { return `Left tools · ${state.tool}`; },
    get titleColor() { return state.color; }, component: { render: () => null }, collapsed: true,
  }] });
  const view = frame.getViewChildren('tools')[0]!;
  const label = computed(() => view.label), color = computed(() => view.titleColor);
  expect(label.value).toBe('Left tools · Pencil');
  expect(color.value).toBe('#28a9f4');
  state.tool = 'Eraser'; state.color = '#ff8b36';
  expect(label.value).toBe('Left tools · Eraser');
  expect(color.value).toBe('#ff8b36');
  expect(frame.getViewChildren('tools')[0]).toBe(view);
  expect(frame.viewState.collapsed.left).toBe(true);
  expect(other.views.value).toHaveLength(0);
  frame.moveView('left', 'secondary');
  expect(frame.views.value.find(v => v.id === 'left')?.label).toBe(label.value);
  remove(); expect(frame.views.value).toHaveLength(0);
  frame.dispose(); other.dispose();
});
