<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="w-full py-4 rounded-full font-bold transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
    :class="variantClass"
  >
    <span v-if="loading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'danger' | 'ghost';
    loading?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit';
  }>(),
  {
    variant: 'primary',
    loading: false,
    disabled: false,
    type: 'button',
  }
);

const variantClass = computed(() => ({
  primary: 'bg-accent text-white',
  danger: 'bg-critical text-white',
  ghost: 'bg-white/5 text-white/70',
}[props.variant]));
</script>
