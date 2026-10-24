<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import type { AIChatController } from "./aiChat";
import { activityGroupTiming, type ChatActivityGroup } from "./chatParts";
import ChatEvent from "./ChatEvent.vue";
const props = defineProps<{
  group: ChatActivityGroup;
  chat: AIChatController;
  now: number;
}>();
const running = computed(
  () =>
    props.group.activities.filter((activity) => activity.status === "running")
      .length,
);
const failed = computed(
  () =>
    props.group.activities.filter((activity) => activity.status === "failed")
      .length,
);
const cancelled = computed(
  () =>
    props.group.activities.filter((activity) => activity.status === "cancelled")
      .length,
);
const timing = computed(() =>
  activityGroupTiming(props.group.activities, props.now),
);
const label = computed(
  () =>
    props.group.label ??
    (props.group.activities.length === 1
      ? props.group.activities[0]!.label
      : `${props.group.activities.length} activities`),
);
const disclosure = ref<HTMLDetailsElement>();
const summary = ref<HTMLElement>();
watch(running, (count, previous) => {
  if (
    !count &&
    previous &&
    !failed.value &&
    !cancelled.value &&
    props.chat.state.busy &&
    disclosure.value?.contains(document.activeElement)
  )
    void nextTick(() => summary.value?.focus({ preventScroll: true }));
});
</script>
<template>
  <details
    ref="disclosure"
    class="frame-chat-activity-group"
    :open="running > 0 || failed > 0 || cancelled > 0"
  >
    <summary ref="summary" class="frame-chat-activity-group-summary">
      <span>{{ label }}</span>
      <span class="frame-chat-event-detail"
        >{{
          !group.activities.length
            ? "No activities yet"
            : timing?.running
              ? `for ${timing.duration}`
              : `in ${timing?.duration}`
        }}<template v-if="failed"> · {{ failed }} failed</template
        ><template v-if="cancelled">
          · {{ cancelled }} cancelled</template
        ></span
      >
    </summary>
    <div class="frame-chat-activity-list">
      <ChatEvent
        v-for="activity in group.activities"
        :key="activity.id"
        :part="activity"
        :chat="chat"
        :now="now"
      />
    </div>
  </details>
</template>
