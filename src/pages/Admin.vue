<template>
  <div class="pt-6 space-y-8">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Admin</h1>
      <button @click="loadData" class="text-white/60 p-2 rounded-full bg-white/5">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v6h6M20 20v-6h-6M5 19A9 9 0 0019 5M19 5h-5m5 0v5"></path>
        </svg>
      </button>
    </div>

    <section class="space-y-4">
      <h2 class="text-lg font-bold">Categorias</h2>

      <div class="space-y-4 bg-white/5 border border-white/10 rounded-2xl p-4">
        <AppInput v-model="categoryForm.name" label="Nome" placeholder="Ex. Alimentação" />
        <AppInput v-model="categoryForm.icon" label="Ícone" placeholder="🍔" />

        <label class="block space-y-1.5">
          <span class="text-xs font-semibold text-white/40 uppercase tracking-wide">Cor</span>
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-full border border-white/10 shrink-0" :style="{ backgroundColor: categoryForm.color }" />
            <input v-model="categoryForm.color" type="color" class="w-full h-10 bg-transparent rounded-xl cursor-pointer">
          </div>
        </label>

        <div class="flex gap-2 overflow-x-auto pb-1">
          <button
            v-for="type in categoryTypes"
            :key="type.value"
            @click="categoryForm.type = type.value"
            :class="categoryForm.type === type.value ? type.activeClass : 'bg-white/5 text-white/60'"
            class="px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium"
          >
            {{ type.label }}
          </button>
        </div>

        <p v-if="errorMessage" class="text-critical text-sm">{{ errorMessage }}</p>

        <AppButton :loading="saving" @click="saveCategory">
          {{ categoryForm._id ? 'Salvar categoria' : 'Criar categoria' }}
        </AppButton>
        <AppButton v-if="categoryForm._id" variant="ghost" @click="resetCategoryForm">
          Cancelar edição
        </AppButton>
      </div>

      <div class="space-y-3">
        <article v-for="category in categories" :key="category._id" class="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <span class="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0" :style="{ backgroundColor: category.color + '33' }">{{ category.icon }}</span>
            <div class="min-w-0">
              <p class="font-bold truncate">{{ category.name }}</p>
              <p class="text-xs text-white/50 truncate">{{ category.type === 'INCOME' ? 'Receita' : 'Despesa' }}</p>
            </div>
          </div>
          <div class="flex gap-2 shrink-0">
            <button @click="editCategory(category)" class="p-2 rounded-full bg-white/10">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4H4v16h16v-7M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button @click="deleteCategory(category._id)" class="p-2 rounded-full bg-critical/20 text-critical">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.9 12.1A2 2 0 0116.1 21H7.9a2 2 0 01-2-1.9L5 7m5 4v6m4-6v6M9 7V4h6v3m-8 0h10"></path>
              </svg>
            </button>
          </div>
        </article>
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-lg font-bold">Cartões</h2>

      <div class="space-y-4 bg-white/5 border border-white/10 rounded-2xl p-4">
        <AppInput v-model="cardForm.name" label="Nome" placeholder="Ex. Nubank" />
        <AppInput v-model="cardForm.brand" label="Bandeira" placeholder="Visa, Mastercard..." />
        <AppInput v-model="cardForm.logoUrl" label="URL da logo (opcional)" placeholder="https://..." />

        <label class="block space-y-1.5">
          <span class="text-xs font-semibold text-white/40 uppercase tracking-wide">Cor</span>
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-full border border-white/10 shrink-0 overflow-hidden flex items-center justify-center" :style="{ backgroundColor: cardForm.color }">
              <img v-if="cardForm.logoUrl" :src="cardForm.logoUrl" class="w-full h-full object-cover" alt="">
            </span>
            <input v-model="cardForm.color" type="color" class="w-full h-10 bg-transparent rounded-xl cursor-pointer">
          </div>
        </label>

        <AppInput v-model="cardForm.limit" type="number" label="Limite" placeholder="5000.00" />

        <div class="grid grid-cols-2 gap-3">
          <AppInput v-model="cardForm.closingDay" type="number" label="Dia de fechamento" placeholder="10" />
          <AppInput v-model="cardForm.dueDay" type="number" label="Dia de vencimento" placeholder="17" />
        </div>

        <p v-if="cardErrorMessage" class="text-critical text-sm">{{ cardErrorMessage }}</p>

        <AppButton :loading="savingCard" @click="saveCard">
          {{ cardForm._id ? 'Salvar cartão' : 'Criar cartão' }}
        </AppButton>
        <AppButton v-if="cardForm._id" variant="ghost" @click="resetCardForm">
          Cancelar edição
        </AppButton>
      </div>

      <div class="space-y-3">
        <article v-for="card in cards" :key="card._id" class="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <span class="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 overflow-hidden" :style="{ backgroundColor: card.color + '33' }">
              <img v-if="card.logoUrl" :src="card.logoUrl" class="w-full h-full object-cover" alt="">
              <span v-else>💳</span>
            </span>
            <div class="min-w-0">
              <p class="font-bold truncate">{{ card.name }}</p>
              <p class="text-xs text-white/50 truncate">{{ card.brand }} · fecha dia {{ card.closingDay }}, vence dia {{ card.dueDay }}</p>
            </div>
          </div>
          <div class="flex gap-2 shrink-0">
            <button @click="editCard(card)" class="p-2 rounded-full bg-white/10">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4H4v16h16v-7M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button @click="deleteCard(card._id)" class="p-2 rounded-full bg-critical/20 text-critical">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.9 12.1A2 2 0 0116.1 21H7.9a2 2 0 01-2-1.9L5 7m5 4v6m4-6v6M9 7V4h6v3m-8 0h10"></path>
              </svg>
            </button>
          </div>
        </article>
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-lg font-bold">Usuários</h2>
      <article v-for="user in users" :key="user._id" class="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
        <div>
          <p class="font-bold">{{ user.name }}</p>
          <p class="text-xs text-white/50">{{ user.email }}</p>
        </div>
        <div class="flex gap-2 overflow-x-auto">
          <button
            v-for="role in roles"
            :key="role"
            @click="updateUserRole(user, role)"
            :class="user.role === role ? 'bg-accent text-white' : 'bg-white/5 text-white/60'"
            class="px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium"
          >
            {{ role }}
          </button>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import api from '@/lib/api';
import AppInput from '@/components/ui/AppInput.vue';
import AppButton from '@/components/ui/AppButton.vue';

const categories = ref<any[]>([]);
const cards = ref<any[]>([]);
const users = ref<any[]>([]);
const roles = ['USER', 'ADMIN'];
const saving = ref(false);
const errorMessage = ref('');
const savingCard = ref(false);
const cardErrorMessage = ref('');
const categoryTypes = [
  { label: 'Despesa', value: 'EXPENSE', activeClass: 'bg-critical text-white' },
  { label: 'Receita', value: 'INCOME', activeClass: 'bg-good text-white' },
];

const categoryForm = ref({
  _id: '',
  name: '',
  icon: '',
  color: '#5E5CE6',
  type: 'EXPENSE',
});

const cardForm = ref({
  _id: '',
  name: '',
  brand: '',
  logoUrl: '',
  color: '#5E5CE6',
  limit: '',
  closingDay: '',
  dueDay: '',
});

async function loadData() {
  const [categoriesResponse, cardsResponse, usersResponse] = await Promise.all([
    api.get('/categories'),
    api.get('/cards'),
    api.get('/users'),
  ]);

  categories.value = categoriesResponse.data || [];
  cards.value = cardsResponse.data || [];
  users.value = usersResponse.data || [];
}

function resetCategoryForm() {
  categoryForm.value = {
    _id: '',
    name: '',
    icon: '',
    color: '#5E5CE6',
    type: 'EXPENSE',
  };
}

function editCategory(category: any) {
  categoryForm.value = {
    _id: category._id,
    name: category.name,
    icon: category.icon,
    color: category.color,
    type: category.type,
  };
}

async function saveCategory() {
  if (!categoryForm.value.name || !categoryForm.value.icon || !categoryForm.value.color) {
    errorMessage.value = 'Preencha nome, ícone e cor.';
    return;
  }

  const payload = {
    name: categoryForm.value.name,
    icon: categoryForm.value.icon,
    color: categoryForm.value.color,
    type: categoryForm.value.type,
  };

  try {
    saving.value = true;
    errorMessage.value = '';

    if (categoryForm.value._id) {
      await api.put(`/categories/${categoryForm.value._id}`, payload);
    } else {
      await api.post('/categories', payload);
    }

    await loadData();
    resetCategoryForm();
  } catch (error) {
    errorMessage.value = 'Não foi possível salvar a categoria.';
  } finally {
    saving.value = false;
  }
}

async function deleteCategory(id: string) {
  await api.delete(`/categories/${id}`);
  await loadData();
}

function resetCardForm() {
  cardForm.value = { _id: '', name: '', brand: '', logoUrl: '', color: '#5E5CE6', limit: '', closingDay: '', dueDay: '' };
}

function editCard(card: any) {
  cardForm.value = {
    _id: card._id,
    name: card.name,
    brand: card.brand,
    logoUrl: card.logoUrl || '',
    color: card.color,
    limit: (card.limit / 100).toFixed(2),
    closingDay: String(card.closingDay),
    dueDay: String(card.dueDay),
  };
}

async function saveCard() {
  const limit = Math.round(Number(cardForm.value.limit) * 100);
  const closingDay = Number(cardForm.value.closingDay);
  const dueDay = Number(cardForm.value.dueDay);

  if (!cardForm.value.name || !cardForm.value.brand || !limit || !closingDay || !dueDay) {
    cardErrorMessage.value = 'Preencha nome, bandeira, limite, fechamento e vencimento.';
    return;
  }

  const payload = {
    name: cardForm.value.name,
    brand: cardForm.value.brand,
    logoUrl: cardForm.value.logoUrl || undefined,
    color: cardForm.value.color,
    limit,
    closingDay,
    dueDay,
  };

  try {
    savingCard.value = true;
    cardErrorMessage.value = '';

    if (cardForm.value._id) {
      await api.put(`/cards/${cardForm.value._id}`, payload);
    } else {
      await api.post('/cards', payload);
    }

    await loadData();
    resetCardForm();
  } catch (error) {
    cardErrorMessage.value = 'Não foi possível salvar o cartão.';
  } finally {
    savingCard.value = false;
  }
}

async function deleteCard(id: string) {
  await api.delete(`/cards/${id}`);
  await loadData();
}

async function updateUserRole(user: any, role: string) {
  if (user.role === role) {
    return;
  }

  await api.put(`/users/${user._id}`, { role });
  await loadData();
}

onMounted(loadData);
</script>
