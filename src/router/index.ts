import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '../layouts/AppLayout.vue';
import Dashboard from '@/pages/Dashboard.vue';
import NewTransaction from '../pages/NewTransaction.vue';
import Transactions from '@/pages/Transactions.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        { path: '', component: Dashboard },
        { path: 'nova-transacao', component: NewTransaction },
        { path: 'transacoes', component: Transactions }
      ]
    }
  ]
});

export default router;