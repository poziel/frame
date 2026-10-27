<script setup lang="ts">
import '../../styles/index.css';
import {computed, reactive, ref, useId} from 'vue';
import {
  FrameButton,
  FrameCheckbox,
  FrameRadioGroup,
  FrameTextArea,
} from '../../../../index';
import type {AIChatController} from '../../controllers/aiChat';
import type {
  ChatApprovalPart,
  ChatQuestionPart,
  ChatQuestion,
} from '../../types/chatTypes';

const props = defineProps<{
  part: ChatApprovalPart | ChatQuestionPart;
  chat: AIChatController;
}>();
const customId = `custom-${useId()}`;
const selected = reactive(new Map<string, string[]>());
const custom = reactive(new Map<string, string>());
const error = ref('');
const pending = computed(() => props.part.status === 'pending');
function customChoiceId(question: ChatQuestion) {
  let value = customId;
  while (question.choices.some((choice) => choice.id === value)) value += '_';
  return value;
}
function options(question: ChatQuestion) {
  return [
    ...question.choices.map((choice) => ({
      value: choice.id,
      label: choice.label,
      detail: choice.description,
    })),
    ...(question.allowCustom
      ? [{value: customChoiceId(question), label: 'Write my own answer'}]
      : []),
  ];
}
function choose(questionId: string, choiceId: string, checked: boolean) {
  const choices = selected.get(questionId) ?? [];
  selected.set(
    questionId,
    checked ? [...choices, choiceId] : choices.filter((id) => id !== choiceId)
  );
}
function customVisible(question: ChatQuestion) {
  return (
    question.allowCustom &&
    (question.multiple ||
      selected.get(question.id)?.[0] === customChoiceId(question))
  );
}
function answers() {
  if (props.part.type !== 'question') return [];
  return props.part.questions.map((question) => ({
    questionId: question.id,
    choiceIds: (selected.get(question.id) ?? []).filter(
      (id) => id !== customChoiceId(question)
    ),
    ...(customVisible(question)
      ? {customText: custom.get(question.id) ?? ''}
      : {}),
  }));
}
const ready = computed(
  () =>
    props.part.type === 'question' &&
    props.part.questions.every(
      (question) =>
        question.required === false ||
        !!selected
          .get(question.id)
          ?.some((id) => id !== customChoiceId(question)) ||
        (customVisible(question) && !!custom.get(question.id)?.trim())
    )
);
function submit() {
  if (!ready.value) return;
  error.value = props.chat.answerQuestions(props.part.id, answers())
    ? ''
    : 'This request is no longer available. Check your answers and try again.';
}
function summary(question: ChatQuestion) {
  if (props.part.type !== 'question') return '';
  const answer = props.part.answers?.find(
    (answer) => answer.questionId === question.id
  );
  return answer
    ? [
        ...answer.choiceIds.map(
          (id) =>
            question.choices.find((choice) => choice.id === id)?.label ?? id
        ),
        answer.customText,
      ]
        .filter(Boolean)
        .join(', ') || 'Skipped'
    : 'Cancelled';
}
</script>

<template>
  <div
    class="frame-chat-interaction"
    :class="{pending}"
    :aria-label="
      part.type === 'approval' ? 'Approval request' : 'Question request'
    "
  >
    <div class="frame-chat-event-heading">
      <strong>{{
        part.type === 'approval' ? 'Approval requested' : 'Your input'
      }}</strong
      ><span>{{
        pending
          ? 'Waiting for you'
          : part.status === 'cancelled'
            ? 'Cancelled'
            : 'Answered'
      }}</span>
    </div>
    <p class="frame-chat-event-text">{{ part.text }}</p>
    <template v-if="part.type === 'approval'">
      <p v-if="part.detail" class="frame-chat-event-detail">
        {{ part.detail }}
      </p>
      <div v-if="pending" class="frame-chat-event-actions">
        <FrameButton
          variant="primary"
          @click="chat.resolveApproval(part.id, 'allow')"
          >Allow</FrameButton
        >
        <FrameButton
          variant="secondary"
          @click="chat.resolveApproval(part.id, 'deny')"
          >Deny</FrameButton
        >
        <FrameButton @click="chat.cancelInteraction(part.id)"
          >Cancel request</FrameButton
        >
      </div>
      <p v-else class="frame-chat-event-result">
        {{
          part.status === 'cancelled'
            ? 'Request cancelled.'
            : part.decision === 'allow'
              ? 'Allowed'
              : 'Denied'
        }}
      </p>
    </template>
    <form v-else-if="pending" @submit.prevent="submit">
      <fieldset
        v-for="question in part.questions"
        :key="question.id"
        class="frame-chat-question"
      >
        <legend>
          {{ question.text
          }}<span v-if="question.required === false"> (optional)</span>
        </legend>
        <p v-if="question.multiple" class="frame-chat-event-detail">
          Select all that apply.
        </p>
        <div v-if="question.multiple" class="frame-chat-question-choices">
          <FrameCheckbox
            v-for="choice in question.choices"
            :key="choice.id"
            :model-value="!!selected.get(question.id)?.includes(choice.id)"
            @update:model-value="choose(question.id, choice.id, $event)"
          >
            <span
              >{{ choice.label
              }}<small v-if="choice.description">{{
                choice.description
              }}</small></span
            >
          </FrameCheckbox>
        </div>
        <FrameRadioGroup
          v-else
          :model-value="selected.get(question.id)?.[0] ?? ''"
          :options="options(question)"
          :label="question.text"
          @update:model-value="selected.set(question.id, [$event])"
        />
        <label v-if="customVisible(question)" class="frame-chat-custom-answer"
          ><span>{{
            question.multiple ? 'Additional answer' : 'Your answer'
          }}</span
          ><FrameTextArea
            :model-value="custom.get(question.id) ?? ''"
            @update:model-value="custom.set(question.id, $event)"
            :rows="2"
            :aria-label="`Your answer: ${question.text}`"
            :maxlength="16000"
        /></label>
      </fieldset>
      <p v-if="error" role="alert" class="frame-chat-error">{{ error }}</p>
      <div class="frame-chat-event-actions">
        <FrameButton type="submit" variant="primary" :disabled="!ready"
          >Submit answers</FrameButton
        ><FrameButton @click="chat.cancelInteraction(part.id)"
          >Cancel request</FrameButton
        >
      </div>
    </form>
    <dl v-else class="frame-chat-answers">
      <template v-for="question in part.questions" :key="question.id"
        ><dt>{{ question.text }}</dt> <dd>{{ summary(question) }}</dd></template
      >
    </dl>
  </div>
</template>
