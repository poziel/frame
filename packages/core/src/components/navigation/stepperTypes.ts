/** One step presented by FrameStepper's default item rendering. */
export interface FrameStepItem {

  /** Step value forwarded to Reka and displayed in the default indicator. */
  step: number;

  /** Visible step title. */
  label: string;

  /** Optional supporting text displayed below the title. */
  description?: string;

  /** Prevents user activation of this step. */
  disabled?: boolean;

  /** Explicit completion state forwarded to the underlying step item. */
  completed?: boolean;
}
