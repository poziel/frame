<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { createTerminal, type TerminalController } from './terminal';
import { terminalSurface, type TerminalSurface } from './terminalSurface';

const props = defineProps<{ terminal?: TerminalController; sessionId?: string; profile?: string; cwd?: string; label?: string }>();
const emit = defineEmits<{ ready: [controller: TerminalController, sessionId: string]; focus: [id: string]; find: []; error: [cause: unknown] }>();
const controller = props.terminal ?? createTerminal({ profile: props.profile, cwd: props.cwd });
const host = ref<HTMLElement>(); const createdId = ref<string>(); const localError = ref('');
const id = computed(() => props.sessionId ?? createdId.value);
const session = computed(() => controller.sessions.value.find(s => s.id === id.value));
let surface: TerminalSurface | undefined, mounted = false;
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
    if (!props.sessionId) { const session = await controller.create(props.profile, { cwd: props.cwd }); createdId.value = session.id; }
    if (id.value) { attach(); emit('ready', controller, id.value); }
  } catch (cause) { localError.value = cause instanceof Error ? cause.message : String(cause); emit('error', cause); }
});
onBeforeUnmount(() => { mounted = false; if (host.value) surface?.detach(host.value); });
function focus() { surface?.focus(); }
defineExpose({ controller, focus, search: (query: string, previous = false) => surface?.search(query, previous) ?? false, clear: () => controller.clear(id.value), close: () => id.value ? controller.close(id.value) : Promise.resolve() });
</script>
<template><div class="frame-terminal" :aria-label="label ?? session?.name ?? 'Terminal'" @focusin="id && emit('focus', id)" @pointerdown="id && emit('focus', id)">
  <div ref="host" class="frame-terminal-host" />
  <p v-if="localError || session?.error" class="frame-terminal-status" role="alert">{{ localError || session?.error }}</p>
  <p v-else-if="session?.status === 'exited'" class="frame-terminal-status" role="status">Process exited ({{ session.exitCode }}).</p>
</div></template>
