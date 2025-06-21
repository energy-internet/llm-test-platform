// src/stores/testStore.js
import { create } from 'zustand'
import { api, handleApiError } from '../utils/api'

export const useTestStore = create((set, get) => ({
  tasks: [],
  benchmarks: [],
  results: {},
  reports: [],
  loading: false,
  error: null,

  // Fetch test tasks
  fetchTasks: async () => {
    try {
      set({ loading: true, error: null })
      const response = await api.tasks.getTasks()
      set({ tasks: response.data || [], loading: false })
    } catch (error) {
      set({ error: handleApiError(error), loading: false })
    }
  },

  // Fetch benchmarks
  fetchBenchmarks: async () => {
    try {
      set({ loading: true, error: null })
      const response = await api.benchmarks.getBenchmarks()
      set({ benchmarks: response.data || [], loading: false })
    } catch (error) {
      set({ error: handleApiError(error), loading: false })
    }
  },

  // Create test task
  createTask: async (taskData) => {
    try {
      set({ loading: true, error: null })
      const response = await api.tasks.createTask(taskData)
      const newTask = response.data
      
      const { tasks } = get()
      set({ 
        tasks: [newTask, ...tasks],
        loading: false 
      })
      
      return { success: true, data: newTask }
    } catch (error) {
      const errorMessage = handleApiError(error)
      set({ error: errorMessage, loading: false })
      return { success: false, error: errorMessage }
    }
  },

  // Update task status
  updateTaskStatus: async (id, status, progress = null) => {
    try {
      const updates = { status, progress }
      const response = await api.tasks.updateTask(id, updates)
      const updatedTask = response.data
      
      const { tasks } = get()
      const updatedTasks = tasks.map(t => 
        t.id === id ? updatedTask : t
      )
      
      set({ tasks: updatedTasks })
      
      return { success: true, data: updatedTask }
    } catch (error) {
      const errorMessage = handleApiError(error)
      set({ error: errorMessage })
      return { success: false, error: errorMessage }
    }
  },

  // Fetch test results
  fetchResults: async (taskId) => {
    try {
      const response = await api.tasks.getTaskResults(taskId)
      const taskResults = response.data
      
      const { results } = get()
      set({ 
        results: {
          ...results,
          [taskId]: taskResults || []
        }
      })
      
      return { success: true, data: taskResults }
    } catch (error) {
      const errorMessage = handleApiError(error)
      set({ error: errorMessage })
      return { success: false, error: errorMessage }
    }
  },

  // Fetch reports
  fetchReports: async () => {
    try {
      set({ loading: true, error: null })
      const response = await api.reports.getReports()
      set({ reports: response.data || [], loading: false })
    } catch (error) {
      set({ error: handleApiError(error), loading: false })
    }
  },

  // Create report
  createReport: async (reportData) => {
    try {
      set({ loading: true, error: null })
      const response = await api.reports.createReport(reportData)
      const newReport = response.data
      
      const { reports } = get()
      set({ 
        reports: [newReport, ...reports],
        loading: false 
      })
      
      return { success: true, data: newReport }
    } catch (error) {
      const errorMessage = handleApiError(error)
      set({ error: errorMessage, loading: false })
      return { success: false, error: errorMessage }
    }
  },

  // Clear error
  clearError: () => set({ error: null })
}))