import groups from '../../../core/component-groups.json';

// Build-time metadata shared with Core's folder inventory; no shell ownership implied.
const entries = Object.entries(groups);
const componentFolders = new Map(entries.flatMap(([folder, group]) => group.components.map(name => [name, folder] as const)));
export const componentGroupOrder = [...entries.map(([, group]) => group.title), 'General', 'Modules'];
export function coreComponentSource(name: string) {
  const folder = componentFolders.get(name.replace(/\.vue$/, ''));
  return `packages/core/src/components/${folder ? folder + '/' : 'framework/'}${name.replace(/\.vue$/, '')}.vue`;
}
export function componentGroupForSource(source: string) {
  const name = source.split('/').pop()?.replace(/\.vue$/, '') ?? '';
  const folder = componentFolders.get(name);
  return folder ? groups[folder as keyof typeof groups].title : 'General';
}
