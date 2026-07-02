<template>
  <div class="space-y-6 pt-6">
    <h1 class="text-2xl font-bold">Resumo</h1>

    <PeriodFilter @change="onPeriodChange" />

    <GlassCard>
      <p class="text-white/60 text-sm">Saldo Disponível</p>
      <h2 class="text-4xl font-black mt-1">
        R$ {{ ((summary?.totals?.balance || 0) / 100).toFixed(2) }}
      </h2>
    </GlassCard>

    <div class="grid grid-cols-2 gap-4">
      <GlassCard class="border-good/20">
        <p class="text-good text-xs">Receitas</p>
        <p class="font-bold">R$ {{ ((summary?.totals?.totalIncome || 0) / 100).toFixed(2) }}</p>
      </GlassCard>
      <GlassCard class="border-critical/20">
        <p class="text-critical text-xs">Despesas</p>
        <p class="font-bold">R$ {{ ((Math.abs(summary?.totals?.totalExpense) || 0) / 100).toFixed(2) }}</p>
      </GlassCard>
    </div>

    <GlassCard v-if="summary?.sharedDebt?.length">
      <p class="text-white/60 text-sm mb-2">Saldo entre vocês</p>
      <div v-for="debt in summary.sharedDebt" :key="debt.userId" class="flex items-center justify-between">
        <p class="font-medium">{{ debt.userName || 'Parceiro(a)' }} deve</p>
        <p class="font-bold text-accent">R$ {{ (debt.amount / 100).toFixed(2) }}</p>
      </div>
    </GlassCard>

    <div class="mt-8 bg-white/5 p-4 rounded-2xl border border-white/10" v-if="chartSeries[0] > 0 || chartSeries[1] > 0">
      <h3 class="text-lg font-medium mb-4 text-center">Balanço Mensal</h3>
      <apexchart
        type="donut"
        height="280"
        :options="chartOptions"
        :series="chartSeries"
      />
    </div>

    <div class="bg-white/5 border border-white/10 rounded-2xl p-4" v-if="summary?.expensesByCategory?.length">
      <h3 class="text-sm font-semibold text-white/40 uppercase tracking-wide mb-3">Gastos por categoria</h3>
      <div class="space-y-3">
        <div v-for="category in summary.expensesByCategory" :key="category.categoryName" class="flex items-center gap-3">
          <span
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
            :style="{ backgroundColor: (category.categoryColor || '#898781') + '26' }"
          >
            {{ category.categoryIcon || '❔' }}
          </span>
          <p class="flex-1 text-sm truncate">{{ category.categoryName || 'Sem categoria' }}</p>
          <p class="text-sm font-bold shrink-0">R$ {{ (category.total / 100).toFixed(2) }}</p>
        </div>
      </div>
    </div>

    <div class="bg-white/5 border border-white/10 rounded-2xl p-4" v-if="goals?.length">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-white/40 uppercase tracking-wide">Metas</h3>
        <router-link to="/metas" class="text-xs text-accent font-medium">Ver todas</router-link>
      </div>
      <div class="space-y-4">
        <div v-for="goal in goals" :key="goal._id">
          <div class="flex items-center justify-between mb-1 text-sm">
            <p class="font-medium">{{ goal.icon }} {{ goal.name }}</p>
            <p class="text-white/50">{{ goalProgress(goal) }}%</p>
          </div>
          <div class="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div class="h-full rounded-full" :style="{ width: goalProgress(goal) + '%', backgroundColor: goal.color }" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '@/lib/api';
import GlassCard from '@/components/ui/GlassCard.vue';
import PeriodFilter from '@/components/ui/PeriodFilter.vue';

const goals = ref<any[]>([]);
const currentRange = ref({ startDate: '', endDate: '' });

const summary = ref<any>({
  totals: {
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  },
  sharedDebt: [],
  expensesByCategory: []
});

const chartSeries = computed(() => {
  const income = (summary.value?.totals?.totalIncome || 0) / 100;
  const expense = Math.abs((summary.value?.totals?.totalExpense || 0) / 100);
  return [income, expense];
});

const chartOptions = {
  labels: ['Receitas', 'Despesas'],
  colors: ['#2DD4BF', '#FB7185'],
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

function goalProgress(goal: any) {
  if (!goal?.targetAmount) return 0;
  return Math.min(100, Math.round(((goal.currentAmount || 0) / goal.targetAmount) * 100));
}

async function fetchDashboard() {
  if (!currentRange.value.startDate) return;

  try {
    const { data } = await api.get('/dashboard', {
      params: {
        startDate: currentRange.value.startDate,
        endDate: currentRange.value.endDate
      }
    });
    summary.value = data;
  } catch (error) {
    console.error(error);
  }
}

async function fetchGoals() {
  try {
    const { data } = await api.get('/goals');
    goals.value = Array.isArray(data) ? data.slice(0, 3) : [];
  } catch (error) {
    console.error(error);
  }
}

function onPeriodChange(range: { startDate: string; endDate: string }) {
  currentRange.value = range;
  fetchDashboard();
}

onMounted(() => {
  fetchGoals();
});
</script>
