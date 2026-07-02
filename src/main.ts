import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import VueApexCharts from 'vue3-apexcharts';
import { supabase } from './lib/supabase';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(VueApexCharts);
app.mount('#app');

router.isReady().then(() => {
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      router.push('/reset-password');
    }
  });
});