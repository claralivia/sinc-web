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

      <div class="space-y-3 bg-white/5 border border-white/10 rounded-xl p-4">
        <input v-model="categoryForm.name" placeholder="Nome" class="w-full bg-transparent border-b border-white/20 p-2 outline-none focus:border-blue-500">
        <input v-model="categoryForm.icon" placeholder="Ícone SVG/texto curto" class="w-full bg-transparent border-b border-white/20 p-2 outline-none focus:border-blue-500">
        <input v-model="categoryForm.color" placeholder="#3b82f6" class="w-full bg-transparent border-b border-white/20 p-2 outline-none focus:border-blue-500">

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

        <button @click="saveCategory" class="w-full bg-blue-500 rounded-xl py-3 font-bold">
          {{ categoryForm._id ? 'Salvar categoria' : 'Criar categoria' }}
        </button>
      </div>

      <div class="space-y-3">
        <article v-for="category in categories" :key="category._id" class="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-3">
          <div>
            <p class="font-bold">{{ category.icon }} {{ category.name }}</p>
            <p class="text-xs text-white/50">{{ category.type }} · {{ category.color }}</p>
          </div>
          <div class="flex gap-2">
            <button @click="editCategory(category)" class="p-2 rounded-full bg-white/10">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4H4v16h16v-7M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button @click="deleteCategory(category._id)" class="p-2 rounded-full bg-red-500/20 text-red-400">
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
      <article v-for="user in users" :key="user._id" class="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <div>
          <p class="font-bold">{{ user.name }}</p>
          <p class="text-xs text-white/50">{{ user.email }}</p>
        </div>
        <div class="flex gap-2 overflow-x-auto">
          <button
            v-for="role in roles"
            :key="role"
            @click="updateUserRole(user, role)"
            :class="user.role === role ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/60'"
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

const categories = ref<any[]>([]);
const users = ref<any[]>([]);
const roles = ['USER', 'ADMIN'];
const categoryTypes = [
  { label: 'Despesa', value: 'EXPENSE', activeClass: 'bg-red-500 text-white' },
  { label: 'Receita', value: 'INCOME', activeClass: 'bg-green-500 text-white' },
];

const categoryForm = ref({
  _id: '',
  name: '',
  icon: '',
  color: '#3b82f6',
  type: 'EXPENSE',
});

async function loadData() {
  const [categoriesResponse, usersResponse] = await Promise.all([
    api.get('/categories'),
    api.get('/users'),
  ]);

  categories.value = categoriesResponse.data || [];
  users.value = usersResponse.data || [];
}

function resetCategoryForm() {
  categoryForm.value = {
    _id: '',
    name: '',
    icon: '',
    color: '#3b82f6',
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
    return;
  }

  const payload = {
    name: categoryForm.value.name,
    icon: categoryForm.value.icon,
    color: categoryForm.value.color,
    type: categoryForm.value.type,
  };

  if (categoryForm.value._id) {
    await api.put(`/categories/${categoryForm.value._id}`, payload);
    await loadData();
    resetCategoryForm();
    return;
  }

  await api.post('/categories', payload);
  await loadData();
  resetCategoryForm();
}

async function deleteCategory(id: string) {
  await api.delete(`/categories/${id}`);
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
