// src/stores/modelStore.js
import { create } from 'zustand'
import { apiClient, handleApiError } from '../utils/api'

export const useModelStore = create((set, get) => ({
  providers: [],
  loading: false,
  error: null,

  // Fetch model providers
  fetchProviders: async () => {
    try {
      set({ loading: true, error: null })
      const response = await apiClient.get('/model-providers/providers')
      set({ providers: response.data || [], loading: false })
    } catch (error) {
      set({ error: handleApiError(error), loading: false })
    }
  },

  // Add model provider
  addProvider: async (providerData) => {
    try {
      console.log('开始添加模型提供商，数据:', JSON.stringify(providerData))
      set({ loading: true, error: null })
      console.log('发送请求前...')
      const response = await apiClient.post('/model-providers/providers', providerData)
      console.log('请求成功，响应数据:', response.data)
      const newProvider = response.data
      
      const { providers } = get()
      set({ 
        providers: [newProvider, ...providers],
        loading: false 
      })
      
      return { success: true, data: newProvider }
    } catch (error) {
      console.error('添加模型提供商失败:', error)
      const errorMessage = handleApiError(error)
      console.error('错误信息:', errorMessage)
      set({ error: errorMessage, loading: false })
      return { success: false, error: errorMessage }
    }
  },

  // Update model provider
  updateProvider: async (id, updates) => {
    try {
      set({ loading: true, error: null })
      const response = await apiClient.put(`/model-providers/providers/${id}`, updates)
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
      await apiClient.delete(`/model-providers/providers/${id}`)
      
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