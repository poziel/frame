<script setup lang="ts">
import { FieldRoot, FieldLabel, FieldControl, FieldDescription, FieldError, useForwardProps } from 'reka-ui';
import type { FieldRootProps } from 'reka-ui';
import '../forms/advanced.css';
const props=defineProps<FieldRootProps & { label?: string; description?: string; error?: string }>();
const forwarded=useForwardProps(props);
</script>
<template><FieldRoot v-bind="forwarded" :invalid="invalid || !!error" class="frame-field"><FieldLabel v-if="label" class="frame-field-label">{{label}}</FieldLabel><FieldControl as-child><slot /></FieldControl><FieldDescription v-if="description" class="frame-field-description">{{description}}</FieldDescription><FieldError class="frame-field-error"><template v-if="error">{{error}}</template></FieldError></FieldRoot></template>
