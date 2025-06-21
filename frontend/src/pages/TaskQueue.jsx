// src/pages/TaskQueue.jsx
import React, { useEffect, useState } from 'react'
import { Card, Table, Tag, Progress, Button, Space, Modal, message, Tooltip } from 'antd'
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  StopOutlined,
  EyeOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { useAuth } from '../hooks/useAuth'
import { useTestStore } from '../stores/testStore'

const TaskQueue = () => {
  const { user } = useAuth()
  const { tasks, loading, fetchTasks, updateTaskStatus } = useTestStore()
  const [selectedTask, setSelectedTask] = useState(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)

  useEffect(() => {
    fetchTasks()
    
    // 设置定时刷新
    const interval = setInterval(() => {
      fetchTasks()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [fetchTasks])

  const handleViewDetail = (task) => {
    setSelectedTask(task)
    setDetailModalVisible(true)
  }

  const handleCancelTask = async (taskId) => {
    Modal.confirm({
      title: '确认取消',
      content: '确定要取消这个测试任务吗？',
      okText: '取消任务',
      okType: 'danger',
      cancelText: '不取消',
      onOk: async () => {
        const result = await updateTaskStatus(taskId, 'cancelled')
        if (result.success) {
          message.success('任务已取消')
        } else {
          message.error('取消失败')
        }
      }
    })
  }

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

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: '基准测试',
      dataIndex: 'benchmarks',
      key: 'benchmark',
      render: (benchmark) => benchmark?.name || '未知',
    },
    {
      title: '模型数量',
      dataIndex: 'model_ids',
      key: 'model_count',
      render: (modelIds) => `${modelIds?.length || 0} 个模型`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag,
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => (
        <Progress 
          percent={Number(progress || 0)} 
          size="small" 
          status={progress === 100 ? 'success' : 'active'}
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {record.status === 'pending' || record.status === 'running' ? (
            <Tooltip title="取消任务">
              <Button
                type="text"
                danger
                icon={<StopOutlined />}
                onClick={() => handleCancelTask(record.id)}
              />
            </Tooltip>
          ) : null}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card
        title="任务队列"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchTasks()}
            loading={loading}
          >
            刷新
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={tasks}
          loading={loading}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个任务`,
          }}
        />
      </Card>

      <Modal
        title="任务详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedTask && (
          <div>
            <h3>{selectedTask.name}</h3>
            <div style={{ marginBottom: 16 }}>
              <strong>状态：</strong>{getStatusTag(selectedTask.status)}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>进度：</strong>
              <Progress percent={Number(selectedTask.progress || 0)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>基准测试：</strong>{selectedTask.benchmarks?.name}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>模型数量：</strong>{selectedTask.model_ids?.length || 0}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>创建时间：</strong>{new Date(selectedTask.created_at).toLocaleString()}
            </div>
            {selectedTask.started_at && (
              <div style={{ marginBottom: 16 }}>
                <strong>开始时间：</strong>{new Date(selectedTask.started_at).toLocaleString()}
              </div>
            )}
            {selectedTask.completed_at && (
              <div style={{ marginBottom: 16 }}>
                <strong>完成时间：</strong>{new Date(selectedTask.completed_at).toLocaleString()}
              </div>
            )}
            {selectedTask.error_message && (
              <div style={{ marginBottom: 16 }}>
                <strong>错误信息：</strong>
                <div style={{ color: 'red', marginTop: 8 }}>
                  {selectedTask.error_message}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default TaskQueue