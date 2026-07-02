<template>
  <main class="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
    <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

    <section class="w-full max-w-sm space-y-8 relative">
      <div class="flex flex-col items-center text-center space-y-4">
        <img src="/favicon.svg" alt="SINC" class="w-16 h-16 rounded-2xl shadow-lg shadow-accent/30">
        <div>
          <h1 class="text-3xl font-black">SINC</h1>
          <p class="text-white/50 text-sm mt-1">Suas finanças, em sintonia</p>
        </div>
      </div>

      <form v-if="!showReset" class="space-y-5" @submit.prevent="handleLogin">
        <AppInput v-model="email" type="email" label="E-mail" placeholder="voce@email.com" />
        <AppInput v-model="password" type="password" label="Senha" placeholder="••••••••" />

        <p v-if="errorMessage" class="text-critical text-sm">{{ errorMessage }}</p>

        <AppButton type="submit" :loading="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </AppButton>

        <button type="button" @click="openReset" class="w-full text-center text-sm text-white/50 hover:text-white transition-colors">
          Esqueceu a senha?
        </button>
      </form>

      <form v-else class="space-y-5" @submit.prevent="handleSendReset">
        <p class="text-sm text-white/50 text-center">Informe seu e-mail e enviaremos um link para redefinir a senha.</p>
        <AppInput v-model="email" type="email" label="E-mail" placeholder="voce@email.com" />

        <p v-if="errorMessage" class="text-critical text-sm">{{ errorMessage }}</p>
        <p v-if="successMessage" class="text-good text-sm">{{ successMessage }}</p>

        <AppButton type="submit" :loading="sendingReset">
          {{ sendingReset ? 'Enviando...' : 'Enviar link de recuperação' }}
        </AppButton>

        <button type="button" @click="closeReset" class="w-full text-center text-sm text-white/50 hover:text-white transition-colors">
          Voltar para o login
        </button>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';
import AppInput from '@/components/ui/AppInput.vue';
import AppButton from '@/components/ui/AppButton.vue';

const router = useRouter();
const auth = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const showReset = ref(false);
const sendingReset = ref(false);

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

function openReset() {
  errorMessage.value = '';
  successMessage.value = '';
  showReset.value = true;
}

function closeReset() {
  errorMessage.value = '';
  successMessage.value = '';
  showReset.value = false;
}

async function handleSendReset() {
  if (!email.value) {
    errorMessage.value = 'Informe seu e-mail.';
    return;
  }

  try {
    sendingReset.value = true;
    errorMessage.value = '';
    successMessage.value = '';

    const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw error;
    }

    successMessage.value = 'Link enviado! Confira seu e-mail.';
  } catch (error: any) {
    errorMessage.value = error?.message || 'Não foi possível enviar o link.';
  } finally {
    sendingReset.value = false;
  }
}
</script>
