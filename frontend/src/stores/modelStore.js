// src/stores/modelStore.js
import { create } from 'zustand'
import { api, handleApiError } from '../utils/api'

export const useModelStore = create((set, get) => ({
  providers: [],
  loading: false,
  error: null,

  // Fetch model providers
  fetchProviders: async () => {
    try {
      set({ loading: true, error: null })
      const response = await api.models.getProviders()
      set({ providers: response.data || [], loading: false })
    } catch (error) {
      set({ error: handleApiError(error), loading: false })
    }
  },

  // Add model provider
  addProvider: async (providerData) => {
    try {
      set({ loading: true, error: null })
      const response = await api.models.createProvider(providerData)
      const newProvider = response.data
      
      const { providers } = get()
      set({ 
        providers: [newProvider, ...providers],
        loading: false 
      })
      
      return { success: true, data: newProvider }
    } catch (error) {
      const errorMessage = handleApiError(error)
      set({ error: errorMessage, loading: false })
      return { success: false, error: errorMessage }
    }
  },

  // Update model provider
  updateProvider: async (id, updates) => {
    try {
      set({ loading: true, error: null })
      const response = await api.models.updateProvider(id, updates)
      const updatedProvider = response.data
      
      const { providers } = get()
      const updatedProviders = providers.map(p => 
        p.id === id ? updatedProvider : p
      )
      
      set({ 
        providers: updatedProviders,
        loading: false 
      })
      
      return { success: true, data: updatedProvider }
    } catch (error) {
      const errorMessage = handleApiError(error)
      set({ error: errorMessage, loading: false })
      return { success: false, error: errorMessage }
    }
  },

  // Delete model provider
  deleteProvider: async (id) => {
    try {
      set({ loading: true, error: null })
      await api.models.deleteProvider(id)
      
      const { providers } = get()
      const filteredProviders = providers.filter(p => p.id !== id)
      
      set({ 
        providers: filteredProviders,
        loading: false 
      })
      
      return { success: true }
    } catch (error) {
      const errorMessage = handleApiError(error)
      set({ error: errorMessage, loading: false })
      return { success: false, error: errorMessage }
    }
  },

  // Clear error
  clearError: () => set({ error: null })
}))