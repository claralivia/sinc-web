<template>
  <div class="pt-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Histórico</h1>
      <div class="flex items-center gap-2 bg-white/5 rounded-xl p-1 border border-white/10">
        <button @click="previousMonth" class="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <span class="font-medium capitalize min-w-[120px] text-center text-xs">
          {{ displayMonth }}
        </span>
        <button @click="nextMonth" class="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>

    <div v-if="!transactions?.length" class="text-center text-white/50 py-10">
      Nenhuma transação encontrada.
    </div>

    <div class="space-y-4">
      <div v-for="t in transactions" :key="t?._id" class="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center gap-3">
        <div>
          <p class="font-bold">{{ t?.description || 'Sem descrição' }}</p>
          <p class="text-xs text-white/50">{{ t?.date ? formatDate(t.date) : 'Data inválida' }} · {{ t?.categoryId?.name || 'Sem categoria' }}</p>
        </div>
        <div class="flex items-center gap-3">
          <div :class="t?.type === 'INCOME' ? 'text-green-500' : 'text-red-500'" class="font-bold text-right">
            {{ t?.type === 'INCOME' ? '+' : '-' }} R$ {{ ((t?.amount || 0) / 100).toFixed(2) }}
          </div>
          <button @click="deleteTransaction(t._id)" class="p-2 rounded-full bg-red-500/10 text-red-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.9 12.1A2 2 0 0116.1 21H7.9a2 2 0 01-2-1.9L5 7m5 4v6m4-6v6M9 7V4h6v3m-8 0h10"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import api from '@/lib/api';

interface Transaction {
  _id: string;
  description: string;
  amount: number;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  categoryId?: { name: string };
}

const transactions = ref<Transaction[]>([]);
const currentDate = ref(new Date());

const displayMonth = computed(() => currentDate.value.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }));

const dateParams = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
  return { startDate, endDate };
});

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR');
}

async function loadTransactions() {
  try {
    const { data } = await api.get('/transactions', {
      params: {
        startDate: dateParams.value.startDate,
        endDate: dateParams.value.endDate
      }
    });
    
    transactions.value = Array.isArray(data) ? data : (data?.transactions || data?.data || []);
  } catch (error) {
    console.error(error);
  }
}

function previousMonth() {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() - 1);
  currentDate.value = newDate;
}

function nextMonth() {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() + 1);
  currentDate.value = newDate;
}

async function deleteTransaction(id: string) {
  await api.delete(`/transactions/${id}`);
  await loadTransactions();
}

onMounted(() => {
  loadTransactions();
});

watch(currentDate, () => {
  loadTransactions();
});
</script>
