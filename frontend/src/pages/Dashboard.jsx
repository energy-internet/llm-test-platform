// src/pages/Dashboard.jsx
import React, { useEffect } from 'react'
import { Row, Col, Card, Statistic, Button, List, Avatar, Tag, Space } from 'antd'
import { 
  ApiOutlined, 
  ExperimentOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useModelStore } from '../stores/modelStore'
import { useTestStore } from '../stores/testStore'
import StatsCard from '../components/Dashboard/StatsCard'
import QuickActions from '../components/Dashboard/QuickActions'
import RecentActivity from '../components/Dashboard/RecentActivity'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { providers, fetchProviders } = useModelStore()
  const { tasks, fetchTasks } = useTestStore()

  useEffect(() => {
    fetchProviders()
    fetchTasks()
  }, [fetchProviders, fetchTasks])

  const stats = {
    totalModels: providers.length,
    runningTasks: tasks.filter(t => t.status === 'running').length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    totalTasks: tasks.length
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 'bold' }}>
          欢迎回来，{user?.username || user?.email}！
        </h1>
        <p style={{ color: '#666', fontSize: 16, margin: '8px 0 0 0' }}>
          这里是您的AI模型评估平台概览
        </p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="接入模型"
            value={stats.totalModels}
            icon={<ApiOutlined />}
            color="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="运行中任务"
            value={stats.runningTasks}
            icon={<PlayCircleOutlined />}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="已完成任务"
            value={stats.completedTasks}
            icon={<CheckCircleOutlined />}
            color="#722ed1"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="总测试数"
            value={stats.totalTasks}
            icon={<ExperimentOutlined />}
            color="#fa8c16"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <QuickActions />
        </Col>
        <Col xs={24} lg={16}>
          <RecentActivity tasks={tasks.slice(0, 6)} />
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard