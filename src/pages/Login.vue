<template>
  <main class="min-h-screen bg-black text-white flex items-center justify-center p-6">
    <section class="w-full max-w-sm space-y-8">
      <div>
        <p class="text-white/50 text-sm">SINC</p>
        <h1 class="text-3xl font-black mt-2">Entrar</h1>
      </div>

      <form class="space-y-4" @submit.prevent="handleLogin">
        <input
          v-model="email"
          type="email"
          placeholder="email"
          class="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500"
        >

        <input
          v-model="password"
          type="password"
          placeholder="senha"
          class="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500"
        >

        <p v-if="errorMessage" class="text-red-400 text-sm">{{ errorMessage }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-500 disabled:bg-blue-500/50 py-4 rounded-xl font-bold active:scale-95 transition-transform"
        >
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const auth = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');

async function handleLogin() {
  if (!email.value || !password.value) {
    errorMessage.value = 'Informe email e senha.';
    return;
  }

  try {
    loading.value = true;
    errorMessage.value = '';
    await auth.login(email.value, password.value);
    router.push('/');
  } catch (error: any) {
    errorMessage.value = error?.message || 'Não foi possível entrar.';
  } finally {
    loading.value = false;
  }
}
</script>
