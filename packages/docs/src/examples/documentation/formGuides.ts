export interface GuideExample {
  id: string;
  title: string;
  description: string;
  values: Record<string, unknown>;
  slots?: Record<string, string>;
}
export interface ComponentGuide {
  description: string;
  anatomy: { part: string; description: string }[];
  capabilities: string[];
  source: string;
  examples: GuideExample[];
}
const example = (
  id:string,
  title:string,
  description:string,
  values:Record<string,unknown>,
  slots?:Record<string,string>
):GuideExample => ({id,title,description,values,...(slots?{slots}:{})});
const anatomy = (...parts:[string,string][]) => parts.map(([part,description])=>({part,description}));
const choice = (value:string, label:string, extra:Record<string,unknown>={})=>({value,label,...extra});
const fruits = [choice('apple','Apple'),choice('banana','Banana'),choice('blueberry','Blueberry'),choice('grapes','Grapes')];
const textOptions = ['Apple','Apricot','Banana','Blueberry','Grapes'];
const guide = (
  id:string,
  description:string,
  parts:ComponentGuide['anatomy'],
  capabilities:string[],
  examples:GuideExample[]
):ComponentGuide => ({description,anatomy:parts,capabilities,examples,source:`https://reka-ui.com/docs/components/${id}`});

// Describe the composition shipped by Frame, rather than promising every upstream primitive.
export const formGuides:Record<string,ComponentGuide> = {
  autocomplete: guide('autocomplete',
    'A text input that offers suggestions while accepting a value outside the list. Selecting a suggestion fills the text; it does not create a separate selected-item model.',
    anatomy(['AutocompleteRoot','Coordinates typed text and popup state.'],['Anchor + Input','The editable field anchors the suggestion popup.'],['Portal + Content','Keeps suggestions inside the Frame overlay boundary.'],['Item + Empty','Renders matching strings or a no-results message.']),
    ['Type freely or accept a keyboard-highlighted suggestion.','Case-insensitive filtering follows the controlled text value.','Choose whether focus or a click opens suggestions.'],[
      example('free-text','Free text with suggestions','Select a fruit, or type a new name and leave the field. The text remains the value even without a match.',{modelValue:'',options:textOptions,label:'Fruit',placeholder:'Type or choose a fruit',openOnFocus:true}),
      example('matching','Filtered suggestions and empty results','Start with “ap”, then replace it with “pear”. The list narrows and displays its empty message when nothing matches.',{modelValue:'ap',options:textOptions,label:'Fruit search',openOnFocus:true}),
      example('focus-behavior','Open on focus','Tab into the input to see suggestions before typing. This suits short lists users may want to browse.',{modelValue:'',options:textOptions,label:'Browse suggestions',openOnFocus:true,openOnClick:true}),
    ]),
  checkbox: guide('checkbox',
    'A labeled control for one boolean choice. Frame composes the checkbox and its checked indicator so the visible label also activates the control.',
    anatomy(['Label','Wraps the control and its label text.'],['CheckboxRoot','Owns the checked state and keyboard interaction.'],['CheckboxIndicator','Shows the mark when checked.']),
    ['Toggle with the label, pointer, or Space.','Frame exposes boolean checked state; upstream indeterminate and custom-value modes are not part of this wrapper.','Use the default slot for a richer visible label.'],[
      example('boolean','A boolean choice','Activate the text or press Space on the checkbox. The model switches between true and false.',{modelValue:false,label:'Accept terms and conditions'}),
      example('label-content','Custom label content','Use the default slot to supply the label while retaining the checkbox interaction.',{modelValue:true},{default:'Include release notes in this export'}),
    ]),
  'checkbox-group': guide('checkbox',
    'A collection of independent checkboxes backed by an array. Each selected option contributes its stable value; several choices can be checked together.',
    anatomy(['CheckboxGroupRoot','Coordinates the selected-value array.'],['Label + CheckboxRoot','An independently labeled choice for each option.'],['CheckboxIndicator','Marks each selected choice.']),
    ['Select any combination of options.','Disable individual choices without disabling the group.','Insert non-selectable separators between related choices.'],[
      example('array','Several checked values','Check and uncheck fruit options. The model contains only the values currently selected.',{modelValue:['apple','grapes'],options:fruits,label:'Fruit selection'}),
      example('unavailable','Unavailable choices','Banana remains visible but cannot be selected; the other checkboxes stay independent.',{modelValue:['apple'],options:[choice('apple','Apple'),choice('banana','Banana',{disabled:true}),choice('grapes','Grapes')],label:'Available fruit'}),
      example('separators','Separate sets of choices','A separator divides the sets without becoming part of the selected array.',{modelValue:['apple'],options:[choice('apple','Apple'),choice('banana','Banana'),{type:'separator',id:'berries'},choice('blueberry','Blueberry')],label:'Fruit and berries'}),
    ]),
  combobox: guide('combobox',
    'A searchable picker for a predefined option list. Searching changes the visible results; choosing a result stores its value while the input displays its label.',
    anatomy(['Root','Coordinates the chosen option.'],['Anchor + Input + Trigger','Combines searching with a button that opens the list.'],['Portal + Content + Viewport','Presents the bounded option popup.'],['Item + Separator + Empty','Renders available choices, divisions, and no-results feedback.']),
    ['Search labels without changing stable option values.','Choose with arrow keys and Enter.','Show disabled items, details, and separators.','Frame exposes a single string selection, rather than upstream object or multiple selection.'],[
      example('search','Search and select','Open the list and type “blue”. Choose Blueberry to store blueberry while displaying its readable label.',{modelValue:'apple',options:fruits,label:'Fruit',placeholder:'Search fruit'}),
      example('details','Explain an option','Details appear beside each label. An unavailable option stays visible but cannot replace the current selection.',{modelValue:'standard',options:[choice('standard','Standard',{detail:'Included'}),choice('express','Express',{detail:'Next day'}),choice('international','International',{detail:'Unavailable',disabled:true})],label:'Delivery'}),
      example('sections','Divide related choices','A non-selectable separator visually separates fruits from berries in the popup.',{modelValue:'apple',options:[choice('apple','Apple'),choice('banana','Banana'),{type:'separator',id:'berries'},choice('blueberry','Blueberry')],label:'Fruit or berry'}),
    ]),
  editable: guide('editable',
    'Inline text that becomes an input when editing starts. Use it for a short value that should read like content until the user chooses to change it.',
    anatomy(['EditableRoot','Coordinates the value and editing state.'],['EditableArea','Groups both representations of the same text.'],['Preview + Input','Switches between readable text and the editor.']),
    ['Edit a single line in place.','Focus is managed when entering or leaving editing.','Show a placeholder when the value is empty.','Frame supplies the preview/input composition; separate edit, submit, and cancel triggers are not exposed.'],[
      example('inline','Edit in place','Activate the text, change it, and leave the field to finish. Press Escape during editing to cancel.',{modelValue:'Reka UI',label:'Project title'}),
      example('enter-only','Save only with Enter','Double-click to edit. Enter saves; clicking away or pressing Escape discards the draft.',{modelValue:'Explicit commit',label:'Enter-only title',activationMode:'dblclick',submitMode:'enter'}),
      example('empty','Start from an empty value','The preview shows a placeholder until a title is entered. Placeholder text is not stored in the model.',{modelValue:'',placeholder:'Click to add a title',label:'Untitled project'}),
    ]),
  field: guide('field',
    'Connects a control with its label, help text, and validation feedback. Frame supplies the surrounding parts; place one application control in the default slot.',
    anatomy(['FieldRoot','Coordinates IDs and validation state.'],['FieldLabel','Labels the slotted control.'],['FieldControl','Connects the child control to field state.'],['Description + Error','Links help text and validation feedback to the control.']),
    ['Automatically connects label, description, and error messages.','Supports native constraints and custom validation.','Can display an application-supplied error.'],[
      example('description','Label and supporting text','The description is connected to the input, keeping help text available while the user edits.',{name:'projectName',label:'Project name',description:'Use a short, recognizable name.'}),
      example('required','Validate when leaving the field','Clear the input and move focus away. Required validation displays feedback after blur.',{name:'projectName',label:'Required name',required:true,validationMode:'onBlur',description:'Clear this value, then leave the field.'}),
      example('external-error','Show an external error','An explicit error marks the control invalid and supplies feedback from application validation.',{name:'projectName',label:'Project name',error:'This project name is already taken.'}),
    ]),
  form: guide('form',
    'A form boundary that coordinates named fields, validation, and server errors. Valid submissions can be handled in the application or continue through native form submission.',
    anatomy(['FormRoot','Coordinates descendant fields and submit/reset behavior.'],['FrameField','Registers each named control and its validation.'],['Submit control','Requests validation and submission.']),
    ['Prevents invalid submission and focuses the first invalid control.','Collects named values through formSubmit.','Maps server errors to fields and clears them after editing.'],[
      example('submit','Validate before submission','Clear the project name and submit to see validation. Enter a name and submit again to see the collected values.',{}, {default:'Submit project'}),
      example('server-error','Display a server error','A server error is keyed by projectName. Editing that field clears its reported error.',{errors:{projectName:'This name is already registered.'}},{default:'Save project'}),
      example('blur','Set validation timing for the form','Fields inherit blur validation from this form. Clear the input, then leave it to reveal the required message.',{validationMode:'onBlur'},{default:'Save changes'}),
    ]),
  rating: guide('rating',
    'A score input composed of repeated rating items. Whole or fractional steps let users choose a score with pointer or keyboard interaction.',
    anatomy(['RatingRoot','Coordinates the score, length, and step size.'],['RatingItem','Groups the steps that make one item.'],['RatingItemIndicator','Renders an interactive step; Frame supplies a star by default.']),
    ['Use whole, half, quarter, or tenth steps.','Optionally preview a score on hover.','Allow clearing by activating the selected score again.'],[
      example('fractional','Half-step ratings','Choose between whole and half scores while retaining five visible rating items.',{modelValue:3.5,length:5,step:0.5}),
      example('preview','Preview before choosing','Move over the stars to preview another score, then leave without clicking. The stored score stays unchanged.',{modelValue:2,length:5,hoverable:true}),
      example('clear','Clear the current score','Activate the currently selected score again to reset the rating to zero.',{modelValue:4,length:5,clearable:true}),
      example('symbols','Custom rating content','Replace the default star through the slot while preserving the rating interaction.',{modelValue:3,length:5},{default:'♥'}),
    ]),
  'tag-group': guide('tag-group',
    'A keyboard-navigable collection of existing tags. Unlike Tags Input, it presents an application-owned list and can optionally let users select its items.',
    anatomy(['TagGroupRoot','Coordinates focus and optional selection.'],['TagGroupItem + ItemText','Pairs an item value with its visible label.'],['ItemDelete','Appears only when the application handles the remove event.']),
    ['Choose no selection, one selection, or several selections.','Keep at least one tag selected when required.','A remove listener enables removal requests; the host updates items.'],[
      example('browse','Browse without selecting','The tags are navigable but do not represent a selection when selectionMode is none.',{selectionMode:'none',items:fruits}),
      example('single','Select one tag','One tag acts as the current category. Selecting another replaces it.',{modelValue:'apple',selectionMode:'single',items:fruits}),
      example('multiple','Select several tags','Multiple selection keeps an array. Toggle tags to build a combination.',{modelValue:['apple','grapes'],selectionMode:'multiple',items:fruits}),
      example('required-selection','Keep a selection','The selected tag cannot be deselected until another tag replaces it.',{modelValue:'apple',selectionMode:'single',disallowEmptySelection:true,items:fruits}),
    ]),
  label: guide('label',
    'An accessible label for a control. Associate it with an input ID, or place a native control inside the label when composing your own view.',
    anatomy(['Label','Renders the label content and forwards activation to an associated control.']),
    ['Associate a separate control through for and id.','Supports nested native controls in application compositions.','Avoids accidental text selection on repeated label clicks.'],[
      example('association','Focus an associated field','Activate the label to focus the input whose ID matches its for value.',{for:'guide-name'},{default:'Project name'}),
    ]),
  listbox: guide('listbox',
    'An always-visible list of choices with managed focus. Use a single value for one selection or an array when several choices may be selected.',
    anatomy(['ListboxRoot','Coordinates focus and selected values.'],['ListboxContent','Contains the visible choices.'],['ListboxItem','Presents an option label and optional detail.']),
    ['Choose one or several visible options.','Navigate choices with the keyboard.','Keep unavailable options visible and unselectable.'],[
      example('single','Select one item','The entire list stays visible as the selected value changes.',{modelValue:'apple',options:fruits,label:'Fruit'}),
      example('multiple','Select multiple items','Enable multiple to bind an array and select several entries in the same list.',{modelValue:['apple','grapes'],multiple:true,options:fruits,label:'Fruit selection'}),
      example('disabled-option','Skip an unavailable item','Banana remains visible but is skipped by selection; Apple and Grapes remain available.',{modelValue:'apple',options:[choice('apple','Apple'),choice('banana','Banana',{disabled:true}),choice('grapes','Grapes')],label:'Available fruit'}),
    ]),
  'input-group': {
    source:'https://reka-ui.com/docs/utilities/primitive',
    description:'Compose a labeled input with decorations or actions while retaining one shared input surface.',
    anatomy:[{part:'FrameFieldGroup',description:'Owns the shared border and focus ring.'},{part:'prefix / suffix',description:'Decorations before or after the input.'}],
    capabilities:['Use currency and unit labels inside the border.','Reuse text, number, date, or select controls.','Override the group surface through component theme variables.'],
    examples:[{id:'currency',title:'Currency input',description:'A dollar prefix and USD suffix surround the actual Frame text input.',values:{},slots:{prefix:'$',suffix:'USD'}},{id:'unit',title:'Unit suffix',description:'Keep a unit next to the input value inside the same surface.',values:{},slots:{suffix:'kg'}}],
  },
  'scrub-field': {
    source:'https://reka-ui.com/docs/components/number-field',
    description:'A compact numeric field with drag scrubbing and click-to-edit text entry, built from Reka number-field primitives and Frame text/icon controls.',
    anatomy:[{part:'NumberFieldRoot',description:'Owns bounds and stepper state.'},{part:'FrameTextField',description:'Direct text entry on click.'},{part:'Scrub display',description:'Label, value, and bounded progress fill.'}],
    capabilities:['Drag or scroll to adjust numeric tool settings.','Click or press Enter to type; Escape cancels.','Use bounds, fractional steps, and disabled state.'],
    examples:[{id:'size',title:'Tool size',description:'Drag to set size, or click to enter an exact value.',values:{modelValue:12,label:'Size',suffix:' px',min:1,max:256,step:1}},{id:'opacity',title:'Opacity',description:'Wheel and arrow buttons change the percentage in single steps.',values:{modelValue:80,label:'Opacity',suffix:'%',min:0,max:100,step:1}}],
  },
  'number-field': guide('number-field',
    'A numeric input with decrement and increment buttons. Bounds and steps apply consistently to the editable value and stepper interactions.',
    anatomy(['NumberFieldRoot','Coordinates numeric value, bounds, and step.'],['NumberFieldInput','Allows direct numeric entry.'],['Decrement + Increment','Adjusts the value by one step.']),
    ['Type numbers or adjust them with buttons and keyboard.','Constrain the allowed numeric interval.','Use fractional or coarse step sizes.'],[
      example('bounds','Bound the value','Choose a value between 1 and 10. The controls stop at the supplied limits.',{modelValue:5,min:1,max:10,label:'Quantity'}),
      example('compact','Compact attached controls','Keep icon buttons attached to one compact input border.',{modelValue:5,min:0,max:10,label:'Compact quantity',size:'compact',controls:'buttons'}),
      example('plain','Without steppers','Numeric entry and keyboard adjustment without visible buttons.',{modelValue:5,min:0,max:10,label:'Plain quantity',controls:'none'}),
      example('stacked','Stacked arrow controls','Native number arrows, matching the settings number input without an extra button background.',{modelValue:5,min:0,max:10,label:'Stacked quantity',controls:'stacked',size:'compact'}),
      example('fractional','Fractional steps','Increase or decrease by 0.25 for a measurement requiring fractional precision.',{modelValue:1.5,min:0,max:4,step:0.25,label:'Measurement'}),
      example('coarse','Coarse increments','A step of 25 moves quickly through the allowed range.',{modelValue:100,min:50,max:200,step:25,label:'Zoom percent'}),
    ]),
  'pin-input': guide('pin-input',
    'A sequence of single-character fields that share one code value. Focus moves between cells while keyboard entry and pasted content fill the sequence.',
    anatomy(['PinInputRoot','Coordinates the character array and focus.'],['PinInputInput','One indexed cell for each position in the code.']),
    ['Choose the number of character cells.','Paste a code across the fields.','Mask characters or request one-time-code autofill.'],[
      example('paste','Paste a verification code','Focus the first cell and paste a six-character code. The input distributes it across the sequence.',{modelValue:[],length:6,otp:true,label:'Verification code'}),
      example('length','A shorter code','Four cells match a shorter code format; existing characters can be edited individually.',{modelValue:['1','2'],length:4,label:'Access code'}),
      example('mask','Mask entered characters','Characters remain in the model while their on-screen representation is masked.',{modelValue:[],length:6,mask:true,label:'Private code'}),
    ]),
  'radio-group': guide('radio-group',
    'A set of visible, mutually exclusive choices. Selecting one option replaces the previous selection rather than toggling an independent boolean.',
    anatomy(['RadioGroupRoot','Coordinates one selected value and keyboard focus.'],['RadioGroupItem','A labeled choice with optional detail.'],['RadioGroupIndicator','Marks the selected choice.']),
    ['Keep one selected value across a group.','Use keyboard navigation between choices.','Explain or disable individual options.'],[
      example('exclusive','Mutually exclusive choices','Select an option to replace the previous choice. Only one value is checked.',{modelValue:'comfortable',options:[choice('default','Default'),choice('comfortable','Comfortable'),choice('compact','Compact')],label:'Density'}),
      example('details','Explain available choices','Details distinguish the choices; the disabled option remains visible without becoming selected.',{modelValue:'standard',options:[choice('standard','Standard',{detail:'Included'}),choice('express','Express',{detail:'Next day'}),choice('international','International',{detail:'Unavailable',disabled:true})],label:'Delivery'}),
    ]),
  select: guide('select',
    'A button-triggered option picker. The selected label stays visible in the trigger while the full list opens in a keyboard-navigable popup.',
    anatomy(['SelectRoot','Coordinates the chosen value and open state.'],['SelectTrigger','Displays the selected label and opening icon.'],['Portal + Content + Viewport','Presents the bounded option popup.'],['Item + ItemText + Separator','Displays choices and optional divisions.']),
    ['Choose from a list without a search input.','Use keyboard typeahead to move to matching labels.','Show option details, descriptions, and a default marker.'],[
      example('typeahead','Keyboard typeahead','Open the picker and type the beginning of a label to move to a matching choice.',{modelValue:'apple',options:fruits,label:'Fruit'}),
      example('help','Explain and mark a default','The default option receives a marker; focusing each option displays its longer description.',{modelValue:'manual',defaultValue:'manual',options:[choice('manual','Manual',{detail:'Recommended',description:'Save only when you request it.'}),choice('automatic','Automatic',{description:'Save changes as you work.'})],label:'Save mode'}),
      example('separators','Separate option sets','The separator divides the list while remaining outside the selection model.',{modelValue:'apple',options:[choice('apple','Apple'),choice('banana','Banana'),{type:'separator',id:'berries'},choice('blueberry','Blueberry')],label:'Fruit or berry'}),
      example('disabled-choice','Unavailable options','A disabled item stays visible while keyboard and pointer selection remain on enabled choices.',{modelValue:'apple',options:[choice('apple','Apple'),choice('banana','Banana',{disabled:true}),choice('grapes','Grapes')],label:'Available fruit'}),
    ]),
  slider: guide('slider',
    'A single-thumb control for choosing a number within a range. The track shows the selected portion while the thumb supports pointer and keyboard adjustment.',
    anatomy(['SliderRoot','Coordinates the scalar value and limits.'],['Track + Range','Shows the available interval and selected portion.'],['Thumb','The focusable handle that changes the value.']),
    ['Click the track or drag the thumb.','Adjust through keyboard interactions.','Choose custom bounds and discrete increments.','Frame exposes one numeric value and one thumb; upstream multi-thumb ranges are not included.'],[
      example('continuous','Adjust a bounded value','Drag or click within the track to choose a value between zero and one hundred.',{modelValue:35,min:0,max:100}),
      example('steps','Snap to larger steps','A step of 25 restricts selection to coarse levels.',{modelValue:50,min:0,max:100,step:25}),
      example('negative','Use a signed range','Custom bounds allow values below and above zero.',{modelValue:-2,min:-10,max:10,step:1}),
    ]),
  switch: guide('switch',
    'An on/off control for a boolean setting. A moving thumb communicates whether the setting is active; the associated label also toggles it.',
    anatomy(['Label','Wraps the switch and its visible text.'],['SwitchRoot','Coordinates boolean state and interaction.'],['SwitchThumb','Shows whether the setting is on or off.']),
    ['Toggle with pointer or keyboard.','Bind a boolean setting through v-model.','Provide label content through a prop or the default slot.'],[
      example('preference','An immediate preference','Toggle the switch to update the boolean setting.',{modelValue:false,label:'Airplane mode'}),
      example('label-slot','Label a switch with slot content','The slot supplies the visible text while preserving the associated switch interaction.',{modelValue:true},{default:'Enable automatic saving'}),
    ]),
  'tags-input': guide('tags-input',
    'An editable collection of text tags with an input after the existing items. Users add text entries and remove individual tags without leaving the field.',
    anatomy(['TagsInputRoot','Coordinates the string array and keyboard focus.'],['Item + ItemText','Displays each existing tag.'],['ItemDelete','Removes one tag.'],['TagsInputInput','Accepts the next entry.']),
    ['Commit typed text into a collection.','Remove tags with their delete controls.','Navigate existing tags using the keyboard.'],[
      example('add','Add text entries','Type a new value and press Enter to add it to the array.',{modelValue:['Apple','Banana'],label:'Fruit tags',placeholder:'Add a fruit'}),
      example('remove','Edit an existing collection','Use a tag’s remove button, or navigate the existing tags with the keyboard.',{modelValue:['Apple','Banana','Blueberry'],label:'Editable tags',placeholder:'Add another'}),
    ]),
  toggle: guide('toggle',
    'A button with a persistent pressed state. Use it for a mode or formatting action that stays active until the user toggles it again.',
    anatomy(['Toggle','Renders a button and exposes its pressed state.'],['Default slot','Supplies the visible button content.']),
    ['Activate with Enter, Space, or pointer.','Bind the pressed state as a boolean.','Customize the button content through its slot.'],[
      example('pressed','A persistent pressed state','Activate the button to turn the mode on, then activate it again to turn it off.',{modelValue:false,label:'Bold'},{default:'Bold'}),
    ]),
  'toggle-group': guide('toggle-group',
    'A set of pressed-state buttons for related actions. One selected value gives exclusive behavior; an array allows several buttons to remain pressed together.',
    anatomy(['ToggleGroupRoot','Coordinates selected values and focus.'],['ToggleGroupItem','Renders each option as a pressed-state button.']),
    ['Select one or multiple pressed buttons.','Navigate related controls with the keyboard.','Disable individual choices while keeping others available.'],[
      example('single','One pressed choice','Single-selection mode suits mutually exclusive alignment choices.',{modelValue:'left',options:[choice('left','Left'),choice('center','Center'),choice('right','Right')],label:'Alignment'}),
      example('multiple','Combine pressed choices','Multiple mode keeps an array so Bold and Italic can both remain pressed.',{modelValue:['bold'],multiple:true,options:[choice('bold','Bold'),choice('italic','Italic'),choice('underline','Underline')],label:'Formatting'}),
      example('disabled-choice','Restrict one action','The unavailable choice stays in the group without accepting activation.',{modelValue:'left',options:[choice('left','Left'),choice('center','Center'),choice('right','Right',{disabled:true})],label:'Allowed alignment'}),
    ]),
};
