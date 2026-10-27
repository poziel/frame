<script setup lang="ts">
import {computed} from 'vue';
import logo from "../../../../../assets/frame.svg";
import {useFrame} from '../../framework/useFrame';
import FrameButton from '../actions/FrameButton.vue';
defineProps<{ active: boolean }>();
const frame=useFrame();
const actions=computed(()=>(frame.workspace.options.welcome?.commands ?? []).flatMap(id=>{const command=frame.commands.get(id);return command && frame.commands.isVisible(id)?[command]:[];}));
</script>
<template><div class="pane-placeholder" :class="{ 'is-focused': active }"><img :src="logo" alt="Frame" draggable="false" style="user-select:none;-webkit-user-drag:none"/><div v-if="actions.length" class="pane-welcome-actions"><FrameButton v-for="command in actions" :key="command.id" variant="ghost" :disabled="!frame.commands.isEnabled(command.id)" @click="frame.commands.execute(command.id)"><span>{{command.label}}</span><kbd v-if="command.shortcut">{{command.shortcut}}</kbd></FrameButton></div></div></template>
