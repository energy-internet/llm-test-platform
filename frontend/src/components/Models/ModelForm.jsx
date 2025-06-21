// src/components/Models/ModelForm.jsx
import React, { useState, useEffect } from 'react'
import { Form, Input, Select, Button, message, Space } from 'antd'
import { useAuth } from '../../hooks/useAuth'
import { useModelStore } from '../../stores/modelStore'

const { Option } = Select
const { TextArea } = Input

const ModelForm = ({ provider, onSuccess, onCancel }) => {
  const [form] = Form.useForm()
  const { user } = useAuth()
  const { addProvider, updateProvider, loading } = useModelStore()
  const [testingConnection, setTestingConnection] = useState(false)

  useEffect(() => {
    if (provider) {
      form.setFieldsValue({
        name: provider.name,
        provider_type: provider.provider_type,
        api_endpoint: provider.api_endpoint,
        api_key: '', // 安全起见不显示现有密钥
        description: provider.config?.description || ''
      })
    }
  }, [provider, form])

  const modelProviders = [
    { value: 'openai', label: 'OpenAI', endpoint: 'https://api.openai.com/v1' },
    { value: 'anthropic', label: 'Anthropic', endpoint: 'https://api.anthropic.com' },
    { value: 'google', label: 'Google AI', endpoint: 'https://generativelanguage.googleapis.com/v1' },
    { value: 'huggingface', label: 'HuggingFace', endpoint: 'https://api-inference.huggingface.co/models' },
    { value: 'ollama', label: 'Ollama', endpoint: 'http://localhost:11434' },
    { value: 'deepseek', label: 'DeepSeek', endpoint: 'https://api.deepseek.com/v1' },
    { value: 'custom', label: '自定义', endpoint: '' }
  ]

  const handleProviderTypeChange = (value) => {
    const selectedProvider = modelProviders.find(p => p.value === value)
    if (selectedProvider && selectedProvider.endpoint) {
      form.setFieldValue('api_endpoint', selectedProvider.endpoint)
    }
  }

  const handleTestConnection = async () => {
    try {
      const values = await form.validateFields(['provider_type', 'api_endpoint', 'api_key'])
      setTestingConnection(true)
      
      // 模拟连接测试
      setTimeout(() => {
        setTestingConnection(false)
        message.success('连接测试成功！')
      }, 2000)
    } catch (error) {
      message.error('请填写必要信息后再测试连接')
    }
  }

  const handleSubmit = async (values) => {
    try {
      const providerData = {
        user_id: user.id,
        name: values.name,
        provider_type: values.provider_type,
        api_endpoint: values.api_endpoint,
        api_key_encrypted: values.api_key, // 实际应用中需要加密
        config: {
          description: values.description
        }
      }

      let result
      if (provider) {
        result = await updateProvider(provider.id, providerData)
      } else {
        result = await addProvider(providerData)
      }

      if (result.success) {
        message.success(provider ? '更新成功' : '添加成功')
        onSuccess()
      } else {
        message.error(result.error.message)
      }
    } catch (error) {
      message.error('操作失败: ' + error.message)
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        provider_type: 'openai',
        api_endpoint: 'https://api.openai.com/v1'
      }}
    >
      <Form.Item
        name="name"
        label="模型名称"
        rules={[
          { required: true, message: '请输入模型名称' },
          { max: 100, message: '名称不能超过100个字符' }
        ]}
      >
        <Input placeholder="例如：我的GPT-4模型" />
      </Form.Item>

      <Form.Item
        name="provider_type"
        label="提供商类型"
        rules={[{ required: true, message: '请选择提供商类型' }]}
      >
        <Select onChange={handleProviderTypeChange}>
          {modelProviders.map(provider => (
            <Option key={provider.value} value={provider.value}>
              {provider.label}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="api_endpoint"
        label="API端点"
        rules={[
          { required: true, message: '请输入API端点' },
          { type: 'url', message: '请输入有效的URL' }
        ]}
      >
        <Input placeholder="https://api.example.com/v1" />
      </Form.Item>

      <Form.Item
        name="api_key"
        label="API密钥"
        rules={[{ required: !provider, message: '请输入API密钥' }]}
      >
        <Input.Password 
          placeholder={provider ? "留空表示不修改现有密钥" : "请输入API密钥"}
        />
      </Form.Item>

      <Form.Item
        name="description"
        label="描述"
      >
        <TextArea 
          rows={3} 
          placeholder="可选：添加模型描述信息"
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button
            type="default"
            onClick={handleTestConnection}
            loading={testingConnection}
          >
            测试连接
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
          >
            {provider ? '更新' : '添加'}
          </Button>
          <Button onClick={onCancel}>
            取消
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

export default ModelForm