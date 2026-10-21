import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import type { UnlistenFn } from "@tauri-apps/api/event";
import { onBeforeUnmount, onMounted, ref } from "vue";

export function useWindowControls() {
  const nativeWindow = isTauri() ? getCurrentWindow() : null;
  const maximized = ref(false);
  const fullscreen = ref(false);
  const fullscreenAvailable = !!nativeWindow || (typeof document !== "undefined" && document.fullscreenEnabled);
  const browserChanged = () => { fullscreen.value = !!document.fullscreenElement; };
  async function toggleFullscreen(element?: HTMLElement) {
    if (nativeWindow) { await nativeWindow.setFullscreen(!(await nativeWindow.isFullscreen())); fullscreen.value = await nativeWindow.isFullscreen(); }
    else if (document.fullscreenElement) await document.exitFullscreen();
    else await (element?.ownerDocument.documentElement ?? document.documentElement).requestFullscreen();
  }
  let stopResize: UnlistenFn | undefined;
  let disposed = false;
  async function execute(action: "minimize" | "maximize" | "close") {
    if (!nativeWindow) return;
    if (action === "minimize") await nativeWindow.minimize();
    if (action === "close") await nativeWindow.close();
    if (action === "maximize") {
      await nativeWindow.toggleMaximize();
      maximized.value = await nativeWindow.isMaximized(); fullscreen.value = await nativeWindow.isFullscreen();
    }
  }
  onMounted(async () => {
    document.addEventListener("fullscreenchange", browserChanged);
    if (!nativeWindow) return;
    try {
      maximized.value = await nativeWindow.isMaximized(); fullscreen.value = await nativeWindow.isFullscreen();
      const stop = await nativeWindow.onResized(async () => {
        try { maximized.value = await nativeWindow.isMaximized(); fullscreen.value = await nativeWindow.isFullscreen(); } catch { /* Window is closing. */ }
      });
      if (disposed) stop(); else stopResize = stop;
    } catch { /* Controls still work if observing window state fails. */ }
  });
  onBeforeUnmount(() => { disposed = true; stopResize?.(); document.removeEventListener("fullscreenchange", browserChanged); });
  return { native: !!nativeWindow, maximized, fullscreen, fullscreenAvailable, toggleFullscreen, execute };
}


