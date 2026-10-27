/** Keep API values intact while displaying readable names in playground controls. */
export function playgroundOptions(values: readonly string[]) {
  return values.map(value => ({ value, label: value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, letter => letter.toUpperCase()) }));
}
