// src/utils/api.js
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// Create an Axios instance
export const api = axios.create({
    baseURL: '/api/v1', // Using relative URL for flexibility
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Error handling utility
export const handleApiError = (error) => {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('API Error Response:', error.response.data);
        return error.response.data.detail || '服务器发生错误';
    } else if (error.request) {
        // The request was made but no response was received
        console.error('API No Response:', error.request);
        return '无法连接到服务器，请检查您的网络';
    } else {
        // Something happened in setting up the request that triggered an Error
        console.error('API Error', error.message);
        return error.message;
    }
};

// 分组方法补充：保持以前默认导出为 api 实例，同时挂载命名空间
api.auth = {
    me: () => api.get('/auth/me'),
    login: (payload) => api.post('/auth/login', payload),
    register: (payload) => api.post('/auth/register', payload),
};

api.models = {
    getProviders: () => api.get('/model-providers'),
    createProvider: (data) => api.post('/model-providers', data),
    updateProvider: (id, data) => api.put(`/model-providers/${id}`, data),
    deleteProvider: (id) => api.delete(`/model-providers/${id}`),
};

api.benchmarks = {
    getBenchmarks: () => api.get('/benchmarks'),
    createBenchmark: (data) => api.post('/benchmarks', data),
    updateBenchmark: (id, data) => api.put(`/benchmarks/${id}`, data),
    deleteBenchmark: (id) => api.delete(`/benchmarks/${id}`),
};

api.tests = {
    // 若有测试用例的接口，可在此扩展
};

// 任务（复用后端 /tests 路由以匹配现有后端）
api.tasks = {
    getTasks: (params) => api.get('/tests', { params }),
    createTask: (data) => api.post('/tests', data),
    updateTask: (id, data) => api.put(`/tests/${id}/status`, data),
    getTaskResults: (id) => api.get(`/tests/${id}/results`),
    cancelTask: (id) => api.post(`/tests/${id}/cancel`),
    retryTask: (id) => api.post(`/tests/${id}/retry`),
};

export default api;