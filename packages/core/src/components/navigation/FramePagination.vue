<script setup lang="ts">
import { PaginationRoot, PaginationList, PaginationListItem, PaginationEllipsis, PaginationFirst, PaginationLast, PaginationPrev, PaginationNext, useForwardPropsEmits, type PaginationRootProps, type PaginationRootEmits } from 'reka-ui';
import FrameIcon from '../data-display/FrameIcon.vue';
import '../shared/general-a.css';
const props = defineProps<PaginationRootProps>();
const emit = defineEmits<PaginationRootEmits>();
const forwarded = useForwardPropsEmits(props, emit);
</script>
<template><PaginationRoot v-bind="forwarded" v-slot="{ page, pageCount }" class="frame-pagination"><slot :page="page" :page-count="pageCount"><PaginationList v-slot="{ items }" class="frame-pagination-list"><PaginationFirst class="frame-pagination-button" aria-label="First page"><FrameIcon name="chevron-left"/><FrameIcon name="chevron-left"/></PaginationFirst><PaginationPrev class="frame-pagination-button" aria-label="Previous page"><FrameIcon name="chevron-left"/></PaginationPrev><template v-for="(item, index) in items" :key="index"><PaginationListItem v-if="item.type === 'page'" :value="item.value" class="frame-pagination-button">{{ item.value }}</PaginationListItem><PaginationEllipsis v-else class="frame-pagination-ellipsis"/></template><PaginationNext class="frame-pagination-button" aria-label="Next page"><FrameIcon name="chevron-right"/></PaginationNext><PaginationLast class="frame-pagination-button" aria-label="Last page"><FrameIcon name="chevron-right"/><FrameIcon name="chevron-right"/></PaginationLast></PaginationList></slot></PaginationRoot></template>
