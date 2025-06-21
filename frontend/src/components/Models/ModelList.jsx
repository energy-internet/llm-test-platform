// src/components/Models/ModelList.jsx
import React from 'react'
import { List, Card, Tag, Button, Space, Avatar } from 'antd'
import { ApiOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'

const ModelList = ({ providers, onEdit, onDelete, loading }) => {
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

  const getProviderIcon = (type) => {
    return <ApiOutlined style={{ color: getProviderColor(type) }} />
  }

  return (
    <List
      loading={loading}
      dataSource={providers}
      renderItem={provider => (
        <List.Item>
          <Card
            style={{ width: '100%' }}
            bodyStyle={{ padding: '16px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <Avatar 
                    icon={getProviderIcon(provider.provider_type)} 
                    style={{ backgroundColor: 'transparent', marginRight: 12 }}
                  />
                  <div>
                    <h4 style={{ margin: 0, fontSize: 16 }}>{provider.name}</h4>
                    <Tag color={getProviderColor(provider.provider_type)} style={{ marginTop: 4 }}>
                      {provider.provider_type.toUpperCase()}
                    </Tag>
                  </div>
                </div>
                <div style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>
                  <strong>端点:</strong> {provider.api_endpoint || '默认'}
                </div>
                {provider.config?.description && (
                  <div style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>
                    <strong>描述:</strong> {provider.config.description}
                  </div>
                )}
                <div style={{ color: '#999', fontSize: 12 }}>
                  创建时间: {new Date(provider.created_at).toLocaleString()}
                </div>
              </div>
              
              <div>
                <Space>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => onEdit(provider)}
                  >
                    编辑
                  </Button>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => onDelete(provider.id)}
                  >
                    删除
                  </Button>
                </Space>
              </div>
            </div>
          </Card>
        </List.Item>
      )}
    />
  )
}

export default ModelList