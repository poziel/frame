/** Fit preferred content heights into a region, keeping every open view visible. */
export function fitViewSizes(preferred: readonly number[], available: number, minimum = 60): number[] {
  if (!preferred.length) return [];
  const budget = Math.max(0, available);
  const floor = Math.min(minimum, budget / preferred.length);
  const sizes = preferred.map(size => Math.max(floor, Number.isFinite(size) ? size : 180));
  let remaining = budget;
  let pending = sizes.map((_, index) => index);
  while (pending.length) {
    const sum = pending.reduce((total, index) => total + sizes[index]!, 0);
    const factor = sum ? remaining / sum : 0;
    const pinned = pending.filter(index => sizes[index]! * factor < floor);
    if (!pinned.length) { pending.forEach(index => { sizes[index] = sum ? sizes[index]! * factor : remaining / pending.length; }); break; }
    pinned.forEach(index => { sizes[index] = floor; remaining -= floor; });
    pending = pending.filter(index => !pinned.includes(index));
  }
  return sizes;
}
