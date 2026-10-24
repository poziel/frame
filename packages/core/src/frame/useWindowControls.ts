import { computed, onMounted } from 'vue';
import type { Frame } from './createFrame';
export function useWindowControls(frame: Frame) {
  const controls = frame.host.window;
  onMounted(() => frame.host.attach(document));
  return {
    maximized: computed(() => controls.state.value.maximized),
    fullscreen: computed(() => controls.state.value.fullscreen),
    fullscreenAvailable: computed(() => { void controls.state.value; return controls.supports('fullscreen'); }),
    supports: controls.supports, toggleFullscreen: controls.toggleFullscreen, execute: controls.execute,
  };
}
