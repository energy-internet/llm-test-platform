// src/components/Dashboard/RecentActivity.jsx
import React from 'react'
import { Card, List, Tag, Empty } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'

const RecentActivity = ({ tasks = [] }) => {
  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'default', text: '等待中' },
      running: { color: 'processing', text: '运行中' },
      completed: { color: 'success', text: '已完成' },
      failed: { color: 'error', text: '失败' },
      cancelled: { color: 'default', text: '已取消' }
    }
    
    const config = statusConfig[status] || { color: 'default', text: status }
    return <Tag color={config.color}>{config.text}</Tag>
  }

  return (
    <Card title="最近活动">
      {tasks.length === 0 ? (
        <Empty 
          description="暂无测试活动"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <List
          dataSource={tasks}
          renderItem={task => (
            <List.Item>
              <List.Item.Meta
                avatar={<ClockCircleOutlined style={{ fontSize: 16, color: '#1890ff' }} />}
                title={task.name}
                description={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{task.benchmarks?.name || '未知基准测试'}</span>
                    <div>
                      {getStatusTag(task.status)}
                      <span style={{ marginLeft: 8, color: '#666', fontSize: 12 }}>
                        {new Date(task.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  )
}

export default RecentActivity