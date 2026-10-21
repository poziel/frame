<script setup lang="ts">
import { ref } from "vue";
const preview = ref(true);
</script><template><form class="demo-properties" style="display:block" @submit.prevent><h1>Advanced properties</h1><label class="demo-check"><input v-model="preview" type="checkbox"/>Preview changes before applying</label><p>Escape returns to the original properties modal with its edits intact.</p></form></template>
