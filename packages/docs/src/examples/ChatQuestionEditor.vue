<script setup lang="ts">
import {
  FrameButton,
  FrameCheckbox,
  FrameTextInput,
  FrameTextArea,
} from "@frame/core";
import type { ChatQuestion } from "@frame/features";
defineProps<{ modelValue: ChatQuestion[] }>();
const emit = defineEmits<{
  "update:modelValue": [questions: ChatQuestion[]];
}>();
function newQuestion(): ChatQuestion {
  return {
    id: crypto.randomUUID(),
    text: "Which direction should I take?",
    choices: [
      { id: crypto.randomUUID(), label: "Option A" },
      { id: crypto.randomUUID(), label: "Option B" },
    ],
    allowCustom: true,
  };
}
function addChoice(question: ChatQuestion) {
  question.choices.push({
    id: crypto.randomUUID(),
    label: `Option ${question.choices.length + 1}`,
  });
}
</script>
<template>
  <div class="chat-question-editor">
    <fieldset
      v-for="(question, index) in modelValue"
      :key="question.id"
      class="playground-question-editor"
    >
      <legend>Question {{ index + 1 }}</legend>
      <label
        ><span>Question prompt</span
        ><FrameTextArea
          v-model="question.text"
          :rows="2"
          :aria-label="`Question ${index + 1} prompt`"
          :maxlength="4000"
      /></label>
      <div class="playground-checks">
        <FrameCheckbox
          v-model="question.multiple"
          label="Allow multiple selections"
        /><FrameCheckbox
          v-model="question.allowCustom"
          label="Allow a custom answer"
        /><FrameCheckbox
          :model-value="question.required !== false"
          label="Answer required"
          @update:model-value="question.required = $event"
        />
      </div>
      <div
        v-for="(choice, choiceIndex) in question.choices"
        :key="choice.id"
        class="playground-choice-editor"
      >
        <FrameTextInput
          v-model="choice.label"
          :aria-label="`Question ${index + 1} option ${choiceIndex + 1}`"
          :maxlength="500"
        />
        <FrameButton
          :aria-label="`Remove question ${index + 1} option ${choiceIndex + 1}`"
          @click="question.choices.splice(choiceIndex, 1)"
          >Remove</FrameButton
        >
      </div>
      <div class="playground-actions">
        <FrameButton
          :disabled="question.choices.length >= 10"
          @click="addChoice(question)"
          >Add option</FrameButton
        ><FrameButton
          @click="
            emit(
              'update:modelValue',
              modelValue.filter((item) => item.id !== question.id),
            )
          "
          >Remove question</FrameButton
        >
      </div>
    </fieldset>
    <FrameButton
      :disabled="modelValue.length >= 5"
      @click="emit('update:modelValue', [...modelValue, newQuestion()])"
      >Add question</FrameButton
    >
  </div>
</template>
