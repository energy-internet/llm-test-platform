// src/components/Tests/ModelSelection.jsx
import React from 'react'
import { Card, Checkbox, Empty, Avatar, Tag } from 'antd'
import { ApiOutlined } from '@ant-design/icons'

const ModelSelection = ({ providers, selectedModels, onSelectionChange }) => {
  const handleModelToggle = (provider, checked) => {
    let newSelection
    if (checked) {
      newSelection = [...selectedModels, provider]
    } else {
      newSelection = selectedModels.filter(m => m.id !== provider.id)
    }
    onSelectionChange(newSelection)
  }

  const getProviderColor = (type) => {
    const colorMap = {
      openai: '#10a37f',
      anthropic: '#d4a574',
      google: '#4285f4',
      huggingface: '#ff6b35',
      ollama: '#2563eb',
      deepseek: '#722ed1',
      custom: '#666666'
    }
    return colorMap[type] || '#666666'
  }

  if (!providers || providers.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Empty 
          description="暂无可用模型，请先添加模型提供商"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h3>选择要测试的模型</h3>
        <p style={{ color: '#666' }}>
          已选择 {selectedModels.length} 个模型
        </p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {providers.map(provider => (
          <Card
            key={provider.id}
            size="small"
            style={{
              cursor: 'pointer',
              border: selectedModels.some(m => m.id === provider.id) ? 
                `2px solid ${getProviderColor(provider.provider_type)}` : 
                '1px solid #d9d9d9'
            }}
            onClick={() => handleModelToggle(provider, !selectedModels.some(m => m.id === provider.id))}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Checkbox
                checked={selectedModels.some(m => m.id === provider.id)}
                onChange={(e) => handleModelToggle(provider, e.target.checked)}
                onClick={(e) => e.stopPropagation()}
              />
              <Avatar 
                icon={<ApiOutlined />}
                style={{ 
                  backgroundColor: getProviderColor(provider.provider_type),
                  color: 'white'
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                  {provider.name}
                </div>
                <Tag 
                  color={getProviderColor(provider.provider_type)}
                  size="small"
                >
                  {provider.provider_type.toUpperCase()}
                </Tag>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ModelSelection