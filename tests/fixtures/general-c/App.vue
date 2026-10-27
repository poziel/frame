<script setup lang="ts">
import {ref} from 'vue';
import FrameDialog from '../../../packages/core/src/components/overlays/FrameDialog.vue';
import FrameAlertDialog from '../../../packages/core/src/components/overlays/FrameAlertDialog.vue';
import FrameDrawer from '../../../packages/core/src/components/overlays/FrameDrawer.vue';
import FramePopover from '../../../packages/core/src/components/overlays/FramePopover.vue';
import FrameHoverCard from '../../../packages/core/src/components/overlays/FrameHoverCard.vue';
import FrameDropdownMenu from '../../../packages/core/src/components/navigation/FrameDropdownMenu.vue';
import FrameContextMenu from '../../../packages/core/src/components/navigation/FrameContextMenu.vue';
import FrameToast from '../../../packages/core/src/components/feedback/FrameToast.vue';
const selected=ref(''),confirmed=ref(false),toast=ref(false);
const items=[{id:'edit',label:'Edit'},{id:'disabled',label:'Unavailable',disabled:true},{id:'delete',label:'Delete',separator:true}];
</script><template><main style="padding:30px;display:flex;gap:12px;flex-wrap:wrap">
<FrameDialog title="Edit profile" description="Update your name."><input aria-label="Name"/><FrameDropdownMenu :items="items" trigger-label="Nested actions" @select="selected=$event.id"/></FrameDialog>
<FrameAlertDialog title="Delete profile?" description="Confirm this action." confirm-label="Delete" @confirm="confirmed=true"/>
<FrameDrawer title="Drawer settings" description="Adjust settings."><input aria-label="Drawer value"/></FrameDrawer>
<FramePopover trigger-label="Open details"><input aria-label="Details value"/></FramePopover>
<FrameHoverCard trigger-label="Hover details" :open-delay="0"><p>Profile information</p></FrameHoverCard>
<FrameDropdownMenu :items="items" trigger-label="File actions" @select="selected=$event.id"/>
<FrameContextMenu :items="items" trigger-label="Context actions" @select="selected=$event.id"/>
<button @click="toast=true">Notify</button><FrameToast v-model:open="toast" title="Saved" description="Your changes were saved." :duration="5000"/>
<output data-testid="selection">{{selected}}</output><output data-testid="confirmed">{{confirmed}}</output>
</main></template>