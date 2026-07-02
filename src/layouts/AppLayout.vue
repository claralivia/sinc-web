<template>
  <div class="min-h-screen bg-black text-white" style="padding-bottom: calc(6rem + env(safe-area-inset-bottom))">
    <main class="p-4 max-w-md mx-auto">
      <router-view />
    </main>

    <nav
      class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-glass-medium border-t border-x border-white/10 backdrop-blur-apple z-50 sm:rounded-t-3xl"
      style="padding-bottom: env(safe-area-inset-bottom)"
    >
      <div class="flex justify-around items-center h-20">
        <button
          @click="$router.push('/')"
          :class="$route.path === '/' ? 'text-accent' : 'text-white/50'"
          class="flex flex-col items-center transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          <span class="text-[10px] mt-1 font-medium">Início</span>
        </button>

        <button
          @click="$router.push('/transacoes')"
          :class="$route.path === '/transacoes' ? 'text-accent' : 'text-white/50'"
          class="flex flex-col items-center transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
          <span class="text-[10px] mt-1 font-medium">Transações</span>
        </button>

        <button
          @click="$router.push('/nova-transacao')"
          class="w-14 h-14 bg-accent rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform -mt-10 border-4 border-black shrink-0"
        >
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
        </button>

        <button
          @click="$router.push('/metas')"
          :class="$route.path === '/metas' ? 'text-accent' : 'text-white/50'"
          class="flex flex-col items-center transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.5-3.5a9 9 0 11-15.9-5.6M21 3v4h-4"></path>
          </svg>
          <span class="text-[10px] mt-1 font-medium">Metas</span>
        </button>

        <button
          v-if="auth.isAdmin"
          @click="$router.push('/admin')"
          :class="$route.path === '/admin' ? 'text-accent' : 'text-white/50'"
          class="flex flex-col items-center transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m12 14a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
          </svg>
          <span class="text-[10px] mt-1 font-medium">Admin</span>
        </button>

        <button
          @click="logout"
          class="flex flex-col items-center text-white/50 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H9m4 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          <span class="text-[10px] mt-1 font-medium">Sair</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const auth = useAuthStore();

async function logout() {
  await auth.logout();
  router.push('/login');
}
</script>
