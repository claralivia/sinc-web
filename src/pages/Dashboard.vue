<template>
  <div class="space-y-6 pt-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Resumo</h1>
      
      <div class="flex items-center gap-2 bg-white/5 rounded-xl p-1 border border-white/10">
        <button @click="previousMonth" class="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <span class="font-medium capitalize min-w-[140px] text-center text-sm">
          {{ displayMonth }}
        </span>
        <button @click="nextMonth" class="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>
    </div>

    <GlassCard>
      <p class="text-white/60 text-sm">Saldo Disponível</p>
      <h2 class="text-4xl font-black mt-1">
        R$ {{ ((summary?.totals?.balance || 0) / 100).toFixed(2) }}
      </h2>
    </GlassCard>

    <div class="grid grid-cols-2 gap-4">
      <GlassCard class="border-green-500/20">
        <p class="text-green-500 text-xs">Receitas</p>
        <p class="font-bold">R$ {{ ((summary?.totals?.totalIncome || 0) / 100).toFixed(2) }}</p>
      </GlassCard>
      <GlassCard class="border-red-500/20">
        <p class="text-red-500 text-xs">Despesas</p>
        <p class="font-bold">R$ {{ ((Math.abs(summary?.totals?.totalExpense) || 0) / 100).toFixed(2) }}</p>
      </GlassCard>
    </div>

    <div class="mt-8 bg-white/5 p-4 rounded-2xl border border-white/10" v-if="chartSeries[0] > 0 || chartSeries[1] > 0">
      <h3 class="text-lg font-medium mb-4 text-center">Balanço Mensal</h3>
      <apexchart 
        type="donut" 
        height="280"
        :options="chartOptions" 
        :series="chartSeries" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '@/lib/api';
import GlassCard from '@/components/ui/GlassCard.vue';

const currentDate = ref(new Date());

const summary = ref({
  totals: {
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  }
});

const displayMonth = computed(() => {
  return currentDate.value.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
});

const dateParams = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
  return { startDate, endDate };
});

const chartSeries = computed(() => {
  const income = (summary.value?.totals?.totalIncome || 0) / 100;
  const expense = Math.abs((summary.value?.totals?.totalExpense || 0) / 100);
  return [income, expense];
});

const chartOptions = {
  labels: ['Receitas', 'Despesas'],
  colors: ['#22c55e', '#ef4444'],
  chart: {
    foreColor: '#ffffff',
    background: 'transparent',
    toolbar: { show: false }
  },
  stroke: { show: false },
  dataLabels: { enabled: false },
  legend: { position: 'bottom' },
  theme: { mode: 'dark' },
  plotOptions: {
    pie: {
      donut: {
        size: '70%'
      }
    }
  }
};

async function fetchDashboard() {
  try {
    const { data } = await api.get('/dashboard', {
      params: {
        userId: '123',
        startDate: dateParams.value.startDate,
        endDate: dateParams.value.endDate
      }
    });
    summary.value = data;
  } catch (error) {
    console.error(error);
  }
}

function previousMonth() {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() - 1);
  currentDate.value = newDate;
  fetchDashboard();
}

function nextMonth() {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() + 1);
  currentDate.value = newDate;
  fetchDashboard();
}

onMounted(() => {
  fetchDashboard();
});
</script>