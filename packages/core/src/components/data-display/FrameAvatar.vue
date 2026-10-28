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
import '../shared/general-a.css';

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
  <AvatarRoot v-bind="forwarded" class="frame-avatar"
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
