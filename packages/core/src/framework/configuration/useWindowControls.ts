import {computed, onMounted, type ComputedRef} from 'vue';
import type {Frame} from '../frame';
import type {HostWindowController} from './hostWindowController';

/** Reactive presentation and bound host operations used by shell controls. */
export interface WindowControls {

  /** Whether the observed native window is maximized. */
  readonly maximized: ComputedRef<boolean>;

  /** Whether native or browser fullscreen is currently active. */
  readonly fullscreen: ComputedRef<boolean>;

  /** Fullscreen capability, reevaluated after document attachment changes state. */
  readonly fullscreenAvailable: ComputedRef<boolean>;

  /** Queries explicit adapter capabilities without native-runtime detection. */
  readonly supports: HostWindowController['supports'];

  /** Bound operation using native fullscreen or the attached document. */
  readonly toggleFullscreen: HostWindowController['toggleFullscreen'];

  /** Bound native minimize, maximize, or close operation. */
  readonly execute: HostWindowController['execute'];
}

/**
 * Connects Vue shell controls to the existing per-Frame host controller.
 *
 * Call during component setup. Browser document observation starts on mount;
 * the Frame owns its cleanup, so unmounting a consumer does not dispose the
 * host or break other consumers. This composable owns only computed projections.
 *
 * @param frame - Frame supplying window state and explicit host capabilities.
 * @returns Reactive presentation values and stable, bound host operations.
 */
export function useWindowControls(frame: Frame): WindowControls {
  const controls = frame.host.window;
  onMounted(() => frame.host.attach(document));
  return {
    maximized: computed(() => controls.state.value.maximized),
    fullscreen: computed(() => controls.state.value.fullscreen),
    fullscreenAvailable: computed(() => {
      // Attachment publishes state, invalidating capability checks for browser shells.
      void controls.state.value;
      return controls.supports('fullscreen');
    }),
    supports: controls.supports,
    toggleFullscreen: controls.toggleFullscreen,
    execute: controls.execute,
  };
}
