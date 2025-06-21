// src/pages/ReportCenter.jsx
import React, { useEffect, useState } from 'react'
import { Card, List, Button, Space, Tag, Modal, Tabs, Empty } from 'antd'
import { 
  BarChartOutlined, 
  EyeOutlined, 
  DownloadOutlined,
  FileTextOutlined 
} from '@ant-design/icons'
import { useAuth } from '../hooks/useAuth'
import { useTestStore } from '../stores/testStore'
import ModelComparison from '../components/Reports/ModelComparison'
import ErrorAnalysis from '../components/Reports/ErrorAnalysis'

const ReportCenter = () => {
  const { user } = useAuth()
  const { reports, tasks, loading, fetchReports, fetchTasks } = useTestStore()
  const [selectedReport, setSelectedReport] = useState(null)
  const [reportModalVisible, setReportModalVisible] = useState(false)

  useEffect(() => {
    fetchReports()
    fetchTasks()
  }, [fetchReports, fetchTasks])

  const completedTasks = tasks.filter(task => task.status === 'completed')

  const handleViewReport = (report) => {
    setSelectedReport(report)
    setReportModalVisible(true)
  }

  const handleCreateReport = (task) => {
    // 这里可以基于task创建报告
    const mockReport = {
      id: Date.now(),
      title: `${task.name} - 测试报告`,
      task_id: task.id,
      summary: {
        total_tests: 100,
        passed_tests: 85,
        failed_tests: 15,
        average_score: 85.6
      },
      visualizations: {
        comparison_data: generateMockComparisonData(),
        error_data: generateMockErrorData()
      }
    }
    handleViewReport(mockReport)
  }

  const generateMockComparisonData = () => {
    return [
      { model: 'GPT-4', accuracy: 92, speed: 8.5, cost: 7.2 },
      { model: 'Claude-3', accuracy: 89, speed: 9.1, cost: 6.8 },
      { model: 'Gemini-Pro', accuracy: 87, speed: 9.8, cost: 5.5 },
    ]
  }

  const generateMockErrorData = () => {
    return [
      { category: '语法错误', count: 12, percentage: 40 },
      { category: '逻辑错误', count: 8, percentage: 27 },
      { category: '格式错误', count: 6, percentage: 20 },
      { category: '其他错误', count: 4, percentage: 13 },
    ]
  }

  return (
    <div>
      <Card title="报告中心" style={{ marginBottom: 16 }}>
        <Tabs
          items={[
            {
              key: 'completed-tasks',
              label: '已完成任务',
              children: (
                <List
                  dataSource={completedTasks}
                  renderItem={task => (
                    <List.Item
                      actions={[
                        <Button
                          type="primary"
                          icon={<BarChartOutlined />}
                          onClick={() => handleCreateReport(task)}
                        >
                          生成报告
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                        title={task.name}
                        description={
                          <Space>
                            <span>基准测试: {task.benchmarks?.name}</span>
                            <span>模型数量: {task.model_ids?.length}</span>
                            <Tag color="success">已完成</Tag>
                            <span>完成时间: {new Date(task.completed_at).toLocaleString()}</span>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                  locale={{
                    emptyText: <Empty description="暂无已完成的测试任务" />
                  }}
                />
              )
            },
            {
              key: 'saved-reports',
              label: '已保存报告',
              children: (
                <List
                  dataSource={reports}
                  renderItem={report => (
                    <List.Item
                      actions={[
                        <Button
                          type="text"
                          icon={<EyeOutlined />}
                          onClick={() => handleViewReport(report)}
                        >
                          查看
                        </Button>,
                        <Button
                          type="text"
                          icon={<DownloadOutlined />}
                        >
                          导出
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<BarChartOutlined style={{ fontSize: 24, color: '#52c41a' }} />}
                        title={report.title}
                        description={
                          <Space>
                            <span>任务: {report.test_tasks?.name}</span>
                            <span>创建时间: {new Date(report.created_at).toLocaleString()}</span>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                  locale={{
                    emptyText: <Empty description="暂无已保存的报告" />
                  }}
                />
              )
            }
          ]}
        />
      </Card>

      <Modal
        title={selectedReport?.title || '测试报告'}
        open={reportModalVisible}
        onCancel={() => setReportModalVisible(false)}
        width={1200}
        footer={[
          <Button key="export" icon={<DownloadOutlined />}>
            导出PDF
          </Button>,
          <Button key="close" onClick={() => setReportModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedReport && (
          <Tabs
            items={[
              {
                key: 'overview',
                label: '概览',
                children: (
                  <div>
                    <Card size="small" style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                            {selectedReport.summary?.total_tests || 0}
                          </div>
                          <div>总测试数</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                            {selectedReport.summary?.passed_tests || 0}
                          </div>
                          <div>通过测试</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#f5222d' }}>
                            {selectedReport.summary?.failed_tests || 0}
                          </div>
                          <div>失败测试</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fa8c16' }}>
                            {selectedReport.summary?.average_score || 0}%
                          </div>
                          <div>平均得分</div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )
              },
              {
                key: 'comparison',
                label: '模型对比',
                children: (
                  <ModelComparison data={selectedReport.visualizations?.comparison_data || []} />
                )
              },
              {
                key: 'errors',
                label: '错误分析',
                children: (
                  <ErrorAnalysis data={selectedReport.visualizations?.error_data || []} />
                )
              }
            ]}
          />
        )}
      </Modal>
    </div>
  )
}

export default ReportCenter