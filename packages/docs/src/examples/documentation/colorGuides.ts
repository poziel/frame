import type { ComponentGuide } from './formGuides';
const palette=['#0078d4','#16a34a','#e05252','#a855f7'];
export const colorGuides:Record<string,ComponentGuide>={
 'color-area':{
  description:'Choose a color by moving across two channels at once. The gradient and thumb reflect the current color and selected color space.',
  source:'https://reka-ui.com/docs/components/color-area',
  capabilities:['Edit with a pointer, touch, or arrow keys.','Choose the color space and the channel assigned to each axis.','Bind the resulting color to other application controls.'],
  anatomy:[{part:'ColorAreaRoot',description:'Holds color state and computes the gradient.'},{part:'ColorAreaArea',description:'Receives position changes on the color plane.'},{part:'ColorAreaThumb',description:'Marks the selected channel coordinates.'}],
  examples:[
   {id:'hsb-plane',title:'Saturation and brightness',description:'Keep hue fixed while horizontal movement adjusts saturation and vertical movement adjusts brightness.',values:{modelValue:'#0078d4',colorSpace:'hsb',xChannel:'saturation',yChannel:'brightness'}},
   {id:'hsl-plane',title:'Saturation and lightness',description:'Change to HSL to explore darker and lighter colors with the same two-dimensional interaction.',values:{modelValue:'#16a34a',colorSpace:'hsl',xChannel:'saturation',yChannel:'lightness'}},
   {id:'rgb-plane',title:'Independent RGB channels',description:'Assign red and green to the axes. Moving the thumb preserves the blue channel.',values:{modelValue:'#8078d4',colorSpace:'rgb',xChannel:'red',yChannel:'green'}},
  ],
 },
 'color-field':{
  description:'Enter a complete color as text, or edit one channel numerically. Channel editing retains the other parts of the color.',
  source:'https://reka-ui.com/docs/components/color-field',
  capabilities:['Accept a hex value or select a channel to edit.','Use arrow keys for small changes and Page Up/Down for larger changes.','Configure the color space and increment size.'],
  anatomy:[{part:'ColorFieldRoot',description:'Parses color values and coordinates channel updates.'},{part:'ColorFieldInput',description:'Displays the editable color or channel value.'}],
  examples:[
   {id:'hex-input',title:'Hexadecimal input',description:'Edit the complete hex value, then commit the entry to update the bound color.',values:{modelValue:'#0078d4'}},
   {id:'hue-input',title:'Numeric hue editing',description:'Select the hue channel and step by five units. Saturation and brightness stay attached to the color.',values:{modelValue:'#0078d4',colorSpace:'hsb',channel:'hue',step:5}},
   {id:'red-input',title:'RGB channel editing',description:'Edit red as a number without replacing the green and blue channels.',values:{modelValue:'#8078d4',colorSpace:'rgb',channel:'red',step:1}},
  ],
 },
 'color-slider':{
  description:'Adjust a single color channel on a gradient track. The thumb position and gradient update with the current color.',
  source:'https://reka-ui.com/docs/components/color-slider',
  capabilities:['Adjust hue, alpha, or a channel in RGB, HSL, or HSB.','Use horizontal or vertical tracks.','Control increment precision with step.'],
  anatomy:[{part:'ColorSliderRoot',description:'Coordinates the selected color channel.'},{part:'ColorSliderTrack',description:'Shows the gradient for that channel.'},{part:'ColorSliderThumb',description:'Provides pointer and keyboard adjustment.'}],
  examples:[
   {id:'hue-track',title:'Hue spectrum',description:'Move along the hue track while preserving the other channels.',values:{modelValue:'#0078d4',channel:'hue',colorSpace:'hsb'}},
   {id:'alpha-track',title:'Transparency control',description:'Adjust alpha in small increments without changing the underlying color.',values:{modelValue:'rgba(0, 120, 212, 0.6)',channel:'alpha',step:0.05}},
   {id:'vertical-track',title:'Vertical lightness track',description:'Use a vertical HSL lightness control beside a color plane.',values:{modelValue:'#16a34a',colorSpace:'hsl',channel:'lightness',orientation:'vertical'}},
  ],
 },
 'color-swatch':{
  description:'Represent a color as a visible sample with an accessible name. A swatch displays a value; it does not select or edit it.',
  source:'https://reka-ui.com/docs/components/color-swatch',
  capabilities:['Display CSS color values.','Provide a readable color name for assistive technology.','Show both opaque and translucent samples.'],
  anatomy:[{part:'ColorSwatch',description:'Renders the color sample and its accessible description.'}],
  examples:[
   {id:'named-sample',title:'Named color sample',description:'Pair the stored color with a meaningful label rather than relying on color alone.',values:{color:'#0078d4',label:'Application accent'}},
   {id:'alpha-sample',title:'Translucent sample',description:'Pass an alpha color to display a partially transparent sample.',values:{color:'rgba(0, 120, 212, 0.5)',label:'Half-opacity accent'}},
  ],
 },
 'color-swatch-picker':{
  description:'Select a color from a supplied palette. Frame builds a selectable item, swatch, and selection indicator for each color.',
  source:'https://reka-ui.com/docs/components/color-swatch-picker',
  capabilities:['Keep selection in a bound color value.','Move focus and select colors with the keyboard.','Arrange the palette horizontally or vertically.'],
  anatomy:[{part:'ColorSwatchPickerRoot',description:'Owns palette selection and keyboard navigation.'},{part:'ColorSwatchPickerItem',description:'Associates one selectable item with a color.'},{part:'ColorSwatchPickerItemSwatch',description:'Displays the item color.'},{part:'ColorSwatchPickerItemIndicator',description:'Marks the selected item.'}],
  examples:[
   {id:'palette-selection',title:'Controlled palette selection',description:'Choose a swatch to update the bound color from a fixed palette.',values:{modelValue:'#0078d4',colors:palette}},
   {id:'vertical-palette',title:'Vertical keyboard navigation',description:'Arrange the same palette vertically for a narrow tool area. Use the arrow keys to move between colors.',values:{modelValue:'#16a34a',colors:palette,orientation:'vertical'}},
  ],
 },
};
