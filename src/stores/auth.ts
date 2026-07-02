import { defineStore } from 'pinia';
import { supabase } from '../lib/supabase';
import api from '../lib/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any,
    profile: null as any,
    loading: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.user),
    isAdmin: (state) => state.profile?.role === 'ADMIN',
  },
  actions: {
    async fetchUser() {
      this.loading = true;
      const { data } = await supabase.auth.getUser();
      this.user = data.user;

      if (!this.user) {
        this.profile = null;
        this.loading = false;
        return;
      }

      const response = await api.get('/me');
      this.profile = response.data;
      this.loading = false;
    },
    async login(email: string, password: string) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        throw error;
      }

      await this.fetchUser();
    },
    async logout() {
      await supabase.auth.signOut();
      this.user = null;
      this.profile = null;
    }
  }
});
