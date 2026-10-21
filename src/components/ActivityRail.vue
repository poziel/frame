<script setup lang="ts">
import ManageButton from "./ManageButton.vue";
import { useFrame } from "../frame/createFrame";
const frame = useFrame();
import type { SidePanelDefinition } from "../types";
import FrameTooltip from "./FrameTooltip.vue";
defineProps<{ panels: readonly SidePanelDefinition[]; activeId: string; expanded: boolean }>();
defineEmits<{ select: [id: string] }>();
</script>
<template>
  <nav class="activity-rail" aria-label="Activities" data-view-region="primary" data-view-axis="y" @dragover.prevent @drop="frame.dropView($event, 'primary')"><slot />
    <FrameTooltip v-for="action in frame.activityActions" :key="action.id" :text="action.label" v-slot="{ describedby }"><button class="rail-button" :class="{ selected: typeof action.active === 'function' ? action.active() : action.active }" :aria-label="action.label" :aria-describedby="describedby" :aria-pressed="action.active === undefined ? undefined : typeof action.active === 'function' ? action.active() : action.active" :disabled="action.disabled" @click="action.run"><component v-if="action.icon" :is="action.icon"/><span v-else>{{ action.label.slice(0, 1) }}</span></button></FrameTooltip>
    <FrameTooltip v-for="panel in panels.filter(item => item.showInRail !== false)" :key="panel.id" :text="panel.label" v-slot="{ describedby }">
      <button class="rail-button" :draggable="false" :data-view-id="panel.id" @keydown="frame.viewKey($event, panel.id, 'primary')" @pointerdown="frame.beginViewDrag($event, panel.id, 'primary')" @dragover.prevent @drop="frame.dropView($event, 'primary', panel.id)" :class="{ selected: expanded && activeId === panel.id }" :aria-label="panel.label"
        :aria-describedby="describedby" :aria-pressed="expanded && activeId === panel.id" aria-controls="side-panel" @click="$emit('select', panel.id)">
        <component :is="panel.icon" v-if="panel.icon" /><span v-else>{{ panel.label.slice(0, 1) }}</span>
      </button>
    </FrameTooltip>
    <ManageButton/>
  </nav>
</template>

