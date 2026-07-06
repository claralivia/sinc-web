<template>
  <div class="pt-6 space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold">Novo Lançamento</h2>
      <button @click="$router.back()" class="text-white/50 hover:text-white transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>

    <div class="bg-accent/10 border border-accent/20 rounded-2xl p-4 space-y-3">
      <p class="text-xs font-semibold text-accent uppercase tracking-wide">✨ Preencher com IA</p>
      <div class="flex gap-2">
        <input
          @keyup.enter="processarIA"
          v-model="textoIA"
          placeholder="Ex. Almoço 35 reais no crédito"
          class="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-accent transition-colors placeholder:text-white/30"
        >
        <button @click="processarIA" class="shrink-0 px-5 rounded-2xl bg-accent font-bold active:scale-95 transition-transform">
          Ir
        </button>
      </div>
    </div>

    <div class="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
      <div class="flex gap-2">
        <button @click="form.type = 'EXPENSE'" :class="form.type === 'EXPENSE' ? 'bg-critical text-white' : 'bg-white/5 text-white/50'" class="flex-1 py-3 rounded-full font-medium transition-colors">Despesa</button>
        <button @click="form.type = 'INCOME'" :class="form.type === 'INCOME' ? 'bg-good text-white' : 'bg-white/5 text-white/50'" class="flex-1 py-3 rounded-full font-medium transition-colors">Receita</button>
      </div>

      <AppInput v-model="form.description" label="Descrição" placeholder="Ex. Almoço" />
      <AppInput v-model="form.amount" type="number" label="Valor" placeholder="0.00" input-class="text-2xl font-black" />
      <AppInput v-model="form.date" type="date" label="Data" />
    </div>

    <div class="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
      <label class="text-xs font-semibold text-white/40 uppercase tracking-wide">Categoria</label>
      <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          v-for="cat in filteredCategories"
          :key="cat._id"
          @click="form.categoryId = cat._id"
          :style="categoryChipStyle(cat)"
          class="px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors border flex items-center gap-1.5"
        >
          <span>{{ cat.icon }}</span>
          <span>{{ cat.name }}</span>
        </button>
      </div>
    </div>

    <div class="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
      <label class="text-xs font-semibold text-white/40 uppercase tracking-wide">Divisão (Rateio)</label>
      <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          v-for="split in splitOptions"
          :key="split.value"
          @click="form.splitType = split.value"
          :class="form.splitType === split.value ? 'bg-accent text-white' : 'bg-white/5 text-white/60'"
          class="px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors"
        >
          {{ split.label }}
        </button>
      </div>

      <div v-if="showsPartnerSplit" class="pt-2 space-y-3">
        <label class="text-xs font-semibold text-white/40 uppercase tracking-wide">Dividido com</label>
        <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            v-for="partner in partners"
            :key="partner._id"
            @click="form.partnerId = partner._id"
            :class="form.partnerId === partner._id ? 'bg-accent text-white' : 'bg-white/5 text-white/60'"
            class="px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors"
          >
            {{ partner.name }}
          </button>
        </div>
        <AppInput
          v-if="form.splitType === 'SHARED_CUSTOM'"
          v-model="form.customSplitPercentage"
          type="number"
          :label="`Porcentagem de ${partnerName}`"
          placeholder="50"
        />
      </div>
    </div>

    <div class="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
      <label class="text-xs font-semibold text-white/40 uppercase tracking-wide">Método de Pagamento</label>
      <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          v-for="method in paymentMethods"
          :key="method.value"
          @click="form.paymentMethod = method.value"
          :class="form.paymentMethod === method.value ? 'bg-accent text-white' : 'bg-white/5 text-white/60'"
          class="px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors flex items-center gap-1.5"
        >
          <span>{{ method.icon }}</span>
          <span>{{ method.label }}</span>
        </button>
      </div>

      <div v-if="form.paymentMethod === 'CREDIT_CARD'" class="pt-2 space-y-3">
        <div v-if="cards?.length" class="space-y-2">
          <label class="text-xs font-semibold text-white/40 uppercase tracking-wide">Cartão</label>
          <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              v-for="card in cards"
              :key="card._id"
              @click="form.cardId = card._id"
              :style="{ backgroundColor: form.cardId === card._id ? card.color : `${card.color}1a`, borderColor: `${card.color}55`, color: form.cardId === card._id ? '#fff' : card.color }"
              class="px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors border flex items-center gap-1.5"
            >
              <img v-if="card.logoUrl" :src="card.logoUrl" class="w-4 h-4 rounded-full object-cover">
              <span v-else>💳</span>
              <span>{{ card.name }}</span>
            </button>
          </div>
        </div>

        <AppInput v-model="form.totalInstallments" type="number" label="Parcelas" placeholder="1" />
      </div>
    </div>

    <p v-if="errorMessage" class="text-critical text-sm text-center">{{ errorMessage }}</p>

    <AppButton :loading="saving" @click="save">
      Confirmar Lançamento
    </AppButton>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import api from '@/lib/api';
import { useRouter } from 'vue-router';
import AppInput from '@/components/ui/AppInput.vue';
import AppButton from '@/components/ui/AppButton.vue';

const router = useRouter();
const textoIA = ref('');
const categories = ref<any[]>([]);
const partners = ref<any[]>([]);
const cards = ref<any[]>([]);
const saving = ref(false);
const errorMessage = ref('');

const form = ref({
  description: '',
  amount: '',
  type: 'EXPENSE',
  categoryId: '',
  splitType: 'MINE',
  paymentMethod: 'PIX',
  partnerId: '',
  customSplitPercentage: '50',
  totalInstallments: '1',
  cardId: '',
  date: new Date().toISOString().split('T')[0]
});

const filteredCategories = computed(() => categories.value.filter((category) => category.type === form.value.type));
const partnerName = computed(() => partners.value.find((partner) => partner._id === form.value.partnerId)?.name || 'parceiro(a)');
const showsPartnerSplit = computed(() => form.value.splitType === 'SHARED_50_50' || form.value.splitType === 'SHARED_CUSTOM');

const splitOptions = [
  { label: 'Só Meu', value: 'MINE' },
  { label: 'Só Dela', value: 'HERS' },
  { label: 'Dividido 50/50', value: 'SHARED_50_50' },
  { label: 'Personalizado', value: 'SHARED_CUSTOM' }
];

const paymentMethods = [
  { label: 'Pix', value: 'PIX', icon: '⚡' },
  { label: 'Cartão de Crédito', value: 'CREDIT_CARD', icon: '💳' },
  { label: 'Cartão de Débito', value: 'DEBIT', icon: '🏧' },
  { label: 'Dinheiro', value: 'CASH', icon: '💵' }
];

function categoryChipStyle(category: any) {
  const isSelected = form.value.categoryId === category._id;

  return {
    backgroundColor: isSelected ? category.color : `${category.color}1a`,
    borderColor: `${category.color}55`,
    color: isSelected ? '#fff' : category.color,
  };
}

function syncDefaultCategory() {
  if (filteredCategories.value.some((category) => category._id === form.value.categoryId)) {
    return;
  }

  form.value.categoryId = filteredCategories.value?.[0]?._id || '';
}

function parseAmountToCents(value: string) {
  return Math.round(Number(value) * 100);
}

async function loadCategories() {
  try {
    const { data } = await api.get('/categories');
    categories.value = Array.isArray(data) ? data : (data?.data || []);
    syncDefaultCategory();
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
  }
}

async function loadPartners() {
  try {
    const { data } = await api.get('/users/partners');
    partners.value = Array.isArray(data) ? data : [];
    form.value.partnerId = partners.value?.[0]?._id || '';
  } catch (error) {
    console.error('Erro ao carregar parceiro(a):', error);
  }
}

async function loadCards() {
  try {
    const { data } = await api.get('/cards');
    cards.value = Array.isArray(data) ? data : [];
    form.value.cardId = cards.value?.[0]?._id || '';
  } catch (error) {
    console.error('Erro ao carregar cartões:', error);
  }
}

async function processarIA() {
  if (!textoIA.value) return;
  try {
    errorMessage.value = '';
    const { data } = await api.post('/ai-parse', { text: textoIA.value });
    if (data?.description) form.value.description = data.description;
    if (data?.amount) form.value.amount = (data.amount / 100).toFixed(2);
    if (data?.type) form.value.type = data.type;
    if (data?.categoryId) form.value.categoryId = data.categoryId;
    if (data?.paymentMethod) form.value.paymentMethod = data.paymentMethod;
    if (data?.splitType) form.value.splitType = data.splitType;
  } catch (error) {
    errorMessage.value = 'Não consegui entender essa frase. Preencha manualmente.';
  }
}

async function save() {
  const amount = parseAmountToCents(form.value.amount);

  if (!form.value.description || !amount || !form.value.categoryId) {
    errorMessage.value = 'Preencha descrição, valor e categoria.';
    return;
  }

  try {
    saving.value = true;
    errorMessage.value = '';

    await api.post('/transactions', {
      description: form.value.description,
      amount,
      type: form.value.type,
      date: new Date(`${form.value.date}T00:00:00`),
      categoryId: form.value.categoryId,
      splitType: form.value.splitType,
      paymentMethod: form.value.paymentMethod,
      isRecurring: false,
      ...(showsPartnerSplit.value && form.value.partnerId ? { partnerId: form.value.partnerId } : {}),
      ...(form.value.splitType === 'SHARED_CUSTOM' ? { customSplitPercentage: Number(form.value.customSplitPercentage) } : {}),
      ...(form.value.paymentMethod === 'CREDIT_CARD' && Number(form.value.totalInstallments) > 1
        ? { totalInstallments: Number(form.value.totalInstallments) }
        : {}),
      ...(form.value.paymentMethod === 'CREDIT_CARD' && form.value.cardId ? { cardId: form.value.cardId } : {})
    });
    router.push('/transacoes');
  } catch (error) {
    errorMessage.value = 'Não foi possível salvar a transação.';
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  loadCategories();
  loadPartners();
  loadCards();
});

watch(() => form.value.type, () => {
  syncDefaultCategory();
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
