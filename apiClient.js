// src/utils/apiClient.js
import api from './api';

// Benchmark API functions
export const benchmarkApi = {
  // Get all benchmarks
  getBenchmarks: (params = {}) => {
    return api.get('/benchmarks', { params });
  },

  // Get benchmark by ID
  getBenchmark: (id) => {
    return api.get(`/benchmarks/${id}`);
  },

  // Import benchmark
  importBenchmark: (formData) => {
    return api.post('/benchmarks/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Convert benchmark format
  convertBenchmark: (formData) => {
    return api.post('/benchmarks/convert', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Get benchmark test cases
  getBenchmarkCases: (id, limit = 10) => {
    return api.get(`/benchmarks/${id}/cases`, { params: { limit } });
  },

  // Delete benchmark
  deleteBenchmark: (id) => {
    return api.delete(`/benchmarks/${id}`);
  },

  // Update benchmark
  updateBenchmark: (id, data) => {
    return api.put(`/benchmarks/${id}`, data);
  }
};

// Export the api instance for direct use
export { api as apiClient }; 