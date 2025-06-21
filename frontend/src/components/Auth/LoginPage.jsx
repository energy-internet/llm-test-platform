// src/components/Auth/LoginPage.jsx
import React, { useState } from 'react'
import { Form, Input, Button, Card, message, Divider } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const LoginPage = () => {
  const { login, loading, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [autoLogin, setAutoLogin] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  // Auto-fill demo credentials and login for demo purposes
  const handleDemoLogin = async () => {
    setAutoLogin(true)
    try {
      const result = await login('admin@example.com', 'admin123')
      if (!result.success) {
        message.error(result.error || 'Demo login failed.')
      } else {
        message.success('登录成功！')
        navigate('/dashboard')
      }
    } catch (error) {
      message.error(error.message)
    }
    setAutoLogin(false)
  }

  const handleSubmit = async (values) => {
    try {
      const result = await login(values.email, values.password)
      if (!result.success) {
        message.error(result.error || 'Login failed.')
      } else {
        message.success('登录成功！')
        navigate('/dashboard')
      }
    } catch (error) {
      message.error(error.message)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}
        bodyStyle={{ padding: '40px 30px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h1 style={{ 
            fontSize: 28, 
            fontWeight: 'bold', 
            color: '#1890ff',
            marginBottom: 8
          }}>
            AI评估平台
          </h1>
          <p style={{ color: '#666', fontSize: 16 }}>
            专业的AI模型测试评估平台
          </p>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱！' },
              { type: 'email', message: '请输入有效的邮箱地址！' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="请输入邮箱"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码！' },
              { min: 6, message: '密码至少6位字符！' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="请输入密码"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block
              loading={loading}
              style={{ height: 45, fontSize: 16 }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <Divider>或</Divider>

        <div style={{ textAlign: 'center' }}>
          <span style={{ color: '#666' }}>还没有账号？</span>
          <Link 
            to="/register"
            style={{ marginLeft: 8, fontWeight: 'bold' }}
          >
            立即注册
          </Link>
        </div>

        <div style={{ 
          marginTop: 30, 
          padding: 20, 
          background: '#f0f9ff', 
          borderRadius: 8,
          border: '1px solid #e1f5fe'
        }}>
          <h4 style={{ color: '#0277bd', marginBottom: 10 }}>演示账号</h4>
          <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: 14 }}>
            邮箱: admin@example.com<br/>
            密码: admin123
          </p>
          <Button 
            type="primary" 
            ghost
            block
            loading={autoLogin}
            onClick={handleDemoLogin}
            style={{ borderColor: '#0277bd', color: '#0277bd' }}
          >
            {autoLogin ? '登录中...' : '一键演示登录'}
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default LoginPage