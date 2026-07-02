import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '../layouts/AppLayout.vue';
import Dashboard from '@/pages/Dashboard.vue';
import NewTransaction from '../pages/NewTransaction.vue';
import Transactions from '@/pages/Transactions.vue';
import Admin from '@/pages/Admin.vue';
import Login from '@/pages/Login.vue';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: Login },
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', component: Dashboard },
        { path: 'nova-transacao', component: NewTransaction },
        { path: 'transacoes', component: Transactions },
        { path: 'admin', component: Admin, meta: { requiresAdmin: true } }
      ]
    }
  ]
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (!auth.user) {
    await auth.fetchUser();
  }

  if (to.path === '/login' && auth.isAuthenticated) {
    return '/';
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return '/login';
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return '/';
  }

  return true;
});

export default router;
