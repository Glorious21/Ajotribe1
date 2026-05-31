import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  token: string | null;
  userId: string | null;
  displayName: string | null;
  isNewUser: boolean;
  isLoaded: boolean;
  pendingInvite: string | null;
  setAuth: (token: string, userId: string, isNewUser: boolean) => void;
  setProfile: (displayName: string) => void;
  setPendingInvite: (code: string | null) => void;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  displayName: null,
  isNewUser: false,
  isLoaded: false,
  pendingInvite: null,

  setPendingInvite: (code) => set({ pendingInvite: code }),

  setAuth: (token, userId, isNewUser) => {
    set({ token, userId, isNewUser });
    SecureStore.setItemAsync('auth_token', token);
    SecureStore.setItemAsync('user_id', userId);
  },

  setProfile: (displayName) => {
    set({ displayName });
    SecureStore.setItemAsync('display_name', displayName);
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('user_id');
    await SecureStore.deleteItemAsync('nostr_nsec');
    set({ token: null, userId: null, displayName: null });
  },

  loadFromStorage: async () => {
    const token = await SecureStore.getItemAsync('auth_token');
    const userId = await SecureStore.getItemAsync('user_id');
    const displayName = await SecureStore.getItemAsync('display_name');
    set({ token, userId, displayName, isLoaded: true });
  },
}));
