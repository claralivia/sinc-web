<template>
  <div class="pt-6 space-y-6">
    <h1 class="text-2xl font-bold">{{ activeTab === 'history' ? 'Histórico' : 'Parcelamentos' }}</h1>

    <div class="flex gap-2 bg-white/5 rounded-full p-1 border border-white/10">
      <button @click="activeTab = 'history'" :class="activeTab === 'history' ? 'bg-accent text-white' : 'text-white/50'" class="flex-1 py-2 rounded-full text-sm font-medium transition-colors">
        Histórico
      </button>
      <button @click="activeTab = 'installments'" :class="activeTab === 'installments' ? 'bg-accent text-white' : 'text-white/50'" class="flex-1 py-2 rounded-full text-sm font-medium transition-colors">
        Parcelamentos
      </button>
    </div>

    <template v-if="activeTab === 'history'">
      <PeriodFilter @change="onPeriodChange" />

      <div v-if="!transactions?.length" class="text-center text-white/50 py-10">
        Nenhuma transação encontrada.
      </div>

      <div class="space-y-4">
        <div v-for="t in transactions" :key="t?._id" class="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <span
              class="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
              :style="{ backgroundColor: (t?.categoryId?.color || '#898781') + '26' }"
            >
              {{ t?.categoryId?.icon || '❔' }}
            </span>
            <div class="min-w-0">
              <p class="font-bold truncate">{{ t?.description || 'Sem descrição' }}</p>
              <p class="text-xs text-white/50 truncate">{{ t?.date ? formatDate(t.date) : 'Data inválida' }} · {{ t?.categoryId?.name || 'Sem categoria' }}</p>
              <p class="text-xs text-white/40 mt-0.5 truncate">{{ t?.paidBy?.name || 'Alguém' }} · {{ splitLabel(t) }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <div :class="t?.type === 'INCOME' ? 'text-good' : 'text-critical'" class="font-bold text-right">
              {{ t?.type === 'INCOME' ? '+' : '-' }} R$ {{ ((t?.amount || 0) / 100).toFixed(2) }}
            </div>
            <button @click="deleteTransaction(t._id)" class="p-2 rounded-full bg-critical/10 text-critical shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.9 12.1A2 2 0 0116.1 21H7.9a2 2 0 01-2-1.9L5 7m5 4v6m4-6v6M9 7V4h6v3m-8 0h10"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </template>

    <template v-if="activeTab === 'installments'">
      <div v-if="!installments?.length" class="text-center text-white/50 py-10">
        Nenhum parcelamento em aberto.
      </div>

      <div class="space-y-4">
        <div v-for="group in installments" :key="group.installmentGroupId" class="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
          <div class="flex items-center gap-3 min-w-0">
            <span
              class="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
              :style="{ backgroundColor: (group.categoryColor || '#898781') + '26' }"
            >
              {{ group.categoryIcon || '❔' }}
            </span>
            <div class="min-w-0 flex-1">
              <p class="font-bold truncate">{{ group.description }}</p>
              <p class="text-xs text-white/50 truncate">
                Total R$ {{ (group.totalAmount / 100).toFixed(2) }} em {{ group.totalInstallments }}x · {{ installmentSplitLabel(group) }}
              </p>
            </div>
          </div>

          <div class="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div class="h-full rounded-full bg-good transition-all" :style="{ width: (group.paidCount / group.totalInstallments) * 100 + '%' }" />
          </div>

          <div class="flex items-center justify-between text-xs">
            <span class="text-good font-medium">{{ group.paidCount }} paga{{ group.paidCount === 1 ? '' : 's' }}</span>
            <span class="text-white/40">{{ group.pendingCount }} restante{{ group.pendingCount === 1 ? '' : 's' }}</span>
          </div>

          <p v-if="group.nextDueDate" class="text-xs text-white/40">Próxima parcela: {{ formatDate(group.nextDueDate) }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import api from '@/lib/api';
import PeriodFilter from '@/components/ui/PeriodFilter.vue';

interface Transaction {
  _id: string;
  description: string;
  amount: number;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  categoryId?: { name: string; icon: string; color: string };
  paidBy?: { name: string };
  owedBy?: { name: string };
  owedAmount?: number;
  splitType?: 'MINE' | 'HERS' | 'SHARED_50_50' | 'SHARED_CUSTOM';
}

const splitLabels: Record<string, string> = {
  MINE: 'Só meu',
  HERS: 'Só dela',
};

function splitLabel(transaction: Transaction) {
  if (!transaction?.splitType) return '';

  if (transaction.splitType === 'SHARED_50_50') {
    return `Dividido 50/50 com ${transaction?.owedBy?.name || 'parceiro(a)'}`;
  }

  if (transaction.splitType === 'SHARED_CUSTOM') {
    const percentage = transaction?.amount ? Math.round(((transaction?.owedAmount || 0) / transaction.amount) * 100) : 0;
    return `Dividido com ${transaction?.owedBy?.name || 'parceiro(a)'} (${percentage}%)`;
  }

  return splitLabels[transaction.splitType] || '';
}

interface InstallmentGroup {
  installmentGroupId: string;
  description: string;
  splitType: 'MINE' | 'HERS' | 'SHARED_50_50' | 'SHARED_CUSTOM';
  totalAmount: number;
  totalInstallments: number;
  paidCount: number;
  pendingCount: number;
  nextDueDate?: string;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
}

const activeTab = ref<'history' | 'installments'>('history');
const transactions = ref<Transaction[]>([]);
const installments = ref<InstallmentGroup[]>([]);
const currentRange = ref({ startDate: '', endDate: '' });

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR');
}

function installmentSplitLabel(group: InstallmentGroup) {
  return splitLabels[group.splitType] || 'Dividido com parceiro(a)';
}

async function loadTransactions() {
  if (!currentRange.value.startDate) return;

  try {
    const { data } = await api.get('/transactions', {
      params: {
        startDate: currentRange.value.startDate,
        endDate: currentRange.value.endDate
      }
    });

    transactions.value = Array.isArray(data) ? data : (data?.transactions || data?.data || []);
  } catch (error) {
    console.error(error);
  }
}

async function loadInstallments() {
  try {
    const { data } = await api.get('/transactions/installments/summary');
    installments.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erro ao carregar parcelamentos:', error);
  }
}

function onPeriodChange(range: { startDate: string; endDate: string }) {
  currentRange.value = range;
  loadTransactions();
}

async function deleteTransaction(id: string) {
  await api.delete(`/transactions/${id}`);
  await loadTransactions();
}

onMounted(() => {
  loadInstallments();
});
</script>
