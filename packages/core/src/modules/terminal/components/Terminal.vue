<script setup lang="ts">
import '../styles/index.scss';
import {computed, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import {FrameIcon} from '../../../index';
import type {TerminalController} from '../controllers/terminal';
import {
  terminalSurface,
  type TerminalSurface,
} from '../services/xterm/terminalSurface';

const props = defineProps<{
  /** Caller-owned terminal controller; unmount detaches presentation without disposing the controller. */
  terminal: TerminalController;
  /** Existing terminal session to attach; omission creates a session on mount. */
  sessionId?: string;
  /** Profile used when creating a session because sessionId was omitted. */
  profile?: string;
  /** Working directory passed to session creation when sessionId is omitted. */
  cwd?: string;
  /** Accessible name or visible label for the rendered control. */
  label?: string;
  /** External session error displayed alongside local attachment failures. */
  errorMessage?: string;
}>();
const emit = defineEmits<{
  /** Reports successful terminal attachment and its controller/session identity. */
  ready: [controller: TerminalController, sessionId: string];
  /** Reports focus entering this terminal session. */
  focus: [id: string];
  /** Requests the terminal search interface. */
  find: [];
  /** Reports a terminal creation or attachment failure. */
  error: [cause: unknown];
}>();
const controller = props.terminal;
const host = ref<HTMLElement>();
const createdId = ref<string>();
const localError = ref('');
const id = computed(() => props.sessionId ?? createdId.value);
const session = computed(() =>
  controller.sessions.value.find((s) => s.id === id.value)
);
let surface: TerminalSurface | undefined,
  mounted = false;
function attach() {
  if (host.value && id.value && session.value && mounted) {
    surface?.detach(host.value);
    surface = terminalSurface(controller, id.value);
    surface.attach(host.value, () => emit('find'));
  }
}
watch(id, attach);
onMounted(async () => {
  mounted = true;
  try {
    if (!props.sessionId) {
      const session = await controller.create(props.profile, {cwd: props.cwd});
      createdId.value = session.id;
    }
    if (id.value) {
      attach();
      emit('ready', controller, id.value);
    }
  } catch (cause) {
    localError.value = cause instanceof Error ? cause.message : String(cause);
    emit('error', cause);
  }
});
onBeforeUnmount(() => {
  mounted = false;
  if (host.value) surface?.detach(host.value);
});
function focus() {
  surface?.focus();
}
defineExpose({
  /** Caller-owned controller currently attached to this component. */
  controller,

  /** Focuses the active input or terminal surface without creating or disposing its owning controller. */
  focus,

  /** Searches the attached terminal surface and returns whether a match was found. */
  search: (query: string, previous = false) =>
    surface?.search(query, previous) ?? false,

  /** Clears the currently attached terminal session display through its controller. */
  clear: () => controller.clear(id.value),

  /** Closes the attached session through the caller-owned terminal controller. */
  close: () => (id.value ? controller.close(id.value) : Promise.resolve()),
});
</script>
<template>
  <div
    class="frame-terminal"
    :aria-label="label ?? session?.name ?? 'Terminal'"
    @focusin="id && emit('focus', id)"
    @pointerdown="id && emit('focus', id)"
  >
    <div ref="host" class="frame-terminal-host" />
    <div
      v-if="localError || session?.error || errorMessage"
      class="frame-terminal-failure frame-terminal-empty"
      role="alert"
      ><FrameIcon name="terminal" :size="32" /><p>{{
        session?.name ?? 'Terminal unavailable'
      }}</p
      ><p class="frame-terminal-error">{{
        localError || session?.error || errorMessage
      }}</p></div
    >
    <p
      v-else-if="session?.status === 'exited'"
      class="frame-terminal-status"
      role="status"
      >Process exited ({{ session.exitCode }}).</p
    >
  </div>
</template>

<style lang="scss">
.frame-terminal {
  display: flex;
  flex-direction: column;
  /* Width for .frame-terminal; terminal width. @token --frame-terminal-width */
  --_frame-default-terminal-width-1fbbf09da4: 100%;
  width: var(
    --frame-terminal-width,
    var(--_frame-default-terminal-width-1fbbf09da4)
  );
  /* Height for .frame-terminal; terminal height. @token --frame-terminal-height */
  --_frame-default-terminal-height-cc7758d1e6: 100%;
  height: var(
    --frame-terminal-height,
    var(--_frame-default-terminal-height-cc7758d1e6)
  );
  /* Min height for .frame-terminal; terminal min height. @token --frame-terminal-min-height */
  --_frame-default-terminal-min-height-543e0fc2b6: 0;
  min-height: var(
    --frame-terminal-min-height,
    var(--_frame-default-terminal-min-height-543e0fc2b6)
  );
  /* Min width for .frame-terminal; terminal min width. @token --frame-terminal-min-width */
  --_frame-default-terminal-min-width-c7c710a47a: 0;
  min-width: var(
    --frame-terminal-min-width,
    var(--_frame-default-terminal-min-width-c7c710a47a)
  );
  /* Background for .frame-terminal; terminal background. @token --frame-terminal-background */
  --_frame-default-terminal-background-8e0854a5be: #181818;
  background: var(
    --frame-terminal-background,
    var(--_frame-default-terminal-background-8e0854a5be)
  );
}

.frame-terminal-host {
  flex: 1;
  /* Min height for .frame-terminal-host; terminal host min height. @token --frame-terminal-host-min-height */
  --_frame-default-terminal-host-min-height-461cec4b27: 0;
  min-height: var(
    --frame-terminal-host-min-height,
    var(--_frame-default-terminal-host-min-height-461cec4b27)
  );
  /* Min width for .frame-terminal-host; terminal host min width. @token --frame-terminal-host-min-width */
  --_frame-default-terminal-host-min-width-b27e7a5082: 0;
  min-width: var(
    --frame-terminal-host-min-width,
    var(--_frame-default-terminal-host-min-width-b27e7a5082)
  );
  overflow: hidden;
  /* Padding for .frame-terminal-host; terminal host padding. @token --frame-terminal-host-padding */
  --_frame-default-terminal-host-padding-3f56b52bc5: 7px 9px;
  padding: var(
    --frame-terminal-host-padding,
    var(--_frame-default-terminal-host-padding-3f56b52bc5)
  );
}

.frame-terminal-screen {
  /* Height for .frame-terminal-screen; terminal screen height. @token --frame-terminal-screen-height */
  --_frame-default-terminal-screen-height-915a156c3f: 100%;
  height: var(
    --frame-terminal-screen-height,
    var(--_frame-default-terminal-screen-height-915a156c3f)
  );
  /* Width for .frame-terminal-screen; terminal screen width. @token --frame-terminal-screen-width */
  --_frame-default-terminal-screen-width-6d9a1ee661: 100%;
  width: var(
    --frame-terminal-screen-width,
    var(--_frame-default-terminal-screen-width-6d9a1ee661)
  );
}

.frame-terminal-status {
  flex-shrink: 0;
  /* Margin for .frame-terminal-status; terminal status margin. @token --frame-terminal-status-margin */
  --_frame-default-terminal-status-margin-793ef65706: 0;
  margin: var(
    --frame-terminal-status-margin,
    var(--_frame-default-terminal-status-margin-793ef65706)
  );
  /* Padding for .frame-terminal-status; terminal status padding. @token --frame-terminal-status-padding */
  --_frame-default-terminal-status-padding-bdd144a95a: 4px 9px;
  padding: var(
    --frame-terminal-status-padding,
    var(--_frame-default-terminal-status-padding-bdd144a95a)
  );
  /* Color for .frame-terminal-status; muted. @token --frame-muted */
  --_frame-default-muted-74c5fb58d7: #999;
  color: var(--frame-muted, var(--_frame-default-muted-74c5fb58d7));
  /* Font size for .frame-terminal-status; terminal status font size. @token --frame-terminal-status-font-size */
  --_frame-default-terminal-status-font-size-93db312565: 12px;
  font-size: var(
    --frame-terminal-status-font-size,
    var(--_frame-default-terminal-status-font-size-93db312565)
  );
}

.frame-terminal {
  position: relative;
}

.frame-terminal-failure {
  position: absolute;
  inset: 0;
  /* Padding for .frame-terminal-failure; space 4. @token --frame-space-4 */
  --_frame-default-space-4-f8290663f4: 16px;
  padding: var(--frame-space-4, var(--_frame-default-space-4-f8290663f4));
  box-sizing: border-box;
  /*   _frame default terminal background 87ddb0fe58 for .frame-terminal-failure; bg. @token --frame-bg */
  --_frame-default-bg-29eeb8bfdf: #181818;
  /* Background for .frame-terminal-failure; terminal background. @token --frame-terminal-background */
  --_frame-default-terminal-background-87ddb0fe58: var(
    --frame-bg,
    var(--_frame-default-bg-29eeb8bfdf)
  );
  background: var(
    --frame-terminal-background,
    var(--_frame-default-terminal-background-87ddb0fe58)
  );
}
</style>
