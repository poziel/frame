<script setup lang="ts">
import '../../styles/index.scss';
import {computed, nextTick, ref, watch} from 'vue';
import type {AIChatController} from '../../controllers/aiChat';
import {
  activityGroupTiming,
  type ChatActivityGroup,
} from '../../services/content/chatParts';
import ChatEvent from './ChatEvent.vue';

const props = defineProps<{
  group: ChatActivityGroup;
  chat: AIChatController;
  now: number;
}>();
const running = computed(
  () =>
    props.group.activities.filter((activity) => activity.status === 'running')
      .length
);
const failed = computed(
  () =>
    props.group.activities.filter((activity) => activity.status === 'failed')
      .length
);
const cancelled = computed(
  () =>
    props.group.activities.filter((activity) => activity.status === 'cancelled')
      .length
);
const timing = computed(() =>
  activityGroupTiming(props.group.activities, props.now)
);
const label = computed(
  () =>
    props.group.label ??
    (props.group.activities.length === 1
      ? props.group.activities[0]!.label
      : `${props.group.activities.length} activities`)
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
    void nextTick(() => summary.value?.focus({preventScroll: true}));
});
</script>
<template>
  <details
    ref="disclosure"
    class="frame-chat-activity-group"
    :open="running > 0 || failed > 0 || cancelled > 0"
  >
    <summary ref="summary" class="frame-chat-activity-group-summary">
      <span
        >{{ label
        }}<span class="frame-chat-event-detail frame-chat-event-meta">
          ({{ !group.activities.length ? 'No activities yet' : timing?.duration
          }}<template v-if="failed">, {{ failed }} failed</template
          ><template v-if="cancelled">, {{ cancelled }} cancelled</template
          >)</span
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

<style lang="scss">
.frame-chat-activity-group {
  min-width: 0;
}

.frame-chat-activity-group-summary {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 4px;
  cursor: pointer;
  /* Color for .frame-chat-activity-group-summary; muted. @token --frame-muted */
  --_frame-default-muted-74c5fb58d7: #999;
  color: var(--frame-muted, var(--_frame-default-muted-74c5fb58d7));
  /* Font size for .frame-chat-activity-group-summary; chat event meta size. @token --frame-chat-event-meta-size */
  --_frame-default-chat-event-meta-size-b2777c8a5f: 11px;
  font-size: var(
    --frame-chat-event-meta-size,
    var(--_frame-default-chat-event-meta-size-b2777c8a5f)
  );
}

.frame-chat-activity-group-summary .frame-chat-event-detail {
  margin: 0;
}

.frame-chat-activity-list {
  padding: 3px 0;
}

.frame-chat-activity-list .frame-chat-activity {
  border: 0;
  background: transparent;
  padding: 3px 0;
  margin: 0;
  /* Color for .frame-chat-activity-list .frame-chat-activity; muted. @token --frame-muted */
  --_frame-default-muted-74c5fb58d7: #999;
  color: var(--frame-muted, var(--_frame-default-muted-74c5fb58d7));
  /* Font size for .frame-chat-activity-list .frame-chat-activity; chat event meta size. @token --frame-chat-event-meta-size */
  --_frame-default-chat-event-meta-size-b2777c8a5f: 11px;
  font-size: var(
    --frame-chat-event-meta-size,
    var(--_frame-default-chat-event-meta-size-b2777c8a5f)
  );
  line-height: 1.5;
}

.frame-chat-activity-group-summary:focus-visible {
  /* Outline for .frame-chat-activity-group-summary:focus-visible; accent. @token --frame-accent */
  --_frame-default-accent-1583861c13: #0078d4;
  outline: 1px solid
    var(--frame-accent, var(--_frame-default-accent-1583861c13));
  outline-offset: 3px;
}
</style>
