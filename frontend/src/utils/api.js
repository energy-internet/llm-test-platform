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

export default api;