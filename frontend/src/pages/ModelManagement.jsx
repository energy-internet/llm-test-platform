// src/pages/ModelManagement.jsx
import React, { useEffect, useState } from 'react'
import { Card, Button, Table, Space, Modal, message, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ApiOutlined } from '@ant-design/icons'
import { useAuth } from '../hooks/useAuth'
import { useModelStore } from '../stores/modelStore'
import ModelForm from '../components/Models/ModelForm'

const ModelManagement = () => {
  const { user } = useAuth()
  const { providers, loading, fetchProviders, deleteProvider } = useModelStore()
  const [modalVisible, setModalVisible] = useState(false)
  const [editingProvider, setEditingProvider] = useState(null)

  useEffect(() => {
    fetchProviders()
  }, [fetchProviders])

  const handleAdd = () => {
    setEditingProvider(null)
    setModalVisible(true)
  }

  const handleEdit = (provider) => {
    setEditingProvider(provider)
    setModalVisible(true)
  }

  const handleDelete = async (providerId) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个模型提供商吗？此操作不可恢复。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        const result = await deleteProvider(providerId)
        if (result.success) {
          message.success('删除成功')
        } else {
          message.error('删除失败')
        }
      }
    })
  }

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <ApiOutlined />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'provider_type',
      key: 'provider_type',
      render: (type) => {
        const colorMap = {
          openai: 'blue',
          anthropic: 'purple',
          google: 'green',
          huggingface: 'orange',
          ollama: 'cyan'
        }
        return <Tag color={colorMap[type] || 'default'}>{type.toUpperCase()}</Tag>
      },
    },
    {
      title: 'API端点',
      dataIndex: 'api_endpoint',
      key: 'api_endpoint',
      render: (endpoint) => endpoint || '默认',
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? '活跃' : '已停用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card
        title={
          <Space>
            <ApiOutlined />
            <span>模型提供商管理</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            添加模型
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={providers}
          loading={loading}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个模型提供商`,
          }}
        />
      </Card>

      <Modal
        title={editingProvider ? '编辑模型提供商' : '添加模型提供商'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <ModelForm
          provider={editingProvider}
          onSuccess={() => {
            setModalVisible(false)
            fetchProviders()
          }}
          onCancel={() => setModalVisible(false)}
        />
      </Modal>
    </div>
  )
}

export default ModelManagement