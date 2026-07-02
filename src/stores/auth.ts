import { defineStore } from 'pinia';
import { supabase } from '../lib/supabase';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any,
  }),
  actions: {
    async fetchUser() {
      const { data } = await supabase.auth.getUser();
      this.user = data.user;
    },
    async logout() {
      await supabase.auth.signOut();
      this.user = null;
    }
  }
});