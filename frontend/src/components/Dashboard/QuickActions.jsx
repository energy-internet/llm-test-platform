// src/components/Dashboard/QuickActions.jsx
import React from 'react'
import { Card, Button, Space } from 'antd'
import { PlusOutlined, ApiOutlined, BarChartOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const QuickActions = () => {
  const navigate = useNavigate()

  const actions = [
    {
      title: '创建测试',
      description: '创建新的AI模型测试任务',
      icon: <PlusOutlined />,
      color: '#1890ff',
      onClick: () => navigate('/tests/create')
    },
    {
      title: '管理模型',
      description: '添加和配置AI模型提供商',
      icon: <ApiOutlined />,
      color: '#52c41a',
      onClick: () => navigate('/models')
    },
    {
      title: '查看报告',
      description: '查看测试结果和分析报告',
      icon: <BarChartOutlined />,
      color: '#722ed1',
      onClick: () => navigate('/reports')
    }
  ]

  return (
    <Card title="快速操作">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {actions.map((action, index) => (
          <Button
            key={index}
            type="default"
            size="large"
            block
            onClick={action.onClick}
            style={{
              height: 'auto',
              padding: '16px',
              textAlign: 'left',
              border: `1px solid ${action.color}`,
              borderRadius: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ color: action.color, fontSize: 20 }}>
                {action.icon}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>
                  {action.title}
                </div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  {action.description}
                </div>
              </div>
            </div>
          </Button>
        ))}
      </Space>
    </Card>
  )
}

export default QuickActions