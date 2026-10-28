<script setup lang="ts">
import {
  PaginationRoot,
  PaginationList,
  PaginationListItem,
  PaginationEllipsis,
  PaginationFirst,
  PaginationLast,
  PaginationPrev,
  PaginationNext,
  useForwardPropsEmits,
  type PaginationRootProps,
  type PaginationRootEmits,
} from 'reka-ui';
import FrameIcon from '../data-display/FrameIcon.vue';
import '../layout/styles/disclosure-and-layout.scss';

const props = defineProps<PaginationRootProps>();
const emit = defineEmits<PaginationRootEmits>();
const forwarded = useForwardPropsEmits(props, emit);
</script>
<template>
  <PaginationRoot
    v-bind="forwarded"
    v-slot="{page, pageCount}"
    class="frame-pagination frame-layout-text"
    ><slot :page="page" :page-count="pageCount"
      ><PaginationList v-slot="{items}" class="frame-pagination-list"
        ><PaginationFirst
          class="frame-pagination-button frame-layout-focus frame-layout-disabled"
          aria-label="First page"
          ><FrameIcon name="chevron-left" /><FrameIcon
            name="chevron-left" /></PaginationFirst
        ><PaginationPrev
          class="frame-pagination-button frame-layout-focus frame-layout-disabled"
          aria-label="Previous page"
          ><FrameIcon name="chevron-left" /></PaginationPrev
        ><template v-for="(item, index) in items" :key="index"
          ><PaginationListItem
            v-if="item.type === 'page'"
            :value="item.value"
            class="frame-pagination-button frame-layout-focus frame-layout-disabled"
            >{{ item.value }}</PaginationListItem
          ><PaginationEllipsis
            v-else
            class="frame-pagination-ellipsis" /></template
        ><PaginationNext
          class="frame-pagination-button frame-layout-focus frame-layout-disabled"
          aria-label="Next page"
          ><FrameIcon name="chevron-right" /></PaginationNext
        ><PaginationLast
          class="frame-pagination-button frame-layout-focus frame-layout-disabled"
          aria-label="Last page"
          ><FrameIcon name="chevron-right" /><FrameIcon
            name="chevron-right" /></PaginationLast></PaginationList></slot
  ></PaginationRoot>
</template>

<style lang="scss">
.frame-pagination-list {
  display: flex;
  align-items: center;
  gap: var(--frame-gap);
  flex-wrap: wrap;
}
.frame-pagination-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  height: 30px;
  padding: 0 var(--frame-control-padding-x);
  border: 1px solid var(--frame-control-border);
  border-radius: var(--frame-control-radius);
  font: inherit;
  background: var(
    --frame-pagination-background,
    var(--frame-control-background)
  );
  color: var(--frame-control-text);
  cursor: pointer;
}
.frame-pagination-button:hover {
  background: var(--frame-menu-hover);
}
.frame-pagination-button[data-selected] {
  background: var(--frame-accent);
  color: var(--frame-accent-foreground);
  border-color: var(--frame-accent);
}
.frame-pagination-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
}
</style>
