/** Selects automatic evaluation, forced approval, or forced denial. */
export type PermissionMode = 'automatic' | 'enabled' | 'disabled';

/**
 * Explicit mutable state owned by a permission registration.
 *
 * @remarks
 * Automatic sources are stored separately in PermissionOptions. A manual
 * override changes this state without replacing those sources. The active
 * flag becomes false permanently when this exact registration is removed.
 */
export interface PermissionState {

  /** Determines whether checks evaluate sources or use a manual override. */
  mode: PermissionMode;

  /** Explanation attached to a manual denial, or undefined otherwise. */
  reason: string | undefined;

  /** Whether this exact permission registration remains usable. */
  active: boolean;
}

/**
 * Evaluated permission state delivered to state subscribers for one explicit target.
 * The reason includes automatic denial explanations as well as manual ones.
 */
export interface PermissionSnapshot extends PermissionState {

  /** Effective denial explanation, including automatic source evaluation. */
  reason: string | undefined;

  /** Effective approval after applying the mode and target condition. */
  allowed: boolean;
}
