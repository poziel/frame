<script setup lang="ts">
import { markRaw } from "vue";
import { PanelSections } from "../frame";
import DemoList from "./DemoList.vue";
import { useFrame } from "../frame/createFrame";
const frame = useFrame();
const sections = [{ id: 'collections', title: 'Collections', component: markRaw(DemoList), padded: false, actions: [{ id: 'new', label: '+', run: () => frame.record('New collection requested') }] }, { id: 'people', title: 'People', component: markRaw(DemoList), props: { kind: 'people' } }];
</script><template><PanelSections :sections="sections"/></template>
