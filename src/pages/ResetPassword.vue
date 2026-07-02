<template>
  <main class="min-h-screen bg-black text-white flex items-center justify-center p-6">
    <section class="w-full max-w-sm space-y-8">
      <div>
        <p class="text-white/50 text-sm">SINC</p>
        <h1 class="text-3xl font-black mt-2">Nova senha</h1>
      </div>

      <form class="space-y-4" @submit.prevent="handleReset">
        <input
          v-model="password"
          type="password"
          placeholder="nova senha"
          class="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500"
        >

        <input
          v-model="confirmPassword"
          type="password"
          placeholder="confirme a senha"
          class="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500"
        >

        <p v-if="errorMessage" class="text-red-400 text-sm">{{ errorMessage }}</p>
        <p v-if="successMessage" class="text-green-400 text-sm">{{ successMessage }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-500 disabled:bg-blue-500/50 py-4 rounded-xl font-bold active:scale-95 transition-transform"
        >
          {{ loading ? 'Salvando...' : 'Salvar nova senha' }}
        </button>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/lib/supabase';

const router = useRouter();

const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

async function handleReset() {
  if (!password.value || password.value.length < 6) {
    errorMessage.value = 'A senha precisa ter pelo menos 6 caracteres.';
    return;
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'As senhas não coincidem.';
    return;
  }

  try {
    loading.value = true;
    errorMessage.value = '';

    const { error } = await supabase.auth.updateUser({ password: password.value });

    if (error) {
      throw error;
    }

    successMessage.value = 'Senha atualizada! Redirecionando...';
    setTimeout(() => router.push('/'), 1500);
  } catch (error: any) {
    errorMessage.value = error?.message || 'Não foi possível atualizar a senha.';
  } finally {
    loading.value = false;
  }
}
</script>
