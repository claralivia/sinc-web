<template>
  <label class="block space-y-1.5">
    <span v-if="label" class="text-xs font-semibold text-white/40 uppercase tracking-wide">{{ label }}</span>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      @input="onInput"
      :class="inputClass"
      class="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 outline-none transition-colors text-white placeholder:text-white/30 focus:border-accent focus:bg-white/[0.07]"
    >
  </label>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string;
  label?: string;
  type?: string;
  placeholder?: string;
  inputClass?: string;
}>();

const emit = defineEmits<{ (event: 'update:modelValue', value: string): void }>();

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value);
}
</script>
