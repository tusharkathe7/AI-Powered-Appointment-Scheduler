import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  error: null,
  
  initialize: async () => {
    try {
      // For demo purposes, we'll use mock data
      // In a real app, you would check for an existing session with Supabase
      
      // Mock logged in user for development
      const mockUser: User = {
        id: 'user-1',
        email: 'user@example.com',
        fullName: 'John Doe',
        phone: '+1234567890',
        createdAt: new Date().toISOString(),
        preferences: {
          preferredDays: ['Monday', 'Wednesday', 'Friday'],
          preferredTimeOfDay: 'morning',
          preferredProviders: ['provider-1'],
          notificationPreferences: {
            email: true,
            sms: true,
            reminderHoursBefore: 24,
          },
        },
      };
      
      // Comment this line to simulate logged out state
      set({ user: mockUser, isAuthenticated: true, isInitialized: true });
      
      // Uncomment this line to simulate logged out state
      // set({ user: null, isAuthenticated: false, isInitialized: true });
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      set({ isInitialized: true });
    }
  },
  
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, you would call Supabase auth here
      // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      // Mock successful login
      const mockUser: User = {
        id: 'user-1',
        email,
        fullName: 'John Doe',
        createdAt: new Date().toISOString(),
      };
      
      set({ user: mockUser, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  register: async (email, password, fullName) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, you would call Supabase auth here
      // const { data, error } = await supabase.auth.signUp({ email, password });
      
      // Mock successful registration
      const mockUser: User = {
        id: 'user-' + Date.now(),
        email,
        fullName,
        createdAt: new Date().toISOString(),
      };
      
      set({ user: mockUser, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  logout: async () => {
    set({ isLoading: true });
    try {
      // In a real app, you would call Supabase auth here
      // await supabase.auth.signOut();
      
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));

// Initialize auth state when the store is first used
useAuthStore.getState().initialize();