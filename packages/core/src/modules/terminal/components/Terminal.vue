<script setup lang="ts">
import '../styles/index.css';
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
