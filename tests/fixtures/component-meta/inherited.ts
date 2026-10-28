/** Imported consumer contract used to verify compiler resolution. */
export interface InheritedProps {

  /** Stable identifier supplied by the host. */
  id: string;

  /** Optional property deliberately lacking a runtime default. */
  disabled?: boolean;

  /** Host validation callback; the documentation playground supplies a fixture. */
  validate?: ValidateSelection;
}

/** Imported callable alias whose optional use must still resolve as a callback. */
export type ValidateSelection = (value: string) => boolean;
