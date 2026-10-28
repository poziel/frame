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

  /** Referrer policy passed to the avatar image request. */
  referrerPolicy?: AvatarImageProps['referrerPolicy'];

  /** Cross-origin request mode passed to the avatar image. */
  crossOrigin?: AvatarImageProps['crossOrigin'];
}

const props = defineProps<Props>();
const emit = defineEmits<AvatarImageEmits>();
const rootProps = computed(() => ({as: props.as, asChild: props.asChild}));
const forwarded = useForwardProps(rootProps);

defineSlots<{
  /** Fallback content used while the image is unavailable; defaults to fallback text. */
  default?(): unknown;
}>();
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
  /* Equal width and height of the avatar surface. @token --frame-avatar-size */
  --_frame-default-avatar-size-134: 36px;
  width: var(
    --frame-avatar-size,
    var(--_frame-default-avatar-size-134)
  ); /* Equal width and height of the avatar surface. @token --frame-avatar-size */
  --_frame-default-avatar-size-134: 36px;
  height: var(--frame-avatar-size, var(--_frame-default-avatar-size-134));
  overflow: hidden;
  /* Corner radius of the avatar surface. @token --frame-avatar-radius */
  --_frame-default-avatar-radius-136: 50%;
  border-radius: var(
    --frame-avatar-radius,
    var(--_frame-default-avatar-radius-136)
  ); /* Surface behind the avatar image or fallback. @token --frame-avatar-background */
  --_frame-default-avatar-background-137: var(--frame-control-background);
  /* Resting fill of text-entry controls and other control surfaces. @token --frame-control-background @context */
  background: var(
    --frame-avatar-background,
    var(--_frame-default-avatar-background-137)
  );
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
  /* Foreground of the avatar fallback. @token --frame-avatar-color */
  --_frame-default-avatar-color-138: var(--frame-text);
  /* Primary foreground for readable text and icons across shell and application content. @token --frame-text @context */
  color: var(--frame-avatar-color, var(--_frame-default-avatar-color-138));
}
</style>
