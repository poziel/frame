<script setup lang="ts">
import {computed} from 'vue';
import {
  AvatarRoot,
  AvatarImage,
  AvatarFallback,
  useForwardProps,
  type AvatarRootProps,
  type AvatarImageProps,
  type AvatarImageEmits,
} from 'reka-ui';
import '../layout/styles/disclosure-and-layout.scss';

interface Props extends AvatarRootProps {

  /** Image URL. The fallback appears while unavailable or loading. */
  src?: string;

  /** Alternative text describing the avatar image. */
  alt?: string;

  /** Initials or text displayed when the image is unavailable. */
  fallback?: string;

  /** Milliseconds before showing the fallback during image loading. */
  delayMs?: number;

  referrerPolicy?: AvatarImageProps['referrerPolicy'];

  crossOrigin?: AvatarImageProps['crossOrigin'];
}

const props = defineProps<Props>();
const emit = defineEmits<AvatarImageEmits>();
const rootProps = computed(() => ({as: props.as, asChild: props.asChild}));
const forwarded = useForwardProps(rootProps);
</script>
<template>
  <AvatarRoot v-bind="forwarded" class="frame-avatar frame-layout-text"
    ><AvatarImage
      v-if="src"
      :src="src"
      :alt="alt ?? ''"
      :referrer-policy="referrerPolicy"
      :cross-origin="crossOrigin"
      class="frame-avatar-image"
      @loading-status-change="emit('loadingStatusChange', $event)"
    /><AvatarFallback
      :delay-ms="delayMs && delayMs > 0 ? delayMs : undefined"
      class="frame-avatar-fallback"
      ><slot>{{ fallback }}</slot></AvatarFallback
    ></AvatarRoot
  >
</template>

<style lang="scss">
.frame-avatar {
  display: inline-flex;
  position: relative;
  width: var(--frame-avatar-size, 36px);
  height: var(--frame-avatar-size, 36px);
  overflow: hidden;
  border-radius: var(--frame-avatar-radius, 50%);
  background: var(--frame-avatar-background, var(--frame-control-background));
  vertical-align: middle;
  flex-shrink: 0;
}
.frame-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.frame-avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-weight: 600;
  color: var(--frame-avatar-color, var(--frame-text));
}
</style>
