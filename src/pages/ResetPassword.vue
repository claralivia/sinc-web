<template>
  <main class="min-h-screen bg-black text-white flex items-center justify-center p-6">
    <section class="w-full max-w-sm space-y-8">
      <div>
        <p class="text-white/50 text-sm">SINC</p>
        <h1 class="text-3xl font-black mt-2">Nova senha</h1>
      </div>

      <form class="space-y-5" @submit.prevent="handleReset">
        <AppInput v-model="password" type="password" label="Nova senha" placeholder="••••••••" />
        <AppInput v-model="confirmPassword" type="password" label="Confirme a senha" placeholder="••••••••" />

        <p v-if="errorMessage" class="text-critical text-sm">{{ errorMessage }}</p>
        <p v-if="successMessage" class="text-good text-sm">{{ successMessage }}</p>

        <AppButton type="submit" :loading="loading">
          {{ loading ? 'Salvando...' : 'Salvar nova senha' }}
        </AppButton>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/lib/supabase';
import AppInput from '@/components/ui/AppInput.vue';
import AppButton from '@/components/ui/AppButton.vue';

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
