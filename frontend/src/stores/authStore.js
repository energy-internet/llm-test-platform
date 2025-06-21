// src/stores/authStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, handleApiError } from '../utils/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: true, // Start with loading: true
      error: null,

      // Initialize auth state
      init: async () => {
        const token = get().token
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          try {
            const response = await api.get('/auth/me')
            set({ user: response.data, loading: false })
          } catch (error) {
            console.error('Failed to fetch user on init', error)
            // Token is invalid, clear it
            get().logout()
            set({ loading: false })
          }
        } else {
          set({ loading: false })
        }
      },

      // Register a new user
      register: async (email, password, username) => {
        try {
          set({ loading: true, error: null })
          await api.post('/auth/register', { email, password, username })
          // After successful registration, log the user in
          await get().login(email, password)
          return { success: true }
        } catch (error) {
          const errorMessage = handleApiError(error)
          set({ error: errorMessage, loading: false })
          return { success: false, error: errorMessage }
        }
      },

      // Log in a user
      login: async (email, password) => {
        try {
          set({ loading: true, error: null })
          const response = await api.post('/auth/login', { username: email, password })
          const { access_token } = response.data
          
          set({ token: access_token })
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
          
          await get().init()
          return { success: true }
        } catch (error) {
          const errorMessage = handleApiError(error)
          set({ error: errorMessage, loading: false })
          return { success: false, error: errorMessage }
        }
      },

      // Log out a user
      logout: () => {
        set({ user: null, token: null, error: null, loading: false })
        delete api.defaults.headers.common['Authorization']
      },

      // Clear auth errors
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage', // This name is used for localStorage key
      partialize: (state) => ({ token: state.token }), // Only persist the token
    }
  )
)

export { useAuthStore }