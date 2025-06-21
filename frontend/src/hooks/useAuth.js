// src/hooks/useAuth.js
import { useAuthStore } from '../stores/authStore'

export const useAuth = () => {
  const { 
    user, 
    loading, 
    error, 
    login, 
    register, 
    logout, 
    clearError 
  } = useAuthStore()

  return {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
  }
}