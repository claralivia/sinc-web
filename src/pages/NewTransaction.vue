<template>
  <div class="pt-6 space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold">Novo Lançamento</h2>
      <button @click="$router.back()" class="text-white/50 hover:text-white transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>

    <div class="mb-6">
      <input 
        @keyup.enter="processarIA"
        v-model="textoIA" 
        placeholder="IA: Ex. Almoço 35 reais no crédito" 
        class="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none focus:border-blue-500 transition-colors"
      >
    </div>

    <div class="space-y-6">
      <div class="flex gap-2">
        <button @click="form.type = 'EXPENSE'" :class="form.type === 'EXPENSE' ? 'bg-red-500 text-white' : 'bg-white/5 text-white/50'" class="flex-1 py-3 rounded-xl font-medium transition-colors">Despesa</button>
        <button @click="form.type = 'INCOME'" :class="form.type === 'INCOME' ? 'bg-green-500 text-white' : 'bg-white/5 text-white/50'" class="flex-1 py-3 rounded-xl font-medium transition-colors">Receita</button>
      </div>

      <div class="space-y-4">
        <input v-model="form.description" placeholder="Descrição" class="w-full bg-transparent border-b border-white/20 p-2 outline-none text-lg focus:border-blue-500 transition-colors">
        <input v-model="form.amount" type="number" placeholder="R$ 0,00" class="w-full bg-transparent border-b border-white/20 p-2 outline-none text-3xl font-black focus:border-blue-500 transition-colors">
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium text-white/50">Categoria</label>
        <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            v-for="cat in categories" 
            :key="cat._id"
            @click="form.categoryId = cat._id"
            :class="form.categoryId === cat._id ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/60'"
            class="px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium text-white/50">Divisão (Rateio)</label>
        <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            v-for="split in splitOptions" 
            :key="split.value"
            @click="form.splitType = split.value"
            :class="form.splitType === split.value ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/60'"
            class="px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors"
          >
            {{ split.label }}
          </button>
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium text-white/50">Método de Pagamento</label>
        <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            v-for="method in paymentMethods" 
            :key="method.value"
            @click="form.paymentMethod = method.value"
            :class="form.paymentMethod === method.value ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/60'"
            class="px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors"
          >
            {{ method.label }}
          </button>
        </div>
      </div>

      <button @click="save" class="w-full bg-blue-500 py-4 rounded-xl font-bold text-white mt-4 active:scale-95 transition-transform">
        Confirmar Lançamento
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/lib/api';
import { useRouter } from 'vue-router';

const router = useRouter();
const textoIA = ref('');
const categories = ref<any[]>([]);

const form = ref({
  description: '',
  amount: '',
  type: 'EXPENSE',
  categoryId: '',
  splitType: 'MINE',
  paymentMethod: 'PIX'
});

const splitOptions = [
  { label: 'Só Meu', value: 'MINE' },
  { label: 'Só Dela', value: 'HERS' },
  { label: 'Dividido 50/50', value: 'SHARED_50_50' }
];

const paymentMethods = [
  { label: 'Pix', value: 'PIX' },
  { label: 'Cartão de Crédito', value: 'CREDIT_CARD' },
  { label: 'Cartão de Débito', value: 'DEBIT' }
];

async function loadCategories() {
  try {
    const { data } = await api.get('/categories');
    categories.value = Array.isArray(data) ? data : (data?.data || []);
    if (categories.value?.length && !form.value.categoryId) {
      form.value.categoryId = categories.value[0]._id;
    }
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
  }
}

async function processarIA() {
  if (!textoIA.value) return;
  try {
    const { data } = await api.post('/ai-parse', { text: textoIA.value });
    if (data?.description) form.value.description = data.description;
    if (data?.amount) form.value.amount = data.amount;
    if (data?.type) form.value.type = data.type;
  } catch (error) {
    console.error('Erro ao processar IA:', error);
  }
}

async function save() {
  try {
    await api.post('/transactions', {
      description: form.value.description,
      amount: Number(form.value.amount) * 100,
      type: form.value.type,
      date: new Date(),
      categoryId: form.value.categoryId,
      paidBy: '64b0f9a2e4b0a1a2b3c4d5e7',
      splitType: form.value.splitType,
      paymentMethod: form.value.paymentMethod,
      isRecurring: false
    });
    router.push('/transacoes');
  } catch (error) {
    console.error('Erro ao salvar transação:', error);
  }
}

onMounted(() => {
  loadCategories();
});
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