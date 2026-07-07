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

      <div class="space-y-3">
        <div v-for="t in transactions" :key="t?._id" class="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <button type="button" class="w-full flex items-center justify-between gap-3 p-4 text-left" @click="toggleExpanded(t._id)">
            <div class="flex items-center gap-3 min-w-0">
              <span
                class="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
                :style="{ backgroundColor: (t?.categoryId?.color || '#898781') + '26' }"
              >
                {{ t?.categoryId?.icon || '❔' }}
              </span>
              <div class="min-w-0">
                <p class="font-bold" :class="expandedId === t?._id ? 'whitespace-normal wrap-break-word' : 'truncate'">{{ t?.description || 'Sem descrição' }}</p>
                <p class="text-xs text-white/50 truncate">{{ t?.date ? formatDate(t.date) : 'Data inválida' }} · {{ t?.categoryId?.name || 'Sem categoria' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <div :class="t?.type === 'INCOME' ? 'text-good' : 'text-critical'" class="font-bold text-right">
                {{ t?.type === 'INCOME' ? '+' : '-' }} R$ {{ ((t?.amount || 0) / 100).toFixed(2) }}
              </div>
              <svg
                class="w-4 h-4 text-white/40 transition-transform shrink-0"
                :class="expandedId === t?._id ? 'rotate-180' : ''"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </button>

          <div v-if="expandedId === t?._id" class="px-4 pb-4 space-y-3 border-t border-white/10 pt-3">
            <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
              <p class="text-white/40">Pago por</p>
              <p class="text-right">{{ t?.paidBy?.name || 'Alguém' }}</p>

              <p class="text-white/40">Pagamento</p>
              <p class="text-right">{{ paymentMethodLabel(t?.paymentMethod) }}<span v-if="t?.cardId?.name"> · {{ t.cardId.name }}</span></p>

              <p class="text-white/40">Divisão</p>
              <p class="text-right">{{ splitLabel(t) || 'Só meu' }}</p>
            </div>

            <div class="flex gap-2 pt-1">
              <button @click="editTransaction(t._id)" class="flex-1 py-3 rounded-2xl bg-white/10 font-medium text-sm">
                Editar
              </button>
              <button @click="deleteTransaction(t._id)" class="flex-1 py-3 rounded-2xl bg-critical/10 text-critical font-medium text-sm">
                Excluir
              </button>
            </div>
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
import { useRouter } from 'vue-router';
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
  paymentMethod?: 'PIX' | 'CREDIT_CARD' | 'DEBIT' | 'CASH';
  cardId?: { name: string };
}

const router = useRouter();

const paymentMethodLabels: Record<string, string> = {
  PIX: 'Pix',
  CREDIT_CARD: 'Cartão de Crédito',
  DEBIT: 'Cartão de Débito',
  CASH: 'Dinheiro',
};

function paymentMethodLabel(method?: string) {
  return (method && paymentMethodLabels[method]) || 'Não informado';
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
const expandedId = ref<string | null>(null);

function toggleExpanded(id: string) {
  expandedId.value = expandedId.value === id ? null : id;
}

function editTransaction(id: string) {
  router.push(`/transacoes/${id}/editar`);
}

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
  if (expandedId.value === id) expandedId.value = null;
  await loadTransactions();
}

onMounted(() => {
  loadInstallments();
});
</script>
