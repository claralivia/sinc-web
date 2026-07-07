<template>
  <div class="pt-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ activeTab === 'goals' ? 'Metas' : 'Gastos Fixos' }}</h1>
      <button @click="activeTab === 'goals' ? toggleForm() : toggleRecurringForm()" class="p-2 rounded-full bg-white/5 text-white/60">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
      </button>
    </div>

    <div class="flex gap-2 bg-white/5 rounded-full p-1 border border-white/10">
      <button @click="activeTab = 'goals'" :class="activeTab === 'goals' ? 'bg-accent text-white' : 'text-white/50'" class="flex-1 py-2 rounded-full text-sm font-medium transition-colors">
        Metas
      </button>
      <button @click="activeTab = 'recurring'" :class="activeTab === 'recurring' ? 'bg-accent text-white' : 'text-white/50'" class="flex-1 py-2 rounded-full text-sm font-medium transition-colors">
        Gastos Fixos
      </button>
    </div>

    <div v-if="showForm && activeTab === 'goals'" class="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
      <AppInput v-model="goalForm.name" label="Nome" placeholder="Ex. Viagem" />
      <AppInput v-model="goalForm.icon" label="Ícone" placeholder="✈️" />

      <label class="block space-y-1.5">
        <span class="text-xs font-semibold text-white/40 uppercase tracking-wide">Cor</span>
        <div class="flex items-center gap-3">
          <span class="w-10 h-10 rounded-full border border-white/10 shrink-0" :style="{ backgroundColor: goalForm.color }" />
          <input v-model="goalForm.color" type="color" class="w-full h-10 bg-transparent rounded-xl cursor-pointer">
        </div>
      </label>

      <AppInput v-model="goalForm.targetAmount" type="number" label="Valor alvo" placeholder="5000.00" />

      <p v-if="errorMessage" class="text-critical text-sm">{{ errorMessage }}</p>

      <AppButton :loading="saving" @click="saveGoal">
        {{ goalForm._id ? 'Salvar meta' : 'Criar meta' }}
      </AppButton>
      <AppButton v-if="goalForm._id" variant="ghost" @click="resetForm">
        Cancelar edição
      </AppButton>
    </div>

    <template v-if="activeTab === 'goals'">
    <div v-if="!goals?.length" class="text-center text-white/50 py-10">
      Nenhuma meta criada ainda.
    </div>

    <div class="space-y-4">
      <GlassCard v-for="goal in goals" :key="goal._id">
        <div class="flex items-center justify-between mb-3 gap-2">
          <div class="flex items-center gap-3 min-w-0">
            <span class="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0" :style="{ backgroundColor: goal.color + '33' }">
              {{ goal.icon }}
            </span>
            <div class="min-w-0">
              <p class="font-bold truncate">{{ goal.name }}</p>
              <p class="text-xs text-white/50 truncate">
                R$ {{ formatAmount(goal.currentAmount) }} de R$ {{ formatAmount(goal.targetAmount) }}
              </p>
            </div>
          </div>
          <div class="flex gap-2 shrink-0">
            <button @click="editGoal(goal)" class="p-2 rounded-full bg-white/10">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4H4v16h16v-7M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button @click="removeGoal(goal._id)" class="p-2 rounded-full bg-critical/20 text-critical">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.9 12.1A2 2 0 0116.1 21H7.9a2 2 0 01-2-1.9L5 7m5 4v6m4-6v6M9 7V4h6v3m-8 0h10"></path>
              </svg>
            </button>
          </div>
        </div>

        <div class="w-full bg-white/10 rounded-full h-2 overflow-hidden mb-1">
          <div class="h-full rounded-full transition-all" :style="{ width: progressPercent(goal) + '%', backgroundColor: goal.color }" />
        </div>
        <p class="text-xs text-white/40 mb-3">{{ progressPercent(goal) }}% da meta</p>

        <div class="space-y-2">
          <input
            v-model="contributionAmounts[goal._id]"
            type="number"
            placeholder="0.00"
            class="w-full min-w-0 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-accent transition-colors"
          >
          <div class="flex gap-2">
            <button @click="contribute(goal, 1)" class="flex-1 min-w-0 py-2 rounded-xl bg-good/20 text-good font-bold text-sm active:scale-95 transition-transform">
              Guardar
            </button>
            <button @click="contribute(goal, -1)" class="flex-1 min-w-0 py-2 rounded-xl bg-critical/20 text-critical font-bold text-sm active:scale-95 transition-transform">
              Retirar
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
    </template>

    <template v-if="activeTab === 'recurring'">
      <div v-if="showRecurringForm" class="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
        <AppInput v-model="recurringForm.description" label="Descrição" placeholder="Ex. Netflix" />
        <AppInput v-model="recurringForm.amount" type="number" label="Valor" placeholder="44.90" />

        <div class="space-y-2">
          <label class="text-xs font-semibold text-white/40 uppercase tracking-wide">Categoria</label>
          <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              v-for="cat in expenseCategories"
              :key="cat._id"
              @click="recurringForm.categoryId = cat._id"
              :style="chipStyle(cat.color, recurringForm.categoryId === cat._id)"
              class="px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors border flex items-center gap-1.5"
            >
              <span>{{ cat.icon }}</span>
              <span>{{ cat.name }}</span>
            </button>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-xs font-semibold text-white/40 uppercase tracking-wide">Método de Pagamento</label>
          <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              v-for="method in paymentMethods"
              :key="method.value"
              @click="recurringForm.paymentMethod = method.value"
              :class="recurringForm.paymentMethod === method.value ? 'bg-accent text-white' : 'bg-white/5 text-white/60'"
              class="px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              <span>{{ method.icon }}</span>
              <span>{{ method.label }}</span>
            </button>
          </div>
        </div>

        <div v-if="recurringForm.paymentMethod === 'CREDIT_CARD' && cards?.length" class="space-y-2">
          <label class="text-xs font-semibold text-white/40 uppercase tracking-wide">Cartão</label>
          <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              v-for="card in cards"
              :key="card._id"
              @click="recurringForm.cardId = card._id"
              :style="chipStyle(card.color, recurringForm.cardId === card._id)"
              class="px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors border flex items-center gap-1.5"
            >
              <span>💳</span>
              <span>{{ card.name }}</span>
            </button>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-xs font-semibold text-white/40 uppercase tracking-wide">Divisão</label>
          <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              v-for="split in splitOptions"
              :key="split.value"
              @click="recurringForm.splitType = split.value"
              :class="recurringForm.splitType === split.value ? 'bg-accent text-white' : 'bg-white/5 text-white/60'"
              class="px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors"
            >
              {{ split.label }}
            </button>
          </div>

          <div v-if="recurringForm.splitType === 'HERS' || recurringForm.splitType === 'SHARED_50_50' || recurringForm.splitType === 'SHARED_CUSTOM'" class="pt-2 space-y-3">
            <label class="text-xs font-semibold text-white/40 uppercase tracking-wide">Dividido com</label>
            <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                v-for="partner in partners"
                :key="partner._id"
                @click="recurringForm.owedBy = partner._id"
                :class="recurringForm.owedBy === partner._id ? 'bg-accent text-white' : 'bg-white/5 text-white/60'"
                class="px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors"
              >
                {{ partner.name }}
              </button>
            </div>
            <AppInput
              v-if="recurringForm.splitType === 'SHARED_CUSTOM'"
              v-model="recurringForm.customSplitPercentage"
              type="number"
              :label="`Porcentagem de ${partnerName}`"
              placeholder="50"
            />
          </div>
        </div>

        <AppInput v-model="recurringForm.dueDay" type="number" label="Dia de vencimento" placeholder="5" />

        <p v-if="recurringErrorMessage" class="text-critical text-sm">{{ recurringErrorMessage }}</p>

        <AppButton :loading="savingRecurring" @click="saveRecurring">
          {{ recurringForm._id ? 'Salvar gasto fixo' : 'Criar gasto fixo' }}
        </AppButton>
        <AppButton v-if="recurringForm._id" variant="ghost" @click="resetRecurringForm">
          Cancelar edição
        </AppButton>
      </div>

      <GlassCard v-if="recurringExpenses?.length">
        <p class="text-white/60 text-sm">Total de gastos fixos por mês</p>
        <h2 class="text-3xl font-black mt-1">R$ {{ formatAmount(totalRecurring) }}</h2>
      </GlassCard>

      <div v-if="!recurringExpenses?.length" class="text-center text-white/50 py-10">
        Nenhum gasto fixo cadastrado ainda.
      </div>

      <div class="space-y-3">
        <article v-for="expense in recurringExpenses" :key="expense._id" class="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-3 min-w-0">
              <span class="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0" :style="{ backgroundColor: (expense.categoryId?.color || '#898781') + '26' }">
                {{ expense.categoryId?.icon || '❔' }}
              </span>
              <div class="min-w-0">
                <p class="font-bold truncate">{{ expense.description }}</p>
                <p class="text-xs text-white/50 truncate">R$ {{ formatAmount(expense.amount) }} · todo dia {{ expense.dueDay }}</p>
              </div>
            </div>
            <div class="flex gap-2 shrink-0">
              <button @click="editRecurring(expense)" class="p-2 rounded-full bg-white/10">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4H4v16h16v-7M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button @click="removeRecurring(expense._id)" class="p-2 rounded-full bg-critical/20 text-critical">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.9 12.1A2 2 0 0116.1 21H7.9a2 2 0 01-2-1.9L5 7m5 4v6m4-6v6M9 7V4h6v3m-8 0h10"></path>
                </svg>
              </button>
            </div>
          </div>

          <div v-if="expense.paid" class="flex items-center gap-2 text-good text-sm font-medium">
            <span>✓</span> Pago este mês
          </div>
          <AppButton v-else :loading="launchingId === expense._id" @click="launchRecurring(expense._id)">
            Lançar esse mês
          </AppButton>
        </article>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import api from '@/lib/api';
import GlassCard from '@/components/ui/GlassCard.vue';
import AppInput from '@/components/ui/AppInput.vue';
import AppButton from '@/components/ui/AppButton.vue';

const activeTab = ref<'goals' | 'recurring'>('goals');

const goals = ref<any[]>([]);
const showForm = ref(false);
const saving = ref(false);
const errorMessage = ref('');
const contributionAmounts = reactive<Record<string, string>>({});

const categories = ref<any[]>([]);
const cards = ref<any[]>([]);
const partners = ref<any[]>([]);
const recurringExpenses = ref<any[]>([]);
const showRecurringForm = ref(false);
const savingRecurring = ref(false);
const recurringErrorMessage = ref('');
const launchingId = ref('');

const expenseCategories = computed(() => categories.value.filter((category) => category.type === 'EXPENSE'));
const partnerName = computed(() => partners.value.find((partner) => partner._id === recurringForm.value.owedBy)?.name || 'parceiro(a)');
const totalRecurring = computed(() => recurringExpenses.value.reduce((sum, expense) => sum + (expense.amount || 0), 0));

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

const recurringForm = ref({
  _id: '',
  description: '',
  amount: '',
  categoryId: '',
  paymentMethod: 'PIX',
  cardId: '',
  splitType: 'MINE',
  owedBy: '',
  customSplitPercentage: '50',
  dueDay: '',
});

function chipStyle(color: string, isSelected: boolean) {
  return {
    backgroundColor: isSelected ? color : `${color}1a`,
    borderColor: `${color}55`,
    color: isSelected ? '#fff' : color,
  };
}

const goalForm = ref({
  _id: '',
  name: '',
  icon: '',
  color: '#5E5CE6',
  targetAmount: '',
});

function formatAmount(amountInCents: number) {
  return ((amountInCents || 0) / 100).toFixed(2);
}

function progressPercent(goal: any) {
  if (!goal?.targetAmount) return 0;
  return Math.min(100, Math.round(((goal.currentAmount || 0) / goal.targetAmount) * 100));
}

function toggleForm() {
  showForm.value = !showForm.value;
}

function resetForm() {
  goalForm.value = { _id: '', name: '', icon: '', color: '#5E5CE6', targetAmount: '' };
  showForm.value = false;
}

function editGoal(goal: any) {
  goalForm.value = {
    _id: goal._id,
    name: goal.name,
    icon: goal.icon,
    color: goal.color,
    targetAmount: (goal.targetAmount / 100).toFixed(2),
  };
  showForm.value = true;
}

async function loadGoals() {
  try {
    const { data } = await api.get('/goals');
    goals.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erro ao carregar metas:', error);
  }
}

async function saveGoal() {
  const targetAmount = Math.round(Number(goalForm.value.targetAmount) * 100);

  if (!goalForm.value.name || !goalForm.value.icon || !targetAmount) {
    errorMessage.value = 'Preencha nome, ícone e valor alvo.';
    return;
  }

  const payload = {
    name: goalForm.value.name,
    icon: goalForm.value.icon,
    color: goalForm.value.color,
    targetAmount,
  };

  try {
    saving.value = true;
    errorMessage.value = '';

    if (goalForm.value._id) {
      await api.put(`/goals/${goalForm.value._id}`, payload);
    } else {
      await api.post('/goals', payload);
    }

    await loadGoals();
    resetForm();
  } catch (error) {
    errorMessage.value = 'Não foi possível salvar a meta.';
  } finally {
    saving.value = false;
  }
}

async function removeGoal(id: string) {
  await api.delete(`/goals/${id}`);
  await loadGoals();
}

async function contribute(goal: any, direction: 1 | -1) {
  const rawAmount = Number(contributionAmounts[goal._id]);

  if (!rawAmount) return;

  try {
    await api.post(`/goals/${goal._id}/contribute`, {
      amount: Math.round(rawAmount * 100) * direction,
    });
    contributionAmounts[goal._id] = '';
    await loadGoals();
  } catch (error) {
    console.error('Erro ao movimentar meta:', error);
  }
}

async function loadFormOptions() {
  try {
    const [categoriesResponse, cardsResponse, partnersResponse] = await Promise.all([
      api.get('/categories'),
      api.get('/cards'),
      api.get('/users/partners'),
    ]);

    categories.value = categoriesResponse.data || [];
    cards.value = cardsResponse.data || [];
    partners.value = partnersResponse.data || [];
    recurringForm.value.owedBy = partners.value?.[0]?._id || '';
  } catch (error) {
    console.error('Erro ao carregar opções do formulário:', error);
  }
}

function currentMonthRange() {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  return { startDate, endDate };
}

async function loadRecurringExpenses() {
  try {
    const { startDate, endDate } = currentMonthRange();
    const { data } = await api.get('/recurring-expenses', { params: { startDate, endDate } });
    recurringExpenses.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erro ao carregar gastos fixos:', error);
  }
}

function toggleRecurringForm() {
  showRecurringForm.value = !showRecurringForm.value;
}

function resetRecurringForm() {
  recurringForm.value = {
    _id: '',
    description: '',
    amount: '',
    categoryId: '',
    paymentMethod: 'PIX',
    cardId: '',
    splitType: 'MINE',
    owedBy: partners.value?.[0]?._id || '',
    customSplitPercentage: '50',
    dueDay: '',
  };
  showRecurringForm.value = false;
}

function editRecurring(expense: any) {
  recurringForm.value = {
    _id: expense._id,
    description: expense.description,
    amount: (expense.amount / 100).toFixed(2),
    categoryId: expense.categoryId?._id || '',
    paymentMethod: expense.paymentMethod,
    cardId: expense.cardId?._id || '',
    splitType: expense.splitType,
    owedBy: expense.owedBy?._id || partners.value?.[0]?._id || '',
    customSplitPercentage: String(expense.customSplitPercentage || 50),
    dueDay: String(expense.dueDay),
  };
  showRecurringForm.value = true;
}

async function saveRecurring() {
  const amount = Math.round(Number(recurringForm.value.amount) * 100);
  const dueDay = Number(recurringForm.value.dueDay);

  if (!recurringForm.value.description || !amount || !recurringForm.value.categoryId || !dueDay) {
    recurringErrorMessage.value = 'Preencha descrição, valor, categoria e dia de vencimento.';
    return;
  }

  const isShared = recurringForm.value.splitType === 'HERS' || recurringForm.value.splitType === 'SHARED_50_50' || recurringForm.value.splitType === 'SHARED_CUSTOM';

  const payload = {
    description: recurringForm.value.description,
    amount,
    categoryId: recurringForm.value.categoryId,
    paymentMethod: recurringForm.value.paymentMethod,
    cardId: recurringForm.value.paymentMethod === 'CREDIT_CARD' ? recurringForm.value.cardId : undefined,
    splitType: recurringForm.value.splitType,
    owedBy: isShared ? recurringForm.value.owedBy : undefined,
    customSplitPercentage: recurringForm.value.splitType === 'SHARED_CUSTOM' ? Number(recurringForm.value.customSplitPercentage) : undefined,
    dueDay,
  };

  try {
    savingRecurring.value = true;
    recurringErrorMessage.value = '';

    if (recurringForm.value._id) {
      await api.put(`/recurring-expenses/${recurringForm.value._id}`, payload);
    } else {
      await api.post('/recurring-expenses', payload);
    }

    await loadRecurringExpenses();
    resetRecurringForm();
  } catch (error) {
    recurringErrorMessage.value = 'Não foi possível salvar o gasto fixo.';
  } finally {
    savingRecurring.value = false;
  }
}

async function removeRecurring(id: string) {
  await api.delete(`/recurring-expenses/${id}`);
  await loadRecurringExpenses();
}

async function launchRecurring(id: string) {
  try {
    launchingId.value = id;
    await api.post(`/recurring-expenses/${id}/launch`);
    await loadRecurringExpenses();
  } catch (error) {
    console.error('Erro ao lançar gasto fixo:', error);
  } finally {
    launchingId.value = '';
  }
}

onMounted(() => {
  loadGoals();
  loadFormOptions();
  loadRecurringExpenses();
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
