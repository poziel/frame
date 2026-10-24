<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import {
  FrameButton,
  FrameSelect,
  FrameTextArea,
  FrameTextInput,
} from "@frame/core";
import type {
  ChatQuestion,
  ChatThinkingPart,
  ChatActivityPart,
  ChatActivityGroupPart,
} from "@frame/features";
import type { ChatPlayground } from "./chatPlayground";
import ChatQuestionEditor from "./ChatQuestionEditor.vue";
import { chatDemoScenarios } from "./chatDemoScenarios";
const props = defineProps<{ session: ChatPlayground }>();
const text = ref("Here is the result."),
  kind = ref("commentary"),
  activeText = ref("");
const thought = ref(
  "Considering the request and comparing possible approaches.",
);
const activityLabel = ref("Inspect project files"),
  activityDetail = ref("Looking for relevant components."),
  output = ref(""),
  activityId = ref("");
const outputLanguage = ref("text");
const groupName = ref("Project inspection"),
  groupId = ref("");
const artifactFiles = ref<HTMLInputElement>();
const textTypes = [
  { value: "commentary", label: "Progress commentary" },
  { value: "intermediate", label: "Intermediate message" },
  { value: "message", label: "Final answer" },
];
const approvalText = ref("Save changes to the project?"),
  approvalDetail = ref("This will update the local project files.");
const questionTitle = ref("Before I continue");
const questions = ref<ChatQuestion[]>([
  {
    id: crypto.randomUUID(),
    text: "Which direction should I take?",
    choices: [
      { id: crypto.randomUUID(), label: "Option A" },
      { id: crypto.randomUUID(), label: "Option B" },
    ],
    allowCustom: true,
  },
]);
const failure = ref("The simulated agent lost its connection.");
const active = computed(() => props.session.chat.state.busy);
const manual = computed(
  () => active.value && props.session.state.mode === "manual",
);
const mode = computed({
  get: () => props.session.state.mode,
  set: (value: string) => {
    props.session.setMode(value);
  },
});
const demoScenario = computed({
  get: () => props.session.state.demoScenario,
  set: (value: string) => {
    props.session.setScenario(value);
  },
});
const demoPace = computed({
  get: () => String(props.session.state.demoDelayMs),
  set: (value: string) => {
    if (!active.value && ["0", "150", "600"].includes(value))
      props.session.state.demoDelayMs = Number(value);
  },
});
const demoOptions = [
  { value: "cycle", label: "Cycle through all 7 examples" },
  ...chatDemoScenarios.map((scenario) => ({
    value: scenario.id,
    label: scenario.label,
  })),
];
const modeOptions = [
  { value: "manual", label: "Manual controls" },
  { value: "demo", label: "Interactive demo" },
];
const paceOptions = [
  { value: "600", label: "Normal" },
  { value: "150", label: "Fast" },
  { value: "0", label: "Instant" },
];
const lastMessage = computed(
  () =>
    props.session.chat.state.messages[
      props.session.chat.state.messages.length - 1
    ],
);
const parts = computed(() => lastMessage.value?.parts ?? []);
const currentThought = computed(
  () =>
    parts.value
      .filter(
        (part): part is ChatThinkingPart =>
          part.type === "thinking" && part.finishedAt === undefined,
      )
      .slice(-1)[0],
);
const activities = computed(() =>
  parts.value.filter(
    (part): part is ChatActivityPart =>
      part.type === "activity" && part.status === "running",
  ),
);
const messages = computed(() =>
  parts.value.filter((part) => part.type === "message"),
);
const groups = computed(() =>
  parts.value.filter(
    (part): part is ChatActivityGroupPart => part.type === "activityGroup",
  ),
);
const groupOptions = computed(() => [
  { value: "", label: "Automatic grouping" },
  ...groups.value.map((group) => ({ value: group.id, label: group.label })),
]);
const selectedGroup = computed({
  get: () =>
    groups.value.some((group) => group.id === groupId.value)
      ? groupId.value
      : "",
  set: (value: string) => {
    groupId.value = value;
  },
});
const messageOptions = computed(() => [
  { value: "", label: "Select an answer" },
  ...messages.value.map((part) => ({
    value: part.id,
    label: part.text.slice(0, 60) || part.id,
  })),
]);
const selectedMessage = computed({
  get: () =>
    messages.value.some((part) => part.id === activeText.value)
      ? activeText.value
      : "",
  set: (value: string) => {
    activeText.value = value;
  },
});
const activityOptions = computed(() => [
  { value: "", label: "Select an activity" },
  ...activities.value.map((part) => ({
    value: part.id,
    label: part.label,
    detail: groups.value.find((group) => group.id === part.groupId)?.label,
  })),
]);
const selectedActivity = computed({
  get: () =>
    activities.value.some((part) => part.id === activityId.value)
      ? activityId.value
      : "",
  set: (value: string) => {
    activityId.value = value;
  },
});
const now = ref(Date.now());
const timer = setInterval(() => {
  if (active.value) now.value = Date.now();
}, 1000);
onBeforeUnmount(() => clearInterval(timer));
const elapsed = computed(() =>
  Math.max(
    0,
    Math.floor(
      (now.value - (lastMessage.value?.createdAt ?? now.value)) / 1000,
    ),
  ),
);
function sendText() {
  props.session.perform(
    kind.value === "commentary"
      ? "Commentary"
      : kind.value === "intermediate"
        ? "Intermediate message"
        : "Final answer",
    (writer) => {
      const id =
        kind.value === "commentary"
          ? writer.commentary(text.value)
          : writer.message(text.value, {
              phase: kind.value === "intermediate" ? "intermediate" : "final",
            });
      if (kind.value !== "commentary") activeText.value = id;
      return id;
    },
  );
}
function setThought() {
  props.session.perform("Current thought", (writer) => {
    const current = currentThought.value;
    if (current) {
      writer.updateThinking(current.id, thought.value);
      return current.id;
    }
    return writer.thinking(thought.value);
  });
}
function clearThought() {
  const current = currentThought.value;
  if (current)
    props.session.perform("Thought cleared", (writer) =>
      writer.finishThinking(current.id),
    );
}
function startActivity() {
  props.session.perform(
    "Activity started",
    (writer) =>
      (activityId.value = writer.activity({
        label: activityLabel.value,
        text: activityDetail.value,
        output: output.value,
        outputLanguage: outputLanguage.value,
        groupId: selectedGroup.value || undefined,
      })),
  );
}
function createGroup() {
  props.session.perform(
    "Activity group created",
    (writer) =>
      (groupId.value = writer.activityGroup({ label: groupName.value })),
  );
}
function approval() {
  props.session.perform("Approval", (writer) =>
    props.session.track(
      "Approval result",
      writer.requestApproval({
        text: approvalText.value,
        detail: approvalDetail.value,
      }),
    ),
  );
}
function ask() {
  props.session.perform("Questions", (writer) =>
    props.session.track(
      "Question result",
      writer.askQuestions({
        text: questionTitle.value,
        questions: questions.value,
      }),
    ),
  );
}
function attach(event: Event) {
  const input = event.target as HTMLInputElement;
  for (const file of Array.from(input.files ?? [])) props.session.addFile(file);
  input.value = "";
}
</script>

<template>
  <main class="chat-playground" aria-label="AI chat playground">
    <header class="playground-header">
      <div>
        <p class="playground-eyebrow">Features / AI chat</p>
        <h1>AI chat playground</h1>
        <p>
          Send a prompt in the sidebar, then act as the agent here. Every
          control uses the public chat response API.
        </p>
      </div>
      <FrameButton variant="secondary" @click="session.reset()"
        >Reset session</FrameButton
      >
    </header>
    <section
      class="playground-card playground-demo"
      aria-label="Interactive demo"
    >
      <h2>Try an interactive demo</h2>
      <p class="playground-help">
        Run an example with one click, or select Interactive demo and send your
        own prompt in the chat. The seven scripted examples show different
        responses and pause for approvals or answers. Everything runs locally.
      </p>
      <div class="playground-demo-options">
        <label
          ><span>Responder mode</span
          ><FrameSelect
            v-model="mode"
            :options="modeOptions"
            label="Responder mode"
            :disabled="active"
        /></label>
        <label
          ><span>Demo example</span
          ><FrameSelect
            v-model="demoScenario"
            :options="demoOptions"
            label="Demo example"
            :disabled="active"
        /></label>
        <label
          ><span>Demo pace</span
          ><FrameSelect
            v-model="demoPace"
            :options="paceOptions"
            label="Demo pace"
            :disabled="active"
        /></label>
      </div>
      <div class="playground-actions">
        <FrameButton
          variant="primary"
          icon="play"
          :disabled="active"
          @click="session.runExample()"
          >Run demo example</FrameButton
        ><FrameButton
          v-if="session.state.activeDemo"
          variant="secondary"
          @click="session.stop()"
          >Stop demo</FrameButton
        >
      </div>
      <p v-if="session.state.mode === 'demo'" class="playground-help">
        Manual event controls are paused in demo mode. Switch to Manual controls
        between turns to take over.
      </p>
    </section>
    <section class="playground-request" aria-label="Current request">
      <div class="playground-request-heading">
        <strong>{{ active ? "Turn active" : "Ready for a prompt" }}</strong
        ><span v-if="active">Working for {{ elapsed }}s</span>
      </div>
      <p v-if="session.state.request">{{ session.state.request.prompt }}</p>
      <p v-else>
        Open AI chat and send a message to begin. Answers stay in this browser
        session.
      </p>
      <ul v-if="session.state.request?.attachments.length">
        <li
          v-for="attachment in session.state.request.attachments"
          :key="attachment.id"
        >
          {{ attachment.name }}
        </li>
      </ul>
    </section>
    <p class="playground-feedback" role="status">
      {{ session.state.feedback }}
    </p>
    <div class="playground-grid">
      <section class="playground-card">
        <h2>Messages &amp; commentary</h2>
        <fieldset :disabled="!manual">
          <label
            ><span>Text type</span
            ><FrameSelect
              v-model="kind"
              :options="textTypes"
              label="Text type"
              :disabled="!manual" /></label
          ><label
            ><span>Response text</span
            ><FrameTextArea
              v-model="text"
              :rows="4"
              aria-label="Response text"
              :maxlength="32000"
          /></label>
          <div class="playground-actions">
            <FrameButton
              variant="primary"
              :disabled="!text.trim()"
              @click="sendText"
              >Send text</FrameButton
            >
          </div>
          <label
            ><span>Answer to append to</span
            ><FrameSelect
              v-model="selectedMessage"
              :options="messageOptions"
              label="Answer to append to"
              :disabled="!manual || !messages.length" /></label
          ><FrameButton
            :disabled="
              !messages.some((part) => part.id === activeText) || !text
            "
            @click="
              session.perform('Answer appended', (writer) =>
                writer.append(activeText, text),
              )
            "
            >Append text</FrameButton
          >
        </fieldset>
      </section>
      <section class="playground-card">
        <h2>Current thought</h2>
        <fieldset :disabled="!manual">
          <p class="playground-help">
            One changing line at the bottom of the work flow. Set it again to
            replace the text. Sending commentary or another event clears it.
          </p>
          <label
            ><span>Thought text</span
            ><FrameTextArea
              v-model="thought"
              :rows="4"
              aria-label="Thought text"
              :maxlength="32000"
          /></label>
          <div class="playground-actions">
            <FrameButton variant="primary" @click="setThought"
              >Set thought</FrameButton
            >
            <FrameButton :disabled="!currentThought" @click="clearThought"
              >Clear thought</FrameButton
            >
          </div>
        </fieldset>
      </section>
      <section class="playground-card">
        <h2>Activities</h2>
        <fieldset :disabled="!manual">
          <p class="playground-help">
            Create a named group and select it for new activities, or use
            automatic grouping between commentary messages. Earlier groups keep
            receiving output.
          </p>
          <label
            ><span>New group name</span
            ><FrameTextInput
              v-model="groupName"
              aria-label="New group name"
              :maxlength="500"
          /></label>
          <FrameButton :disabled="!groupName.trim()" @click="createGroup"
            >Create activity group</FrameButton
          >
          <label
            ><span>Group for new activities</span
            ><FrameSelect
              v-model="selectedGroup"
              :options="groupOptions"
              label="Group for new activities"
              :disabled="!manual"
          /></label>
          <label
            ><span>Activity label</span
            ><FrameTextInput
              v-model="activityLabel"
              aria-label="Activity label"
              :maxlength="500" /></label
          ><label
            ><span>Activity details</span
            ><FrameTextArea
              v-model="activityDetail"
              :rows="2"
              aria-label="Activity details"
              :maxlength="16000" /></label
          ><label
            ><span>Activity output</span
            ><FrameTextArea
              v-model="output"
              :rows="3"
              aria-label="Activity output"
              :maxlength="64000" /></label
          ><label
            ><span>Output language</span
            ><FrameTextInput
              v-model="outputLanguage"
              aria-label="Output language"
              placeholder="text, html, json, bash…" /></label
          ><FrameButton
            variant="primary"
            :disabled="!activityLabel.trim()"
            @click="startActivity"
            >Start activity</FrameButton
          ><label
            ><span>Active activity</span
            ><FrameSelect
              v-model="selectedActivity"
              :options="activityOptions"
              label="Active activity"
              :disabled="!manual || !activities.length"
          /></label>
          <div class="playground-actions">
            <FrameButton
              :disabled="!activities.some((part) => part.id === activityId)"
              @click="
                session.perform('Activity updated', (writer) =>
                  writer.updateActivity(activityId, {
                    label: activityLabel,
                    text: activityDetail,
                    output,
                    outputLanguage,
                  }),
                )
              "
              >Update activity</FrameButton
            ><FrameButton
              :disabled="!activities.some((part) => part.id === activityId)"
              @click="
                session.perform('Activity completed', (writer) =>
                  writer.finishActivity(activityId),
                )
              "
              >Complete activity</FrameButton
            ><FrameButton
              :disabled="!activities.some((part) => part.id === activityId)"
              @click="
                session.perform('Activity failed', (writer) =>
                  writer.finishActivity(activityId, 'failed'),
                )
              "
              >Fail activity</FrameButton
            >
          </div>
        </fieldset>
      </section>
      <section class="playground-card">
        <h2>Approvals</h2>
        <fieldset :disabled="!manual">
          <p class="playground-help">
            Request permission here; allow, deny or cancel it in the chat.
          </p>
          <label
            ><span>Proposed action</span
            ><FrameTextInput
              v-model="approvalText"
              aria-label="Proposed action"
              :maxlength="4000" /></label
          ><label
            ><span>Approval explanation</span
            ><FrameTextArea
              v-model="approvalDetail"
              :rows="3"
              aria-label="Approval explanation"
              :maxlength="16000" /></label
          ><FrameButton
            variant="primary"
            :disabled="!approvalText.trim()"
            @click="approval"
            >Request approval</FrameButton
          >
        </fieldset>
      </section>
      <section class="playground-card playground-wide">
        <h2>Questions &amp; choices</h2>
        <fieldset :disabled="!manual">
          <label
            ><span>Request title</span
            ><FrameTextInput
              v-model="questionTitle"
              aria-label="Request title"
              :maxlength="500" /></label
          ><ChatQuestionEditor v-model="questions" /><FrameButton
            variant="primary"
            :disabled="!questions.length"
            @click="ask"
            >Ask questions</FrameButton
          >
        </fieldset>
      </section>
      <section class="playground-card">
        <h2>Images &amp; files</h2>
        <fieldset :disabled="!manual">
          <p class="playground-help">
            Raster images preview in the chat. Other files appear as downloads.
            Up to 20 files, 20 MB each; reset releases them.
          </p>
          <label
            ><span>Add an artifact</span
            ><FrameButton
              icon="folder-opened"
              :disabled="!manual"
              @click="artifactFiles?.click()"
              >Choose files</FrameButton
            ><input
              ref="artifactFiles"
              class="frame-chat-file-input"
              type="file"
              multiple
              aria-label="Add an artifact"
              @change="attach"
          /></label>
        </fieldset>
      </section>
      <section class="playground-card">
        <h2>Turn lifecycle</h2>
        <fieldset :disabled="!manual">
          <p class="playground-help">
            Sending text keeps the turn open. Resolve pending requests before
            ending it.
          </p>
          <div class="playground-actions">
            <FrameButton variant="primary" @click="session.end()"
              >End turn</FrameButton
            ><FrameButton variant="secondary" @click="session.stop()"
              >Stop turn</FrameButton
            >
          </div>
          <label
            ><span>Failure message</span
            ><FrameTextInput
              v-model="failure"
              aria-label="Failure message"
              :maxlength="4000" /></label
          ><FrameButton @click="session.fail(failure)"
            >Simulate failure</FrameButton
          >
        </fieldset>
      </section>
    </div>
    <details class="playground-log">
      <summary>Event log ({{ session.state.log.length }})</summary>
      <ol>
        <li v-for="entry in session.state.log" :key="entry.id">
          <time>{{ new Date(entry.time).toLocaleTimeString() }}</time>
          <strong>{{ entry.label }}</strong>
          <pre v-if="entry.detail">{{ entry.detail }}</pre>
        </li>
      </ol>
    </details>
  </main>
</template>

<style scoped>
.chat-playground {
  max-width: 1100px;
  margin: 0 auto;
  padding: clamp(16px, 3vw, 36px);
  color: var(--frame-text);
}
.playground-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}
.playground-header h1 {
  margin: 4px 0 10px;
  font-size: 26px;
  font-weight: 500;
}
.playground-header p {
  max-width: 650px;
  line-height: 1.6;
  color: var(--frame-muted);
}
.playground-eyebrow {
  font-size: 11px;
}
.playground-request,
.playground-card,
.playground-log {
  border: 1px solid var(--frame-border);
  border-radius: 6px;
  background: var(--frame-surface);
  padding: 18px;
  min-width: 0;
}
.playground-request-heading {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}
.playground-request p {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  line-height: 1.6;
}
.playground-request span,
.playground-help,
.playground-feedback {
  color: var(--frame-muted);
  font-size: 12px;
  line-height: 1.6;
}
.playground-feedback {
  min-height: 20px;
  margin: 12px 0 20px;
}
.playground-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
  gap: 16px;
}
.playground-wide {
  grid-column: 1 / -1;
}
.playground-demo {
  margin-bottom: 20px;
}
.playground-demo-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
  gap: 0 16px;
}
.playground-card h2 {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 500;
}
.playground-card :deep(fieldset) {
  border: 0;
  padding: 0;
  margin: 0;
  min-width: 0;
}
.playground-card :deep(fieldset:disabled) {
  opacity: 0.55;
}
.playground-card :deep(label:not(.frame-checkbox)),
.playground-card :deep(.playground-checks) {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin: 12px 0;
}
.playground-card :deep(input:not([type="checkbox"])),
.playground-card :deep(textarea),
.playground-card :deep(.frame-select) {
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
}
.playground-card :deep(textarea) {
  resize: vertical;
}
.playground-card :deep(.playground-actions) {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 12px 0;
}
.playground-card :deep(.playground-question-editor) {
  padding: 16px;
  margin: 16px 0;
  border: 1px solid var(--frame-border);
  border-radius: 4px;
}
.playground-card :deep(.playground-choice-editor) {
  display: flex;
  gap: 6px;
  margin: 8px 0;
}
.playground-card :deep(.playground-choice-editor input) {
  flex: 1;
}
.playground-log {
  margin-top: 20px;
}
.playground-log summary {
  cursor: pointer;
}
.playground-log ol {
  padding-left: 22px;
}
.playground-log li {
  margin: 14px 0;
}
.playground-log time {
  color: var(--frame-muted);
}
.playground-log pre {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  max-height: 160px;
  overflow: auto;
  font-family: var(--frame-font-mono);
  font-size: 11px;
}
</style>
