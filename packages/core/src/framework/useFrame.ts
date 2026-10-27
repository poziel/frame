import {inject, type InjectionKey} from 'vue';
import type {Frame} from './frame';

/** Injection identity shared by a FrameShell and its descendants. */
export const frameKey: InjectionKey<Frame> = Symbol('Frame');

/**
 * Returns the Frame instance supplied by the nearest FrameShell.
 *
 * @throws If called outside the setup context of a FrameShell descendant.
 */
export function useFrame(): Frame {
  const frame = inject(frameKey);
  if (!frame) throw new Error('useFrame() must be called inside FrameShell');
  return frame;
}
