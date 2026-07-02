<template>
  <div class="min-h-screen bg-black text-white pb-24">
    <main class="p-4">
      <router-view />
    </main>

    <nav class="fixed bottom-0 w-full bg-glass-medium border-t border-white/10 backdrop-blur-apple z-50">
      <div class="flex justify-around items-center h-20">
        <button 
          @click="$router.push('/')" 
          :class="$route.path === '/' ? 'text-blue-500' : 'text-white/50'"
          class="flex flex-col items-center transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          <span class="text-[10px] mt-1 font-medium">Início</span>
        </button>
        
        <button 
          @click="$router.push('/nova-transacao')" 
          class="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform -mt-10 border-4 border-black"
        >
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
        </button>

        <button 
          @click="$router.push('/transacoes')" 
          :class="$route.path === '/transacoes' ? 'text-blue-500' : 'text-white/50'"
          class="flex flex-col items-center transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
          <span class="text-[10px] mt-1 font-medium">Transações</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
</script>