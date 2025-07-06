// src/utils/api.js
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// 判断当前是否为开发环境
const isDevelopment = import.meta.env.DEV;

// Create an Axios instance
export const api = axios.create({
    baseURL: '/api/v1', // 使用相对路径，不硬编码localhost
    headers: {
        'Content-Type': 'application/json',
    },
});

// 创建一个别名，因为代码中用的是apiClient
export const apiClient = api;

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // 仅在开发环境中输出调试信息
        if (isDevelopment) {
            console.log("发送请求:", config.method, config.url);
            console.log("请求头:", JSON.stringify(config.headers));
            if (config.data) {
                console.log("请求数据:", JSON.stringify(config.data, null, 2));
            }
        }
        
        return config;
    },
    (error) => {
        if (isDevelopment) {
            console.error("请求拦截器错误:", error);
        }
        return Promise.reject(error);
    }
);

// Response interceptor for logging
api.interceptors.response.use(
    (response) => {
        // 仅在开发环境中输出调试信息
        if (isDevelopment) {
            console.log("收到响应:", response.status, response.config.url);
            console.log("响应数据:", JSON.stringify(response.data, null, 2));
        }
        return response;
    },
    (error) => {
        if (isDevelopment) {
            console.error("响应错误:", error);
            if (error.response) {
                console.error("错误状态码:", error.response.status);
                console.error("错误数据:", JSON.stringify(error.response.data, null, 2));
            } else if (error.request) {
                console.error("未收到响应，请求信息:", error.request);
            }
        }
        return Promise.reject(error);
    }
);

// Error handling utility
export const handleApiError = (error) => {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (isDevelopment) {
            console.error('API Error Response:', error.response.data);
        }
        return error.response.data.detail || '服务器发生错误';
    } else if (error.request) {
        // The request was made but no response was received
        if (isDevelopment) {
            console.error('API No Response:', error.request);
        }
        return '无法连接到服务器，请检查您的网络';
    } else {
        // Something happened in setting up the request that triggered an Error
        if (isDevelopment) {
            console.error('API Error', error.message);
        }
        return error.message;
    }
};

export default api;