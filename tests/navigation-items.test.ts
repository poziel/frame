import { expect, test } from 'bun:test';
import { createNavigationItems, type NavigationItem } from '../packages/core/src/frame/navigationItems';

function setup() {
  const calls: string[] = [], errors: unknown[] = [];
  const registry = createNavigationItems({ navigate: href => { calls.push(href); }, reportError: (_label, error) => { errors.push(error); } });
  return { registry, calls, errors };
}
test('navigation types activate only explicit enabled actions and links', async () => {
  const { registry: r, calls } = setup();
  r.register({ id: 'action', type: 'action', label: 'Action', run: () => { calls.push('action'); } });
  r.register({ id: 'link', type: 'link', label: 'Link', href: '/home' });
  r.register({ id: 'separator', type: 'separator' });
  r.register({ id: 'menu', type: 'dropdown', label: 'Menu', disabled: true, items: [{ id: 'child', type: 'action', label: 'Child', run: () => { calls.push('child'); } }] });
  expect(calls).toEqual([]);
  expect(await r.activate('action')).toBe(true);
  expect(await r.activate('link')).toBe(true);
  expect(await r.activate('menu')).toBe(false);
  expect(await r.activate('separator')).toBe(false);
  expect(await r.activate('child')).toBe(false);
  expect(calls).toEqual(['action', '/home']);
  r.setItemVisible('link', false);
  expect(await r.activate('link')).toBe(false);
});
test('tree registration validates duplicates and cycles atomically', () => {
  const { registry: r } = setup();
  const item: NavigationItem = { id: 'root', type: 'dropdown', label: 'Root', items: [{ id: 'child', type: 'link', label: 'Child', href: '/' }] };
  const remove = r.register(item);
  expect(() => r.register({ id: 'new', type: 'dropdown', label: 'New', items: [{ id: 'child', type: 'separator' }] })).toThrow();
  expect(r.find('new')).toBeUndefined();
  const cyclic: any = { id: 'cycle', type: 'dropdown', label: 'Cycle', items: [] }; cyclic.items.push(cyclic);
  expect(() => r.register(cyclic)).toThrow();
  remove(); remove();
  expect(r.find('child')).toBeUndefined();
  expect(() => r.register(item)).not.toThrow();
});
test('malformed mixed navigation behaviors are rejected before registration', () => {
  const { registry: r } = setup();
  for (const item of [
    {id:'mixed',type:'link',label:'Mixed',href:'/',run(){}},
    {id:'separator',type:'separator',badge:3},
    {id:'dropdown',type:'dropdown',label:'Dropdown',items:[],active:true},
    {id:'action',type:'action',label:'Action',run(){},href:'/'},
  ]) expect(() => r.register(item as NavigationItem)).toThrow();
  expect(r.items.value).toHaveLength(0);
});
test('sparse dropdown arrays are rejected atomically', () => {
  const { registry: r } = setup();
  expect(() => r.register({id:'sparse',type:'dropdown',label:'Sparse',items:Array(1)})).toThrow();
  expect(r.find('sparse')).toBeUndefined();expect(r.items.value).toHaveLength(0);
});
test('root ordering and preferences are independent of nested menu order', () => {
  const { registry: r } = setup();
  r.register({ id: 'a', type: 'link', label: 'A', href: '/', badge: 2 });
  r.register({ id: 'b', type: 'dropdown', label: 'B', items: [{ id: 'child', type: 'separator' }] });
  expect(r.moveItem('child', 'a')).toBe(false);
  expect(r.moveItem('b', 'a')).toBe(true);
  expect(r.items.value.map(item => item.id)).toEqual(['b', 'a']);
  r.setBadge('a', 4); r.setBadgeVisible('a', false); r.setItemVisible('a', false);
  expect(r.getItemState('a')).toMatchObject({ badge: 4, badgeVisible: false, visible: false });
  expect(r.moveItem('a', 'missing')).toBe(false);
  expect(r.setBadge('child', 9)).toBe(false);
});
test('errors, independent instances, and disposal cannot revive registrations', async () => {
  const { registry: r, errors } = setup(), other = setup().registry;
  r.register({ id: 'bad', type: 'action', label: 'Bad', run: async () => { throw new Error('failed'); } });
  expect(await r.activate('bad')).toBe(false); expect(errors).toHaveLength(1);
  let finish!: () => void;
  r.register({ id: 'pending', type: 'action', label: 'Pending', run: () => new Promise<void>(resolve => { finish = resolve; }) });
  const pending = r.activate('pending'); r.dispose(); finish(); await pending;
  expect(r.items.value).toHaveLength(0);
  expect(await r.activate('pending')).toBe(false);
  expect(r.moveItem('bad')).toBe(false);
  expect(() => r.register({ id: 'late', type: 'separator' })).toThrow();
  expect(() => other.register({ id: 'bad', type: 'separator' })).not.toThrow();
});
