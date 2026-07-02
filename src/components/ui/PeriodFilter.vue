<template>
  <div class="space-y-2">
    <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <button
        v-for="preset in presets"
        :key="preset.value"
        @click="selectPreset(preset.value)"
        :class="mode === preset.value ? 'bg-accent text-white' : 'bg-white/5 text-white/60'"
        class="px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors shrink-0"
      >
        {{ preset.label }}
      </button>
    </div>

    <div v-if="mode === 'month'" class="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10 w-fit">
      <button @click="shiftMonth(-1)" class="p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      <span class="font-medium capitalize min-w-24 text-center text-xs px-1">{{ displayMonth }}</span>
      <button @click="shiftMonth(1)" class="p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
    </div>

    <div v-if="mode === 'custom'" class="flex gap-2">
      <input
        type="date"
        v-model="customStart"
        @change="emitRange"
        class="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-accent transition-colors"
      >
      <input
        type="date"
        v-model="customEnd"
        @change="emitRange"
        class="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-accent transition-colors"
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

const emit = defineEmits<{ (event: 'change', range: { startDate: string; endDate: string }): void }>();

const presets = [
  { label: 'Este mês', value: 'month' },
  { label: 'Últimos 30 dias', value: 'last30' },
  { label: 'Este ano', value: 'year' },
  { label: 'Personalizado', value: 'custom' },
];

const mode = ref<'month' | 'last30' | 'year' | 'custom'>('month');
const monthDate = ref(new Date());
const customStart = ref('');
const customEnd = ref('');

const displayMonth = computed(() => monthDate.value.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }));

function toISODate(date: Date) {
  return date.toISOString().split('T')[0];
}

function computeRange() {
  const now = new Date();

  if (mode.value === 'last30') {
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    return { startDate: toISODate(start), endDate: toISODate(now) };
  }

  if (mode.value === 'year') {
    return { startDate: toISODate(new Date(now.getFullYear(), 0, 1)), endDate: toISODate(new Date(now.getFullYear(), 11, 31)) };
  }

  if (mode.value === 'custom') {
    return { startDate: customStart.value, endDate: customEnd.value };
  }

  const year = monthDate.value.getFullYear();
  const month = monthDate.value.getMonth();
  return { startDate: toISODate(new Date(year, month, 1)), endDate: toISODate(new Date(year, month + 1, 0)) };
}

function emitRange() {
  const range = computeRange();
  if (!range.startDate || !range.endDate) return;
  emit('change', range);
}

function selectPreset(value: string) {
  mode.value = value as typeof mode.value;

  if (value === 'custom' && !customStart.value) {
    const monthRange = { startDate: toISODate(new Date(monthDate.value.getFullYear(), monthDate.value.getMonth(), 1)), endDate: toISODate(new Date()) };
    customStart.value = monthRange.startDate;
    customEnd.value = monthRange.endDate;
  }

  emitRange();
}

function shiftMonth(direction: number) {
  const newDate = new Date(monthDate.value);
  newDate.setMonth(newDate.getMonth() + direction);
  monthDate.value = newDate;
  emitRange();
}

onMounted(emitRange);
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
