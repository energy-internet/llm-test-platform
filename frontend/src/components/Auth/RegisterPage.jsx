// src/components/Auth/RegisterPage.jsx
import React from 'react'
import { Form, Input, Button, Card, message, Divider } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const RegisterPage = () => {
  const { register, loading, isAuthenticated } = useAuth()
  const [form] = Form.useForm()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (values) => {
    try {
      const result = await register(values.email, values.password, values.username)
      if (!result.success) {
        message.error(result.error || 'Registration failed.')
      } else {
        message.success('注册并登录成功！')
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
            创建账号
          </h1>
          <p style={{ color: '#666', fontSize: 16 }}>
            加入AI评估平台，开始您的模型测试之旅
          </p>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名！' },
              { min: 3, message: '用户名至少3位字符！' },
              { max: 20, message: '用户名最多20位字符！' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="请输入用户名"
            />
          </Form.Item>

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

          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码！' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不匹配！'))
                }
              })
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="请确认密码"
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
              注册
            </Button>
          </Form.Item>
        </Form>

        <Divider>或</Divider>

        <div style={{ textAlign: 'center' }}>
          <span style={{ color: '#666' }}>已有账号？</span>
          <Link 
            to="/login"
            style={{ marginLeft: 8, fontWeight: 'bold' }}
          >
            立即登录
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default RegisterPage