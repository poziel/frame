import type {ShellPresentation} from './shellPresentation';

/** Internal list of controller members retained by shell composition. */
export const viewControllerKeys = Symbol('frame-view-controller-members');

/**
 * Combines an existing specialized controller with its shell presentation.
 *
 * The presentation retains ownership of visibility and availability. Existing
 * controller getters and methods keep their descriptors; mutating operations
 * are gated by feature availability before being added to the presentation.
 *
 * @param controller - Specialized operations and state to retain.
 * @param presentation - Presentation instance receiving those operations.
 * @returns The same presentation instance with the combined controller contract.
 */
export function withPresentation<T extends object, P extends ShellPresentation>(
  controller: T,
  presentation: P
): T & P {
  const declaredKeys: unknown = Reflect.get(controller, viewControllerKeys);
  const descriptors: PropertyDescriptorMap = {};
  const keys = Array.isArray(declaredKeys)
    ? (declaredKeys as string[])
    : Object.keys(controller);
  for (const name of keys) {
    let source: object | null = controller;
    while (source && !Object.prototype.hasOwnProperty.call(source, name)) {
      source = Object.getPrototypeOf(source);
    }
    if (!source) continue;
    const descriptor = Object.getOwnPropertyDescriptor(source, name)!;
    if (descriptor.get) descriptor.get = descriptor.get.bind(controller);
    if (descriptor.set) descriptor.set = descriptor.set.bind(controller);
    descriptors[name] = descriptor;
  }
  delete descriptors.visible;
  for (const [name, descriptor] of Object.entries(descriptors)) {
    if (
      typeof descriptor.value === 'function' &&
      /^(set|move|add|remove|activate)/.test(name)
    ) {
      const run = descriptor.value;
      descriptor.value = (...args: unknown[]) =>
        presentation.available
          ? run(...args)
          : name === 'addSeparator'
            ? undefined
            : false;
    }
  }
  Object.defineProperties(presentation, descriptors);
  return presentation as T & P;
}
