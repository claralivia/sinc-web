<template>
  <div class="pt-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Histórico</h1>
      <button @click="$router.push('/nova-transacao')" class="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold">
        + Novo
      </button>
    </div>

    <div v-if="!transactions?.length" class="text-center text-white/50 py-10">
      Nenhuma transação encontrada.
    </div>

    <div class="space-y-4">
      <div v-for="t in transactions" :key="t?._id" class="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center">
        <div>
          <p class="font-bold">{{ t?.description || 'Sem descrição' }}</p>
          <p class="text-xs text-white/50">{{ t?.date ? formatDate(t.date) : 'Data inválida' }}</p>
        </div>
        <div :class="t?.type === 'INCOME' ? 'text-green-500' : 'text-red-500'" class="font-bold">
          {{ t?.type === 'INCOME' ? '+' : '-' }} R$ {{ ((t?.amount || 0) / 100).toFixed(2) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/lib/api';

interface Transaction {
  _id: string;
  description: string;
  amount: number;
  date: string;
  type: 'INCOME' | 'EXPENSE';
}

const transactions = ref<Transaction[]>([]);

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR');
}

onMounted(async () => {
  try {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

    const { data } = await api.get('/transactions', {
      params: {
        userId: '123',
        startDate,
        endDate
      }
    });
    
    transactions.value = Array.isArray(data) ? data : (data?.transactions || data?.data || []);
  } catch (error) {
    console.error(error);
  }
});
</script>