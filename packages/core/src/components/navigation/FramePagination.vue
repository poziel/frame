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
defineSlots<{
  /** Replaces the built-in page controls with the current page and page count. */ default?(
    props: {
    page: number;
    pageCount: number;
  }
  ): unknown;
}>();
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
  /* Standard space between related content items and control children. @token --frame-gap @context */
  gap: var(--frame-gap);
  flex-wrap: wrap;
}
.frame-pagination-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  height: 30px;
  /* Horizontal inset inside ordinary controls and text-entry surfaces. @token --frame-control-padding-x @context */
  padding: 0 var(--frame-control-padding-x); /* Resting border color of form controls, independently overridable from menu borders. @token --frame-control-border @context */
  border: 1px solid var(--frame-control-border); /* Shared corner radius of buttons and ordinary controls; text-entry surfaces may use the input radius instead. @token --frame-control-radius @context */
  border-radius: var(--frame-control-radius);
  font: inherit;
  /* Resting surface of a pagination button. @token --frame-pagination-background */
  --_frame-default-pagination-background-139: var(--frame-control-background);
  /* Resting fill of text-entry controls and other control surfaces. @token --frame-control-background @context */
  background: var(
    --frame-pagination-background,
    var(--_frame-default-pagination-background-139)
  ); /* Foreground for text and icons on resting control surfaces. @token --frame-control-text @context */
  color: var(--frame-control-text);
  cursor: pointer;
}
.frame-pagination-button:hover {
  /* Neutral hover and highlight fill for ordinary menu rows. @token --frame-menu-hover @context */
  background: var(--frame-menu-hover);
}
.frame-pagination-button[data-selected] {
  /* Shared interaction color for keyboard focus, active actions, and accent-filled controls. @token --frame-accent @context */
  background: var(
    --frame-accent
  ); /* Readable text and icon foreground on accent-filled surfaces. @token --frame-accent-foreground @context */
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
