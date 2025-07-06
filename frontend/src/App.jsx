// src/App.jsx
import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, App as AntdApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { useAuthStore } from './stores/authStore'

// 组件导入
import ProtectedRoute from './components/Auth/ProtectedRoute'
import LoginPage from './components/Auth/LoginPage'
import RegisterPage from './components/Auth/RegisterPage'
import AppLayout from './components/Layout/AppLayout'
import Dashboard from './pages/Dashboard'
import ModelManagement from './pages/ModelManagement'
import TestCreation from './pages/TestCreation'
import TaskQueue from './pages/TaskQueue'
import Reports from './pages/Reports'

// 配置dayjs
dayjs.locale('zh-cn')

// 创建Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Ant Design主题配置
const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
    colorBgContainer: '#ffffff',
  },
  components: {
    Layout: {
      siderBg: '#ffffff',
      triggerBg: '#ffffff',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#e6f7ff',
      itemSelectedColor: '#1890ff',
    },
  },
}

function App() {
  useEffect(() => {
    useAuthStore.getState().init()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={zhCN} theme={theme}>
        <AntdApp>
          <Router>
            <div className="App" style={{ minHeight: '100vh' }}>
              <Routes>
                {/* 公开路由 */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* 受保护的路由 */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Routes>
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/models" element={<ModelManagement />} />
                          <Route path="/tests/create" element={<TestCreation />} />
                          <Route path="/tests/queue" element={<TaskQueue />} />
                          <Route path="/reports" element={<Reports />} />
                          <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </Router>
        </AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  )
}

export default App