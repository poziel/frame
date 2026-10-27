/** Rotate only the channel gradient; alpha checkerboard layers keep their angles. */
export function orientColorGradient(
  background: string,
  orientation = 'horizontal',
  inverted = false,
  dir = 'ltr'
) {
  const direction = orientation === 'vertical' ? (inverted ? 'bottom' : 'top') : ((dir === 'rtl') !== inverted ? 'left' : 'right');
  return background.replace('to right', `to ${direction}`);
}
